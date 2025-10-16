import { useState } from 'react';
import { X, Shield, User } from 'lucide-react';
import Modal from '../common/Modal';
import clsx from 'clsx';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
  projectId: number;
  onMemberUpdated: () => void;
}

export default function EditMemberModal({
  isOpen,
  onClose,
  member,
  projectId,
  onMemberUpdated
}: EditMemberModalProps) {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member'>(member?.role || 'member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    {
      value: 'admin',
      label: 'Admin',
      icon: Shield,
      color: 'blue',
      description: 'Can manage members, tasks, and project settings'
    },
    {
      value: 'member',
      label: 'Member',
      icon: User,
      color: 'gray',
      description: 'Can view and contribute to tasks'
    }
  ];

  const handleSubmit = async () => {
    if (!member || selectedRole === member.role) {
      onClose();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { membersAPI } = await import('../../services/api');
      
      await membersAPI.update(projectId, member.user_id, {
        role: selectedRole
      });

      onMemberUpdated();
      onClose();
    } catch (err: any) {
      console.error('Update member error:', err);
      setError(err.response?.data?.error || 'Failed to update member role');
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;

  const displayEmail = member.user?.email || member.email || 'Unknown User';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Member Role">
      <div className="space-y-6">
        {/* Member Info */}
        <div className="flex items-center gap-3 p-4 bg-background-secondary rounded-lg border border-border">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-medium text-lg">
            {displayEmail.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-text-primary font-medium">{displayEmail}</div>
            <div className="text-sm text-text-secondary">
              Current role: <span className="capitalize font-medium">{member.role}</span>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-text-primary">
            Select New Role
          </label>
          
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.value;
            
            return (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value as any)}
                className={clsx(
                  'w-full p-4 rounded-lg border-2 transition-all text-left',
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-surface hover:border-border'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={clsx(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    isSelected ? 'bg-primary/20' : 'bg-background-secondary'
                  )}>
                    <Icon
                      size={20}
                      className={isSelected ? 'text-primary' : 'text-text-secondary'}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={clsx(
                        'font-medium',
                        isSelected ? 'text-text-primary' : 'text-text-secondary'
                      )}>
                        {role.label}
                      </span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className={clsx(
                      'text-sm',
                      isSelected ? 'text-text-secondary' : 'text-text-tertiary'
                    )}>
                      {role.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-text-primary hover:bg-surface transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedRole === member.role}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Role'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
