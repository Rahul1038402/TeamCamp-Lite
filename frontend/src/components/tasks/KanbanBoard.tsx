import { useState } from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import type { Task } from '../../types';
import clsx from 'clsx';

interface KanbanBoardProps {
  tasks: Task[];
  onCreateTask: () => void;
  onDeleteTask: (taskId: number) => Promise<void>;
  onEditTask: (task: Task) => void;
  onStatusChange: (taskId: number, newStatus: 'todo' | 'in_progress' | 'done') => Promise<void>;
}

type TaskStatus = 'todo' | 'in_progress' | 'done';

interface Column {
  id: TaskStatus;
  title: string;
  color: string;
}

export default function KanbanBoard({
  tasks,
  onCreateTask,
  onDeleteTask,
  onEditTask,
  onStatusChange,
}: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const columns: Column[] = [
    { id: 'todo', title: 'To Do', color: 'border-gray-500' },
    { id: 'in_progress', title: 'In Progress', color: 'border-primary' },
    { id: 'done', title: 'Done', color: 'border-accent' },
  ];

  const getColumnTasks = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedTask && draggedTask.status !== newStatus) {
      try {
        await onStatusChange(Number(draggedTask.id), newStatus);
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  return (
    <div className="h-full overflow-x-auto">
      <div className="flex gap-4 min-w-max pb-4">
        {columns.map((column) => {
          const columnTasks = getColumnTasks(column.id);
          const isOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              className="flex-1 min-w-[320px] max-w-[400px]"
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className={clsx(
                'flex items-center justify-between p-4 bg-surface border-b-4 rounded-t-lg mb-4',
                column.color
              )}>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-text-primary">{column.title}</h3>
                  <span className="px-2 py-0.5 bg-background-secondary rounded-full text-xs text-text-secondary">
                    {columnTasks.length}
                  </span>
                </div>

                  <button
                    onClick={onCreateTask}
                    className="p-1 hover:bg-background-secondary rounded transition-colors"
                    title="Add Task"
                  >
                    <Plus size={18} className="text-text-secondary hover:text-text-primary" />
                    </button>
              </div>

              {/* Tasks Container */}
              <div className={clsx(
                'space-y-3 min-h-[200px] p-2 rounded-lg transition-colors',
                isOver && 'bg-primary/10 border-2 border-dashed border-primary'
              )}>
                {columnTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-text-tertiary text-sm">
                    {isOver ? 'Drop task here' : 'No tasks'}
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onDragEnd={handleDragEnd}
                      className={clsx(
                        'transition-opacity',
                        draggedTask?.id === task.id && 'opacity-50'
                      )}
                    >
                      <TaskCard
                        task={task}
                        onDelete={onDeleteTask}
                        onEdit={onEditTask}
                        onStatusChange={onStatusChange}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}