import { useState } from 'react';
import { X, User, Shield } from 'lucide-react';
import Modal from '../common/Modal';
import clsx from 'clsx';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  onMemberAdded: () => void;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  projectId,
  onMemberAdded
}: AddMemberModalProps) {
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    {
      value: 'admin',
      label: 'Admin',
      icon: Shield,
      description: 'Can manage members, tasks, and project settings'
    },
    {
      value: 'member',
      label: 'Member',
      icon: User,
      description: 'Can view and contribute to tasks'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memberName.trim()) {
      setError('Member name is required');
      return;
    }

    if (!memberEmail.trim()) {
      setError('Member email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(memberEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { membersAPI } = await import('../../services/api');
      
      // Add member directly to this project
      await membersAPI.add(projectId, {
        name: memberName.trim(),
        email: memberEmail.trim().toLowerCase(),
        role: selectedRole
      });

      // Reset form
      setMemberName('');
      setMemberEmail('');
      setSelectedRole('member');
      
      onMemberAdded();
    } catch (err: any) {
      console.error('Add member error:', err);
      setError(err.response?.data?.error || 'Failed to add member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMemberName('');
    setMemberEmail('');
    setSelectedRole('member');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Team Member">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Member Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Member Name *
          </label>
          <input
            type="text"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
        </div>

        {/* Member Email */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Select Role *
          </label>
          
          <div className="space-y-3">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.value;
              
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value as any)}
                  disabled={loading}
                  className={clsx(
                    'w-full p-4 rounded-lg border-2 transition-all text-left',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface hover:border-border hover:bg-background-secondary',
                    loading && 'opacity-50 cursor-not-allowed'
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
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Info Message */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-400">
            This member will be added to the current project only. They will not have access to other projects unless invited separately.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-text-primary hover:bg-surface transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !memberName.trim() || !memberEmail.trim()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
