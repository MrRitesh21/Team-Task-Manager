import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  UserPlus, 
  Trash2, 
  AlertTriangle, 
  Shield, 
  User, 
  Loader2,
  Mail,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProjectSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`projects/${id}`);
      setProject(data);
    } catch (error) {
      toast.error('Failed to load project settings');
      navigate(`/projects/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.patch(`projects/${id}`, {
        name: project.name,
        description: project.description
      });
      toast.success('Project updated');
    } catch (error) {
      toast.error('Failed to update project');
    } finally {
      setUpdating(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      const { data } = await api.post(`projects/${id}/members`, { email: inviteEmail, role: 'MEMBER' });
      setProject({ ...project, members: [...project.members, data] });
      setInviteEmail('');
      toast.success('Member added!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to invite user');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`projects/${id}/members/${userId}`);
      setProject({
        ...project,
        members: project.members.filter(m => m.userId !== userId)
      });
      toast.success('Member removed');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`projects/${id}/members/${userId}`, { role: newRole });
      setProject({
        ...project,
        members: project.members?.map(m => m.userId === userId ? { ...m, role: newRole } : m)
      });
      toast.success('Role updated');
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteProject = async () => {
    if (deleteConfirm !== project.name) {
      toast.error('Please type the project name correctly to confirm');
      return;
    }
    try {
      await api.delete(`projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header>
        <h1 className="text-3xl font-bold font-heading">Project Settings</h1>
        <p className="text-muted">Manage project details, members, and permissions.</p>
      </header>

      {/* General Settings */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold border-b border-gray-800 pb-2">General</h2>
        <form onSubmit={handleUpdate} className="card space-y-4">
          <div>
            <label className="label">Project Name</label>
            <input 
              type="text" 
              className="input"
              value={project.name}
              onChange={e => setProject({...project, name: e.target.value})}
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea 
              className="input min-h-[100px] py-2"
              value={project.description || ''}
              onChange={e => setProject({...project, description: e.target.value})}
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={updating} className="btn btn-primary min-w-[120px]">
              {updating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>

      {/* Team Members */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-2">
          <h2 className="text-xl font-bold">Team Members</h2>
          <span className="text-xs font-medium text-muted uppercase tracking-wider">{project?.members?.length} Total</span>
        </div>

        <div className="card space-y-6">
          <form onSubmit={handleInvite} className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="email" 
                placeholder="Collaborator email address..." 
                className="input pl-10"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={inviting} className="btn btn-primary flex items-center gap-2">
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>Invite</span>
            </button>
          </form>

          <div className="divide-y divide-gray-800">
            {project.members?.map((member) => (
              <div key={member.userId} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={member.user.avatar || `https://ui-avatars.com/api/?name=${member.user.name}&background=4F8EF7&color=fff`} 
                    alt="" 
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{member.user.name}</p>
                    <p className="text-xs text-muted">{member.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <select
                    className="bg-transparent text-sm font-medium border-none focus:ring-0 cursor-pointer text-muted hover:text-white"
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>

                  <button 
                    onClick={() => handleRemoveMember(member.userId)}
                    className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-red-500 border-b border-red-500/20 pb-2">Danger Zone</h2>
        <div className="card border-red-500/20 bg-red-500/5">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Delete this project</h3>
              <p className="text-sm text-muted">Once you delete a project, there is no going back. Please be certain.</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm">To confirm, type <span className="font-mono font-bold text-white">"{project.name}"</span> in the box below:</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                className="input flex-1"
                placeholder="Type project name..."
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
              />
              <button 
                onClick={handleDeleteProject}
                className="btn bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectSettings;
