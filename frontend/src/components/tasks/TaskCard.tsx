import { Calendar, User, MoreVertical, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import clsx from 'clsx';
import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onDelete?: (taskId: number) => void;
  onEdit?: (task: Task) => void;
  onStatusChange?: (taskId: number, newStatus: 'todo' | 'in_progress' | 'done') => void;
}

export default function TaskCard({ task, onDelete, onEdit }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      try {
        if (onDelete) {
          await onDelete(Number(task.id));
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete task');
      } finally {
        setIsDeleting(false);
        setShowMenu(false);
      }
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <div className="bg-surface border border-border rounded-lg p-4 hover:border-primary/50 transition-all cursor-move group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-text-primary font-medium flex-1 pr-2">{task.title}</h3>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-text-secondary hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={16} />
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-2 w-40 bg-surface border border-border rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={() => {
                    if (onEdit) onEdit(task);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary"
                >
                  <Edit2 size={14} />
                  Edit Task
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-background-secondary"
                >
                  <Trash2 size={14} />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-text-secondary line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Priority Badge */}
      {task.priority && (
        <div className="mb-3">
          <span className={clsx(
            'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border',
            getPriorityColor(task.priority)
          )}>
            <AlertCircle size={12} />
            {task.priority.toUpperCase()}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-text-secondary pt-3 border-t border-border">
        <div className="flex items-center gap-3">
          {/* Assigned User */}
          {task.assignee ? (
            <div className="flex items-center gap-1" title={task.assignee.email}>
              <User size={14} />
              <span className="truncate max-w-[80px]">{task.assignee.email?.split('@')[0]}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-text-tertiary">
              <User size={14} />
              <span>Unassigned</span>
            </div>
          )}

          {/* Due Date */}
          {task.due_date && (
            <div className={clsx(
              'flex items-center gap-1',
              isOverdue && 'text-red-400'
            )}>
              <Calendar size={14} />
              <span>{format(new Date(task.due_date), 'MMM d')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}