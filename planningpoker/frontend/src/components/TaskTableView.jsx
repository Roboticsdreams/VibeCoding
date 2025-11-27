import { useState, useEffect } from 'react';
import { Edit2, Trash2, Play, CheckCircle, ChevronUp, ChevronDown, RefreshCw, FileSymlink, ExternalLink } from 'lucide-react';
import { tasksAPI, votesAPI } from '../lib/api';
import { jiraAPI } from '../lib/jira-api';
import { socketClient } from '../lib/socket';
import EditTaskModal from './EditTaskModal';
import JiraExportModal from './JiraExportModal';

export default function TaskTableView({ tasks, roomId, isAdmin, onUpdate }) {
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [editingTask, setEditingTask] = useState(null);
  const [exportingTask, setExportingTask] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [jiraLinks, setJiraLinks] = useState({});

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedTasks = () => {
    const sorted = [...tasks].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null values
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      // String comparison
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return sorted;
  };

  const handleActivate = async (task) => {
    try {
      const response = await tasksAPI.activate(task.id);
      socketClient.emitTaskActivated(roomId, response.data.task);
      onUpdate();
    } catch (error) {
      console.error('Failed to activate task:', error);
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await tasksAPI.delete(task.id);
      socketClient.emitTaskDeleted(roomId, task.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleResetVotes = async (task) => {
    if (!window.confirm('Reset all votes for this task? The task will be reactivated for voting.')) return;

    try {
      setResetting(task.id);
      await votesAPI.clearAll(task.id);
      await tasksAPI.activate(task.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to reset votes:', error);
      alert(error.response?.data?.error || 'Failed to reset votes');
    } finally {
      setResetting(null);
    }
  };

  const getStatusBadge = (task) => {
    if (task.story_points !== null) {
      return (
        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          <CheckCircle size={12} className="mr-1" />
          {task.story_points} SP
        </span>
      );
    }
    if (task.is_active) {
      return (
        <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium animate-pulse">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
        {task.status}
      </span>
    );
  };

  const SortHeader = ({ field, label, className = '' }) => (
    <th
      onClick={() => handleSort(field)}
      className={`px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
        )}
      </div>
    </th>
  );

  // Fetch Jira links for all tasks
  useEffect(() => {
    const fetchJiraLinks = async () => {
      const links = {};
      
      for (const task of tasks) {
        try {
          const response = await jiraAPI.getTaskLink(task.id);
          links[task.id] = response.data;
        } catch (error) {
          // No link found or error - skip
          if (error.response?.status !== 404) {
            console.error(`Error fetching Jira link for task ${task.id}:`, error);
          }
        }
      }
      
      setJiraLinks(links);
    };
    
    if (tasks.length > 0) {
      fetchJiraLinks();
    }
  }, [tasks]);

  // Function to truncate text to specified length with ellipsis
  const truncateText = (text, maxLength = 20) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  return (
    <div className="card p-0">
      <div>
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortHeader field="title" label="Task" className="w-1/5" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-1/5">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Jira ID
              </th>
              <SortHeader field="status" label="Status" />
              <SortHeader field="vote_count" label="Votes" />
              {isAdmin && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getSortedTasks().map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap" title={task.title}>
                  <div className="text-sm font-medium text-gray-900 truncate">{truncateText(task.title, 20)}</div>
                </td>
                <td className="px-6 py-4" title={task.description || '-'}>
                  <div className="text-sm text-gray-600 truncate">
                    {truncateText(task.description, 20)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {jiraLinks[task.id] ? (
                    <a 
                      href={jiraLinks[task.id].browserUrl}
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(jiraLinks[task.id].browserUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                    >
                      {jiraLinks[task.id].jira_issue_key}
                      <ExternalLink size={12} className="ml-1" />
                    </a>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(task)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {task.vote_count || 0} / {task.total_participants || 0}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Edit Task"
                      >
                        <Edit2 size={16} />
                      </button>
                      {task.vote_count > 0 && (
                        <button
                          onClick={() => handleResetVotes(task)}
                          disabled={resetting === task.id}
                          className="text-orange-600 hover:text-orange-900 transition-colors disabled:opacity-50"
                          title="Reset votes and allow revoting"
                        >
                          <RefreshCw size={16} className={resetting === task.id ? 'animate-spin' : ''} />
                        </button>
                      )}
                      {!task.is_active && (
                        <button
                          onClick={() => handleActivate(task)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Activate Task"
                        >
                          <Play size={16} />
                        </button>
                      )}
                      {task.story_points !== null && (
                        <>
                          <button
                            onClick={() => setExportingTask(task)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Export to Jira"
                          >
                            <FileSymlink size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(task)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No tasks yet</p>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          roomId={roomId}
          onClose={() => setEditingTask(null)}
          onSuccess={onUpdate}
        />
      )}
      
      {/* Export to Jira Modal */}
      {exportingTask && (
        <JiraExportModal
          task={exportingTask}
          onClose={() => setExportingTask(null)}
          onSuccess={onUpdate}
        />
      )}
      
    </div>
  );
}
