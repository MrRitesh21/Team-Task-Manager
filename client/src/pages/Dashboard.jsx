import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layout as LayoutIcon, 
  ChevronRight,
  TrendingUp,
  Loader2,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('dashboard');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: Layers, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'In Progress', value: stats?.byStatus.inProgress || 0, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Completed', value: stats?.byStatus.done || 0, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Overdue', value: stats?.overdueTasks.length || 0, icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-20">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold font-heading mb-2">Overview</h1>
          <p className="text-muted text-lg">Keep track of your projects and team performance.</p>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-sm font-medium">
          <Calendar className="w-4 h-4 text-accent" />
          <span>{format(new Date(), 'MMMM d, yyyy')}</span>
        </div>
      </header>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.?.map((stat) => (
          <motion.div 
            key={stat.label} 
            variants={item}
            className={`card relative overflow-hidden group hover:border-white/20 transition-all duration-500`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-[60px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`} />
            <div className="relative flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.border} border shadow-inner`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-muted/70 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold font-heading">{stat.value}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Upcoming Tasks */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-heading flex items-center gap-3">
              <Clock className="w-6 h-6 text-accent" />
              Focus Tasks
            </h2>
            <Link to="/projects" className="text-xs font-bold text-accent hover:text-white flex items-center gap-1 transition-colors uppercase tracking-widest">
              Explore Projects <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid gap-4">
            {stats?.myTasks.length === 0 ? (
              <div className="card border-dashed border-white/10 flex flex-col items-center justify-center py-20 bg-transparent">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-muted/30" />
                </div>
                <p className="text-muted font-medium">All caught up! No tasks pending.</p>
              </div>
            ) : (
              stats?.myTasks.?.map((task) => (
                <div key={task.id} className="group card p-1 bg-white/[0.03] hover:bg-white/[0.05] transition-all duration-300">
                  <div className="p-4 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                        <span className="text-accent font-bold text-xs">{task.project.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white group-hover:text-accent transition-colors truncate">{task.title}</h3>
                        <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                          <Layers className="w-3 h-3" /> {task.project.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:block text-right">
                        <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1 inline-block ${
                          task.priority === 'URGENT' ? 'bg-rose-500/10 text-rose-500' :
                          task.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {task.priority}
                        </div>
                        <p className="text-[10px] text-muted flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" /> 
                          {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
                        </p>
                      </div>
                      <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-accent hover:text-white flex items-center justify-center transition-all border border-white/5">
                        <ArrowUpRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tasks per User Breakdown */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-heading">Team Workload</h2>
          <div className="card bg-[#0A0A0A] border-white/5 p-8">
            <div className="space-y-6">
              {stats?.tasksPerUser?.map((member) => {
                const percentage = stats.totalTasks > 0 
                  ? Math.round((member._count.assignedTasks / stats.totalTasks) * 100) 
                  : 0;
                
                return (
                  <div key={member.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=4F8EF7&color=fff`} 
                          className="w-6 h-6 rounded-lg object-cover" 
                          alt="" 
                        />
                        <span className="text-sm font-bold">{member.name}</span>
                      </div>
                      <span className="text-xs font-bold text-muted">{member._count.assignedTasks} tasks</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-accent shadow-[0_0_10px_rgba(79,142,247,0.5)]"
                      />
                    </div>
                  </div>
                );
              })}
              {(!stats?.tasksPerUser || stats.tasksPerUser.length === 0) && (
                <p className="text-center text-muted py-4 italic text-sm">No assignments yet.</p>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold font-heading mt-10">Activity</h2>
          <div className="card bg-[#0A0A0A] border-white/5 p-8 space-y-8">
            {stats?.recentActivity.length === 0 ? (
              <p className="text-center text-muted py-8 italic">Silence is golden...</p>
            ) : (
              stats?.recentActivity.?.map((activity, idx) => (
                <div key={activity.id} className="flex gap-5 relative">
                  {idx !== stats.recentActivity.length - 1 && (
                    <div className="absolute left-[19px] top-10 bottom-[-32px] w-[2px] bg-gradient-to-b from-white/10 to-transparent" />
                  )}
                  <div className="relative shrink-0">
                    <img 
                      src={activity.assignee?.avatar || `https://ui-avatars.com/api/?name=${activity.assignee?.name || 'U'}&background=4F8EF7&color=fff`} 
                      alt="" 
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/5 shadow-2xl"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0A0A0A] rounded-full flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-accent rounded-full" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm text-gray-300 leading-tight">
                      <span className="font-bold text-white">{activity.assignee?.name || 'Someone'}</span>
                      <span className="text-muted mx-1.5">modified</span>
                      <span className="text-accent font-medium hover:underline cursor-pointer">"{activity.title}"</span>
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-bold text-muted/50 uppercase tracking-wider">
                        {format(new Date(activity.updatedAt), 'h:mm a')}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[10px] font-bold text-accent/70 uppercase tracking-wider truncate">
                        {activity.project.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
