import { useState } from 'react';
import { X, DoorOpen } from 'lucide-react';
import { roomsAPI } from '../lib/api';

export default function JoinRoomModal({ onClose, onSuccess }) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await roomsAPI.joinByInvite(inviteCode.trim().toUpperCase());
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <DoorOpen size={24} className="text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Join Room</h2>
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

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invite Code *
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="input-field text-center text-sm font-mono tracking-wider uppercase border border-gray-300 rounded-md"
                placeholder="Enter code"
                maxLength={8}
                required
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Ask the room creator or admin for the 8-character invite code
              </p>
            </div>
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
              type="submit"
              className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
              disabled={loading || inviteCode.length !== 8}
            >
              <DoorOpen size={18} />
              <span>{loading ? 'Joining...' : 'Join Room'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
