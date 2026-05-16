import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layout, 
  ChevronRight,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard');
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
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: Layout, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'In Progress', value: stats?.byStatus.inProgress || 0, icon: TrendingUp, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Completed', value: stats?.byStatus.done || 0, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Overdue', value: stats?.overdueTasks.length || 0, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold font-heading">Dashboard</h1>
        <p className="text-muted">Welcome back! Here's what's happening today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Upcoming Tasks
            </h2>
            <Link to="/projects" className="text-sm text-accent hover:underline flex items-center gap-1">
              View all projects <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.myTasks.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-muted">No upcoming tasks. You're all caught up!</p>
              </div>
            ) : (
              stats?.myTasks.map((task) => (
                <div key={task.id} className="card p-4 hover:border-gray-700 transition-colors group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate group-hover:text-accent transition-colors">{task.title}</h3>
                      <p className="text-sm text-muted">{task.project.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block mb-1 ${
                        new Date(task.dueDate) < new Date() ? 'bg-red-500/10 text-red-500' : 'bg-accent/10 text-accent'
                      }`}>
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
                      </div>
                      <p className="text-xs text-muted">{task.priority}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          <div className="card space-y-6 p-5">
            {stats?.recentActivity.length === 0 ? (
              <p className="text-center text-muted py-8">No recent activity</p>
            ) : (
              stats?.recentActivity.map((activity, idx) => (
                <div key={activity.id} className="flex gap-4 relative">
                  {idx !== stats.recentActivity.length - 1 && (
                    <div className="absolute left-4 top-10 bottom-[-24px] w-px bg-gray-800" />
                  )}
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <img 
                      src={activity.assignee?.avatar || `https://ui-avatars.com/api/?name=${activity.assignee?.name || 'User'}&background=4F8EF7&color=fff`} 
                      alt="" 
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.assignee?.name || 'Someone'}</span> updated <span className="text-accent">"{activity.title}"</span>
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {format(new Date(activity.updatedAt), 'MMM d, h:mm a')} • {activity.project.name}
                    </p>
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
