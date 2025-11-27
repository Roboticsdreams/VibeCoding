import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { tasksAPI } from '../lib/api';
import { socketClient } from '../lib/socket';

export default function EditTaskModal({ task, roomId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    storyPoints: task.story_points || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData({
      title: task.title || '',
      description: task.description || '',
      storyPoints: task.story_points || ''
    });
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updateData = {
        title: formData.title,
        description: formData.description
      };
      
      // Only include storyPoints if it's a valid number
      if (formData.storyPoints !== '' && formData.storyPoints !== null) {
        updateData.storyPoints = parseInt(formData.storyPoints);
      }

      const response = await tasksAPI.update(task.id, updateData);
      socketClient.emitTaskUpdated(roomId, response.data.task);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Edit Task</h2>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Story Points (optional)
            </label>
            <input
              type="number"
              min="0"
              className="input"
              value={formData.storyPoints}
              onChange={(e) => setFormData({ ...formData, storyPoints: e.target.value })}
              placeholder="Final story points"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty if not yet finalized
            </p>
          </div>

          <div className="flex space-x-3">
            <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
              {loading ? 'Updating...' : 'Update Task'}
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
