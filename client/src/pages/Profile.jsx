import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Loader2, 
  CheckCircle2,
  FolderKanban
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setPassLoading(true);
    try {
      // Assuming api is accessible or use a service
      const api = (await import('../services/api')).default;
      await api.patch('users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header>
        <h1 className="text-3xl font-bold font-heading">User Profile</h1>
        <p className="text-muted">Manage your personal information and account security.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <div className="card text-center flex flex-col items-center">
            <div className="relative mb-4 group">
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=4F8EF7&color=fff&size=200`} 
                alt="" 
                className="w-32 h-32 rounded-full border-4 border-accent/20 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-sm text-muted mb-6">{user?.email}</p>
            
            <div className="w-full pt-6 border-t border-gray-800 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Account Status
                </span>
                <span className="font-medium text-green-500">Verified</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-accent" /> Active Projects
                </span>
                <span className="font-medium">...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* General Information */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-accent" /> General Information
            </h3>
            <form onSubmit={handleUpdateProfile} className="card space-y-4">
              <div className="space-y-1.5">
                <label className="label">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input 
                    type="text" 
                    className="input pl-10"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="label">Avatar URL</label>
                <div className="relative">
                  <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input 
                    type="text" 
                    className="input pl-10"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.avatar}
                    onChange={e => setFormData({...formData, avatar: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1.5 opacity-60">
                <label className="label">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input 
                    type="email" 
                    className="input pl-10 cursor-not-allowed"
                    value={user?.email}
                    disabled
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={loading} className="btn btn-primary min-w-[120px]">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Update Profile'}
                </button>
              </div>
            </form>
          </section>

          {/* Security */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent" /> Security
            </h3>
            <form onSubmit={handleChangePassword} className="card space-y-4">
              <div className="space-y-1.5">
                <label className="label">Current Password</label>
                <input 
                  type="password" 
                  className="input"
                  required
                  value={passwordData.currentPassword}
                  onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="label">New Password</label>
                  <input 
                    type="password" 
                    className="input"
                    required
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="label">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="input"
                    required
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={passLoading} className="btn btn-secondary min-w-[150px]">
                  {passLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Change Password'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
