import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  User, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  Plus,
  Settings as SettingsIcon,
  ChevronRight,
  Command
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'My Profile', href: '/profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex text-white selection:bg-accent/30">
      {/* Background Glows */}
      <div className="fixed -top-[20%] -left-[10%] w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-surface/40 backdrop-blur-2xl border-r border-white/5 transition-all duration-500 lg:static lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-8">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
                <Command className="w-6 h-6" />
              </div>
              <span className="text-2xl font-heading font-bold tracking-tight">TaskSync</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            <p className="px-4 text-[10px] font-bold text-muted/50 uppercase tracking-[0.2em] mb-4">Navigation</p>
            {navigation?.map((item) => (
              <Link
                key={item?.name}
                to={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group",
                  location.pathname === item.href 
                    ? "bg-white/5 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" 
                    : "text-muted hover:bg-white/[0.02] hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    location.pathname === item.href ? "text-accent" : "text-muted group-hover:text-white"
                  )} />
                  <span className="font-medium text-sm">{item?.name}</span>
                </div>
                {location.pathname === item.href && (
                  <motion.div layoutId="active-nav" className="w-1.5 h-1.5 rounded-full bg-accent" />
                )}
              </Link>
            ))}
          </nav>

          <div className="p-6 mt-auto">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <img 
                    src={user??.avatar || `https://ui-avatars.com/api/?name=${user??.name}&background=4F8EF7&color=fff`} 
                    alt={user??.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-surface rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{user??.name}</p>
                  <p className="text-[10px] text-muted truncate uppercase tracking-wider">{user??.email?.split('@')[0]}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>SIGN OUT</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden z-10">
        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-background/20 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-muted hover:text-white bg-white/5 rounded-xl border border-white/10"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted">Pages</span>
              <ChevronRight className="w-4 h-4 text-muted/40" />
              <span className="font-medium capitalize">{location.pathname.split('/')[1] || 'Dashboard'}</span>
            </div>
          </div>

          <div className="flex-1 max-w-lg mx-8 hidden lg:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-2.5 text-sm focus:border-accent/50 focus:bg-white/10 outline-none transition-all duration-300"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[10px] text-muted font-mono">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white hover:bg-white/10 transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-[#050505]"></span>
            </button>
            <button className="btn btn-primary h-10 px-4 text-sm font-bold tracking-wide">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">NEW TASK</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth no-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
