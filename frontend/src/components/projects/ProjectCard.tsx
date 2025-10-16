import { Link } from 'react-router-dom';
import { Calendar, Users, CheckCircle2, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useProjects } from '../../contexts/ProjectContext';
import { tasksAPI, membersAPI } from '../../services/api';
import clsx from 'clsx';

interface ProjectCardProps {
  project: any;
  viewMode: 'grid' | 'list';
}

export default function ProjectCard({ project, viewMode }: ProjectCardProps) {
  const { deleteProject } = useProjects();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      try {
        const [tasksRes, membersRes] = await Promise.all([
          tasksAPI.getByProject(project.id).catch(() => ({ data: [] })),
          membersAPI.getByProject(project.id).catch(() => ({ data: [] }))
        ]);

        setTasks(tasksRes.data || []);
        setMembers(membersRes.data || []);
      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [project.id]);

  // Calculate project progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === 'done').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-accent text-white';
      case 'completed':
        return 'bg-blue-500 text-white';
      case 'on-hold':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await deleteProject(project.id);
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete project');
      } finally {
        setIsDeleting(false);
        setShowMenu(false);
      }
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-surface border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-4">
          {/* Project Color Indicator */}
          <div className="w-1 h-16 bg-accent rounded-full" />
          
          {/* Project Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <Link
                  to={`/projects/${project.id}`}
                  className="text-lg font-medium text-text-primary hover:text-primary transition-colors"
                >
                  {project.name}
                </Link>
                <p className="text-sm text-text-secondary line-clamp-1 mt-1">
                  {project.description || 'No description'}
                </p>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <MoreVertical size={18} />
                </button>
                
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg z-20 py-1">
                      <Link
                        to={`/projects/${project.id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary"
                      >
                        <Edit2 size={16} />
                        Edit Project
                      </Link>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-background-secondary"
                      >
                        <Trash2 size={16} />
                        {isDeleting ? 'Deleting...' : 'Delete Project'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Due {project.end_date ? format(new Date(project.end_date), 'MMM d, yyyy') : 'No date'}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{loading ? '...' : members.length} members</span>
              </div>
              
              <div className="flex items-center gap-1">
                <CheckCircle2 size={14} />
                <span>{loading ? '...' : `${completedTasks}/${totalTasks}`} tasks</span>
              </div>
              
              <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', getStatusColor(project.status))}>
                {project.status}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-32">
            <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
              <span>Progress</span>
              <span className="font-medium">{loading ? '...' : `${progress}%`}</span>
            </div>
            <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="bg-surface border border-border rounded-lg p-5 hover:border-primary/50 transition-all hover:shadow-lg group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', getStatusColor(project.status))}>
              {project.status}
            </span>
          </div>
          
          <Link
            to={`/projects/${project.id}`}
            className="text-lg font-semibold text-text-primary hover:text-primary transition-colors block"
          >
            {project.name}
          </Link>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-text-secondary hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={18} />
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg z-20 py-1">
                <Link
                  to={`/projects/${project.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary"
                >
                  <Edit2 size={16} />
                  Edit Project
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-background-secondary"
                >
                  <Trash2 size={16} />
                  {isDeleting ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary line-clamp-2 mb-4 min-h-[40px]">
        {project.description || 'No description provided'}
      </p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
          <span>Progress</span>
          <span className="font-medium text-text-primary">{loading ? '...' : `${progress}%`}</span>
        </div>
        <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <div className="flex items-center gap-1" title="Tasks">
            <CheckCircle2 size={16} />
            <span>{loading ? '...' : `${completedTasks}/${totalTasks}`}</span>
          </div>
          
          <div className="flex items-center gap-1" title="Team Members">
            <Users size={16} />
            <span>{loading ? '...' : members.length}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <Calendar size={14} />
          <span>{project.end_date ? format(new Date(project.end_date), 'MMM d') : 'No date'}</span>
        </div>
      </div>

      {/* Members Avatars */}
      {!loading && members.length > 0 && (
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
          <div className="flex -space-x-2">
            {members.slice(0, 3).map((member: any, index: number) => (
              <div
                key={member.user_id || index}
                className="w-7 h-7 rounded-full bg-primary border-2 border-surface flex items-center justify-center text-white text-xs font-medium"
                title={member.user?.email}
              >
                {member.user?.email?.charAt(0).toUpperCase() || '?'}
              </div>
            ))}
            {members.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-background-secondary border-2 border-surface flex items-center justify-center text-text-secondary text-xs font-medium">
                +{members.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}