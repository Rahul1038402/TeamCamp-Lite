import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../contexts/ProjectContext';
import { membersAPI } from '../../services/api';
import InviteMemberModal from '../../components/team/InviteMemberModal';
import EditMemberModal from '../../components/team/EditMemberModal';
import MemberCard from '../../components/team/MemberCard';
import clsx from 'clsx';

export default function TeamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'owner' | 'admin' | 'member'>('all');

  const projectId = id ? Number(id) : null;
  const project = projects.find(p => p.id === projectId);

  const currentMember = project?.members?.find((m: any) => m.user_id === user?.id);
  const isOwner = currentMember?.role === 'owner';
  const isAdmin = currentMember?.role === 'admin' || isOwner;

  useEffect(() => {
    if (!projectsLoading && !project && projectId) {
      navigate('/projects');
    }
  }, [project, projectsLoading, navigate, projectId]);

  useEffect(() => {
    if (projectId) {
      fetchMembers();
    }
  }, [projectId]);

  const fetchMembers = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const response = await membersAPI.getByProject(projectId);
      setMembers(response.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!projectId) return;

    try {
      await membersAPI.remove(projectId, userId);
      await fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  };

  const handleEditMember = (member: any) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleMemberAdded = () => {
    fetchMembers();
    setShowInviteModal(false);
  };

  const handleMemberUpdated = () => {
    fetchMembers();
    setShowEditModal(false);
    setSelectedMember(null);
  };

  if (projectsLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const filteredMembers = filter === 'all' 
    ? members 
    : members.filter(m => m.role === filter);

  const roleCounts = {
    owner: members.filter(m => m.role === 'owner').length,
    admin: members.filter(m => m.role === 'admin').length,
    member: members.filter(m => m.role === 'member').length,
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="px-6 py-4">
          <Link
            to={`/projects/${projectId}`}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Project</span>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">Team Management</h1>
              <p className="text-text-secondary">{project.name}</p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus size={18} />
                Invite Member
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="border-b border-border bg-surface px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Stats Cards */}
          <div className="flex items-center gap-4">
            <div className="bg-background-secondary rounded-lg px-4 py-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-text-secondary" />
                <span className="text-xs text-text-secondary">Total Members</span>
              </div>
              <div className="text-2xl font-bold text-text-primary">{members.length}</div>
            </div>

            <div className="bg-purple-500/10 rounded-lg px-4 py-3 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={16} className="text-purple-400" />
                <span className="text-xs text-purple-400">Owners</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">{roleCounts.owner}</div>
            </div>

            <div className="bg-blue-500/10 rounded-lg px-4 py-3 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={16} className="text-blue-400" />
                <span className="text-xs text-blue-400">Admins</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">{roleCounts.admin}</div>
            </div>

            <div className="bg-gray-500/10 rounded-lg px-4 py-3 border border-gray-500/30">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-gray-400" />
                <span className="text-xs text-gray-400">Members</span>
              </div>
              <div className="text-2xl font-bold text-gray-400">{roleCounts.member}</div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            {['all', 'owner', 'admin', 'member'].map((filterValue) => (
              <button
                key={filterValue}
                onClick={() => setFilter(filterValue as any)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                  filter === filterValue
                    ? 'bg-primary text-white'
                    : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                )}
              >
                {filterValue}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredMembers.length > 0 ? (
          <div className="grid gap-4 max-w-4xl">
            {filteredMembers.map((member: any) => (
              <MemberCard
                key={member.user_id}
                member={member}
                currentUserId={user?.id || ''}
                onRemove={isAdmin ? handleRemoveMember : undefined}
                onEdit={isOwner ? handleEditMember : undefined}
                isOwner={isOwner}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-lg p-12 text-center max-w-2xl mx-auto">
            <Users size={48} className="mx-auto mb-4 text-text-tertiary" />
            <div className="text-text-primary font-medium mb-2">
              {filter === 'all' ? 'No team members yet' : `No ${filter}s found`}
            </div>
            <div className="text-sm text-text-secondary mb-6">
              {filter === 'all' 
                ? 'Invite team members to collaborate on this project'
                : `There are no members with the ${filter} role`}
            </div>
            {isAdmin && filter === 'all' && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Invite First Member
              </button>
            )}
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-text-primary hover:bg-surface transition-colors"
              >
                View All Members
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {projectId && (
        <>
          <InviteMemberModal
            isOpen={showInviteModal}
            onClose={() => setShowInviteModal(false)}
            projectId={projectId}
            onMemberAdded={handleMemberAdded}
          />

          <EditMemberModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedMember(null);
            }}
            member={selectedMember}
            projectId={projectId}
            onMemberUpdated={handleMemberUpdated}
          />
        </>
      )}
    </div>
  );
}
