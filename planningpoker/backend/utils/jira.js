const JiraClient = require('jira-client');
const axios = require('axios');

/**
 * Create a Jira API client
 * @param {Object} config - Configuration object
 * @param {string} config.jiraUrl - Jira instance URL
 * @param {string} config.jiraEmail - Jira user email/username
 * @param {string} config.jiraToken - Jira API token or personal access token (PAT)
 * @param {string} config.authType - Authentication type ('basic', 'token', or 'pat')
 * @returns {JiraClient} Configured Jira client
 */
const createJiraClient = ({ jiraUrl, jiraEmail, jiraToken, authType = 'token' }) => {
  if (!jiraUrl || !jiraEmail || !jiraToken) {
    throw new Error('Missing Jira configuration parameters');
  }

  // Extract host from the URL
  let host;
  let protocol = 'https';
  let apiVersion = '3'; // Default for Jira Cloud
  let isJiraDataCenter = false;
  
  try {
    const url = new URL(jiraUrl);
    host = url.hostname;
    protocol = url.protocol.replace(':', '');
    
    // Detect if this is likely a Data Center instance
    if (host.includes('athenahealth.com') || 
        process.env.JIRA_TYPE === 'server' || 
        process.env.JIRA_TYPE === 'data-center') {
      apiVersion = '2'; // For Jira Server/Data Center
      isJiraDataCenter = true;
      
      // Default to PAT auth for Data Center if not specified
      if (!authType || authType === 'token') {
        authType = process.env.JIRA_AUTH_TYPE || 'pat';
      }
    }
  } catch (error) {
    throw new Error('Invalid Jira URL');
  }
  
  // Check for environment variable to disable SSL verification (for self-signed certs)
  const strictSSL = process.env.JIRA_ALLOW_SELF_SIGNED !== 'true';
  
  const options = {
    protocol,
    host,
    apiVersion,
    strictSSL, // Set to false for self-signed certificates
    rejectUnauthorized: strictSSL // Additional setting for axios requests
  };
  
  // Set up authentication based on the specified type
  switch (authType.toLowerCase()) {
    case 'pat':
      // For PAT authentication, depending on Jira version:
      console.log('Using Personal Access Token (PAT) authentication');
      options.bearer = jiraToken; // Bearer token authentication
      break;
    
    case 'basic':
      // For basic authentication:
      console.log('Using Basic authentication');
      options.username = jiraEmail;
      options.password = jiraToken;
      break;
      
    case 'token':
    default:
      // For API token authentication (default for Jira Cloud):
      console.log('Using API Token authentication');
      options.username = jiraEmail;
      options.password = jiraToken;
      break;
  }
  
  // For Data Center instances, use different authentication options if needed
  if (isJiraDataCenter) {
    // For Athenahealth Jira, modify the username format if needed
    if (host.includes('athenahealth.com')) {
      // If the username contains @athenahealth.com, remove it
      if (jiraEmail.toLowerCase().includes('@athenahealth.com')) {
        options.username = jiraEmail.split('@')[0]; // Use only the username part
        console.log('Athenahealth Jira detected - using username without domain');
      }
      
      // For Athenahealth Jira Server, we might need to use cookie-based auth
      // or some other mechanism, but we'll try basic auth first
      console.log('Connecting to Athenahealth Jira instance - using API version:', apiVersion);
    } else {
      // For other Data Center/Server instances
      console.log('Using Jira Data Center/Server authentication mode with API version:', apiVersion);
    }
  }
  
  return new JiraClient(options);
};

/**
 * Verify Jira credentials by attempting to get current user info
 * @param {Object} config - Jira configuration
 * @returns {Promise<Object>} User information if credentials are valid
 */
