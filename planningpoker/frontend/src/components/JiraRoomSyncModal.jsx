import { useState, useEffect } from 'react';
import { X, Search, FileSymlink, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { jiraAPI } from '../lib/jira-api';

export default function JiraRoomSyncModal({ roomId, tasks, onClose, onSuccess }) {
  const [jiraProjects, setJiraProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [issueType, setIssueType] = useState('Story');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const issueTypes = [
    { value: 'Story', label: 'Story' },
    { value: 'Task', label: 'Task' },
    { value: 'Bug', label: 'Bug' },
    { value: 'Epic', label: 'Epic' },
    { value: 'Improvement', label: 'Improvement' },
  ];

  // Separate tasks into those with and without Jira links
  const tasksToExport = tasks.filter(t => !t.jira_issue_key);
  const tasksToSync = tasks.filter(t => t.jira_issue_key);

  useEffect(() => {
    loadJiraProjects();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProjectDropdown && !event.target.closest('.project-dropdown-container')) {
        setShowProjectDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProjectDropdown]);

  const loadJiraProjects = async () => {
    setLoadingProjects(true);
    try {
      const response = await jiraAPI.getProjects();
      setJiraProjects(response.data || []);
    } catch (err) {
      console.error('Failed to load Jira projects:', err);
      setError('Failed to load Jira projects. Please check your Jira settings.');
    } finally {
      setLoadingProjects(false);
    }
  };

  const filteredProjects = jiraProjects.filter(project =>
    project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.key?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSync = async () => {
    if (tasksToExport.length > 0 && !selectedProject) {
      setError('Please select a Jira project for exporting new tasks');
      return;
    }

    setProcessing(true);
    setError('');
    setResults(null);

    try {
      // Only include projectKey and issueType if we have tasks to export
      const requestData = tasksToExport.length > 0 ? {
        projectKey: selectedProject,
        issueType: issueType
      } : {};
      
      const response = await jiraAPI.exportRoom(roomId, requestData);

      const { exported, synced, errors } = response.data;
      
      setResults({
        exported: exported || 0,
        synced: synced || 0,
        errors: errors || [],
        total: (exported || 0) + (synced || 0)
      });

      // Refresh the parent component after a brief delay
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (err) {
      console.error('Failed to sync with Jira:', err);
      setError(err.response?.data?.error || 'Failed to sync with Jira');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <FileSymlink size={24} className="text-primary-600" />
            <h2 className="text-2xl font-semibold">Jira Export & Sync</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start space-x-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {results ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle size={20} className="text-green-600" />
                <h3 className="font-semibold text-green-900">Sync Completed Successfully!</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-green-800">
                  <span className="font-medium">Total processed:</span> {results.total} tasks
                </p>
                {results.exported > 0 && (
                  <p className="text-green-800">
                    <span className="font-medium">Exported to Jira:</span> {results.exported} new tasks
                  </p>
                )}
                {results.synced > 0 && (
                  <p className="text-green-800">
                    <span className="font-medium">Synced with Jira:</span> {results.synced} existing tasks
                  </p>
                )}
              </div>
              {results.errors && results.errors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-300">
                  <p className="font-medium text-yellow-700 mb-2">Some tasks had issues:</p>
                  <ul className="text-xs text-yellow-600 space-y-1">
                    {results.errors.map((err, idx) => (
                      <li key={idx}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button onClick={onClose} className="btn btn-primary w-full">
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Task Summary */}
            <div className="mb-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">{tasksToExport.length}</div>
                  <div className="text-sm text-blue-700">Tasks to export</div>
                  <div className="text-xs text-blue-600 mt-1">Will be created in Jira</div>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">{tasksToSync.length}</div>
                  <div className="text-sm text-green-700">Tasks to sync</div>
                  <div className="text-xs text-green-600 mt-1">Story points will be updated</div>
                </div>
              </div>
            </div>

            {/* Project Selection (only if there are tasks to export) */}
            {tasksToExport.length > 0 && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-4">Export Settings</h3>
                <div className="space-y-4">
                  {/* Project Selection */}
                  <div className="relative project-dropdown-container">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jira Project *
                    </label>
                    <div className="relative">
                      <div
                        onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                        className="input cursor-pointer flex items-center justify-between"
                      >
                        <span className={selectedProject ? 'text-gray-900' : 'text-gray-400'}>
                          {selectedProject ? 
                            jiraProjects.find(p => p.key === selectedProject)?.name || selectedProject
                            : 'Select a project...'}
                        </span>
                        <Search size={16} className="text-gray-400" />
                      </div>
                      
                      {showProjectDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                          <div className="p-2 border-b">
                            <input
                              type="text"
                              placeholder="Search projects..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {loadingProjects ? (
                              <div className="p-3 text-sm text-gray-500 text-center">Loading projects...</div>
                            ) : filteredProjects.length > 0 ? (
                              filteredProjects.map((project) => (
                                <div
                                  key={project.key}
                                  onClick={() => {
                                    setSelectedProject(project.key);
                                    setShowProjectDropdown(false);
                                    setSearchQuery('');
                                  }}
                                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                >
                                  <div className="font-medium text-sm text-gray-900">{project.name}</div>
                                  <div className="text-xs text-gray-500">{project.key}</div>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-sm text-gray-500 text-center">No projects found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Issue Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Type *
                    </label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="input"
                    >
                      {issueTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex space-x-3">
              <button
                onClick={handleSync}
                disabled={processing || (tasksToExport.length > 0 && !selectedProject)}
                className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FileSymlink size={18} />
                    <span>
                      {tasksToExport.length > 0 && tasksToSync.length > 0
                        ? 'Export & Sync All'
                        : tasksToExport.length > 0
                        ? 'Export to Jira'
                        : 'Sync with Jira'}
                    </span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={processing}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
