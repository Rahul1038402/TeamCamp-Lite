import { useState, useEffect } from 'react';
import KanbanBoard from '../tasks/KanbanBoard';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from '../tasks/EditTaskModal';
import { tasksAPI } from '../../services/api';
import type { Task, Project } from '../../types';

interface TasksTabProps {
  projectId: number;
  project: Project;
  onTasksUpdate: () => void;
}

export default function TasksTab({ projectId, project, onTasksUpdate }: TasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await tasksAPI.getByProject(projectId);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleCreateTask = () => {
    setShowCreateModal(true);
  };

  const handleTaskCreated = () => {
    fetchTasks();
    onTasksUpdate();
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await tasksAPI.delete(taskId);
      fetchTasks();
      onTasksUpdate();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleTaskUpdated = () => {
    fetchTasks();
    onTasksUpdate();
    setEditingTask(null);
  };

  const handleStatusChange = async (taskId: number, newStatus: 'todo' | 'in_progress' | 'done') => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      fetchTasks();
      onTasksUpdate();
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-surface border border-border rounded-lg border-dashed">
        <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">No tasks yet</h3>
        <p className="text-text-secondary mb-4">Get started by creating your first task</p>
        <button
          onClick={handleCreateTask}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Create First Task
        </button>

        <CreateTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          projectId={projectId}
          members={project.members || []}
          onTaskCreated={handleTaskCreated}
        />
      </div>
    );
  }

  return (
    <div className="h-full">
      <KanbanBoard
        tasks={tasks}
        onCreateTask={handleCreateTask}
        onDeleteTask={handleDeleteTask}
        onEditTask={handleEditTask}
        onStatusChange={handleStatusChange}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        projectId={projectId}
        members={project.members || []}
        onTaskCreated={handleTaskCreated}
      />

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          task={editingTask}
          members={project.members || []}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
}