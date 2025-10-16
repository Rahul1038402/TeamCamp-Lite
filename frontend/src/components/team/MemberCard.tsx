import { MoreVertical, Trash2, Shield, User, Mail, Edit2 } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface MemberCardProps {
  member: any;
  currentUserId: string;
  onRemove?: (userId: string) => Promise<void>;
  onEdit?: (member: any) => void;  // Add this
  isOwner?: boolean;
}

export default function MemberCard({ 
  member, 
  currentUserId, 
  onRemove, 
  onEdit,  // Add this
  isOwner 
}: MemberCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const isCurrentUser = member.user_id === currentUserId;
  const canEdit = isOwner && onEdit && !isCurrentUser;
  const canRemove = isOwner && !isCurrentUser && onRemove;

  const displayEmail = member.user?.email || member.email || 'Unknown User';
  const displayName = member.user?.name || member.name || displayEmail;

  const handleRemove = async () => {
    if (window.confirm(`Are you sure you want to remove ${displayEmail} from this project?`)) {
      setIsRemoving(true);
      try {
        if (onRemove) {
          await onRemove(member.user_id);
        }
      } catch (error) {
        console.error('Remove error:', error);
        alert('Failed to remove member');
      } finally {
        setIsRemoving(false);
        setShowMenu(false);
      }
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(member);
      setShowMenu(false);
    }
  };

  const getRoleIcon = () => {
    switch (member.role) {
      case 'owner':
        return <Shield size={16} className="text-purple-400" />;
      case 'admin':
        return <Shield size={16} className="text-blue-400" />;
      default:
        return <User size={16} className="text-gray-400" />;
    }
  };

  const getRoleBadgeColor = () => {
    switch (member.role) {
      case 'owner':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'admin':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getInitial = () => {
    if (displayEmail && displayEmail !== 'Unknown User') {
      return displayEmail.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
            {getInitial()}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-text-primary font-medium truncate">
                {displayName}
              </div>
              {isCurrentUser && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded flex-shrink-0">
                  You
                </span>
              )}
            </div>
            
            {displayName !== displayEmail && (
              <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
                <Mail size={12} />
                <span className="truncate">{displayEmail}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {getRoleIcon()}
              <span className={clsx(
                'text-xs font-medium px-2 py-1 rounded border capitalize',
                getRoleBadgeColor()
              )}>
                {member.role}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        {(canEdit || canRemove) && (
          <div className="relative flex-shrink-0 ml-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              disabled={isRemoving}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-lg transition-colors disabled:opacity-50"
              title="Member actions"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg z-20 py-1">
                  {canEdit && (
                    <button
                      onClick={handleEdit}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-background-secondary transition-colors"
                    >
                      <Edit2 size={16} />
                      Change Role
                    </button>
                  )}
                  {canRemove && (
                    <button
                      onClick={handleRemove}
                      disabled={isRemoving}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-background-secondary transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {isRemoving ? 'Removing...' : 'Remove Member'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
