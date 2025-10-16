import { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import MemberCard from './MemberCard';
import InviteMemberModal from './InviteMemberModal';
import { membersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { ProjectMember } from '../../types';

interface MemberListProps {
  projectId: number;
  isOwner: boolean;
}

export default function MemberList({ projectId, isOwner }: MemberListProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchMembers = async () => {
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

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const handleRemoveMember = async (userId: string) => {
    try {
      await membersAPI.remove(projectId, userId);
      await fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  };

  const handleMemberAdded = () => {
    fetchMembers();
    setShowInviteModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="text-text-secondary" size={20} />
          <h3 className="text-lg font-medium text-text-primary">Team Members</h3>
          <span className="px-2 py-0.5 bg-background-secondary rounded-full text-xs text-text-secondary">
            {members.length}
          </span>
        </div>
        {isOwner && (
          <button 
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            Invite Member
          </button>
        )}
      </div>

      {/* Members Grid */}
      {members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <MemberCard
              key={member.user_id}
              member={member}
              currentUserId={user?.id || ''}
              onRemove={isOwner ? handleRemoveMember : undefined}
              isOwner={isOwner}
            />
          ))}
        </div>
      ) : (
        <div className="bg-surface border border-border border-dashed rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-text-tertiary" size={32} />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No team members yet</h3>
          <p className="text-text-secondary mb-4">
            Invite team members to collaborate on this project
          </p>
          {isOwner && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Invite First Member
            </button>
          )}
        </div>
      )}

      {/* Invite Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        projectId={projectId}
        onMemberAdded={handleMemberAdded}
      />
    </div>
  );
}