const verifyJiraCredentials = async (config) => {
  try {
    const jira = createJiraClient(config);
    
    // First try the standard API method
    return await jira.getCurrentUser();
  } catch (error) {
    console.error('Jira verification error:', error);
    
    // Provide more detailed error message for certificate issues
    if (error.code === 'SELF_SIGNED_CERT_IN_CHAIN' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      throw new Error('SSL Certificate error: Your Jira instance is using a self-signed certificate. Set JIRA_ALLOW_SELF_SIGNED=true in your .env file.');
    }
    
    // If we got a 401, try a direct basic auth request as fallback 
    if (error.statusCode === 401 || (error.response && error.response.status === 401)) {
      try {
        console.log('Trying alternative authentication method...');
        const { jiraUrl, jiraEmail, jiraToken } = config;
        
        // Prepare username - for Athenahealth Jira, strip domain if present
        let username = jiraEmail;
        if (jiraUrl.includes('athenahealth.com') && username.includes('@')) {
          username = username.split('@')[0]; // Just use the username part
          console.log('Using username without domain for Athenahealth Jira');
        }
        
        // Check if we should use PAT or Basic Auth for fallback
        const usePatAuth = process.env.JIRA_AUTH_TYPE === 'pat' || jiraUrl.includes('athenahealth.com');
        
        let requestConfig;
        if (usePatAuth) {
          // Try PAT auth (Bearer token)
          requestConfig = {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${jiraToken}`
            },
            validateStatus: null,
            timeout: 10000
          };
          console.log('Trying fallback with PAT authentication (Bearer token)');
        } else {
          // Try Basic Auth
          requestConfig = {
            auth: {
              username: username,
              password: jiraToken
            },
            headers: {
              'Accept': 'application/json'
            },
            validateStatus: null,
            timeout: 10000
          };
          console.log('Trying fallback with Basic authentication');
        }
        
        // Make the request
        const response = await axios.get(
          `${jiraUrl}/rest/api/2/myself`,
          requestConfig
        );
        
        console.log('Authentication response status:', response.status);
        
        if (response.status === 200) {
          return response.data;
        } else {
          throw new Error(`Authentication failed with status: ${response.status}`);
        }
      } catch (fallbackError) {
        console.error('Fallback authentication failed:', fallbackError);
        throw new Error('Failed to authenticate with Jira. Please check your URL, email, and API token.');
      }
    }
    
    throw new Error('Invalid Jira credentials or connection error');
  }
};

/**
 * Convert a Planning Poker task to Jira issue format
 * @param {Object} task - Planning Poker task
 * @param {string} projectKey - Jira project key
 * @returns {Object} Jira issue data
 */
const getStoryPointsFieldId = () => {
  const configuredId = process.env.JIRA_STORY_POINTS_FIELD_ID;

  if (!configuredId || configuredId.trim() === '') {
    return 'customfield_10002';
  }

  if (configuredId.toLowerCase() === 'none' || configuredId.toLowerCase() === 'false') {
    return null;
  }

  return configuredId;
};

const convertTaskToJiraIssue = (task, projectKey, issueType = 'Task') => {
  const storyPointsFieldId = getStoryPointsFieldId();
  console.log('Story Points Field ID:', storyPointsFieldId);
  console.log('Task Story Points:', task.story_points, typeof task.story_points);
  
  // Handle both number and string representations of story points
  const hasStoryPoints = task.story_points !== null && task.story_points !== undefined;
  const storyPointsField = (storyPointsFieldId && hasStoryPoints)
    ? { [storyPointsFieldId]: Number(task.story_points) }
    : {};
    
  console.log('Story Points Field to send:', storyPointsField);

  return {
    fields: {
      project: {
        key: projectKey
      },
      summary: task.title,
      description: task.description || '',
      issuetype: {
        name: issueType
      },
      ...storyPointsField
    }
  };
};

/**
 * Convert a Jira issue to Planning Poker task format
 * @param {Object} issue - Jira issue
 * @returns {Object} Task data for Planning Poker
 */
const convertJiraIssueToTask = (issue) => {
  const storyPointsFieldId = getStoryPointsFieldId();
  console.log('Reading story points from field:', storyPointsFieldId);
  const storyPoints = storyPointsFieldId ? issue.fields?.[storyPointsFieldId] ?? null : null;
  console.log('Found story points:', storyPoints);
  
  return {
    title: issue.fields.summary,
    description: issue.fields.description || '',
    story_points: storyPoints,
    jira_issue_key: issue.key,
    jira_issue_id: issue.id,
    jira_project_key: issue.fields.project.key,
    status: issue.fields.status.name
  };
};

/**
 * Get all projects the user has access to
 * @param {Object} config - Jira configuration
 * @returns {Promise<Array>} List of projects
 */
const getJiraProjects = async (config) => {
  try {
    const jira = createJiraClient(config);
    return await jira.listProjects();
  } catch (error) {
    console.error('Error getting Jira projects:', error.message);
    throw error;
  }
};

/**
 * Search for Jira issues with JQL query
 * @param {Object} config - Jira configuration
 * @param {string} jql - JQL query string
 * @returns {Promise<Array>} List of issues
 */
const searchJiraIssues = async (config, jql) => {
  try {
    const jira = createJiraClient(config);
    return await jira.searchJira(jql);
  } catch (error) {
    console.error('Error searching Jira issues:', error.message);
    throw error;
  }
};

/**
 * Create a new issue in Jira
 * @param {Object} config - Jira configuration
 * @param {Object} issueData - Issue data
 * @returns {Promise<Object>} Created issue
 */
const createJiraIssue = async (config, issueData) => {
  try {
    const jira = createJiraClient(config);
    return await jira.addNewIssue(issueData);
  } catch (error) {
    console.error('Error creating Jira issue:', error.message);
    throw error;
  }
};

/**
 * Update an existing issue in Jira
 * @param {Object} config - Jira configuration
 * @param {string} issueKey - Issue key
 * @param {Object} issueData - Issue update data
 * @returns {Promise<void>}
 */
const updateJiraIssue = async (config, issueKey, issueData) => {
  try {
    console.log(`Updating Jira issue ${issueKey} with data:`, JSON.stringify(issueData));
    const jira = createJiraClient(config);
    const result = await jira.updateIssue(issueKey, issueData);
    console.log(`Successfully updated Jira issue ${issueKey}`);
    return result;
  } catch (error) {
    console.error(`Error updating Jira issue ${issueKey}:`, error.message);
    console.error('Full error:', error);
    throw error;
  }
};

module.exports = {
  createJiraClient,
  verifyJiraCredentials,
  convertTaskToJiraIssue,
  convertJiraIssueToTask,
  getStoryPointsFieldId,
  getJiraProjects,
  searchJiraIssues,
  createJiraIssue,
  updateJiraIssue
};
