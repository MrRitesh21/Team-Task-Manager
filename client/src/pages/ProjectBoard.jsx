import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Calendar,
  AlertCircle,
  Loader2,
  X,
  MessageSquare,
  Layout,
  Users as UsersIcon,
  ChevronLeft
} from 'lucide-react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import TaskDetail from '../components/TaskDetail';
import { useAuth } from '../context/AuthContext';

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'bg-slate-500' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-amber-500' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'bg-indigo-500' },
  { id: 'DONE', title: 'Done', color: 'bg-emerald-500' },
];

const TaskCard = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={clsx(
        "bg-white/[0.03] border border-white/5 rounded-2xl p-5 cursor-grab active:cursor-grabbing hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 mb-4 group",
        isDragging && "opacity-20",
        isOverdue && "border-rose-500/30 bg-rose-500/[0.02]"
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-bold text-sm leading-snug group-hover:text-accent transition-colors">{task.title}</h4>
          {isOverdue && <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse mt-1.5 shrink-0" />}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {task.assignee ? (
              <img 
                src={task.assignee?.avatar || `https://ui-avatars.com/api/?name=${task.assignee?.name}&background=4F8EF7&color=fff`} 
                alt={task.assignee?.name}
                className="w-7 h-7 rounded-lg border-2 border-[#0A0A0A] object-cover"
                title={task.assignee?.name}
              />
            ) : (
              <div className="w-7 h-7 rounded-lg border-2 border-[#0A0A0A] bg-white/5 flex items-center justify-center text-[8px] text-muted font-bold">UN</div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {task._count?.comments > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-muted font-bold">
                <MessageSquare className="w-3 h-3" />
                <span>{task._count.comments}</span>
              </div>
            )}
            <div className={clsx(
              "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest",
              task.priority === 'URGENT' ? 'bg-rose-500/10 text-rose-500' :
              task.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
              task.priority === 'MEDIUM' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'
            )}>
              {task.priority}
            </div>
          </div>
        </div>

        {task.dueDate && (
          <div className={clsx(
            "flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider",
            isOverdue ? "text-rose-500" : "text-muted/60"
          )}>
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(new Date(task.dueDate), 'MMM d')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectBoard = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState('TODO');
  const [searchQuery, setSearchQuery] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`projects/${id}`),
        api.get(`tasks/project/${id}`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      toast.error('Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tasks, searchQuery]);

  const tasksByStatus = useMemo(() => {
    return COLUMNS.reduce((acc, col) => {
      acc[col.id] = filteredTasks.filter(t => t.status === col.id);
      return acc;
    }, {});
  }, [filteredTasks]);

  const onDragStart = (event) => {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';
    if (!isActiveATask) return;

    if (isActiveATask && isOverATask) {
      const activeTask = tasks.find(t => t.id === activeId);
      const overTask = tasks.find(t => t.id === overId);
      if (activeTask && overTask && activeTask.status !== overTask.status) {
        setTasks(prev => {
          const activeIndex = prev.findIndex(t => t.id === activeId);
          const overIndex = prev.findIndex(t => t.id === overId);
          const updatedTasks = [...prev];
          updatedTasks[activeIndex].status = overTask.status;
          return arrayMove(updatedTasks, activeIndex, overIndex);
        });
      }
    }

    const isOverAColumn = COLUMNS.some(col => col.id === overId);
    if (isActiveATask && isOverAColumn) {
      const activeTask = tasks.find(t => t.id === activeId);
      if (activeTask && activeTask.status !== overId) {
        setTasks(prev => {
          const activeIndex = prev.findIndex(t => t.id === activeId);
          const updatedTasks = [...prev];
          updatedTasks[activeIndex].status = overId;
          return arrayMove(updatedTasks, activeIndex, activeIndex);
        });
      }
    }
  };

  const onDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    let newStatus = activeTask.status;
    const isOverAColumn = COLUMNS.some(col => col.id === overId);
    if (isOverAColumn) {
      newStatus = overId;
    } else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    try {
      await api.patch(`tasks/${activeId}`, { status: newStatus });
    } catch (error) {
      toast.error('Failed to save changes');
      fetchProjectData();
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>;

  return (
    <div className="h-full flex flex-col min-w-0 pb-10">
      {/* Board Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
        <div className="space-y-4">
          <Link to="/projects" className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-white transition-colors uppercase tracking-widest group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Projects
          </Link>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Layout className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading mb-1">{project?.name}</h1>
              <div className="flex items-center gap-6 text-xs text-muted/60 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-3.5 h-3.5" />
                  <span>{project?.members?.length} Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" />
                  <span>{tasks.length} Tasks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-3 hover:space-x-1 transition-all duration-500 group pr-2">
              {project?.members?.slice(0, 5).map((member) => (
                <div key={member.userId} className="relative group/member">
                  <img 
                    src={member.user?.avatar || `https://ui-avatars.com/api/?name=${member.user?.name}&background=4F8EF7&color=fff`} 
                    className="w-10 h-10 rounded-xl border-2 border-[#050505] object-cover ring-2 ring-transparent group-hover/member:ring-accent transition-all"
                    alt={member.user?.name}
                  />
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-surface px-2 py-1 rounded text-[10px] font-bold border border-white/10 opacity-0 group-hover/member:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-2xl">
                    {member.user?.name} ({member.role})
                  </div>
                </div>
              ))}
              {project?.members?.length > 5 && (
                <div className="w-10 h-10 rounded-xl bg-white/5 border-2 border-[#050505] flex items-center justify-center text-[10px] font-bold text-muted">
                  +{project.members.length - 5}
                </div>
              )}
            </div>

            <div className="h-10 w-px bg-white/5 hidden sm:block" />

            <div className="flex flex-wrap items-center gap-4">
          <div className="relative group flex-1 min-w-[200px] sm:max-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Search in board..." 
              className="glass-input pl-11 h-12 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary h-12 px-5">
            <Filter className="w-4 h-4" /> <span>Filters</span>
          </button>
          {project?.members?.find(m => m.userId === user?.id)?.role === 'ADMIN' && (
            <Link to={`/projects/${id}/settings`} className="btn btn-secondary h-12 w-12 !px-0">
              <Settings className="w-5 h-5" />
            </Link>
          )}
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto min-h-0 no-scrollbar">
        <div className="flex gap-8 h-full">
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
            {COLUMNS?.map((col) => (
              <div key={col.id} className="flex flex-col w-[340px] shrink-0 h-full">
                <div className="flex items-center justify-between mb-6 px-2">
                  <div className="flex items-center gap-3">
                    <div className={clsx("w-2 h-2 rounded-full", col.color)} />
                    <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-white/90">{col.title}</h3>
                    <span className="bg-white/5 border border-white/10 text-muted/50 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                      {tasksByStatus[col.id].length}
                    </span>
                  </div>
                  <button onClick={() => { setNewTaskColumn(col.id); setShowCreateModal(true); }} className="p-1.5 text-muted hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 bg-white/[0.01] border border-white/[0.03] rounded-3xl p-3 min-h-[300px] overflow-y-auto no-scrollbar shadow-inner">
                  <SortableContext id={col.id} items={tasksByStatus[col.id]?.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1 min-h-[50px]">
                      {tasksByStatus[col.id]?.map((task) => (
                        <TaskCard key={task.id} task={task} onClick={setSelectedTask} />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              </div>
            ))}

            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
              {activeTask ? (
                <div className="bg-surface/80 backdrop-blur-xl border-2 border-accent/50 p-5 rounded-2xl shadow-[0_0_50px_rgba(79,142,247,0.2)] w-[340px] pointer-events-none">
                  <h4 className="font-bold text-sm leading-snug">{activeTask.title}</h4>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      <AnimatePresence>
        {selectedTask && <TaskDetail taskId={selectedTask.id} onClose={() => setSelectedTask(null)} onUpdate={fetchProjectData} />}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateModal && <CreateTaskModal projectId={id} status={newTaskColumn} members={project?.members || []} onClose={() => setShowCreateModal(false)} onCreated={(newTask) => { setTasks([...tasks, newTask]); setShowCreateModal(false); }} />}
      </AnimatePresence>
    </div>
  );
};

const CreateTaskModal = ({ projectId, status, members, onClose, onCreated }) => {
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(`tasks/project/${projectId}`, { ...formData, status });
      toast.success('Task created');
      onCreated(data);
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="glass-card w-full max-w-xl relative z-10 p-10 border-white/20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold font-heading mb-1">New Task</h2>
            <p className="text-xs text-muted uppercase tracking-widest font-bold">Assigning to {status.replace('_', ' ')}</p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="label">Task Headline</label>
            <input type="text" required autoFocus className="glass-input text-lg font-bold" placeholder="Design system overhaul..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="label">Priority Level</label>
              <select className="glass-input text-sm" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Level</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="label">Target Date</label>
              <input type="date" className="glass-input text-sm" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="label">Responsible Member</label>
            <select className="glass-input text-sm" value={formData.assigneeId} onChange={e => setFormData({...formData, assigneeId: e.target.value})}>
              <option value="">Unassigned</option>
              {members?.map(m => ( <option key={m.userId} value={m.userId}>{m.user?.name}</option> ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="label">Context & Details</label>
            <textarea className="glass-input min-h-[120px] py-3 resize-none text-sm leading-relaxed" placeholder="Briefly describe the requirements and goals..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="flex justify-end gap-4 mt-10">
            <button type="button" onClick={onClose} className="btn btn-secondary h-12 px-8 font-bold">CANCEL</button>
            <button type="submit" disabled={loading} className="btn btn-primary h-12 px-10 font-bold tracking-widest uppercase text-xs">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CREATE TASK'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProjectBoard;
