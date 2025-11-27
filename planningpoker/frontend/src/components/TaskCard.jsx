import { useState } from 'react';
import { Play, Trash2, CheckCircle, Edit2, RefreshCw, FileSymlink } from 'lucide-react';
import { tasksAPI, votesAPI } from '../lib/api';
import { socketClient } from '../lib/socket';
import EditTaskModal from './EditTaskModal';
import JiraExportModal from './JiraExportModal';

export default function TaskCard({ task, roomId, isAdmin, onUpdate }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const handleActivate = async () => {
    try {
      console.log(`Activating task ${task.id}`);
      
      // Make the API call to activate the task
      const response = await tasksAPI.activate(task.id);
      const activatedTask = response.data.task;
      console.log(`Task ${task.id} activated, emitting socket event`);
      
      // Emit the socket event to notify all clients
      socketClient.emitTaskActivated(roomId, activatedTask);
      
      // Update local UI
      onUpdate();
    } catch (error) {
      console.error('Failed to activate task:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await tasksAPI.delete(task.id);
      socketClient.emitTaskDeleted(roomId, task.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleResetVotes = async () => {
    if (!window.confirm('Reset all votes for this task? The task will be reactivated for voting.')) return;

    try {
      setResetting(true);
      await votesAPI.clearAll(task.id);
      const response = await tasksAPI.activate(task.id);
      const activatedTask = response.data.task;
      
      // Emit the socket event to notify all clients
      socketClient.emitTaskActivated(roomId, activatedTask);
      
      onUpdate();
    } catch (error) {
      console.error('Failed to reset votes:', error);
      alert(error.response?.data?.error || 'Failed to reset votes');
    } finally {
      setResetting(false);
    }
  };

  const getStatusBadge = () => {
    if (task.story_points !== null) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center space-x-1">
          <CheckCircle size={14} />
          <span>{task.story_points} SP</span>
        </span>
      );
    }
    if (task.is_active) {
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm animate-pulse">
          Active
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
        {task.status}
      </span>
    );
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.title}</h3>
          <p className="text-gray-600 text-sm">{task.description}</p>
        </div>
        {getStatusBadge()}
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Votes: {task.vote_count || 0} / {task.total_participants || 0}
        </div>

        {isAdmin && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="btn btn-secondary flex items-center space-x-1 text-sm"
              title="Edit Task"
            >
              <Edit2 size={14} />
              <span>Edit</span>
            </button>
            {task.vote_count > 0 && (
              <button
                onClick={handleResetVotes}
                disabled={resetting}
                className="btn flex items-center space-x-1 text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                title="Reset votes and allow revoting"
              >
                <RefreshCw size={14} className={resetting ? 'animate-spin' : ''} />
                <span>{resetting ? 'Resetting...' : 'Reset & Revote'}</span>
              </button>
            )}
            
            {/* Jira Export Button - Only show for tasks with story points */}
            {task.story_points !== null && (
              <button
                onClick={() => setShowExportModal(true)}
                className="btn flex items-center space-x-1 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                title="Export to Jira"
              >
                <FileSymlink size={14} />
                <span>Export to Jira</span>
              </button>
            )}
            {!task.is_active && (
              <button
                onClick={handleActivate}
                className="btn btn-primary flex items-center space-x-1 text-sm"
              >
                <Play size={14} />
                <span>Activate</span>
              </button>
            )}
            <button
              onClick={handleDelete}
              className="btn btn-danger flex items-center space-x-1 text-sm"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      {showEditModal && (
        <EditTaskModal
          task={task}
          roomId={roomId}
          onClose={() => setShowEditModal(false)}
          onSuccess={onUpdate}
        />
      )}
      
      {/* Export to Jira Modal */}
      {showExportModal && (
        <JiraExportModal
          task={task}
          onClose={() => setShowExportModal(false)}
          onSuccess={onUpdate}
        />
      )}
    </div>
  );
}
