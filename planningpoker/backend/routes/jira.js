const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const pool = require('../db/config');
const { authenticateToken } = require('../middleware/auth');
const { 
  getJiraProjects, 
  searchJiraIssues, 
  createJiraIssue, 
  updateJiraIssue,
  convertTaskToJiraIssue,
  convertJiraIssueToTask,
  createJiraClient,
  getStoryPointsFieldId
} = require('../utils/jira');
const { hasRoomAccess, isRoomAdmin } = require('../utils/helpers');

// Get user's Jira settings
const getUserJiraSettings = async (userId) => {
  const result = await pool.query(
    `SELECT jira_url, jira_email, jira_token, jira_integration_enabled, jira_auth_type 
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0 || !result.rows[0].jira_integration_enabled) {
    return null;
  }

  return {
    jiraUrl: result.rows[0].jira_url,
    jiraEmail: result.rows[0].jira_email,
    jiraToken: result.rows[0].jira_token,
    authType: result.rows[0].jira_auth_type || process.env.JIRA_AUTH_TYPE || 'token'
  };
};

// Get available Jira fields to identify story points field ID
router.get('/fields', authenticateToken, async (req, res) => {
  try {
    const jiraConfig = await getUserJiraSettings(req.user.id);
    
    if (!jiraConfig) {
      return res.status(400).json({ error: 'Jira integration not enabled' });
    }

    // Create a Jira client directly
    const jira = createJiraClient(jiraConfig);
    
    // Get all fields
    const fields = await jira.listFields();
    
    // Filter to find potential story point fields
    const potentialStoryPointFields = fields.filter(field => 
      field.name.toLowerCase().includes('story') ||
      field.name.toLowerCase().includes('point') ||
      field.name.toLowerCase().includes('sp') ||
      field.name.toLowerCase().includes('estimate')
    );
    
    console.log('All fields:', fields.map(f => ({ id: f.id, name: f.name })));
    
    // Return both all fields and filtered ones
    res.json({
      allFields: fields.map(f => ({ id: f.id, name: f.name, custom: f.custom })),
      potentialStoryPointFields
    });
  } catch (error) {
    console.error('Get Jira fields error:', error.message);
    res.status(500).json({ error: 'Failed to get Jira fields' });
  }
});

// Get all Jira projects the user has access to
router.get('/projects', authenticateToken, async (req, res) => {
  try {
    const jiraConfig = await getUserJiraSettings(req.user.id);
    
    if (!jiraConfig) {
      return res.status(400).json({ error: 'Jira integration not enabled' });
    }

    const projects = await getJiraProjects(jiraConfig);
    res.json(projects);
  } catch (error) {
    console.error('Get Jira projects error:', error.message);
    res.status(500).json({ error: 'Failed to get Jira projects' });
  }
});

// Search Jira issues
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { jql, projectKey } = req.query;
    
    if (!jql && !projectKey) {
      return res.status(400).json({ error: 'JQL query or project key is required' });
    }

    const jiraConfig = await getUserJiraSettings(req.user.id);
    
    if (!jiraConfig) {
      return res.status(400).json({ error: 'Jira integration not enabled' });
    }

    // Build JQL
    let queryJql = jql || '';
    if (projectKey && !queryJql.includes('project =')) {
      queryJql = queryJql ? `${queryJql} AND project = "${projectKey}"` : `project = "${projectKey}"`;
    }

    // Add default order if not specified
    if (!queryJql.toLowerCase().includes('order by')) {
      queryJql = `${queryJql} ORDER BY created DESC`;
    }

    const searchResult = await searchJiraIssues(jiraConfig, queryJql);
    res.json(searchResult);
  } catch (error) {
    console.error('Search Jira issues error:', error.message);
    res.status(500).json({ error: 'Failed to search Jira issues' });
  }
});

// Import issues from Jira to a room
router.post('/import/room/:roomId', authenticateToken, 
  [
    param('roomId').isInt(),
    body('issueKeys').isArray().withMessage('Issue keys must be an array'),
    body('issueKeys.*').isString().notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { roomId } = req.params;
      const { issueKeys } = req.body;

      // Check if user is admin in the room
      const admin = await isRoomAdmin(pool, req.user.id, roomId);
      if (!admin) {
        return res.status(403).json({ error: 'Only admins can import tasks' });
      }

      // Get Jira settings
      const jiraConfig = await getUserJiraSettings(req.user.id);
      if (!jiraConfig) {
        return res.status(400).json({ error: 'Jira integration not enabled' });
      }

      // Create Jira client
      const jira = createJiraClient(jiraConfig);

      // Import issues
      const importResults = [];
      const importErrors = [];

      for (const issueKey of issueKeys) {
        try {
          // Get issue from Jira
          const issue = await jira.findIssue(issueKey);
          
          // Convert to task
          const taskData = convertJiraIssueToTask(issue);
          
          // Insert into database
          const result = await pool.query(
            `INSERT INTO tasks (room_id, title, description, created_by, status) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id`,
            [roomId, taskData.title, taskData.description, req.user.id, 'draft']
          );
          
          const taskId = result.rows[0].id;
          
          // Create link between task and Jira issue
          await pool.query(
            `INSERT INTO jira_issue_links (task_id, jira_issue_id, jira_issue_key, jira_project_key) 
             VALUES ($1, $2, $3, $4)`,
            [taskId, taskData.jira_issue_id, taskData.jira_issue_key, taskData.jira_project_key]
          );
          
          importResults.push({
            taskId,
            jiraIssueKey: issueKey,
            success: true
          });
        } catch (error) {
          console.error(`Error importing issue ${issueKey}:`, error.message);
          importErrors.push({
            jiraIssueKey: issueKey,
            error: error.message
          });
        }
      }

      // Get the imported tasks
      let tasks = [];
      if (importResults.length > 0) {
        const taskIds = importResults.map(r => r.taskId);
        const tasksResult = await pool.query(
          `SELECT t.*, u.name as created_by_name, jl.jira_issue_key
           FROM tasks t
           LEFT JOIN users u ON t.created_by = u.id
           LEFT JOIN jira_issue_links jl ON t.id = jl.task_id
           WHERE t.id = ANY($1)`,
          [taskIds]
        );
        tasks = tasksResult.rows;
      }

      // Emit socket event if tasks were imported
      const io = req.app.get('io');
      if (io && tasks.length > 0) {
        tasks.forEach(task => {
          io.to(`room-${roomId}`).emit('task-created', task);
        });
      }

      res.json({
        message: `Imported ${importResults.length} tasks with ${importErrors.length} errors`,
        importedTasks: tasks,
        errors: importErrors
      });
    } catch (error) {
      console.error('Import Jira issues error:', error.message);
      res.status(500).json({ error: 'Failed to import Jira issues' });
    }
  }
);

// Export task to Jira
router.post('/export/task/:taskId', authenticateToken, 
  [
    param('taskId').isInt(),
    body('projectKey').isString().notEmpty().withMessage('Project key is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { taskId } = req.params;
      const { projectKey, issueType = 'Task' } = req.body;

      // Get the task - explicitly selecting story_points field
      const taskResult = await pool.query(
        `SELECT t.id, t.title, t.description, t.room_id, t.story_points, t.is_active, t.status, t.created_by,
               r.id as room_id 
         FROM tasks t 
         JOIN rooms r ON t.room_id = r.id 
         WHERE t.id = $1`,
        [taskId]
      );
      
      if (taskResult.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      const task = taskResult.rows[0];
      console.log('Task data for export:', JSON.stringify(task));

      // Check if user has access to the room
      const access = await hasRoomAccess(pool, req.user.id, task.room_id);
      if (!access) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check if task is already linked to a Jira issue
      const linkResult = await pool.query(
        'SELECT * FROM jira_issue_links WHERE task_id = $1',
        [taskId]
      );
      const existingLink = linkResult.rows[0] || null;

      // Get Jira settings
      const jiraConfig = await getUserJiraSettings(req.user.id);
      if (!jiraConfig) {
        return res.status(400).json({ error: 'Jira integration not enabled' });
      }

      // If there is already a linked Jira issue, update it instead of creating a new one
      if (existingLink) {
        const updateData = {
          fields: {
            summary: task.title,
            description: task.description || ''
          }
        };

        const storyPointsFieldId = getStoryPointsFieldId();
        const hasStoryPoints = task.story_points !== null && task.story_points !== undefined;
        
        if (storyPointsFieldId && hasStoryPoints) {
          updateData.fields[storyPointsFieldId] = Number(task.story_points);
          console.log(`Adding story points (${task.story_points}) to field ${storyPointsFieldId} in export flow`);
        }

        await updateJiraIssue(jiraConfig, existingLink.jira_issue_key, updateData);
        
        // Verify story points update by fetching the issue directly
        try {
          const jira = createJiraClient(jiraConfig);
          const updatedIssue = await jira.findIssue(existingLink.jira_issue_key);
          const storyPointsFieldId = getStoryPointsFieldId();

          if (storyPointsFieldId) {
            console.log('Story Points Value in Jira:', updatedIssue.fields[storyPointsFieldId]);
          } else {
            console.log('No story points field configured');
          }
        } catch (verifyError) {
          console.error('Failed to verify issue update:', verifyError.message);
        }

        // Ensure stored project key remains up to date if user selected a different project
        if (projectKey && projectKey !== existingLink.jira_project_key) {
          await pool.query(
            `UPDATE jira_issue_links SET jira_project_key = $1 WHERE id = $2`,
            [projectKey, existingLink.id]
          );
        }

        return res.json({
          message: 'Task synchronized with existing Jira issue',
          jiraIssue: {
            id: existingLink.jira_issue_id,
            key: existingLink.jira_issue_key,
            url: `${jiraConfig.jiraUrl}/browse/${existingLink.jira_issue_key}`
          }
        });
      }

      // Convert task to Jira issue format for new issue creation
      const issueData = convertTaskToJiraIssue(task, projectKey, issueType);

      // Create issue in Jira
      const issue = await createJiraIssue(jiraConfig, issueData);

      // Create link between task and Jira issue
      await pool.query(
        `INSERT INTO jira_issue_links (task_id, jira_issue_id, jira_issue_key, jira_project_key) 
         VALUES ($1, $2, $3, $4)`,
        [taskId, issue.id, issue.key, projectKey]
      );

      res.json({
        message: 'Task exported to Jira successfully',
        jiraIssue: {
          id: issue.id,
          key: issue.key,
          url: `${jiraConfig.jiraUrl}/browse/${issue.key}`
        }
      });
    } catch (error) {
      console.error('Export task to Jira error:', error.message);
      res.status(500).json({ error: 'Failed to export task to Jira' });
    }
  }
);

// Update Jira issue with task details
router.put('/sync/task/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;

    // Get the task - explicitly selecting story_points field
    const taskResult = await pool.query(
      `SELECT t.id, t.title, t.description, t.room_id, t.story_points, t.is_active, t.status, t.created_by,
              jl.jira_issue_key, jl.jira_project_key
       FROM tasks t
       LEFT JOIN jira_issue_links jl ON t.id = jl.task_id
       WHERE t.id = $1`,
      [taskId]
    );
    
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = taskResult.rows[0];

    // Check if task is linked to a Jira issue
    if (!task.jira_issue_key) {
      return res.status(400).json({ error: 'Task is not linked to a Jira issue' });
    }

    // Check if user has access to the room
    const access = await hasRoomAccess(pool, req.user.id, task.room_id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get Jira settings
    const jiraConfig = await getUserJiraSettings(req.user.id);
    if (!jiraConfig) {
      return res.status(400).json({ error: 'Jira integration not enabled' });
    }

    // Prepare update data
    const updateData = {
      fields: {
        summary: task.title,
        description: task.description || ''
      }
    };

    // Add story points if available
    const storyPointsFieldId = getStoryPointsFieldId();
    const hasStoryPoints = task.story_points !== null && task.story_points !== undefined;
    
    if (storyPointsFieldId && hasStoryPoints) {
      updateData.fields[storyPointsFieldId] = Number(task.story_points);
      console.log(`Adding story points (${task.story_points}) to field ${storyPointsFieldId} in update data`);
    }

    // Update Jira issue
    await updateJiraIssue(jiraConfig, task.jira_issue_key, updateData);
    
    // Verify story points update by fetching the issue directly
    try {
      const jira = createJiraClient(jiraConfig);
      const updatedIssue = await jira.findIssue(task.jira_issue_key);

      if (storyPointsFieldId) {
        console.log('Story Points Value in Jira:', updatedIssue.fields[storyPointsFieldId]);
        console.log('Task story points (local):', task.story_points);
      } else {
        console.log('No story points field configured');
      }
    } catch (verifyError) {
      console.error('Failed to verify issue update:', verifyError.message);
    }

    res.json({
      message: 'Task synchronized with Jira issue',
      jiraIssueKey: task.jira_issue_key,
      url: `${jiraConfig.jiraUrl}/browse/${task.jira_issue_key}`
    });
  } catch (error) {
    console.error('Sync task with Jira error:', error.message);
    res.status(500).json({ error: 'Failed to synchronize task with Jira' });
  }
});

// Get linked Jira issue for a task
router.get('/task/:taskId/link', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;

    // Get the task
    const taskResult = await pool.query(
      `SELECT t.*, r.id as room_id 
       FROM tasks t 
       JOIN rooms r ON t.room_id = r.id 
       WHERE t.id = $1`,
      [taskId]
    );
    
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user has access to the room
    const access = await hasRoomAccess(pool, req.user.id, taskResult.rows[0].room_id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get the link
    const linkResult = await pool.query(
      `SELECT * FROM jira_issue_links WHERE task_id = $1`,
      [taskId]
    );

    if (linkResult.rows.length === 0) {
      return res.status(404).json({ error: 'No Jira link found for this task' });
    }

    const link = linkResult.rows[0];

    // Get Jira settings for URL
    const jiraConfig = await getUserJiraSettings(req.user.id);
    const jiraUrl = jiraConfig ? jiraConfig.jiraUrl : null;

    res.json({
      ...link,
      browserUrl: jiraUrl ? `${jiraUrl}/browse/${link.jira_issue_key}` : null
    });
  } catch (error) {
    console.error('Get Jira link error:', error.message);
    res.status(500).json({ error: 'Failed to get Jira link' });
  }
});

// Batch export all tasks in a room to Jira
router.post('/export/room/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { projectKey, issueType = 'Task' } = req.body;
    
    // Check if user has access to the room
    const access = await hasRoomAccess(pool, req.user.id, roomId);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get all tasks in the room (not just active ones)
    const tasksResult = await pool.query(
      `SELECT t.id, t.title, t.description, t.room_id, t.story_points, t.is_active, t.status, t.created_by
       FROM tasks t
       WHERE t.room_id = $1
       ORDER BY t.created_at DESC`,
      [roomId]
    );
    
    if (tasksResult.rows.length === 0) {
      return res.status(404).json({ error: 'No tasks found in the room' });
    }
    
    // Get Jira settings
    const jiraConfig = await getUserJiraSettings(req.user.id);
    if (!jiraConfig) {
      return res.status(400).json({ error: 'Jira integration not enabled' });
    }
    
    let exported = 0;
    let synced = 0;
    const errors = [];
    
    // Check if tasks have Jira links
    const tasksWithLinks = await pool.query(
      `SELECT t.id, jil.jira_issue_key
       FROM tasks t
       LEFT JOIN jira_issue_links jil ON t.id = jil.task_id
       WHERE t.room_id = $1`,
      [roomId]
    );
    
    const taskLinkMap = {};
    tasksWithLinks.rows.forEach(row => {
      taskLinkMap[row.id] = row.jira_issue_key;
    });
    
    // Check if we need projectKey for any tasks
    const tasksToExport = tasksResult.rows.filter(t => !taskLinkMap[t.id]);
    if (tasksToExport.length > 0 && !projectKey) {
      return res.status(400).json({ error: 'Project key is required for exporting new tasks' });
    }
    
    // Process each task
    for (const task of tasksResult.rows) {
      try {
        const existingLink = taskLinkMap[task.id];
        
        if (existingLink) {
          // Update existing issue
          const updateData = {
            fields: {
              summary: task.title,
              description: task.description || ''
            }
          };
          
          const storyPointsFieldId = getStoryPointsFieldId();
          const hasStoryPoints = task.story_points !== null && task.story_points !== undefined;
          
          if (storyPointsFieldId && hasStoryPoints) {
            updateData.fields[storyPointsFieldId] = Number(task.story_points);
          }
          
          await updateJiraIssue(jiraConfig, existingLink, updateData);
          synced++;
        } else {
          // Create new issue
          const issueData = convertTaskToJiraIssue(task, projectKey, issueType);
          const issue = await createJiraIssue(jiraConfig, issueData);
          
          // Create link between task and Jira issue
          await pool.query(
            `INSERT INTO jira_issue_links (task_id, jira_issue_id, jira_issue_key, jira_project_key) 
             VALUES ($1, $2, $3, $4)`,
            [task.id, issue.id, issue.key, projectKey]
          );
          exported++;
        }
      } catch (error) {
        console.error(`Error processing task ${task.id}:`, error.message);
        errors.push(`${task.title}: ${error.message}`);
      }
    }
    
    res.json({
      message: `Processed ${exported + synced} tasks: ${exported} exported, ${synced} synced`,
      exported,
      synced,
      errors
    });
  } catch (error) {
    console.error('Batch export to Jira error:', error.message);
    res.status(500).json({ error: 'Failed to batch export tasks to Jira' });
  }
});

// Batch sync all tasks in a room with Jira
router.put('/sync/room/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Check if user has access to the room
    const access = await hasRoomAccess(pool, req.user.id, roomId);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get all active tasks in the room with Jira links
    const tasksResult = await pool.query(
      `SELECT t.id, t.title, t.description, t.room_id, t.story_points, t.is_active, t.status, t.created_by,
              jl.jira_issue_key, jl.jira_project_key
       FROM tasks t
       JOIN jira_issue_links jl ON t.id = jl.task_id
       WHERE t.room_id = $1 AND t.is_active = true`,
      [roomId]
    );
    
    if (tasksResult.rows.length === 0) {
      return res.status(404).json({ error: 'No linked tasks found in the room' });
    }
    
    // Get Jira settings
    const jiraConfig = await getUserJiraSettings(req.user.id);
    if (!jiraConfig) {
      return res.status(400).json({ error: 'Jira integration not enabled' });
    }
    
    const results = [];
    const errors = [];
    
    // Process each task
    for (const task of tasksResult.rows) {
      try {
        if (!task.jira_issue_key) {
          errors.push({
            taskId: task.id,
            title: task.title,
            error: 'No Jira issue linked'
          });
          continue;
        }
        
        const updateData = {
          fields: {
            summary: task.title,
            description: task.description || ''
          }
        };
        
        const storyPointsFieldId = getStoryPointsFieldId();
        const hasStoryPoints = task.story_points !== null && task.story_points !== undefined;
        
        if (storyPointsFieldId && hasStoryPoints) {
          updateData.fields[storyPointsFieldId] = Number(task.story_points);
        }
        
        await updateJiraIssue(jiraConfig, task.jira_issue_key, updateData);
        
        results.push({
          taskId: task.id,
          title: task.title,
          action: 'synced',
          jiraIssueKey: task.jira_issue_key,
          url: `${jiraConfig.jiraUrl}/browse/${task.jira_issue_key}`
        });
      } catch (error) {
        console.error(`Error syncing task ${task.id}:`, error.message);
        errors.push({
          taskId: task.id,
          title: task.title,
          error: error.message
        });
      }
    }
    
    res.json({
      message: `Synced ${results.length} tasks (${errors.length} errors)`,
      results,
      errors
    });
  } catch (error) {
    console.error('Batch sync with Jira error:', error.message);
    res.status(500).json({ error: 'Failed to batch sync tasks with Jira' });
  }
});

// CSV export endpoint for tasks in a room
router.get('/export/csv/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Check if user has access to the room
    const access = await hasRoomAccess(pool, req.user.id, roomId);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get room details for the filename
    const roomResult = await pool.query('SELECT name FROM rooms WHERE id = $1', [roomId]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    const roomName = roomResult.rows[0].name;
    
    // Get all tasks in the room
    const tasksResult = await pool.query(
      `SELECT t.id, t.title, t.description, t.story_points, t.status, t.created_at,
              u.name as created_by_name,
              jl.jira_issue_key
       FROM tasks t
       LEFT JOIN users u ON t.created_by = u.id
       LEFT JOIN jira_issue_links jl ON t.id = jl.task_id
       WHERE t.room_id = $1
       ORDER BY t.created_at DESC`,
      [roomId]
    );
    
    // Format data for CSV
    const csvData = tasksResult.rows.map(task => ({
      'ID': task.id,
      'Title': task.title,
      'Description': task.description || '',
      'Story Points': task.story_points || '',
      'Status': task.status,
      'Created By': task.created_by_name || 'Anonymous',
      'Created Date': new Date(task.created_at).toISOString().split('T')[0],
      'Jira Key': task.jira_issue_key || ''
    }));
    
    // Create CSV string
    const csvFields = Object.keys(csvData[0]);
    const csvParser = new (require('json2csv')).Parser({ fields: csvFields });
    const csv = csvParser.parse(csvData);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${roomName}-tasks.csv"`);
    
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error.message);
    res.status(500).json({ error: 'Failed to export tasks to CSV' });
  }
});

module.exports = router;
