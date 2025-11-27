import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, Clock, Target, Award, Download } from 'lucide-react';
import { tasksAPI } from '../lib/api';

export default function ConsolidatedView({ roomId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConsolidatedData();
  }, [roomId]);

  const fetchConsolidatedData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await tasksAPI.getConsolidated(roomId);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load consolidated data');
      console.error('Failed to fetch consolidated data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading consolidated data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, tasks } = data;
  const completionRate = summary.total_tasks > 0 
    ? ((parseInt(summary.completed_tasks) / parseInt(summary.total_tasks)) * 100).toFixed(1)
    : 0;

  const handleExport = () => {
    // Create CSV content
    const csvRows = [
      ['Task Summary Report'],
      [''],
      ['Metric', 'Value'],
      ['Total Tasks', summary.total_tasks],
      ['Completed Tasks', summary.completed_tasks],
      ['Total Story Points', parseFloat(summary.total_story_points).toFixed(1)],
      ['Average Story Points', parseFloat(summary.average_story_points).toFixed(1)],
      ['Completion Rate', `${completionRate}%`],
      [''],
      ['Task Details'],
      ['#', 'Title', 'Story Points', 'Status'],
      ...tasks.map((task, idx) => [
        idx + 1,
        task.title,
        task.story_points,
        task.status || 'pending'
      ])
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `room-${roomId}-consolidated-report.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Story Points */}
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-primary-700 mb-1">Total Story Points</p>
              <p className="text-3xl font-bold text-primary-900">
                {parseFloat(summary.total_story_points).toFixed(0)}
              </p>
            </div>
            <div className="p-3 bg-primary-200 rounded-lg">
              <Target className="text-primary-700" size={24} />
            </div>
          </div>
        </div>

        {/* Average Story Points */}
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">Average Points</p>
              <p className="text-3xl font-bold text-blue-900">
                {parseFloat(summary.average_story_points).toFixed(1)}
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <TrendingUp className="text-blue-700" size={24} />
            </div>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-purple-900">
                {summary.total_tasks}
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <BarChart3 className="text-purple-700" size={24} />
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-900">
                {summary.completed_tasks}
              </p>
              <p className="text-xs text-green-600 mt-1">{completionRate}% complete</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <CheckCircle2 className="text-green-700" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Completion Progress Bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Sprint Progress</h3>
          <span className="text-sm font-medium text-gray-600">
            {summary.completed_tasks} of {summary.total_tasks} tasks
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${completionRate}%` }}
          >
            {completionRate > 10 && (
              <span className="text-xs font-bold text-white">{completionRate}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Tasks Breakdown */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Award size={24} className="text-primary-600" />
            <span>Story Points by Task</span>
          </h3>
          <div className="flex items-center">
            <span className="text-sm text-gray-500">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} with points assigned
            </span>
          </div>
        </div>

        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{task.title}</div>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : task.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {task.status || 'pending'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">
                      {task.story_points}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600">No tasks have story points assigned yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Complete voting on tasks to see them here
            </p>
          </div>
        )}
      </div>

      {/* Insights */}
      {tasks.length > 0 && (
        <div className="card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center space-x-2">
            <TrendingUp size={20} />
            <span>Insights</span>
          </h3>
          <div className="space-y-2 text-sm text-amber-800">
            <p>
              • <strong>Velocity:</strong> Average {parseFloat(summary.average_story_points).toFixed(1)} points per task
            </p>
            <p>
              • <strong>Completion Rate:</strong> {completionRate}% of tasks have story points assigned
            </p>
            {parseInt(summary.completed_tasks) > 0 && (
              <p>
                • <strong>Total Effort:</strong> {parseFloat(summary.total_story_points).toFixed(0)} story points across all completed tasks
              </p>
            )}
            {parseInt(summary.total_tasks) > parseInt(summary.completed_tasks) && (
              <p className="text-amber-700 font-medium">
                • {parseInt(summary.total_tasks) - parseInt(summary.completed_tasks)} task{parseInt(summary.total_tasks) - parseInt(summary.completed_tasks) !== 1 ? 's' : ''} still need{parseInt(summary.total_tasks) - parseInt(summary.completed_tasks) === 1 ? 's' : ''} story point assignment
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
