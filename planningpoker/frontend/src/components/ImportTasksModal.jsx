import { useState } from 'react';
import { X, Upload, FileText, Download } from 'lucide-react';
import { tasksAPI } from '../lib/api';

export default function ImportTasksModal({ roomId, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setError('');

    // Preview the file
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      const tasks = lines.slice(1).map(line => {
        const [title, description] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        return { title, description };
      }).filter(task => task.title);
      
      setPreview(tasks.slice(0, 5)); // Show first 5 for preview
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header row
        const tasks = lines.slice(1).map(line => {
          const [title, description] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
          return { title, description: description || '' };
        }).filter(task => task.title);

        if (tasks.length === 0) {
          setError('No valid tasks found in CSV file');
          setLoading(false);
          return;
        }

        // Create tasks one by one
        let successCount = 0;
        let failCount = 0;

        for (const task of tasks) {
          try {
            await tasksAPI.create({
              roomId,
              title: task.title,
              description: task.description
            });
            successCount++;
          } catch (err) {
            console.error('Failed to create task:', task.title, err);
            failCount++;
          }
        }

        if (successCount > 0) {
          onSuccess();
          alert(`Successfully imported ${successCount} tasks${failCount > 0 ? ` (${failCount} failed)` : ''}`);
          onClose();
        } else {
          setError('Failed to import tasks');
        }
        setLoading(false);
      };
      reader.readAsText(file);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to import tasks');
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'Title,Description\n"User Login","As a user, I want to login to access my account"\n"Password Reset","As a user, I want to reset my password if I forget it"';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Upload size={24} className="text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Import Tasks from CSV</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* CSV Format Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
              <FileText size={16} />
              <span>CSV Format</span>
            </h3>
            <p className="text-sm text-blue-800 mb-2">
              Your CSV file should have two columns: <strong>Title</strong> and <strong>Description</strong>
            </p>
            <div className="bg-white p-2 rounded border border-blue-200 font-mono text-xs mt-2">
              Title,Description<br/>
              "User Login","As a user, I want to login"<br/>
              "Password Reset","As a user, I want to reset password"
            </div>
            <button
              onClick={downloadTemplate}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <Download size={14} />
              <span>Download template CSV</span>
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File *
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="input-field"
              disabled={loading}
            />
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Preview (showing first {preview.length} tasks)
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {preview.map((task, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="font-medium text-gray-900">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
            disabled={loading || !file}
          >
            <Upload size={18} />
            <span>{loading ? 'Importing...' : 'Import Tasks'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
