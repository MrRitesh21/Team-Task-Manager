import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  X, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  MoreVertical,
  Trash2,
  Send,
  Loader2,
  Clock,
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';

const TaskDetail = ({ taskId, onClose, onUpdate }) => {
  const { user: currentUser } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [updating, setUpdating] = useState(null); // 'status', 'priority', etc.

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const { data } = await api.get(`/tasks/${taskId}`);
      setTask(data);
      setDescription(data.description || '');
    } catch (error) {
      toast.error('Failed to load task details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updates) => {
    const field = Object.keys(updates)[0];
    setUpdating(field);
    try {
      const { data } = await api.patch(`/tasks/${taskId}`, updates);
      setTask(prev => ({ ...prev, ...data }));
      onUpdate();
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommenting(true);
    try {
      const { data } = await api.post(`/tasks/${taskId}/comments`, { content: newComment });
      setTask(prev => ({
        ...prev,
        comments: [...prev.comments, data]
      }));
      setNewComment('');
      onUpdate(); // To refresh comment count on board
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  if (loading) return null;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div className="fixed inset-y-0 right-0 z-[80] w-full max-w-xl bg-surface border-l border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={clsx(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            task.status === 'DONE' ? 'bg-green-500/10 text-green-500' : 'bg-accent/10 text-accent'
          )}>
            {task.status === 'DONE' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <span className="text-sm font-medium text-muted">TASK-{task.id.slice(0, 4).toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDelete} className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-2 text-muted hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Title */}
        <div>
          <textarea
            className="w-full bg-transparent text-2xl font-bold font-heading focus:outline-none resize-none overflow-hidden"
            rows={1}
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            onBlur={(e) => handleUpdate({ title: e.target.value })}
          />
        </div>

        {/* Props Grid */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-12">
          <div className="space-y-1.5">
            <label className="label flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Status
            </label>
            <select
              className="w-full bg-background border border-gray-700 rounded-lg px-3 py-1.5 text-sm appearance-none focus:border-accent outline-none"
              value={task.status}
              onChange={(e) => handleUpdate({ status: e.target.value })}
              disabled={updating === 'status'}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="label flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Priority
            </label>
            <select
              className="w-full bg-background border border-gray-700 rounded-lg px-3 py-1.5 text-sm appearance-none focus:border-accent outline-none"
              value={task.priority}
              onChange={(e) => handleUpdate({ priority: e.target.value })}
              disabled={updating === 'priority'}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="label flex items-center gap-2">
              <User className="w-4 h-4" /> Assignee
            </label>
            <div className="flex items-center gap-2 px-1">
              <img 
                src={task.assignee?.avatar || `https://ui-avatars.com/api/?name=${task.assignee?.name || 'Unassigned'}&background=4F8EF7&color=fff`} 
                alt="" 
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm">{task.assignee?.name || 'Unassigned'}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="label flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Due Date
            </label>
            <div className={clsx(
              "text-sm font-medium px-1",
              isOverdue ? "text-red-500" : "text-white"
            )}>
              {task.dueDate ? format(new Date(task.dueDate), 'MMMM d, yyyy') : 'No due date'}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="label uppercase tracking-widest text-[10px] font-bold">Description</label>
          {isEditingDescription ? (
            <div className="space-y-2">
              <textarea
                className="input min-h-[150px] py-3 text-sm"
                autoFocus
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => {
                    setDescription(task.description || '');
                    setIsEditingDescription(false);
                  }}
                  className="btn btn-secondary text-xs px-3 py-1"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleUpdate({ description });
                    setIsEditingDescription(false);
                  }}
                  className="btn btn-primary text-xs px-3 py-1"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setIsEditingDescription(true)}
              className="prose prose-invert prose-sm max-w-none p-4 rounded-xl bg-background/50 border border-transparent hover:border-gray-700 cursor-pointer transition-colors min-h-[100px]"
            >
              {task.description ? (
                <ReactMarkdown>{task.description}</ReactMarkdown>
              ) : (
                <p className="text-muted italic">No description provided. Click to add one...</p>
              )}
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="space-y-6 pt-4 border-t border-gray-800">
          <h3 className="text-lg font-bold flex items-center gap-2">
            Comments
            <span className="bg-gray-800 text-muted px-2 py-0.5 rounded-full text-xs">{task.comments.length}</span>
          </h3>

          <form onSubmit={handleAddComment} className="relative">
            <textarea
              placeholder="Write a comment..."
              className="input pr-12 py-3 text-sm min-h-[80px] resize-none"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button 
              type="submit"
              disabled={commenting || !newComment.trim()}
              className="absolute bottom-3 right-3 p-2 bg-accent text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {commenting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>

          <div className="space-y-6 pb-12">
            {task.comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <img 
                  src={comment.author.avatar || `https://ui-avatars.com/api/?name=${comment.author.name}&background=4F8EF7&color=fff`} 
                  alt="" 
                  className="w-8 h-8 rounded-full shrink-0"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{comment.author.name}</span>
                    <span className="text-[10px] text-muted">{format(new Date(comment.createdAt), 'MMM d, p')}</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
