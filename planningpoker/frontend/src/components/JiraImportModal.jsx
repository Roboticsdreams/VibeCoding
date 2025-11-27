import { useState, useEffect, useRef } from 'react';
import { X, Search, FileSymlink, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { jiraAPI } from '../lib/jira-api';
import useStore from '../store/useStore';

export default function JiraImportModal({ roomId, onClose, onSuccess }) {
  const { user } = useStore();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [jqlQuery, setJqlQuery] = useState('');
  const [showJqlPresets, setShowJqlPresets] = useState(false);
  const [issues, setIssues] = useState([]);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState('');

  // Check if Jira integration is enabled
  const isJiraEnabled = user?.jira_integration_enabled;

  useEffect(() => {
    if (isJiraEnabled) {
      fetchProjects();
    }
  }, [isJiraEnabled]);

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
        // Set the project search field to show the selected project
        setProjectSearch(`${response.data[0].name} (${response.data[0].key})`);
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

  // Search for Jira issues
  const searchIssues = async () => {
    if (!selectedProject) {
      setError('Please select a project');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Use a more flexible status filter approach - we want to only see planning-ready items
    // Use statusCategory rather than specific status names to be compatible with different Jira setups
    const statusFilter = 'status in ("New", "To Do", "Open", "Backlog")';
    
    console.log('Using Athenahealth Jira-compatible status filter');
    
    // Build JQL query
    let query;
    if (jqlQuery) {
      // Always apply the status filter even with custom JQL queries
      query = `${jqlQuery} AND ${statusFilter} AND project = "${selectedProject}"`;
    } else {
      query = `${statusFilter} AND project = "${selectedProject}"`;
    }
    
    console.log('Final JQL query:', query);
    
    try {
      const response = await jiraAPI.searchIssues({ jql: query });
      setIssues(response.data.issues || []);
    } catch (error) {
      // Handle SSL certificate errors specifically
      if (error.response?.data?.error?.includes('SSL Certificate error') || 
          error.response?.data?.error?.includes('SELF_SIGNED_CERT_IN_CHAIN') ||
          error.response?.data?.error?.includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE')) {
        setError(
          'SSL Certificate Error: Your Jira instance is using a self-signed certificate. ' +
          'Please ask your administrator to set JIRA_ALLOW_SELF_SIGNED=true in the backend .env file.'
        );
      } else if (handleJiraError(error)) {
        // Error already handled by the function
      } else {
        const errorMsg = error.response?.data?.errorMessages?.join(', ') || error.message || 'Failed to search Jira issues';
        setError(`JQL Error: ${errorMsg}. Please check your query.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle issue selection
  const toggleIssueSelection = (issueKey) => {
    if (selectedIssues.includes(issueKey)) {
      setSelectedIssues(selectedIssues.filter(key => key !== issueKey));
    } else {
      setSelectedIssues([...selectedIssues, issueKey]);
    }
  };

  // Handle Jira errors for better user experience
  const handleJiraError = (error) => {
    console.error('Jira error details:', error);
    
    // Check for status field errors
    if (error.response?.data?.errorMessages?.some(msg => msg.includes('does not exist for the field \'status\''))) {
      setError('Your Jira instance has different status values than expected. ' + 
               'Please try using a simpler JQL query or contact your administrator.');
      return true;
    }
    return false;
  };

  // Import selected issues
  const importIssues = async () => {
    if (selectedIssues.length === 0) {
      setError('Please select at least one issue to import');
      return;
    }

    setImporting(true);
    setError('');
    setSuccess('');

    try {
      console.log('Importing issues:', selectedIssues);
      console.log('Room ID:', roomId);
      
      // Make sure roomId is properly passed
      if (!roomId) {
        throw new Error('Room ID is missing');
      }
      
      const response = await jiraAPI.importIssues(roomId, { issueKeys: selectedIssues, authType: 'pat' });
      console.log('Import response:', response.data);
      
      setSuccess(`Successfully imported ${selectedIssues.length} issues`);
      
      // Wait a moment before closing and refreshing
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Import error details:', error);
      
      // Handle SSL certificate errors specifically
      if (error.response?.data?.error?.includes('SSL Certificate error') || 
          error.response?.data?.error?.includes('SELF_SIGNED_CERT_IN_CHAIN') ||
          error.response?.data?.error?.includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE')) {
        setError(
          'SSL Certificate Error: Your Jira instance is using a self-signed certificate. ' +
          'Please ask your administrator to set JIRA_ALLOW_SELF_SIGNED=true in the backend .env file.'
        );
      } else if (error.message === 'Room ID is missing') {
        setError('Room ID is required for import. Please try again or contact support.');
      } else {
        // Enhanced error handling with more specific messages
        const errorMsg = error.response?.data?.error || error.message || 'Failed to import issues from Jira';
        setError(`Import failed: ${errorMsg}`);
      }
      setImporting(false);
    }
  };

  // Render JQL help tooltip
  const renderJqlHelp = () => (
    <div className="ml-1 group relative">
      <span className="cursor-help text-gray-400">?</span>
      <div className="hidden group-hover:block absolute z-10 w-72 p-2 bg-gray-800 text-white text-xs rounded shadow-lg -right-1 top-6">
        <p className="mb-1">JQL examples:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>status = "To Do"</li>
          <li>assignee = currentUser()</li>
          <li>priority = High</li>
          <li>sprint in openSprints()</li>
          <li>updated &gt;= -7d</li>
        </ul>
      </div>
    </div>
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest('.project-dropdown-container')) {
        setShowProjectDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Add class to the project container for click outside detection
  const projectContainerRef = useRef(null);
  
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileSymlink size={20} className="text-primary-600 mr-2" />
            Import from Jira
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 flex-1 overflow-auto">
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

              {/* Search Form */}
              <div className="mb-5 space-y-4">
                <div className="flex flex-col md:flex-row md:space-x-3 space-y-4 md:space-y-0">
                  <div className="w-full md:w-1/3 relative project-dropdown-container" ref={projectContainerRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project
                    </label>
                    <div className="relative">
                      <div className="relative">
                        <input
                          type="text"
                          className="input w-full border-2 border-gray-300 rounded-md py-2 px-3"
                          placeholder="Search projects..."
                          value={projectSearch}
                          onChange={(e) => {
                            setProjectSearch(e.target.value);
                            setShowProjectDropdown(true);
                          }}
                          onClick={() => setShowProjectDropdown(true)}
                          disabled={loading}
                        />
                        {selectedProject && (
                          <div className="flex items-center text-sm bg-primary-50 text-primary-700 px-3 py-1 rounded mt-1 border border-primary-200">
                            <span className="font-medium">Selected:</span> 
                            <span className="ml-1">{projects.find(p => p.key === selectedProject)?.name || ''} ({selectedProject})</span>
                          </div>
                        )}
                      </div>
                      {showProjectDropdown && projects.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200">
                          {projects
                            .filter(project => {
                              const searchLower = projectSearch.toLowerCase();
                              return project.name.toLowerCase().includes(searchLower) ||
                                project.key.toLowerCase().includes(searchLower);
                            })
                            .map((project) => (
                              <div
                                key={project.id}
                                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-primary-50 ${selectedProject === project.key ? 'bg-primary-100' : ''}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const newProject = project.key;
                                  const newProjectDisplay = `${project.name} (${project.key})`;
                                  
                                  // Set both the selected project and the display text
                                  setSelectedProject(newProject);
                                  setProjectSearch(newProjectDisplay);
                                  setShowProjectDropdown(false);
                                  
                                  // Clear issues and selected issues when project changes
                                  setIssues([]);
                                  setSelectedIssues([]);
                                  
                                  // Log for debugging
                                  console.log('Selected project:', newProject, 'Display:', newProjectDisplay);
                                }}
                              >
                                <span className="block truncate">
                                  {project.name} ({project.key})
                                </span>
                              </div>
                            ))}
                          {projects.filter(project => {
                            const searchLower = projectSearch.toLowerCase();
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
                  
                  <div className="w-full md:flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <span>JQL Filter (Optional)</span>
                        {renderJqlHelp()}
                      </label>
                      <button 
                        type="button"
                        className="text-xs text-primary-600 hover:text-primary-800 flex items-center"
                        onClick={() => setShowJqlPresets(!showJqlPresets)}
                      >
                        Quick Filters
                      </button>
                    </div>
                    
                    {showJqlPresets && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        <button 
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded"
                          onClick={() => setJqlQuery('statusCategory in ("To Do", "In Progress") OR status in ("New", "To Do", "Open", "Backlog")')}>
                          Backlog Items
                        </button>
                        <button 
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded"
                          onClick={() => setJqlQuery('assignee = currentUser()')}
                        >
                          My Issues
                        </button>
                        <button 
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded"
                          onClick={() => setJqlQuery('sprint in openSprints()')}
                        >
                          Current Sprint
                        </button>
                        <button 
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded"
                          onClick={() => setJqlQuery('created >= -30d')}
                        >
                          Created Last 30 Days
                        </button>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="e.g., status = 'To Do' AND assignee = currentUser()"
                        className="input flex-1 border-2 border-gray-300 rounded-md py-2 px-3"
                        value={jqlQuery}
                        onChange={(e) => setJqlQuery(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        className="btn btn-primary"
                        onClick={searchIssues}
                        disabled={loading || !selectedProject}
                      >
                        {loading ? (
                          <RefreshCw size={16} className="animate-spin mr-1" />
                        ) : (
                          <Search size={16} className="mr-1" />
                        )}
                        <span>Search</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Project will be automatically added to your query
                    </p>
                  </div>
                </div>
              </div>

              {/* Results List */}
              <div className="border border-gray-200 rounded-lg mb-4">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">
                    {issues.length} issues found
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {selectedIssues.length} selected
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {issues.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {loading ? 'Searching...' : 'No issues found. Try a different project or search query.'}
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {issues.map((issue) => (
                        <li 
                          key={issue.id}
                          className={`p-3 hover:bg-gray-50 cursor-pointer ${
                            selectedIssues.includes(issue.key) ? 'bg-primary-50' : ''
                          }`}
                          onClick={() => toggleIssueSelection(issue.key)}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-3"
                              checked={selectedIssues.includes(issue.key)}
                              onChange={() => {}} // Handled by the li click
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs bg-gray-100 px-1 rounded">
                                  {issue.key}
                                </span>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {issue.fields.summary}
                                </p>
                              </div>
                              
                              <div className="flex items-center mt-1 space-x-2">
                                {issue.fields.issuetype && (
                                  <span className="text-xs text-gray-500">
                                    {issue.fields.issuetype.name}
                                  </span>
                                )}
                                
                                {issue.fields.status && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                    {issue.fields.status.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end space-x-3">
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          
          {isJiraEnabled && (
            <button
              className="btn btn-primary flex items-center space-x-2"
              onClick={importIssues}
              disabled={importing || selectedIssues.length === 0}
            >
              {importing ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <FileSymlink size={16} />
              )}
              <span>
                {importing 
                  ? 'Importing...' 
                  : `Import ${selectedIssues.length} Issues`
                }
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
