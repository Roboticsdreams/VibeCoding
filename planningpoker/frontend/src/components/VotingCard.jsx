import { useState, useEffect, useRef } from 'react';
import { Check, X, Eye } from 'lucide-react';
import { votesAPI, tasksAPI, roomsAPI } from '../lib/api';
import { socketClient } from '../lib/socket';
import useStore from '../store/useStore';

const STORY_POINTS = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

export default function VotingCard({ task, roomId, isAdmin, onUpdate }) {
  const { user } = useStore();
  const [myVote, setMyVote] = useState(null);
  const [votes, setVotes] = useState([]);
  const [voteCount, setVoteCount] = useState(task.vote_count || 0);
  const [revealed, setRevealed] = useState(false);
  const [storyPoints, setStoryPoints] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [participants, setParticipants] = useState([]);
  const listenersRegistered = useRef(false);

  // Initialize with the task data
  useEffect(() => {
    console.log('VotingCard mounted/updated for task:', task.id);
    console.log('Initial vote count from task:', task.vote_count);
    
    // Fetch votes immediately
    fetchVotes();
    fetchVotingStatus(true); // Force refresh on initial load
    
    // Set up an interval to refresh vote data as a fallback
    // Use socket events as primary mechanism, polling as backup
    const refreshInterval = setInterval(() => {
      fetchVotingStatus();
      if (isAdmin) {
        fetchVotes();
      }
    }, 3000); // Poll every 3 seconds as a fallback

    const handleVoteSubmitted = ({ taskId, voteCount: newVoteCount, userId, userName }) => {
      if (taskId === task.id) {
        console.log(`Vote submitted for task ${taskId}, new count: ${newVoteCount}, by user ${userName || userId}`);
        
        // Update the vote count immediately
        setVoteCount(newVoteCount);
        
        // Update participant voting status locally for immediate UI feedback
        setParticipants(prev => prev.map(p => {
          if (p.id === userId) {
            return {...p, has_voted: true};
          }
          return p;
        }));
        
        // Fetch fresh data from server
        fetchVotingStatus(true);
        if (isAdmin) {
          fetchVotes();
        }
      }
    };

    const handleVoteDeleted = ({ taskId, voteCount: newVoteCount, userId, userName }) => {
      if (taskId === task.id) {
        console.log(`Vote deleted for task ${taskId}, new count: ${newVoteCount}, by user ${userName || userId}`);
        
        // Update the vote count immediately
        setVoteCount(newVoteCount);
        
        // Update participant voting status locally for immediate UI feedback
        setParticipants(prev => prev.map(p => {
          if (p.id === userId) {
            return {...p, has_voted: false};
          }
          return p;
        }));
        
        // Fetch fresh data from server
        fetchVotingStatus(true);
        if (isAdmin) {
          fetchVotes();
        }
      }
    };

    const handleVotesRevealed = ({ taskId, votes: revealedVotes }) => {
      if (taskId === task.id) {
        console.log(`Votes revealed for task ${taskId}`);
        setVotes(revealedVotes);
        setRevealed(true);
        // Refresh data to ensure consistency
        fetchVotes();
      }
    };
    
    // Handle when a task is activated by an admin
    const handleTaskActivated = (data) => {
      // Extract task from event data (handle both formats)
      const activatedTask = data.task || data;
      console.log(`VotingCard received task-activated event for task:`, activatedTask.id);
      console.log(`This VotingCard is for task: ${task.id}`);
      
      // Check if this is the newly activated task
      const isCurrentCard = task.id === activatedTask.id;
      
      if (isCurrentCard) {
        console.log(`This IS the newly activated task - refreshing all data`);
        // Fresh start for this task
        setMyVote(null);
        setVoteCount(0);
        setVotes([]);
        setRevealed(false);
        setParticipants([]);
        
        // Fetch fresh data
        fetchVotes();
        fetchVotingStatus(true);
      }
    };
    
    // Handle force-refresh events from the server
    const handleForceRefresh = ({ taskId, action }) => {
      console.log(`Force refresh received for task ${taskId}, action: ${action || 'update'}`);
      
      // Always refresh status
      fetchVotingStatus(true);
      
      // Refresh votes if this is the current task
      if (taskId === task.id) {
        fetchVotes();
      }
    };
    
    // Register socket listeners only once (prevent React StrictMode duplicate registration)
    if (!listenersRegistered.current) {
      console.log('VotingCard: Registering socket listeners');
      listenersRegistered.current = true;
      
      socketClient.onTaskActivated(handleTaskActivated);
      socketClient.onVoteSubmitted(handleVoteSubmitted);
      socketClient.onVoteDeleted(handleVoteDeleted);
      socketClient.onVotesRevealed(handleVotesRevealed);
      socketClient.onForceRefresh(handleForceRefresh);
    } else {
      console.log('VotingCard: Listeners already registered, skipping');
    }

    return () => {
      // DON'T remove socket listeners - they persist across StrictMode remounts
      // The key prop on VotingCard ensures it's fully unmounted/remounted on task change
      clearInterval(refreshInterval);
    };
  }, [task.id, isAdmin, roomId]);

  const fetchVotingStatus = async (forceRefresh = false) => {
    try {
      // Add a cache-busting query parameter when force refreshing
      const endpoint = forceRefresh ? 
        `${task.id}?noCache=true&_t=${new Date().getTime()}` : 
        task.id;
        
      const response = await votesAPI.getVotingStatus(endpoint);
      const statusData = response.data;
      
      // Log timestamp and detailed debug information
      console.log(`Got voting status at ${statusData.timestamp || 'unknown'}, fresh=${!!statusData.fresh}`);
      
      if (statusData.debug) {
        console.log(`Debug info - query count: ${statusData.debug.query_count}, direct count: ${statusData.debug.direct_count}`);
      }
      
      // Update participants list with voting status - make sure this has actual data
      const participantsList = statusData.participants || [];
      console.log(`Got ${participantsList.length} participants from API`);
      
      // Count voted participants manually to verify
      const votedParticipants = participantsList.filter(p => p.has_voted).length;
      console.log(`Manual count of voted participants: ${votedParticipants}`);
      
      setParticipants(participantsList);
      
      // Always update vote count from status API for consistency
      const votesCount = statusData.votes_cast || 0;
      console.log(`Setting vote count to ${votesCount} (API reported) vs ${votedParticipants} (counted from participants)`);
      setVoteCount(votesCount);
      
      // Check if this is the user's current vote
      const currentUserVoteStatus = statusData.participants?.find(p => p.id === user?.id)?.has_voted || false;
      
      // If status shows we have a vote but local state doesn't, refresh vote data
      if (currentUserVoteStatus && !myVote) {
        fetchVotes();
      }
      
      console.log(`Updated voting status: ${statusData.votes_cast}/${statusData.total_participants} participants voted`);
    } catch (error) {
      console.error('Failed to fetch voting status:', error);
    }
  };

  const fetchVotes = async () => {
    try {
      const myVoteRes = await votesAPI.getMyVote(task.id);
      setMyVote(myVoteRes.data);
    } catch (error) {
      // No vote yet
      setMyVote(null);
    }

    if (isAdmin) {
      try {
        const taskRes = await tasksAPI.getById(task.id);
        const taskVotes = taskRes.data.votes || [];
        setVotes(taskVotes);
        setVoteCount(taskVotes.length);
      } catch (error) {
        console.error('Failed to fetch votes:', error);
      }
    }
  };

  const handleVote = async (estimate) => {
    setSubmitting(true);
    try {
      console.log(`Submitting vote for task ${task.id}, estimate: ${estimate}`);
      
      // Submit the vote to the server
      await votesAPI.submit({ taskId: task.id, estimate });
      
      // Update local state immediately for responsive UI
      setMyVote({ estimate });
      
      // Get the accurate vote count from server
      const countResponse = await votesAPI.getCount(task.id);
      const serverCount = countResponse.data.count;
      console.log(`Server reports ${serverCount} votes after submission`);
      
      // Update local vote count
      setVoteCount(serverCount);
      
      // Update local participant state for immediate UI feedback
      setParticipants(prev => prev.map(p => {
        if (p.id === user?.id) {
          return {...p, has_voted: true};
        }
        return p;
      }));
      
      // Emit socket event to broadcast to all other clients
      socketClient.emitVoteSubmitted(roomId, task.id, serverCount);
      
      // Fetch fresh voting status
      fetchVotingStatus(true);
    } catch (error) {
      console.error('Failed to submit vote:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVote = async () => {
    try {
      console.log(`Deleting vote for task ${task.id}`);
      
      // Delete the vote on the server
      await votesAPI.delete(task.id);
      
      // Clear local vote state
      setMyVote(null);
      
      // Get the accurate vote count from server
      const countResponse = await votesAPI.getCount(task.id);
      const serverCount = countResponse.data.count;
      console.log(`Server reports ${serverCount} votes after deletion`);
      
      // Update local vote count
      setVoteCount(serverCount);
      
      // Update local participant state for immediate UI feedback
      setParticipants(prev => prev.map(p => {
        if (p.id === user?.id) {
          return {...p, has_voted: false};
        }
        return p;
      }));
      
      // Emit socket event to broadcast to all other clients
      socketClient.emitVoteDeleted(roomId, task.id, serverCount);
      
      // Fetch fresh voting status
      fetchVotingStatus(true);
    } catch (error) {
      console.error('Failed to delete vote:', error);
    }
  };

  const handleReveal = async () => {
    try {
      const taskRes = await tasksAPI.getById(task.id);
      const taskVotes = taskRes.data.votes || [];
      const statistics = taskRes.data.statistics || {};
      
      setVotes(taskVotes);
      setRevealed(true);
      socketClient.emitVotesRevealed(roomId, task.id, taskVotes, statistics);
    } catch (error) {
      console.error('Failed to reveal votes:', error);
    }
  };

  const handleAssignPoints = async () => {
    if (!storyPoints) return;

    try {
      await tasksAPI.update(task.id, { storyPoints: parseInt(storyPoints) });
      await tasksAPI.deactivate(task.id);
      socketClient.emitTaskDeactivated(roomId, task.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to assign story points:', error);
    }
  };

  const calculateStatistics = () => {
    if (votes.length === 0) return null;
    
    const estimates = votes.map((v) => v.estimate);
    const sum = estimates.reduce((a, b) => a + b, 0);
    const avg = (sum / estimates.length).toFixed(1);
    
    const frequency = {};
    estimates.forEach((e) => {
      frequency[e] = (frequency[e] || 0) + 1;
    });
    const mode = Object.keys(frequency).reduce((a, b) =>
      frequency[a] > frequency[b] ? a : b
    );

    return {
      average: avg,
      mode: parseInt(mode),
      min: Math.min(...estimates),
      max: Math.max(...estimates),
    };
  };

  const stats = revealed ? calculateStatistics() : null;

  return (
    <div className="space-y-6">
      {/* Task Info */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{task.title}</h3>
        <p className="text-gray-600">{task.description}</p>
      </div>

      {/* Voting Interface */}
      {!revealed && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Select Your Estimate</h4>
          <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
            {STORY_POINTS.map((points) => (
              <button
                key={points}
                onClick={() => handleVote(points)}
                disabled={submitting}
                className={`py-3 rounded-lg font-semibold transition-all ${
                  myVote?.estimate === points
                    ? 'bg-primary-600 text-white scale-110'
                    : 'bg-white border-2 border-gray-300 hover:border-primary-500 hover:scale-105'
                }`}
              >
                {points}
              </button>
            ))}
          </div>

          {myVote && (
            <div className="mt-4 flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 text-green-700">
                <Check size={20} />
                <span>You voted: {myVote.estimate} points</span>
              </div>
              <button
                onClick={handleDeleteVote}
                className="text-red-600 hover:text-red-700 flex items-center space-x-1"
              >
                <X size={18} />
                <span>Remove</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Voting Progress */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-700">
          <span className="font-semibold">{voteCount}</span> out of{' '}
          <span className="font-semibold">{participants.length || 0}</span> voted
        </div>

        {isAdmin && !revealed && voteCount > 0 && (
          <button
            onClick={handleReveal}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Eye size={18} />
            <span>Reveal Votes</span>
          </button>
        )}
      </div>

      {/* Participants voting status - always visible */}
      <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-white">
        <h4 className="font-medium text-gray-700 mb-2">Voting Status</h4>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {participants.map((participant) => {
            const hasVoted = participant.has_voted;
            
            return (
              <div key={participant.id} className="flex justify-between items-center py-1 border-b border-gray-100">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${hasVoted ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">
                    {participant.name} {participant.id === user?.id && "(you)"}
                  </span>
                </div>
                <span className={`text-xs font-medium py-1 px-2 rounded-full ${hasVoted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {hasVoted ? 'Voted' : 'Not voted'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Message when active task changes for regular users */}
      {!isAdmin && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Note: Vote counts are only visible to everyone after the admin reveals them.
        </div>
      )}

      {/* Revealed Results */}
      {revealed && (
        <div className="space-y-4">
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">Average</div>
                <div className="text-2xl font-bold text-blue-700">{stats.average}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600 mb-1">Mode</div>
                <div className="text-2xl font-bold text-green-700">{stats.mode}</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-sm text-orange-600 mb-1">Min</div>
                <div className="text-2xl font-bold text-orange-700">{stats.min}</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-600 mb-1">Max</div>
                <div className="text-2xl font-bold text-purple-700">{stats.max}</div>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium text-gray-700 mb-3">Individual Votes</h4>
            <div className="space-y-2">
              {votes.map((vote) => (
                <div
                  key={vote.id}
                  className="flex items-center justify-between p-3 bg-white border rounded-lg"
                >
                  <span className="text-gray-900">{vote.user_name}</span>
                  <span className="font-bold text-primary-600 text-lg">{vote.estimate} SP</span>
                </div>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Assign Final Story Points</h4>
              <div className="flex space-x-3">
                <input
                  type="number"
                  className="input flex-1"
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value)}
                  placeholder="Enter story points"
                  min="0"
                />
                <button
                  onClick={handleAssignPoints}
                  className="btn btn-primary"
                  disabled={!storyPoints}
                >
                  Assign & Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
