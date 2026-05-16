import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FolderKanban, 
  Plus, 
  MoreVertical, 
  Users as UsersIcon, 
  Calendar, 
  Layout, 
  Loader2,
  Search,
  Grid,
  List,
  ArrowUpRight,
  Command,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [inviteCode, setInviteCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('projects');
      setProjects(data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('projects', newProject);
      toast.success('Project created!');
      setNewProject({ name: '', description: '' });
      setShowCreateModal(false);
      fetchProjects();
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('projects/join', { inviteCode });
      toast.success('Joined project successfully!');
      setInviteCode('');
      setShowJoinModal(false);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to join project');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => p?.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-[1600px] mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <FolderKanban className="w-6 h-6 text-white" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Organization Hub</p>
          </div>
          <h1 className="text-5xl font-bold font-heading">Projects</h1>
          <p className="text-muted text-lg mt-2">Manage and coordinate your team efforts in one place.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowJoinModal(true)}
            className="btn btn-secondary h-12 px-6 flex items-center gap-2 text-sm font-bold tracking-wide"
          >
            <UsersIcon className="w-5 h-5" />
            <span>JOIN WITH CODE</span>
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary h-12 px-6 flex items-center gap-2 text-sm font-bold tracking-wide"
          >
            <Plus className="w-5 h-5" />
            <span>CREATE NEW</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredProjects?.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Link to={`/projects/${project.id}`} className="card h-full flex flex-col hover:border-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:bg-accent group-hover:text-white transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(79,142,247,0.3)]">
                    {project?.name.charAt(0)}
                  </div>
                  <div className="flex -space-x-2">
                    {project.members?.slice(0, 3)?.map((m, i) => (
                      <img 
                        key={i} 
                        src={m.user?.avatar || `https://i.pravatar.cc/100?u=${m.userId}`} 
                        className="w-8 h-8 rounded-lg border-2 border-[#050505] object-cover" 
                        alt="" 
                      />
                    ))}
                    {(project.members?.length || 0) > 3 && (
                      <div className="w-8 h-8 rounded-lg border-2 border-[#050505] bg-surface flex items-center justify-center text-[10px] font-bold text-muted">
                        +{(project.members?.length || 0) - 3}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl font-bold font-heading group-hover:text-accent transition-colors">{project?.name}</h2>
                    <span className={clsx(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest",
                      project.role === 'ADMIN' ? "bg-accent/10 text-accent border border-accent/20" : "bg-white/5 text-muted border border-white/10"
                    )}>
                      {project.role}
                    </span>
                  </div>
                  <p className="text-muted text-sm line-clamp-2 leading-relaxed">{project.description || 'No description provided for this project.'}</p>
                </div>

                <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-muted/60 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <Layout className="w-3.5 h-3.5" />
                      <span>{project._count?.tasks || 0} Tasks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UsersIcon className="w-3.5 h-3.5" />
                      <span>{project?.members?.length} Members</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted group-hover:text-accent transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State / Create Card */}
        <button 
          onClick={() => setShowCreateModal(true)}
          className="card border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center min-h-[300px] group hover:border-accent/50 hover:bg-accent/[0.02] transition-all duration-500"
        >
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:bg-accent group-hover:text-white">
            <Plus className="w-8 h-8" />
          </div>
          <p className="font-heading font-bold text-xl mb-1">Launch Project</p>
          <p className="text-muted text-sm uppercase tracking-widest font-bold">New Workspace</p>
        </button>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="glass-card w-full max-w-xl relative z-10 p-10 border-white/20">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold font-heading">New Project</h2>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                  <Plus className="w-5 h-5 text-muted rotate-45" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="label">Project Title</label>
                  <input type="text" required autoFocus className="glass-input text-lg font-bold" placeholder="E.g., Quantum Redesign" value={newProject?.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="label">Vision & Summary</label>
                  <textarea className="glass-input min-h-[140px] py-4 resize-none text-sm leading-relaxed" placeholder="What's the main goal of this initiative?" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
                </div>
                <div className="flex justify-end gap-4 mt-10">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary h-12 px-8 font-bold">CANCEL</button>
                  <button type="submit" disabled={loading} className="btn btn-primary h-12 px-10 font-bold tracking-widest uppercase text-xs">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'LAUNCH PROJECT'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowJoinModal(false)} />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="glass-card w-full max-w-lg relative z-10 p-10 border-white/20">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <UsersIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold font-heading">Join Project</h2>
                </div>
                <button onClick={() => setShowJoinModal(false)} className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                  <Plus className="w-5 h-5 text-muted rotate-45" />
                </button>
              </div>
              <form onSubmit={handleJoin} className="space-y-6">
                <div className="space-y-2">
                  <label className="label">Invite Code</label>
                  <input type="text" required autoFocus className="glass-input text-center text-2xl font-mono tracking-widest uppercase" placeholder="ABC-123-XYZ" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} />
                  <p className="text-[10px] text-muted text-center uppercase tracking-widest mt-2 font-bold">Paste the code provided by your project admin</p>
                </div>
                <div className="flex justify-end gap-4 mt-10">
                  <button type="button" onClick={() => setShowJoinModal(false)} className="btn btn-secondary h-12 px-8 font-bold">CANCEL</button>
                  <button type="submit" disabled={loading} className="btn bg-purple-500 hover:bg-purple-600 text-white h-12 px-10 font-bold tracking-widest uppercase text-xs">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'JOIN PROJECT'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
