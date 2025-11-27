import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, DoorOpen, Plus, Inbox, Share2, Check } from 'lucide-react';
import useStore from '../store/useStore';
import { groupsAPI, roomsAPI } from '../lib/api';
import CreateGroupModal from '../components/CreateGroupModal';
import CreateRoomModal from '../components/CreateRoomModal';
import JoinRoomModal from '../components/JoinRoomModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { groups, setGroups, rooms, setRooms } = useStore();
  const [loading, setLoading] = useState(true);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
  const [shareTooltips, setShareTooltips] = useState({});
  const shareTooltipTimers = useRef({});

  useEffect(() => {
    fetchData();
    
    // Clean up any remaining tooltips on unmount
    return () => {
      Object.values(shareTooltipTimers.current).forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, []);

  const fetchData = async () => {
    try {
      const [groupsRes, roomsRes] = await Promise.all([
        groupsAPI.getAll(),
        roomsAPI.getAll(),
      ]);
      setGroups(groupsRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Groups
              </dt>
              <dd className="text-2xl font-semibold text-gray-900">
                {groups.length}
              </dd>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Inbox className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Rooms
              </dt>
              <dd className="text-2xl font-semibold text-gray-900">
                {rooms.length}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">My Groups</h2>
          <button
            onClick={() => setShowGroupModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create Group</span>
          </button>
        </div>

        {groups.length === 0 ? (
          <p className="text-gray-500">No groups yet. Create your first group!</p>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => navigate(`/group/${group.id}`)}
                className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                      <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                        {group.my_role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {group.description || 'No description'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Created by {group.creator_name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rooms Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">My Rooms</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowJoinRoomModal(true)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <DoorOpen size={18} />
              <span>Join Room</span>
            </button>
            <button
              onClick={() => setShowRoomModal(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Create Room</span>
            </button>
          </div>
        </div>

        {rooms.length === 0 ? (
          <p className="text-gray-500">No rooms yet. Create your first room!</p>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => navigate(`/room/${room.id}`)}
                className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{room.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {room.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">Code:</span>
                      <span className="text-xs font-mono font-bold text-gray-700">{room.invite_code}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation to room
                        
                        // Create the shareable URL
                        const shareUrl = `${window.location.origin}/join?code=${room.invite_code}`;
                        navigator.clipboard.writeText(shareUrl);
                        
                        // Show tooltip for this room
                        setShareTooltips(prev => ({ ...prev, [room.id]: true }));
                        
                        // Clear any existing timer
                        if (shareTooltipTimers.current[room.id]) {
                          clearTimeout(shareTooltipTimers.current[room.id]);
                        }
                        
                        // Set new timer to hide tooltip
                        shareTooltipTimers.current[room.id] = setTimeout(() => {
                          setShareTooltips(prev => ({ ...prev, [room.id]: false }));
                        }, 2000);
                      }}
                      className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                      title="Share Room"
                    >
                      {shareTooltips[room.id] ? <Check size={18} className="text-green-600" /> : <Share2 size={18} className="text-gray-600" />}
                    </button>
                    {shareTooltips[room.id] && (
                      <div className="absolute top-10 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Link copied!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showGroupModal && (
        <CreateGroupModal
          onClose={() => setShowGroupModal(false)}
          onSuccess={fetchData}
        />
      )}

      {showRoomModal && (
        <CreateRoomModal
          onClose={() => setShowRoomModal(false)}
          onSuccess={fetchData}
        />
      )}

      {showJoinRoomModal && (
        <JoinRoomModal
          onClose={() => setShowJoinRoomModal(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
