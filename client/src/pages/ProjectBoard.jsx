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
  MessageSquare
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
import TaskDetail from '../components/TaskDetail';

const COLUMNS = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'IN_REVIEW', title: 'In Review' },
  { id: 'DONE', title: 'Done' },
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
        "card p-4 cursor-grab active:cursor-grabbing hover:border-gray-600 transition-colors mb-3",
        isDragging && "opacity-50 border-accent",
        isOverdue && "border-red-500/50"
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
          {isOverdue && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <div className="flex -space-x-2">
            {task.assignee ? (
              <img 
                src={task.assignee.avatar || `https://ui-avatars.com/api/?name=${task.assignee.name}&background=4F8EF7&color=fff`} 
                alt={task.assignee.name}
                className="w-6 h-6 rounded-full border-2 border-surface"
                title={task.assignee.name}
              />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-surface bg-gray-800 flex items-center justify-center text-[10px] text-muted">?</div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {task._count?.comments > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-muted">
                <MessageSquare className="w-3 h-3" />
                <span>{task._count.comments}</span>
              </div>
            )}
            <div className={clsx(
              "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
              task.priority === 'URGENT' ? 'bg-red-500/10 text-red-500' :
              task.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
              task.priority === 'MEDIUM' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'
            )}>
              {task.priority}
            </div>
          </div>
        </div>

        {task.dueDate && (
          <div className={clsx(
            "flex items-center gap-1.5 text-[10px] font-medium",
            isOverdue ? "text-red-500" : "text-muted"
          )}>
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(task.dueDate), 'MMM d')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectBoard = () => {
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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
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
    return tasks.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

    // Dropping a Task over another Task
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

    // Dropping a Task over a Column
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

    // Find new status
    let newStatus = activeTask.status;
    const isOverAColumn = COLUMNS.some(col => col.id === overId);
    if (isOverAColumn) {
      newStatus = overId;
    } else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    // Persist change
    try {
      await api.patch(`/tasks/${activeId}`, { status: newStatus });
    } catch (error) {
      toast.error('Failed to save changes');
      fetchProjectData(); // Rollback
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="h-full flex flex-col min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold font-heading">{project?.name}</h1>
            <Link to={`/projects/${id}/settings`} className="p-1.5 text-muted hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted">
            <div className="flex -space-x-2">
              {project?.members.slice(0, 5).map(m => (
                <img 
                  key={m.userId}
                  src={m.user.avatar || `https://ui-avatars.com/api/?name=${m.user.name}&background=4F8EF7&color=fff`}
                  className="w-6 h-6 rounded-full border-2 border-surface"
                  title={m.user.name}
                />
              ))}
              {project?.members.length > 5 && (
                <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-surface flex items-center justify-center text-[10px]">
                  +{project.members.length - 5}
                </div>
              )}
            </div>
            <span>{tasks.length} Tasks</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="input pl-10 h-10 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary h-10 px-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden lg:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto min-h-0">
        <div className="flex gap-6 h-full pb-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            {COLUMNS.map((col) => (
              <div key={col.id} className="flex flex-col w-80 shrink-0 h-full">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm uppercase tracking-wider">{col.title}</h3>
                    <span className="bg-gray-800 text-muted px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                      {tasksByStatus[col.id].length}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setNewTaskColumn(col.id);
                      setShowCreateModal(true);
                    }}
                    className="p-1 text-muted hover:text-white hover:bg-gray-800 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 bg-gray-900/30 rounded-xl p-2 min-h-[150px] overflow-y-auto scrollbar-none">
                  <SortableContext
                    id={col.id}
                    items={tasksByStatus[col.id].map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {tasksByStatus[col.id].map((task) => (
                      <TaskCard key={task.id} task={task} onClick={setSelectedTask} />
                    ))}
                  </SortableContext>
                </div>
              </div>
            ))}

            <DragOverlay dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: {
                  active: {
                    opacity: '0.5',
                  },
                },
              }),
            }}>
              {activeTask ? (
                <div className="card p-4 shadow-2xl border-accent w-80 pointer-events-none">
                  <h4 className="font-medium text-sm line-clamp-2">{activeTask.title}</h4>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Modals & Panels */}
      {selectedTask && (
        <TaskDetail 
          taskId={selectedTask.id} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={fetchProjectData}
        />
      )}

      {showCreateModal && (
        <CreateTaskModal 
          projectId={id}
          status={newTaskColumn}
          members={project?.members || []}
          onClose={() => setShowCreateModal(false)}
          onCreated={(newTask) => {
            setTasks([...tasks, newTask]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

const CreateTaskModal = ({ projectId, status, members, onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(`/tasks/project/${projectId}`, {
        ...formData,
        status
      });
      toast.success('Task created');
      onCreated(data);
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="card w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">New Task in {status.replace('_', ' ')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input 
              type="text" required autoFocus
              className="input" placeholder="What needs to be done?"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select 
                className="input"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input 
                type="date"
                className="input"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="label">Assignee</label>
            <select 
              className="input"
              value={formData.assigneeId}
              onChange={e => setFormData({...formData, assigneeId: e.target.value})}
            >
              <option value="">Unassigned</option>
              {members.map(m => (
                <option key={m.userId} value={m.userId}>{m.user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea 
              className="input min-h-[100px] py-2 resize-none"
              placeholder="Add some details..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary min-w-[100px]">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectBoard;
