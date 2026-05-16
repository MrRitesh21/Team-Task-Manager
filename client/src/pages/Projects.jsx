import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  FolderPlus, 
  Users, 
  CheckSquare, 
  MoreVertical, 
  Loader2,
  Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post('/projects', newProject);
      setProjects([data, ...projects]);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      toast.success('Project created!');
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Projects</h1>
          <p className="text-muted">Manage and track all your team projects.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </header>

      {projects.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            <FolderPlus className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-xl font-bold mb-2">No projects yet</h3>
          <p className="text-muted mb-6 max-w-sm">Create your first project to start organizing tasks and collaborating with your team.</p>
          <button 
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link 
              key={project.id} 
              to={`/projects/${project.id}`}
              className="card group hover:border-accent/50 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent transition-colors">
                  <FolderPlus className="w-5 h-5 text-accent group-hover:text-white transition-colors" />
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  project.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {project.role}
                </div>
              </div>
              
              <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">{project.name}</h3>
              <p className="text-sm text-muted line-clamp-2 mb-6 flex-1">{project.description || 'No description provided.'}</p>
              
              <div className="flex items-center gap-6 pt-4 border-t border-gray-800 text-sm text-muted">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{project._count.members}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4" />
                  <span>{project._count.tasks} Tasks</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="card w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Project Name</label>
                <input 
                  type="text" 
                  required
                  className="input"
                  placeholder="e.g. Website Redesign"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Description (Optional)</label>
                <textarea 
                  className="input min-h-[100px] py-2 resize-none"
                  placeholder="Describe the project goals and scope..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={creating}
                  className="btn btn-primary min-w-[100px] flex items-center justify-center"
                >
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
