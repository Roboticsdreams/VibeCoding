import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { tasksAPI } from '../lib/api';
import { jiraAPI } from '../lib/jira-api';
import { socketClient } from '../lib/socket';

export default function CreateTaskModal({ roomId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Jira export options
  const [exportToJira, setExportToJira] = useState(false);
  const [jiraProjects, setJiraProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [issueType, setIssueType] = useState('Story');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  
  const issueTypes = [
    { value: 'Story', label: 'Story' },
    { value: 'Task', label: 'Task' },
    { value: 'Bug', label: 'Bug' },
    { value: 'Epic', label: 'Epic' },
    { value: 'Improvement', label: 'Improvement' },
  ];

  // Load Jira projects when export option is enabled
  useEffect(() => {
    if (exportToJira && jiraProjects.length === 0) {
      loadJiraProjects();
    }
  }, [exportToJira]);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create the task first
      const response = await tasksAPI.create({ ...formData, roomId: parseInt(roomId) });
      const createdTask = response.data.task;
      
      // If Jira export is enabled, export to Jira
      if (exportToJira && selectedProject) {
        try {
          await jiraAPI.exportTask(createdTask.id, {
            projectKey: selectedProject,
            issueType: issueType
          });
          console.log('Task exported to Jira successfully');
        } catch (jiraErr) {
          console.error('Failed to export to Jira:', jiraErr);
          // Don't fail the whole operation if Jira export fails
          setError('Task created but failed to export to Jira: ' + (jiraErr.response?.data?.error || jiraErr.message));
        }
      }
      
      socketClient.emitTaskCreated(roomId, createdTask);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Create Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="User story or feature name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="input"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide context for estimation..."
            />
          </div>
          
          {/* Jira Export Options */}
          <div className="border-t pt-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportToJira}
                onChange={(e) => setExportToJira(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Export to Jira</span>
            </label>
          </div>
          
          {exportToJira && (
            <div className="space-y-3 pl-6 border-l-2 border-primary-200">
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
          )}

          <div className="flex space-x-3">
            <button 
              type="submit" 
              className="btn btn-primary flex-1" 
              disabled={loading || (exportToJira && !selectedProject)}
              title={exportToJira && !selectedProject ? 'Please select a Jira project' : ''}
            >
              {loading ? 'Creating...' : (exportToJira ? 'Create & Export to Jira' : 'Create Task')}
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
