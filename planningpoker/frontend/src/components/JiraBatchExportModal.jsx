import { useState, useEffect, useRef, useMemo } from 'react';
import { X, AlertCircle, FileSymlink, RefreshCw } from 'lucide-react';
import { jiraAPI } from '../lib/jira-api';

export default function JiraBatchExportModal({ roomId, tasks = [], onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [issueType, setIssueType] = useState('Task');
  const dropdownRef = useRef(null);
  const tasksArray = Array.isArray(tasks) ? tasks : [];
  const allTasksHaveJira = useMemo(
    () => tasksArray.length > 0 && tasksArray.every(task => task?.jira_issue_key),
    [tasksArray]
  );
  const [mode, setMode] = useState(allTasksHaveJira ? 'sync' : 'export'); // 'export' or 'sync'
  const [results, setResults] = useState(null);
  
  useEffect(() => {
    fetchProjects();
    
    // Handle clicks outside of the dropdown to close it
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (allTasksHaveJira) {
      setMode('sync');
    }
  }, [allTasksHaveJira]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jiraAPI.getProjects();
      setProjects(response.data);
      if (response.data.length > 0) {
        setSelectedProject(response.data[0].key);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.error || 'Failed to fetch Jira projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionMode = allTasksHaveJira ? 'sync' : mode;
    if (actionMode === 'sync' && mode !== 'sync') {
      setMode('sync');
    }

    if (!selectedProject && actionMode === 'export') {
      setError('Please select a project');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      let response;
      
      if (actionMode === 'export') {
        response = await jiraAPI.exportRoom(roomId, {
          projectKey: selectedProject,
          issueType
        });
      } else {
        response = await jiraAPI.syncRoom(roomId);
      }
      
      setResults(response.data);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error processing Jira operation:', err);
      setError(err.response?.data?.error || `Failed to ${mode} tasks to Jira`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {allTasksHaveJira || mode === 'sync' ? 'Sync All Tasks with Jira' : 'Export All Tasks to Jira'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 flex items-start">
            <AlertCircle size={18} className="mr-2 mt-1 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {results ? (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mb-4">
              {results.message}
            </div>
            
            {results.results.length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">Processed Tasks</h3>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jira Key</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.results.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{result.title}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              result.action === 'created' ? 'bg-green-100 text-green-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {result.action}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <a 
                              href={result.url} 
                              className="text-blue-600 hover:text-blue-900"
                            >
                              {result.jiraIssueKey}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {results.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold text-red-600 mb-2">Errors</h3>
                <div className="max-h-60 overflow-y-auto border border-red-200 rounded">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Task</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Error</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.errors.map((error, index) => (
                        <tr key={index} className="hover:bg-red-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{error.title}</td>
                          <td className="px-4 py-2 text-sm text-red-600">{error.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Try Again'
                )}
              </button>
              <button onClick={onClose} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-6">
              <div className={`flex ${allTasksHaveJira ? 'mb-4' : 'space-x-4 mb-6'}`}>
                {!allTasksHaveJira && (
                  <button
                    type="button"
                    onClick={() => setMode('export')}
                    className={`flex-1 py-3 px-4 rounded-md flex items-center justify-center space-x-2 ${
                      mode === 'export'
                        ? 'bg-primary-100 border-2 border-primary-500 text-primary-700'
                        : 'bg-gray-100 border border-gray-300 text-gray-600'
                    }`}
                  >
                    <FileSymlink size={18} />
                    <span>Export to Jira</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMode('sync')}
                  className={`flex-1 py-3 px-4 rounded-md flex items-center justify-center space-x-2 ${
                    mode === 'sync'
                      ? 'bg-primary-100 border-2 border-primary-500 text-primary-700'
                      : 'bg-gray-100 border border-gray-300 text-gray-600'
                  }`}
                  disabled={allTasksHaveJira}
                >
                  <RefreshCw size={18} />
                  <span>Sync with Jira</span>
                </button>
              </div>

              {allTasksHaveJira && (
                <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded">
                  All tasks in this room are already linked to Jira issues. You can run a sync to push the latest
                  title, description, and story points.
                </div>
              )}

              {mode === 'export' && !allTasksHaveJira && (
                <>
                  <div className="mb-4">
                    <label className="form-label" htmlFor="project">
                      Jira Project
                    </label>
                    <div className="relative" ref={dropdownRef}>
                      <input
                        id="project"
                        type="text"
                        className="form-input w-full"
                        placeholder="Search for a project..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowDropdown(true);
                        }}
                        onClick={() => setShowDropdown(true)}
                        disabled={loading || projects.length === 0}
                        required
                      />
                      {selectedProject && (
                        <div className="text-sm text-primary-600 mt-1">
                          Selected: {projects.find(p => p.key === selectedProject)?.name} ({selectedProject})
                        </div>
                      )}
                      {showDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200">
                          {projects
                            .filter(project => {
                              const searchLower = searchTerm.toLowerCase();
                              return project.name.toLowerCase().includes(searchLower) ||
                                project.key.toLowerCase().includes(searchLower);
                            })
                            .map((project) => (
                              <div
                                key={project.id}
                                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-primary-50 ${selectedProject === project.key ? 'bg-primary-100' : ''}`}
                                onClick={() => {
                                  setSelectedProject(project.key);
                                  setSearchTerm(`${project.name} (${project.key})`);
                                  setShowDropdown(false);
                                }}
                              >
                                <span className="block truncate">
                                  {project.name} ({project.key})
                                </span>
                              </div>
                            ))}
                          {projects.filter(project => {
                            const searchLower = searchTerm.toLowerCase();
                            return project.name.toLowerCase().includes(searchLower) ||
                              project.key.toLowerCase().includes(searchLower);
                          }).length === 0 && (
                            <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-500">
                              No projects found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label" htmlFor="issueType">
                      Issue Type
                    </label>
                    <select
                      id="issueType"
                      className="form-input"
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      disabled={loading}
                    >
                      <option value="Task">Task</option>
                      <option value="Story">Story</option>
                      <option value="Bug">Bug</option>
                      <option value="Epic">Epic</option>
                    </select>
                  </div>
                </>
              )}

              {(mode === 'sync' || allTasksHaveJira) && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded mb-4">
                  This will update all Jira issues that are already linked to tasks in this room.
                  Unlinked tasks won't be affected. This action can't be undone.
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || ((mode === 'export' && !allTasksHaveJira) && !selectedProject)}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (mode === 'export' && !allTasksHaveJira) ? (
                  'Export All Tasks'
                ) : (
                  'Sync All Tasks'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
