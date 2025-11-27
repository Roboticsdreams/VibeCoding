import { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, AlertCircle, Shield, Search } from 'lucide-react';
import { groupsAPI, authAPI } from '../lib/api';

export default function ManageMembersModal({ group, onClose, onUpdate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await authAPI.getMe();
      setCurrentUser(res.data);
    } catch (err) {
      console.error('Failed to fetch current user:', err);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    console.log('Frontend search triggered with query:', query);
    
    if (query.trim().length < 2) {
      console.log('Query too short, clearing results');
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      console.log('Calling authAPI.searchUsers...');
      const response = await authAPI.searchUsers(query);
      console.log('Search API response:', response);
      console.log('Search results data:', response.data);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Search error:', err);
      console.error('Error response:', err.response);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery(user.name);
    setSearchResults([]);
  };

  const handleAddMember = async () => {
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await groupsAPI.addMember(group.id, selectedUser.id);
      setSelectedUser(null);
      setSearchQuery('');
      await onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the group?')) return;
    
    setLoading(true);
    setError('');
    try {
      await groupsAPI.removeMember(group.id, userId);
      await onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    if (!window.confirm(`Change this member's role to ${newRole}?`)) return;
    
    setLoading(true);
    setError('');
    try {
      await groupsAPI.updateMemberRole(group.id, userId, newRole);
      await onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const isCreator = (memberId) => memberId === group.creator_id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Manage Members</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Add Member Section */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Member</h3>
            <div className="relative">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Type name or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={loading}
                  />
                  {searching && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAddMember}
                  disabled={!selectedUser || loading}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <UserPlus size={18} />
                  <span>Add</span>
                </button>
              </div>
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex flex-col border-b border-gray-100 last:border-0"
                    >
                      <span className="font-medium text-gray-900">{user.name}</span>
                      <span className="text-sm text-gray-500">{user.email}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
                  No users found
                </div>
              )}
            </div>
            {selectedUser && (
              <div className="mt-2 p-2 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-medium text-primary-900">{selectedUser.name}</span>
                  <span className="text-sm text-primary-600 ml-2">({selectedUser.email})</span>
                </div>
                <button
                  onClick={() => { setSelectedUser(null); setSearchQuery(''); }}
                  className="text-primary-600 hover:text-primary-800"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Search for users by name or email address (min 2 characters)
            </p>
          </div>

          {/* Members List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Current Members ({group.members?.length || 0})
            </h3>
            {group.members && group.members.length > 0 ? (
              <div className="space-y-3">
                {group.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {member.name}
                        {member.id === currentUser?.id && (
                          <span className="ml-2 text-xs text-primary-600">(You)</span>
                        )}
                        {isCreator(member.id) && (
                          <span className="ml-2 text-xs text-amber-600">(Creator)</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{member.email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Role Badge & Toggle */}
                      {!isCreator(member.id) ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateRole(
                              member.id,
                              member.role === 'admin' ? 'participant' : 'admin'
                            )}
                            disabled={loading}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              member.role === 'admin'
                                ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title="Click to change role"
                          >
                            <div className="flex items-center space-x-1">
                              {member.role === 'admin' && <Shield size={14} />}
                              <span>{member.role}</span>
                            </div>
                          </button>
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                          <div className="flex items-center space-x-1">
                            <Shield size={14} />
                            <span>admin</span>
                          </div>
                        </span>
                      )}

                      {/* Remove Button */}
                      {!isCreator(member.id) && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 transition-colors p-2"
                          title="Remove member"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">No members yet</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
