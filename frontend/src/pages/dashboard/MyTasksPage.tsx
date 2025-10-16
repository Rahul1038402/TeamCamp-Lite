import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Filter, Loader2 } from 'lucide-react';
import { tasksAPI, membersAPI } from '../../services/api';
import TaskCard from '../../components/tasks/TaskCard';
import EditTaskModal from '../../components/tasks/EditTaskModal';
import clsx from 'clsx';
import type { Task, ProjectMember } from '../../types';

type FilterType = 'all' | 'todo' | 'in_progress' | 'done';

interface ExtendedTask extends Task {
  projectName?: string;
  projectId?: number;
}

export default function MyTasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const [myTasks, setMyTasks] = useState<ExtendedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskMembers, setEditTaskMembers] = useState<ProjectMember[]>([]);

  // Fetch tasks assigned to current user
  const fetchMyTasks = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await tasksAPI.getMyTasks();
      const tasksWithProject = (response.data || []).map((task: Task) => ({
        ...task,
        projectName: task.project?.name || 'Unknown Project',
        projectId: task.project?.id || task.project_id,
      }));
      setMyTasks(tasksWithProject);
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      setMyTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [user?.id]);

  // Filter tasks
  const filteredTasks = myTasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  // Group tasks by status for counts
  const todoTasks = myTasks.filter(t => t.status === 'todo');
  const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
  const doneTasks = myTasks.filter(t => t.status === 'done');

  // Handle task deletion
  const handleDeleteTask = async (taskId: number) => {
    try {
      await tasksAPI.delete(taskId);
      // Refresh tasks after deletion
      await fetchMyTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  // Handle task edit
  const handleEditTask = async (task: Task) => {
    // Fetch members for the task's project
    try {
      const response = await membersAPI.getByProject(task.project_id);
      setEditTaskMembers(response.data || []);
      setEditingTask(task);
    } catch (error) {
      console.error('Error fetching project members:', error);
      setEditTaskMembers([]);
      setEditingTask(task);
    }
  };

  // Handle status change
  const handleStatusChange = async (taskId: number, newStatus: 'todo' | 'in_progress' | 'done') => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      // Refresh tasks after status change
      await fetchMyTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  };

  // Handle task update from modal
  const handleTaskUpdated = async () => {
    await fetchMyTasks();
    setEditingTask(null);
    setEditTaskMembers([]);
  };

  // Navigate to task's project when card is clicked
  const handleTaskClick = (task: ExtendedTask) => {
    if (task.projectId) {
      navigate(`/projects/${task.projectId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary mb-1">My Tasks</h1>
        <p className="text-text-secondary">All tasks assigned to you across projects</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1">
          <button
            onClick={() => setFilter('all')}
            className={clsx(
              'px-4 py-2 rounded text-sm transition-colors',
              filter === 'all'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            All <span className="ml-1 text-xs opacity-70">({myTasks.length})</span>
          </button>
          <button
            onClick={() => setFilter('todo')}
            className={clsx(
              'px-4 py-2 rounded text-sm transition-colors',
              filter === 'todo'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            To Do <span className="ml-1 text-xs opacity-70">({todoTasks.length})</span>
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={clsx(
              'px-4 py-2 rounded text-sm transition-colors',
              filter === 'in_progress'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            In Progress <span className="ml-1 text-xs opacity-70">({inProgressTasks.length})</span>
          </button>
          <button
            onClick={() => setFilter('done')}
            className={clsx(
              'px-4 py-2 rounded text-sm transition-colors',
              filter === 'done'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            Done <span className="ml-1 text-xs opacity-70">({doneTasks.length})</span>
          </button>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-surface border border-border rounded-lg">
          <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mb-4">
            <Filter size={32} className="text-text-tertiary" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {filter === 'all' ? 'No tasks assigned' : `No ${filter.replace('-', ' ')} tasks`}
          </h3>
          <p className="text-text-secondary">
            {filter === 'all' 
              ? 'Tasks assigned to you will appear here'
              : 'Try selecting a different filter'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task)}
              className="cursor-pointer"
            >
              <div className="relative">
                {/* Project Badge */}
                {task.projectName && (
                  <div className="absolute -top-2 left-4 z-10">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent text-white text-xs rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      {task.projectName}
                    </span>
                  </div>
                )}
                
                {/* Task Card */}
                <div onClick={(e) => e.stopPropagation()}>
                  <TaskCard
                    task={task}
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          isOpen={!!editingTask}
          onClose={() => {
            setEditingTask(null);
            setEditTaskMembers([]);
          }}
          task={editingTask}
          members={editTaskMembers}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
}