import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Trash2, Settings } from 'lucide-react';
import useStore from '../store/useStore';
import { authAPI } from '../lib/api';
import JiraSettings from '../components/JiraSettings';

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useStore();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await authAPI.updateProfile(formData);
      setUser(response.data.user);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await authAPI.deleteAccount();
      logout();
      navigate('/login');
    } catch (error) {
      setMessage('Failed to delete account');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <User size={32} className="text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
      </div>

      <div className="card">
        {message && (
          <div className={`mb-6 p-3 rounded-lg ${
            message.includes('success') 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>

        {/* Jira Integration */}
        <JiraSettings />
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-danger flex items-center space-x-2"
            >
              <Trash2 size={18} />
              <span>Delete Account</span>
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 mb-4">
                Are you sure? This action cannot be undone. All your data will be permanently deleted.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleDelete}
                  className="btn btn-danger"
                >
                  Yes, Delete My Account
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
