import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle2, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { membersAPI, tasksAPI, filesAPI } from '../../services/api';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';

interface ProjectSidebarProps {
  project: any;
}

export default function ProjectSidebar({ project }: ProjectSidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deleteProject } = useProjects();
  const [members, setMembers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user is creator
  const isCreator = project?.created_by === user?.id;
  const currentMember = members.find((m: any) => m.user_id === user?.id);
  const isAdmin = isCreator || currentMember?.role === 'admin' || currentMember?.role === 'owner';

  useEffect(() => {
    fetchSidebarData();
  }, [project.id]);

  const fetchSidebarData = async () => {
    setLoading(true);
    try {
      const [membersRes, tasksRes, filesRes] = await Promise.all([
        membersAPI.getByProject(project.id).catch(() => ({ data: [] })),
        tasksAPI.getByProject(project.id).catch(() => ({ data: [] })),
        filesAPI.getByProject(project.id).catch(() => ({ data: [] }))
      ]);

      // Filter out owners from members display
      const invitedMembers = (membersRes.data || []).filter((m: any) => m.role !== 'owner');
      
      setMembers(invitedMembers);
      setTasks(tasksRes.data || []);
      setFiles(filesRes.data || []);
    } catch (error) {
      console.error('Error fetching sidebar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await deleteProject(project.id);
        navigate('/dashboard');
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete project');
      } finally {
        setIsDeleting(false);
        setShowMenu(false);
      }
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === 'done').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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

  return (
    <div className="w-80 h-full bg-surface border-r border-border flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back to Projects</span>
        </button>

        {/* Project Title with Menu */}
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-xl font-semibold text-text-primary flex-1">{project.name}</h2>
          
          {/* Three Dot Menu */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-text-secondary hover:text-text-primary transition-colors rounded hover:bg-background-secondary"
              >
                <MoreVertical size={18} />
              </button>
              
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg z-20 py-1">
                    <Link
                      to={`/projects/${project.id}/edit`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary w-full"
                      onClick={() => setShowMenu(false)}
                    >
                      <Edit2 size={16} />
                      Edit Project
                    </Link>
                    {isCreator && (
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-background-secondary disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        {isDeleting ? 'Deleting...' : 'Delete Project'}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <span className={clsx('inline-block px-3 py-1 rounded-full text-xs font-medium', getStatusColor(project.status))}>
          {project.status}
        </span>
      </div>

      {/* Progress */}
      <div className="p-6 border-b border-border">
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-text-secondary">Progress</span>
            <span className="text-text-primary font-semibold">{progress}%</span>
          </div>
          <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-background-secondary rounded-lg p-3">
            <div className="text-lg font-bold text-text-primary">{completedTasks}</div>
            <div className="text-xs text-text-secondary">Completed</div>
          </div>
          <div className="bg-background-secondary rounded-lg p-3">
            <div className="text-lg font-bold text-text-primary">{totalTasks - completedTasks}</div>
            <div className="text-xs text-text-secondary">Remaining</div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">Team Members</span>
          </div>
          <span className="text-xs text-text-secondary">{members.length}</span>
        </div>

        {loading ? (
          <div className="text-xs text-text-tertiary text-center py-4">Loading...</div>
        ) : members.length > 0 ? (
          <>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {members.slice(0, 5).map((member: any) => (
                <div key={member.user_id} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {member.user?.email?.charAt(0).toUpperCase() || member.user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-text-primary truncate">
                      {member.user?.name || member.user?.email || 'Unknown'}
                    </div>
                    <div className="text-xs text-text-secondary capitalize">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>

            {members.length > 5 && (
              <div className="text-xs text-primary mt-2">
                +{members.length - 5} more members
              </div>
            )}
          </>
        ) : (
          <div className="text-xs text-text-tertiary text-center py-4">
            No team members yet
          </div>
        )}
      </div>

      {/* Recent Tasks */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">Recent Tasks</span>
          </div>
        </div>

        {loading ? (
          <div className="text-xs text-text-tertiary text-center py-4">Loading...</div>
        ) : tasks.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {tasks.slice(0, 5).map((task: any) => (
              <div key={task.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-background-secondary transition-colors cursor-pointer">
                <div className={clsx(
                  'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                  task.status === 'done' && 'bg-green-500',
                  task.status === 'in_progress' && 'bg-blue-500',
                  task.status === 'todo' && 'bg-gray-500'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-primary truncate">{task.title}</div>
                  <div className="text-xs text-text-secondary capitalize">{task.status.replace('_', ' ')}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-text-tertiary text-center py-4">
            No tasks yet
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="p-6 border-b border-border">
        <div className="space-y-3 text-sm">
          {project.start_date && (
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Start Date</span>
              <span className="text-text-primary">{format(new Date(project.start_date), 'MMM d, yyyy')}</span>
            </div>
          )}
          {project.end_date && (
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">End Date</span>
              <span className="text-text-primary">{format(new Date(project.end_date), 'MMM d, yyyy')}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Files</span>
            <span className="text-text-primary">{files.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
