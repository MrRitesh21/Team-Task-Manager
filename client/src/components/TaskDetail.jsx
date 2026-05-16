import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  X, 
  Clock, 
  User, 
  Tag, 
  MessageSquare, 
  Send, 
  Trash2, 
  Loader2,
  Calendar,
  Layers,
  ChevronRight,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const TaskDetail = ({ taskId, onClose, onUpdate }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const { data } = await api.get(`tasks/${taskId}`);
      setTask(data);
    } catch (error) {
      toast.error('Failed to load task details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommenting(true);
    try {
      await api.post(`tasks/${taskId}/comments`, { content: newComment });
      setNewComment('');
      fetchTask();
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  const updateTask = async (updates) => {
    try {
      await api.patch(`tasks/${taskId}`, updates);
      fetchTask();
      onUpdate();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-surface/80 backdrop-blur-3xl z-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ x: '100%' }} 
        animate={{ x: 0 }} 
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-2xl bg-[#080808] border-l border-white/5 shadow-[-50px_0_100px_rgba(0,0,0,0.5)] flex flex-col"
      >
        {/* Header */}
        <div className="h-24 px-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02] sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted/60 uppercase tracking-widest mb-0.5">Project Task</p>
              <h2 className="text-xl font-bold font-heading">Details</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
              <MoreVertical className="w-5 h-5 text-muted" />
            </button>
            <button onClick={onClose} className="p-2.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-10 space-y-12">
            {/* Title Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
                  task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-accent/10 text-accent border-accent/20'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white/5 text-muted/80 border border-white/10">
                  {task.priority}
                </span>
              </div>
              <h1 className="text-4xl font-bold font-heading leading-tight leading-relaxed">{task.title}</h1>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
              <div className="space-y-3">
                <p className="label">Assigned To</p>
                <div className="flex items-center gap-3 group cursor-pointer p-2 -m-2 rounded-xl hover:bg-white/5 transition-colors">
                  <img 
                    src={task.assignee?.avatar || `https://ui-avatars.com/api/?name=${task.assignee?.name || 'U'}&background=4F8EF7&color=fff`} 
                    className="w-10 h-10 rounded-xl ring-2 ring-white/5"
                    alt=""
                  />
                  <div>
                    <p className="text-sm font-bold">{task.assignee?.name || 'Unassigned'}</p>
                    <p className="text-[10px] text-muted uppercase tracking-wider font-medium">{task.assignee ? 'Responsible' : 'Awaiting Assignment'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="label">Due Date</p>
                <div className="flex items-center gap-3 p-2 -m-2 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{task.dueDate ? format(new Date(task.dueDate), 'MMMM d, yyyy') : 'Set a deadline'}</p>
                    <p className="text-[10px] text-muted uppercase tracking-wider font-medium">Target Completion</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="label">Context & Background</p>
                <button className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">Edit Content</button>
              </div>
              <div className="prose prose-invert prose-sm max-w-none bg-white/[0.02] border border-white/5 rounded-2xl p-8 leading-relaxed">
                {task.description ? (
                  <ReactMarkdown>{task.description}</ReactMarkdown>
                ) : (
                  <p className="text-muted/50 italic">This task has no context provided yet...</p>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-bold font-heading">Discussion</h3>
                <span className="bg-white/5 border border-white/10 text-[10px] font-bold px-2 py-0.5 rounded-lg text-muted">{task.comments?.length || 0}</span>
              </div>

              <div className="space-y-6">
                {task.comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-4 group">
                    <img 
                      src={comment.author.avatar || `https://ui-avatars.com/api/?name=${comment.author.name}&background=4F8EF7&color=fff`} 
                      className="w-10 h-10 rounded-xl ring-2 ring-white/5"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 group-hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-bold">{comment.author.name}</p>
                          <p className="text-[10px] text-muted font-bold uppercase tracking-wider">{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</p>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="relative mt-8 group">
                <div className="absolute inset-0 bg-accent/5 blur-2xl rounded-full group-focus-within:bg-accent/10 transition-all" />
                <div className="relative flex items-center gap-4 bg-white/[0.05] border border-white/10 rounded-2xl p-4 focus-within:border-accent/50 focus-within:bg-white/[0.08] transition-all">
                  <textarea
                    rows="1"
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none py-2 px-1 max-h-32"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment(e);
                      }
                    }}
                  />
                  <button 
                    type="submit" 
                    disabled={commenting || !newComment.trim()}
                    className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-accent/20 transition-all shrink-0"
                  >
                    {commenting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-muted/50 mt-3 text-center uppercase tracking-widest font-bold">Press <span className="text-white">Enter</span> to send message</p>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskDetail;
