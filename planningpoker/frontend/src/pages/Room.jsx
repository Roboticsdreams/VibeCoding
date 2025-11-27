import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Users, CheckCircle, Settings, List, Edit2, Trash2, Upload, FileSymlink, RefreshCw, FileDown, Share2, Copy, Check } from 'lucide-react';
import useStore from '../store/useStore';
import { roomsAPI, tasksAPI } from '../lib/api';
import { socketClient } from '../lib/socket';
import TaskCard from '../components/TaskCard';
import TaskTableView from '../components/TaskTableView';
import VotingCard from '../components/VotingCard';
import CreateTaskModal from '../components/CreateTaskModal';
import ImportTasksModal from '../components/ImportTasksModal';
import EditRoomModal from '../components/EditRoomModal';
import ManageParticipantsModal from '../components/ManageParticipantsModal';
import JiraImportModal from '../components/JiraImportModal';
import JiraRoomSyncModal from '../components/JiraRoomSyncModal';

export default function Room() {
  const { id } = useParams();
  const { currentRoom, setCurrentRoom, updateRoom, tasks, setTasks, user } = useStore();
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showJiraImportModal, setShowJiraImportModal] = useState(false);
  const [showJiraRoomSyncModal, setShowJiraRoomSyncModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [showCsvTooltip, setShowCsvTooltip] = useState(false);
  const shareTooltipTimeoutRef = useRef(null);
  const csvTooltipTimeoutRef = useRef(null);
  const listenersRegistered = useRef(false);
  const roomJoined = useRef(false);

  useEffect(() => {
    fetchRoomData();
    
    // Wait for socket to be connected before joining room
    const joinRoomWhenReady = () => {
      if (roomJoined.current) {
        console.log('⏭️ Already joined room, skipping...');
        return;
      }
      
      if (socketClient.socket?.connected) {
        console.log('🚪 Joining room now...');
        roomJoined.current = true;
        socketClient.joinRoom(id);
      } else {
        // Socket not ready yet, wait for connection event
        console.log('⏳ Waiting for socket to connect before joining room...');
        const checkConnection = setInterval(() => {
          if (socketClient.socket?.connected) {
            console.log('✅ Socket ready, joining room now');
            clearInterval(checkConnection);
            roomJoined.current = true;
            socketClient.joinRoom(id);
          }
        }, 100); // Check every 100ms
        
        // Cleanup interval after 5 seconds if still not connected
        setTimeout(() => clearInterval(checkConnection), 5000);
      }
    };
    
    joinRoomWhenReady();

    // Socket event listeners
    const handleTaskCreated = (task) => {
      setTasks(prevTasks => [task, ...prevTasks]);
    };

    const handleTaskActivated = (data) => {
      console.log('📨 Room: Received task-activated event from server:', data);
      // Extract task from the event data (handle both formats)
      const task = data.task || data;
      console.log('🔔 Room received task-activated event:', data);
      console.log('📋 Extracted task:', task);
      console.log('🎯 Setting active task to:', task?.id, task?.title);
      
      if (!task || !task.id) {
        console.error('❌ Invalid task data received:', data);
        return;
      }
      
      // Update active task immediately
      setActiveTask(prevActive => {
        console.log('⚡ setActiveTask: changing from', prevActive?.id, prevActive?.title, 'to', task.id, task.title);
        return task;
      });
      
      // Update tasks list to reflect active status
      setTasks(prevTasks => {
        if (!Array.isArray(prevTasks)) {
          console.error('❌ prevTasks is not an array:', prevTasks);
          return [];
        }
        return prevTasks.map((t) => ({
          ...t,
          is_active: t.id === task.id
        }));
      });
      
      console.log('✅ Active task updated successfully for task:', task.id, task.title);
      
      // Don't fetch room data here - the socket event already has fresh data
      // Fetching from API might return stale cached data and overwrite our update
    };

    const handleTaskDeactivated = ({ taskId }) => {
      setActiveTask(null);
      setTasks(prevTasks => {
        if (!Array.isArray(prevTasks)) return [];
        return prevTasks.map((t) => 
          t.id === taskId ? { ...t, is_active: false } : t
        );
      });
    };

    const handleTaskUpdated = (task) => {
      setTasks(prevTasks => {
        if (!Array.isArray(prevTasks)) return [];
        return prevTasks.map((t) => (t.id === task.id ? task : t));
      });
    };

    const handleTaskDeleted = ({ taskId }) => {
      setTasks(prevTasks => {
        if (!Array.isArray(prevTasks)) return [];
        return prevTasks.filter((t) => t.id !== taskId);
      });
      if (activeTask?.id === taskId) {
        setActiveTask(null);
      }
    };

    const handleParticipantChange = () => {
      fetchRoomData();
    };

    const handleForceRefresh = ({ action }) => {
      console.log('Room received force-refresh event, action:', action);
      // Don't fetch room data for task-activated actions - we already have fresh data from the event
      // Only fetch for other actions that might need a full refresh
      if (action && action.includes('task-activated')) {
        console.log('Skipping fetchRoomData for task-activated action');
        return;
      }
      fetchRoomData();
    };

    // Register all event listeners (wait for socket to be ready)
    const doRegisterListeners = () => {
      socketClient.onTaskCreated(handleTaskCreated);
      socketClient.onTaskActivated(handleTaskActivated);
      socketClient.onTaskDeactivated(handleTaskDeactivated);
      socketClient.onTaskUpdated(handleTaskUpdated);
      socketClient.onTaskDeleted(handleTaskDeleted);
      socketClient.onParticipantAdded(handleParticipantChange);
      socketClient.onParticipantRemoved(handleParticipantChange);
      socketClient.onGroupAdded(handleParticipantChange);
      socketClient.onGroupRemoved(handleParticipantChange);
      socketClient.onForceRefresh(handleForceRefresh);
    };
    
    const registerListeners = () => {
      // Prevent duplicate listener registration (React StrictMode causes double mount)
      if (listenersRegistered.current) {
        console.log('⏭️ Listeners already registered, skipping...');
        return;
      }
      
      if (socketClient.socket?.connected) {
        console.log('✅ Registering listeners now...');
        listenersRegistered.current = true;
        doRegisterListeners();
      } else {
        // Wait for socket to connect
        const checkConnection = setInterval(() => {
          if (socketClient.socket?.connected) {
            clearInterval(checkConnection);
            console.log('✅ Registering listeners now...');
            listenersRegistered.current = true;
            doRegisterListeners();
          }
        }, 100);
        
        setTimeout(() => clearInterval(checkConnection), 5000);
      }
    };
    
    registerListeners();
    
    return () => {
      // Clean up tooltips
      if (shareTooltipTimeoutRef.current) {
        clearTimeout(shareTooltipTimeoutRef.current);
      }
      if (csvTooltipTimeoutRef.current) {
        clearTimeout(csvTooltipTimeoutRef.current);
      }
      
      // DON'T clean up socket listeners or leave room - they need to persist across React StrictMode remounts
      // The refs prevent duplicate registration/joining
      // Listeners and room membership will be cleaned up when the socket disconnects
    };
  }, [id]);

  const fetchRoomData = async () => {
    try {
      console.log('🌐 fetchRoomData: STARTING API call');
      console.trace('📍 fetchRoomData called from:');
      const [roomRes, tasksRes] = await Promise.all([
        roomsAPI.getById(id),
        tasksAPI.getByRoom(id),
      ]);
      
      setCurrentRoom(roomRes.data);
      // Ensure tasks is always an array
      const tasksList = Array.isArray(tasksRes.data) ? tasksRes.data : [];
      setTasks(tasksList);
      
      // Find the active task (use tasksList, not tasksRes.data)
      const active = tasksList.find((t) => t.is_active);
      
      if (active) {
        console.log('🌐 fetchRoomData: Found active task from API:', active.id, active.title);
        setActiveTask(prevActive => {
          console.log('🌐 fetchRoomData: setActiveTask from', prevActive?.id, prevActive?.title, 'to', active.id, active.title);
          return active;
        });
      } else {
        console.log('🌐 fetchRoomData: No active task found, setting to null');
        setActiveTask(null);
      }
    } catch (error) {
      console.error('Failed to fetch room data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin or creator
  const isAdmin = currentRoom?.participants?.find(
    (p) => p.id === user?.id && p.role === 'admin'
  );
  const isCreator = currentRoom?.creator_id === user?.id;
  const canManageRoom = isAdmin || isCreator;

  const handleDeleteRoom = async () => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone and will delete all tasks and votes.')) {
      return;
    }

    try {
      await roomsAPI.delete(id);
      window.location.href = '/rooms'; // Redirect to rooms list
    } catch (error) {
      console.error('Failed to delete room:', error);
      alert(error.response?.data?.error || 'Failed to delete room');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading room...</div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Room not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Room Header */}
      <div className="card">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentRoom.name}</h1>
            <p className="text-gray-600">{currentRoom.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Invite Code</div>
            <div className="text-xl font-mono font-bold text-primary-600 flex items-center justify-end">
              {currentRoom.invite_code}
              <button 
                onClick={() => {
                  const shareUrl = `${window.location.origin}/join?code=${currentRoom.invite_code}`;
                  navigator.clipboard.writeText(shareUrl);
                  
                  // Show tooltip
                  setShowShareTooltip(true);
                  
                  // Clear any existing timeout
                  if (shareTooltipTimeoutRef.current) {
                    clearTimeout(shareTooltipTimeoutRef.current);
                  }
                  
                  // Hide tooltip after 2 seconds
                  shareTooltipTimeoutRef.current = setTimeout(() => {
                    setShowShareTooltip(false);
                  }, 2000);
                }}
                className="ml-2 p-1 text-primary-600 hover:bg-primary-100 rounded-full transition-colors relative"
                title="Copy invite link"
              >
                {showShareTooltip ? <Check size={16} /> : <Copy size={16} />}
                {showShareTooltip && (
                  <span className="absolute -top-8 -right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Link copied!
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users size={16} />
              <span>{currentRoom.participants?.length || 0} participants</span>
              {currentRoom.groups && currentRoom.groups.length > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>{currentRoom.groups.length} groups</span>
                </>
              )}
            </div>
            
            <button
              onClick={() => {
                const shareUrl = `${window.location.origin}/join?code=${currentRoom.invite_code}`;
                if (navigator.share) {
                  navigator.share({
                    title: `Join Planning Poker Room: ${currentRoom.name}`,
                    text: `Join our planning poker session: ${currentRoom.name}`,
                    url: shareUrl,
                  }).catch(err => {
                    navigator.clipboard.writeText(shareUrl);
                    setShowShareTooltip(true);
                    if (shareTooltipTimeoutRef.current) {
                      clearTimeout(shareTooltipTimeoutRef.current);
                    }
                    shareTooltipTimeoutRef.current = setTimeout(() => {
                      setShowShareTooltip(false);
                    }, 2000);
                  });
                } else {
                  navigator.clipboard.writeText(shareUrl);
                  setShowShareTooltip(true);
                  if (shareTooltipTimeoutRef.current) {
                    clearTimeout(shareTooltipTimeoutRef.current);
                  }
                  shareTooltipTimeoutRef.current = setTimeout(() => {
                    setShowShareTooltip(false);
                  }, 2000);
                }
              }}
              className="btn btn-secondary flex items-center space-x-1 text-sm"
            >
              <Share2 size={14} />
              <span>Share Room</span>
              {showShareTooltip && (
                <span className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>
          </div>
          
          {/* Export options */}
          {canManageRoom && (
            <div className="flex items-center space-x-2 mr-4">
            <button
              onClick={() => {
                // Create CSV content with consolidated view data
                const exportCsv = async () => {
                  try {
                    // Get analytics data from API
                    const response = await tasksAPI.getConsolidated(id);
                    const { summary, tasks: analyticsTasks } = response.data;
                    
                    // Build CSV content
                    const csvRows = [
                      ['Planning Poker Export - ' + currentRoom.name],
                      [''],
                      ['Room Summary'],
                      ['Room Name', currentRoom.name],
                      ['Room ID', id],
                      ['Invite Code', currentRoom.invite_code],
                      ['Participants', currentRoom.participants?.length || 0],
                      ['Groups', currentRoom.groups?.length || 0],
                      [''],
                      ['Analytics Summary'],
                      ['Total Tasks', summary.total_tasks],
                      ['Completed Tasks', summary.completed_tasks],
                      ['Total Story Points', parseFloat(summary.total_story_points).toFixed(1)],
                      ['Average Story Points', parseFloat(summary.average_story_points).toFixed(1)],
                      ['Completion Rate', `${((parseInt(summary.completed_tasks) / parseInt(summary.total_tasks || 1)) * 100).toFixed(1)}%`],
                      [''],
                      ['Task Details'],
                      ['ID', 'Title', 'Description', 'Status', 'Story Points', 'Votes'],
                    ];
                    
                    // Add task data
                    if (Array.isArray(tasks)) {
                      tasks.forEach(task => {
                      csvRows.push([
                        task.id,
                        task.title,
                        task.description || '',
                        task.is_active ? 'Active' : task.status || 'pending',
                        task.story_points !== null ? task.story_points : '',
                        `${task.vote_count || 0}/${task.total_participants || 0}`
                      ]);
                      });
                    }
                    
                    // Generate and download CSV
                    const csvContent = csvRows.map(row => 
                      row.map(cell => 
                        typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
                      ).join(',')
                    ).join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `room-${id}-export.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // Show confirmation tooltip
                    setShowCsvTooltip(true);
                    if (csvTooltipTimeoutRef.current) {
                      clearTimeout(csvTooltipTimeoutRef.current);
                    }
                    csvTooltipTimeoutRef.current = setTimeout(() => {
                      setShowCsvTooltip(false);
                    }, 2000);
                  } catch (error) {
                    console.error('Error exporting CSV:', error);
                    alert('Failed to export data to CSV');
                  }
                };
                
                exportCsv();
              }}
              className={`btn ${Array.isArray(tasks) && tasks.length > 0 ? 'btn-secondary' : 'btn-disabled'} flex items-center space-x-2 text-sm relative`}
              title={Array.isArray(tasks) && tasks.length > 0 ? "Export to CSV" : "Create tasks first to export CSV"}
              disabled={!Array.isArray(tasks) || tasks.length === 0}
            >
              <FileDown size={16} />
              <span>Export CSV</span>
              {showCsvTooltip && (
                <span className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  CSV Downloaded!
                </span>
              )}
            </button>
            {(() => {
              const hasUnlinkedTasks = Array.isArray(tasks) && tasks.some(t => !t.jira_issue_key);
              const hasLinkedTasks = Array.isArray(tasks) && tasks.some(t => t.jira_issue_key);
              const hasTasks = Array.isArray(tasks) && tasks.length > 0;
              
              return (
                <button
                  onClick={() => setShowJiraRoomSyncModal(true)}
                  className={`btn ${hasTasks ? 'btn-primary' : 'btn-disabled'} flex items-center space-x-2 text-sm`}
                  title={
                    !hasTasks ? 'Create tasks first to use Jira Export/Sync' :
                    hasUnlinkedTasks && hasLinkedTasks ? 'Export new tasks and sync existing with Jira' :
                    hasUnlinkedTasks ? 'Export tasks to Jira' :
                    'Sync story points with Jira'
                  }
                  disabled={!hasTasks}
                >
                  <FileSymlink size={16} />
                  <span>
                    {hasUnlinkedTasks && hasLinkedTasks ? 'Export & Sync Jira' :
                     hasUnlinkedTasks ? 'Export to Jira' :
                     'Sync Jira'}
                  </span>
                </button>
              );
            })()}
          </div>
          )}
          {canManageRoom && (
            <div className="flex items-center space-x-2">
              {canManageRoom && (
                <button
                  onClick={() => setShowEditRoomModal(true)}
                  className="btn btn-secondary flex items-center space-x-2 text-sm"
                  title="Edit Room"
                >
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
              )}
              <button
                onClick={() => setShowManageModal(true)}
                className="btn btn-secondary flex items-center space-x-2 text-sm"
              >
                <Settings size={16} />
                <span>Manage Access</span>
              </button>
              {isCreator && (
                <button
                  onClick={handleDeleteRoom}
                  className="btn btn-danger flex items-center space-x-2 text-sm"
                  title="Delete Room"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active Task Voting */}
      {activeTask && (
        <div className="card bg-primary-50 border-2 border-primary-200">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle size={24} className="text-primary-600" />
            <h2 className="text-xl font-semibold text-primary-900">Active Voting</h2>
          </div>
          <VotingCard key={activeTask.id} task={activeTask} roomId={id} isAdmin={!!canManageRoom} onUpdate={fetchRoomData} />
        </div>
      )}

      {/* View Toggle & Header */}
      <div>
        <div className="flex justify-between items-center py-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Tasks
            </h2>
          </div>
          <div className="flex items-center space-x-2">

            {canManageRoom && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="btn btn-secondary flex items-center space-x-2"
                  title="Import tasks from CSV"
                >
                  <Upload size={18} />
                  <span>Import CSV</span>
                </button>
                <button
                  onClick={() => setShowJiraImportModal(true)}
                  className="btn btn-secondary flex items-center space-x-2"
                  title="Import issues from Jira"
                >
                  <FileSymlink size={18} />
                  <span>Import from Jira</span>
                </button>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Plus size={18} />
                  <span>Add Task</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tasks List View */}
      <div>
        {!Array.isArray(tasks) || tasks.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 mb-4">No tasks yet</p>
              {canManageRoom && (
                <button onClick={() => setShowTaskModal(true)} className="btn btn-primary">
                  Create First Task
                </button>
              )}
            </div>
          ) : (
            // Table View
            <TaskTableView
              tasks={Array.isArray(tasks) ? tasks : []}
              roomId={id}
              isAdmin={!!canManageRoom}
              onUpdate={fetchRoomData}
            />
          )
        }
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <CreateTaskModal
          roomId={id}
          onClose={() => setShowTaskModal(false)}
          onSuccess={fetchRoomData}
        />
      )}

      {/* Import Tasks Modal */}
      {showImportModal && (
        <ImportTasksModal
          roomId={id}
          onClose={() => setShowImportModal(false)}
          onSuccess={fetchRoomData}
        />
      )}
      
      {/* Jira Import Modal */}
      {showJiraImportModal && (
        <JiraImportModal
          roomId={id}
          onClose={() => setShowJiraImportModal(false)}
          onSuccess={fetchRoomData}
        />
      )}
      
      {/* Jira Room Sync Modal */}
      {showJiraRoomSyncModal && (
        <JiraRoomSyncModal
          roomId={id}
          tasks={Array.isArray(tasks) ? tasks : []}
          onClose={() => setShowJiraRoomSyncModal(false)}
          onSuccess={fetchRoomData}
        />
      )}
      
      {/* Room Management Modals */}
      {showManageModal && (
        <ManageParticipantsModal
          room={currentRoom}
          onClose={() => setShowManageModal(false)}
          onUpdated={fetchRoomData}
        />
      )}

      {/* Edit Room Modal */}
      {showEditRoomModal && (
        <EditRoomModal
          room={currentRoom}
          onClose={() => setShowEditRoomModal(false)}
          onSuccess={(updatedData) => {
            // Update store immediately with the edited room data
            updateRoom(id, updatedData);
            // Then fetch the latest data from server
            fetchRoomData();
          }}
        />
      )}
      
    </div>
  );
}
