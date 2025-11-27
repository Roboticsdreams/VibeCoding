import { useState, useEffect } from 'react';
import { X, UserPlus, Users as UsersIcon, Trash2, AlertCircle, Search, Shield, ShieldOff } from 'lucide-react';
import { roomsAPI, groupsAPI, authAPI } from '../lib/api';

export default function ManageParticipantsModal({ room, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('participants');
  const [allUsers, setAllUsers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, groupsRes] = await Promise.all([
        authAPI.getMe(),
        groupsAPI.getAll(),
      ]);
      setCurrentUser(userRes.data);
      setAllGroups(groupsRes.data);
      // In a real app, you'd have an API to get all users
      // For now, we'll work with what we have
    } catch (err) {
      console.error('Failed to fetch data:', err);
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

  const handleAddParticipant = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError('');
    try {
      await roomsAPI.addParticipant(room.id, selectedUser.id);
      setSelectedUser(null);
      setSearchQuery('');
      await onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add participant');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = async (userId) => {
    if (!window.confirm('Remove this participant?')) return;
    
    setLoading(true);
    setError('');
    try {
      await roomsAPI.removeParticipant(room.id, userId);
      await onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove participant');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'participant' : 'admin';
    const action = newRole === 'admin' ? 'promote to admin' : 'demote to participant';
    
    if (!window.confirm(`${action}?`)) return;
    
    setLoading(true);
    setError('');
    try {
      await roomsAPI.updateParticipantRole(room.id, userId, newRole);
      await onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroup = async () => {
    if (!selectedGroupId) return;
    
    setLoading(true);
    setError('');
    try {
      await roomsAPI.addGroup(room.id, parseInt(selectedGroupId));
      setSelectedGroupId('');
      await onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add group');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGroup = async (groupId) => {
    if (!window.confirm('Remove this group? All group members will lose access.')) return;
    
    setLoading(true);
    setError('');
    try {
      await roomsAPI.removeGroup(room.id, groupId);
      await onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove group');
    } finally {
      setLoading(false);
    }
  };

  const availableGroups = allGroups.filter(
    (g) => !room.groups?.some((rg) => rg.id === g.id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Manage Access</h2>
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

        {/* Tabs */}
        <div className="flex border-b px-6">
          <button
            onClick={() => setActiveTab('participants')}
            className={`py-3 px-4 font-medium transition-colors ${
              activeTab === 'participants'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <UsersIcon size={18} />
              <span>Participants ({room.participants?.length || 0})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`py-3 px-4 font-medium transition-colors ${
              activeTab === 'groups'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <UsersIcon size={18} />
              <span>Groups ({room.groups?.length || 0})</span>
            </div>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'participants' ? (
            <div className="space-y-6">
              {/* Add Participant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search User by Name or Email
                </label>
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
                      onClick={handleAddParticipant}
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
                <p className="text-sm text-gray-500 mt-1">
                  Search for users by name or email address (min 2 characters)
                </p>
              </div>

              {/* Participants List */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Current Participants
                </h3>
                {room.participants && room.participants.length > 0 ? (
                  <div className="space-y-2">
                    {room.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {participant.name}
                            {participant.id === currentUser?.id && (
                              <span className="ml-2 text-xs text-primary-600">(You)</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{participant.email}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            <span className={`inline-block px-2 py-0.5 rounded ${
                              participant.role === 'admin'
                                ? 'bg-primary-100 text-primary-700'
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {participant.role}
                            </span>
                            {participant.source && (
                              <span className="ml-2 text-gray-500">
                                via {participant.source}
                              </span>
                            )}
                          </div>
                        </div>
                        {participant.id !== room.creator_id && participant.id !== currentUser?.id && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleChangeRole(participant.id, participant.role)}
                              disabled={loading}
                              className={`transition-colors ${
                                participant.role === 'admin'
                                  ? 'text-orange-600 hover:text-orange-700'
                                  : 'text-green-600 hover:text-green-700'
                              }`}
                              title={participant.role === 'admin' ? 'Demote to Participant' : 'Promote to Admin'}
                            >
                              {participant.role === 'admin' ? (
                                <ShieldOff size={18} />
                              ) : (
                                <Shield size={18} />
                              )}
                            </button>
                            <button
                              onClick={() => handleRemoveParticipant(participant.id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-700 transition-colors"
                              title="Remove Participant"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6">No participants yet</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Add Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Group
                </label>
                <div className="flex space-x-2">
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={loading || availableGroups.length === 0}
                  >
                    <option value="">Select a group...</option>
                    {availableGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddGroup}
                    disabled={!selectedGroupId || loading}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <UserPlus size={18} />
                    <span>Add</span>
                  </button>
                </div>
                {availableGroups.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    All available groups have been added
                  </p>
                )}
              </div>

              {/* Groups List */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Current Groups
                </h3>
                {room.groups && room.groups.length > 0 ? (
                  <div className="space-y-2">
                    {room.groups.map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{group.name}</div>
                          {group.description && (
                            <div className="text-sm text-gray-600">{group.description}</div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveGroup(group.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6">No groups added yet</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
