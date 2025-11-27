import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Plus, Trash2, Settings } from 'lucide-react';
import useStore from '../store/useStore';
import { groupsAPI } from '../lib/api';
import { socketClient } from '../lib/socket';
import ManageMembersModal from '../components/ManageMembersModal';

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useStore();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    fetchGroup();
    
    // Socket listeners for real-time updates
    socketClient.onGroupMemberAdded((data) => {
      if (data.groupId === parseInt(id)) {
        fetchGroup();
      }
    });

    socketClient.onGroupMemberRemoved((data) => {
      if (data.groupId === parseInt(id)) {
        fetchGroup();
      }
    });

    socketClient.onGroupMemberRoleUpdated((data) => {
      if (data.groupId === parseInt(id)) {
        fetchGroup();
      }
    });

    return () => {
      socketClient.off('group-member-added');
      socketClient.off('group-member-removed');
      socketClient.off('group-member-role-updated');
    };
  }, [id]);

  const fetchGroup = async () => {
    try {
      const response = await groupsAPI.getById(id);
      setGroup(response.data);
    } catch (error) {
      console.error('Failed to fetch group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the group?')) return;

    try {
      await groupsAPI.removeMember(id, userId);
      fetchGroup();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Delete this group? This action cannot be undone.')) return;

    try {
      await groupsAPI.delete(id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete group:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading group...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Group not found</p>
      </div>
    );
  }

  const isCreator = group.creator_id === user?.id;

  return (
    <div className="space-y-6">
      {/* Group Header */}
      <div className="card">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
            <p className="text-gray-600">{group.description}</p>
            <p className="text-sm text-gray-500 mt-2">Created by {group.creator_name}</p>
          </div>

          {isCreator && (
            <button
              onClick={handleDeleteGroup}
              className="btn btn-danger flex items-center space-x-2"
            >
              <Trash2 size={18} />
              <span>Delete Group</span>
            </button>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2">
            <Users size={24} />
            <span>Members ({group.members?.length || 0})</span>
          </h2>
          
          {isCreator && (
            <button
              onClick={() => setShowManageModal(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Settings size={18} />
              <span>Manage Members</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {group.members?.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-900">{member.name}</div>
                <div className="text-sm text-gray-500">{member.email}</div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  member.role === 'admin'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {member.role}
                </span>

                {isCreator && member.id !== user.id && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manage Members Modal */}
      {showManageModal && (
        <ManageMembersModal
          group={group}
          onClose={() => setShowManageModal(false)}
          onUpdate={fetchGroup}
        />
      )}
    </div>
  );
}
