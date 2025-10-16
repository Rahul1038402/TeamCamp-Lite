import { useState } from 'react';
import type { FormEvent } from 'react';
import { X, UserPlus, Mail } from 'lucide-react';
import Modal from '../common/Modal';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  onMemberAdded: () => void;
}

export default function InviteMemberModal({ 
  isOpen, 
  onClose, 
  projectId,
  onMemberAdded 
}: InviteMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member'>('member');

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    setSearching(true);
    setError('');
    setFoundUser(null);

    try {
      // Import at component level to avoid circular deps
      const { default: api } = await import('../../services/api');
      
      // Search for user by email - you'll need to add this endpoint
      const response = await api.get(`/users/search?email=${encodeURIComponent(searchEmail)}`);
      
      if (response.data) {
        setFoundUser(response.data);
      } else {
        setError('User not found. They need to sign up first.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to search user');
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!foundUser) {
      setError('Please search for a user first');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Import at component level to avoid circular deps
      const { membersAPI } = await import('../../services/api');
      
      await membersAPI.add(projectId, {
        user_id: foundUser.id,
        role: selectedRole,
      });

      setSuccess('Member invited successfully!');
      setSearchEmail('');
      setFoundUser(null);
      setSelectedRole('member');
      
      // Wait a bit to show success message
      setTimeout(() => {
        onMemberAdded();
        handleClose();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSearchEmail('');
      setFoundUser(null);
      setSelectedRole('member');
      setError('');
      setSuccess('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Team Member">
      <div className="bg-surface rounded-lg p-6 w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">Invite Team Member</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Search Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Search by Email
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                  placeholder="user@example.com"
                  className="w-full pl-10 pr-4 py-2 bg-background-secondary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading || searching}
                />
              </div>
              <button
                onClick={handleSearchUser}
                disabled={loading || searching}
                className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-text-primary hover:bg-surface transition-colors disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Found User Display */}
          {foundUser && (
            <div className="bg-background-secondary border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                  {foundUser.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-text-primary font-medium">{foundUser.email}</div>
                  {foundUser.full_name && (
                    <div className="text-sm text-text-secondary">{foundUser.full_name}</div>
                  )}
                </div>
                <UserPlus className="text-accent" size={20} />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="mt-2 text-xs text-text-tertiary">
                  {selectedRole === 'admin' 
                    ? 'Admins can manage project settings, members, and all content.'
                    : 'Members can view and contribute to project tasks and files.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 mt-6 border-t border-border">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-background-secondary border border-border rounded-lg text-text-primary hover:bg-surface transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleInvite}
            disabled={loading || !foundUser}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Inviting...' : 'Invite Member'}
          </button>
        </div>
      </div>
    </Modal>
  );
}