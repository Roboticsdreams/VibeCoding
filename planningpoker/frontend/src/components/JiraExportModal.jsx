import { useState, useEffect } from 'react';
import { X, ExternalLink, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { jiraAPI } from '../lib/jira-api';
import useStore from '../store/useStore';

export default function JiraExportModal({ task, onClose, onSuccess }) {
  const { user } = useStore();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [issueType, setIssueType] = useState('Task');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [jiraLink, setJiraLink] = useState(null);

  // Check if Jira integration is enabled
  const isJiraEnabled = user?.jira_integration_enabled;

  // Check if task is already linked to Jira
  const [isLinked, setIsLinked] = useState(false);
  const [taskLink, setTaskLink] = useState(null);

  useEffect(() => {
    if (isJiraEnabled) {
      checkTaskLink();
      fetchProjects();
    }
  }, [isJiraEnabled, task?.id]);

  // Check if the task is already linked to a Jira issue
  const checkTaskLink = async () => {
    try {
      const response = await jiraAPI.getTaskLink(task.id);
      setIsLinked(true);
      setTaskLink(response.data);
    } catch (error) {
      // Task is not linked to Jira issue
      setIsLinked(false);
    }
  };

  // Fetch Jira projects
  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await jiraAPI.getProjects();
      setProjects(response.data);
      
      // Auto-select first project if available
      if (response.data.length > 0) {
        setSelectedProject(response.data[0].key);
      }
    } catch (error) {
      // Handle SSL certificate errors specifically
      if (error.response?.data?.error?.includes('SSL Certificate error') || 
          error.response?.data?.error?.includes('SELF_SIGNED_CERT_IN_CHAIN') ||
          error.response?.data?.error?.includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE')) {
        setError(
          'SSL Certificate Error: Your Jira instance is using a self-signed certificate. ' +
          'Please ask your administrator to set JIRA_ALLOW_SELF_SIGNED=true in the backend .env file.'
        );
      } else {
        setError('Failed to fetch Jira projects. Please check your Jira settings.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Export task to Jira
  const exportToJira = async () => {
    if (!selectedProject) {
      setError('Please select a project');
      return;
    }

    setExporting(true);
    setError('');
    setSuccess('');

    try {
      const response = await jiraAPI.exportTask(task.id, {
        projectKey: selectedProject,
        issueType: issueType
      });

      setSuccess('Task exported to Jira successfully');
      setJiraLink(response.data.jiraIssue);
      
      // After successful export, wait a moment before refreshing
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error) {
      // Handle already linked issue case
      if (error.response?.status === 400 && error.response?.data?.jiraIssueKey) {
        setError(`This task is already linked to Jira issue ${error.response.data.jiraIssueKey}`);
      } 
      // Handle SSL certificate errors specifically
      else if (error.response?.data?.error?.includes('SSL Certificate error') || 
          error.response?.data?.error?.includes('SELF_SIGNED_CERT_IN_CHAIN') ||
          error.response?.data?.error?.includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE')) {
        setError(
          'SSL Certificate Error: Your Jira instance is using a self-signed certificate. ' +
          'Please ask your administrator to set JIRA_ALLOW_SELF_SIGNED=true in the backend .env file.'
        );
      } else {
        setError(error.response?.data?.error || 'Failed to export task to Jira');
      }
    } finally {
      setExporting(false);
    }
  };

  // Synchronize task with Jira
  const synchronizeWithJira = async () => {
    setExporting(true);
    setError('');
    setSuccess('');

    try {
      const response = await jiraAPI.syncTask(task.id);
      setSuccess(`Task synchronized with Jira issue ${response.data.jiraIssueKey}`);
      
      // After successful sync, wait a moment before refreshing
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error) {
      // Handle SSL certificate errors specifically
      if (error.response?.data?.error?.includes('SSL Certificate error') || 
          error.response?.data?.error?.includes('SELF_SIGNED_CERT_IN_CHAIN') ||
          error.response?.data?.error?.includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE')) {
        setError(
          'SSL Certificate Error: Your Jira instance is using a self-signed certificate. ' +
          'Please ask your administrator to set JIRA_ALLOW_SELF_SIGNED=true in the backend .env file.'
        );
      } else {
        setError(error.response?.data?.error || 'Failed to synchronize with Jira');
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <ExternalLink size={20} className="text-primary-600 mr-2" />
            {isLinked ? 'Jira Link' : 'Export to Jira'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4">
          {!isJiraEnabled ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">Jira Integration Not Enabled</h4>
                <p className="text-amber-700">
                  Please enable Jira integration in your profile settings before using this feature.
                </p>
                <button
                  className="mt-3 btn btn-secondary text-sm"
                  onClick={() => window.location.href = '/profile'}
                >
                  Go to Profile Settings
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center space-x-2">
                  <CheckCircle size={16} />
                  <span>{success}</span>
                </div>
              )}

              {/* Task Info */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Task</h4>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  {task.description && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{task.description}</p>
                  )}
                  {task.story_points !== null && (
                    <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Story Points: {task.story_points}
                    </div>
                  )}
                </div>
              </div>

              {/* If already linked to Jira */}
              {isLinked && taskLink ? (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Linked Jira Issue</h4>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        {taskLink.jira_issue_key}
                      </span>
                      <span className="text-xs text-gray-500">
                        Project: {taskLink.jira_project_key}
                      </span>
                    </div>
                    
                    {taskLink.browserUrl && (
                      <a
                        href={taskLink.browserUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="btn btn-secondary text-sm flex items-center space-x-1 w-full mt-2"
                      >
                        <ExternalLink size={14} />
                        <span>Open in Jira</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                /* Export Form */
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project
                    </label>
                    <select
                      className="input w-full"
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      disabled={loading || exporting}
                    >
                      <option value="">Select a project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.key}>
                          {project.name} ({project.key})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Type
                    </label>
                    <select
                      className="input w-full"
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      disabled={exporting}
                    >
                      <option value="Task">Task</option>
                      <option value="Story">Story</option>
                      <option value="Bug">Bug</option>
                      <option value="Epic">Epic</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Success with Link */}
              {jiraLink && (
                <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-3">
                  <p className="text-green-700 mb-3">
                    Task has been successfully exported to Jira.
                  </p>
                  <a
                    href={jiraLink.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="btn btn-primary text-sm flex items-center space-x-1 w-full"
                  >
                    <ExternalLink size={14} />
                    <span>Open {jiraLink.key} in Jira</span>
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end space-x-3">
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            {success ? 'Close' : 'Cancel'}
          </button>
          
          {isJiraEnabled && (
            isLinked ? (
              <button
                className="btn btn-primary flex items-center space-x-2"
                onClick={synchronizeWithJira}
                disabled={exporting}
              >
                {exporting ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                <span>
                  {exporting ? 'Syncing...' : 'Sync with Jira'}
                </span>
              </button>
            ) : !jiraLink && (
              <button
                className="btn btn-primary flex items-center space-x-2"
                onClick={exportToJira}
                disabled={exporting || !selectedProject}
              >
                {exporting ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <ExternalLink size={16} />
                )}
                <span>
                  {exporting ? 'Exporting...' : 'Export to Jira'}
                </span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
