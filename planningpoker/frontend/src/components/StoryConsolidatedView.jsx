import { useEffect, useState } from 'react';
import { Book, Users, ThumbsUp, TrendingUp, AlertCircle, CheckCircle, Clock, Download, FileText, RefreshCw } from 'lucide-react';
import { tasksAPI, votesAPI } from '../lib/api';

export default function StoryConsolidatedView({ roomId, isAdmin }) {
  const [tasks, setTasks] = useState([]);
  const [votingHistory, setVotingHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resetting, setResetting] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [roomId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all tasks
      const tasksRes = await tasksAPI.getByRoom(roomId);
      const allTasks = tasksRes.data;
      setTasks(allTasks);

      // Fetch voting history for each task
      const votingData = {};
      for (const task of allTasks) {
        try {
          const votesRes = await votesAPI.getByTask(task.id);
          votingData[task.id] = votesRes.data;
        } catch (err) {
          votingData[task.id] = [];
        }
      }
      setVotingHistory(votingData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load story data');
      console.error('Failed to fetch story data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateVoteStatistics = (votes) => {
    if (!votes || votes.length === 0) return null;
    
    const points = votes.map(v => v.estimate);
    const sum = points.reduce((a, b) => a + b, 0);
    const avg = sum / points.length;
    const sorted = [...points].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    
    // Find mode (most common)
    const frequency = {};
    let maxFreq = 0;
    let mode = points[0];
    
    points.forEach(p => {
      frequency[p] = (frequency[p] || 0) + 1;
      if (frequency[p] > maxFreq) {
        maxFreq = frequency[p];
        mode = p;
      }
    });

    return {
      count: votes.length,
      min: Math.min(...points),
      max: Math.max(...points),
      avg: avg.toFixed(1),
      median,
      mode,
      consensus: maxFreq / votes.length >= 0.5 ? mode : null
    };
  };

  const handleResetVotes = async (taskId) => {
    if (!window.confirm('Reset all votes for this task? The task will be reactivated for voting.')) return;

    try {
      setResetting(taskId);
      await votesAPI.clearAll(taskId);
      
      // Refresh voting history
      setVotingHistory(prev => ({
        ...prev,
        [taskId]: []
      }));

      // Reactivate the task for voting
      await tasksAPI.activate(taskId);
      
      // Refresh all data
      await fetchAllData();
    } catch (err) {
      console.error('Failed to reset votes:', err);
      console.error('Error details:', err.response);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to reset votes';
      alert(`Error: ${errorMessage}`);
    } finally {
      setResetting(null);
    }
  };

  const handleExportStories = () => {
    const csvRows = [
      ['Story Consolidated Report'],
      ['Generated on', new Date().toLocaleString()],
      [''],
      ['Story Summary'],
      ['#', 'Title', 'Description', 'Status', 'Story Points', 'Vote Count', 'Avg Vote', 'Consensus', 'Created'],
    ];

    tasks.forEach((task, idx) => {
      const votes = votingHistory[task.id] || [];
      const stats = calculateVoteStatistics(votes);
      
      csvRows.push([
        idx + 1,
        task.title,
        task.description || 'N/A',
        task.status || 'pending',
        task.story_points || 'Not assigned',
        stats?.count || 0,
        stats?.avg || 'N/A',
        stats?.consensus || 'No consensus',
        new Date(task.created_at).toLocaleDateString()
      ]);

      // Add vote details
      if (votes.length > 0) {
        csvRows.push(['', 'Voter', 'Vote', '', '', '', '', '', '']);
        votes.forEach(vote => {
          csvRows.push(['', vote.voter_name, vote.estimate, '', '', '', '', '', '']);
        });
        csvRows.push(['']); // Empty row
      }
    });

    const csvContent = csvRows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `room-${roomId}-story-report.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading stories...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="text-center py-8">
          <AlertCircle className="mx-auto text-red-600 mb-3" size={48} />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const completedStories = tasks.filter(t => t.story_points !== null);
  const totalPoints = completedStories.reduce((sum, t) => sum + (parseFloat(t.story_points) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-200 rounded-lg">
              <Book className="text-indigo-700" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-indigo-900">Story Consolidated View</h2>
              <p className="text-indigo-700 mt-1">
                {tasks.length} total {tasks.length === 1 ? 'story' : 'stories'} • 
                {completedStories.length} completed • 
                {totalPoints.toFixed(0)} total points
              </p>
            </div>
          </div>
          {tasks.length > 0 && (
            <button
              onClick={handleExportStories}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Download size={18} />
              <span>Export Stories</span>
            </button>
          )}
        </div>
      </div>

      {/* Stories List */}
      {tasks.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-gray-600 text-lg mb-2">No stories yet</p>
          <p className="text-gray-500 text-sm">Create tasks to start your sprint planning</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task, index) => {
            const votes = votingHistory[task.id] || [];
            const stats = calculateVoteStatistics(votes);
            
            return (
              <div key={task.id} className="card hover:shadow-lg transition-shadow">
                {/* Story Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 text-indigo-700 rounded-lg text-lg font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-gray-600 mb-3">{task.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Status and Points */}
                      <div className="flex items-center space-x-4 mb-3">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                          task.story_points
                            ? 'bg-green-100 text-green-700'
                            : task.is_active
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {task.story_points ? (
                            <>
                              <CheckCircle size={14} />
                              <span>Estimated</span>
                            </>
                          ) : task.is_active ? (
                            <>
                              <Clock size={14} />
                              <span>Voting Active</span>
                            </>
                          ) : (
                            <>
                              <Clock size={14} />
                              <span>Pending</span>
                            </>
                          )}
                        </span>

                        {task.story_points && (
                          <div className="flex items-center space-x-2 px-3 py-1 bg-primary-50 rounded-lg">
                            <span className="text-sm text-primary-700 font-medium">Story Points:</span>
                            <span className="text-2xl font-bold text-primary-600">
                              {task.story_points}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Voting Information */}
                {votes.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <ThumbsUp size={16} />
                        <span>Voting Results</span>
                      </h4>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500">
                          {stats.count} {stats.count === 1 ? 'vote' : 'votes'}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => handleResetVotes(task.id)}
                            disabled={resetting === task.id}
                            className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors disabled:opacity-50"
                            title="Reset all votes and ask for revote"
                          >
                            <RefreshCw size={12} className={resetting === task.id ? 'animate-spin' : ''} />
                            <span>{resetting === task.id ? 'Resetting...' : 'Reset Votes'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Vote Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Average</div>
                        <div className="text-lg font-bold text-gray-900">{stats.avg}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Median</div>
                        <div className="text-lg font-bold text-gray-900">{stats.median}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Mode</div>
                        <div className="text-lg font-bold text-gray-900">{stats.mode}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Range</div>
                        <div className="text-lg font-bold text-gray-900">
                          {stats.min}-{stats.max}
                        </div>
                      </div>
                      <div className={`rounded-lg p-3 ${
                        stats.consensus ? 'bg-green-50' : 'bg-amber-50'
                      }`}>
                        <div className="text-xs mb-1" style={{ 
                          color: stats.consensus ? '#15803d' : '#b45309'
                        }}>
                          Consensus
                        </div>
                        <div className="text-lg font-bold" style={{ 
                          color: stats.consensus ? '#15803d' : '#b45309'
                        }}>
                          {stats.consensus || 'None'}
                        </div>
                      </div>
                    </div>

                    {/* Individual Votes */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs font-medium text-gray-700 mb-2">Individual Votes:</div>
                      <div className="flex flex-wrap gap-2">
                        {votes.map((vote, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center space-x-2 bg-white px-3 py-1.5 rounded-md border border-gray-200"
                          >
                            <Users size={14} className="text-gray-500" />
                            <span className="text-sm text-gray-700">{vote.voter_name}</span>
                            <span className="text-sm font-bold text-primary-600">
                              {vote.estimate}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Info */}
                <div className="border-t mt-4 pt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                  {task.updated_at && (
                    <span>Updated {new Date(task.updated_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
