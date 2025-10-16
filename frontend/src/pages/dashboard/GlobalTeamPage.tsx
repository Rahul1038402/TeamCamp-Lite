import { useState } from 'react';
import { Users, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../contexts/ProjectContext';
import { Link } from 'react-router-dom';

export default function GlobalTeamPage() {
  const { user } = useAuth();
  const { projects } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');

  // Get all unique team members across all projects
  const allMembers = projects.reduce((acc: any[], project) => {
    project.members?.forEach((member: any) => {
      const existing = acc.find(m => m.user_id === member.user_id);
      if (!existing) {
        acc.push({
          ...member,
          projects: [{ id: project.id, name: project.name, role: member.role }]
        });
      } else {
        existing.projects.push({ id: project.id, name: project.name, role: member.role });
      }
    });
    return acc;
  }, []);

  const filteredMembers = searchQuery
    ? allMembers.filter((m: any) => 
        m.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allMembers;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-surface px-6 py-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary mb-2">Team Directory</h1>
            <p className="text-text-secondary">
              Manage team members across all projects
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background-secondary border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-border bg-surface px-6 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-text-secondary" />
            <div>
              <div className="text-2xl font-bold text-text-primary">{allMembers.length}</div>
              <div className="text-xs text-text-secondary">Total Members</div>
            </div>
          </div>

          <div className="h-10 w-px bg-border" />

          <div className="flex items-center gap-2">
            <div>
              <div className="text-2xl font-bold text-text-primary">{projects.length}</div>
              <div className="text-xs text-text-secondary">Active Projects</div>
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredMembers.length > 0 ? (
          <div className="grid gap-4 max-w-4xl">
            {filteredMembers.map((member: any) => (
              <div key={member.user_id} className="bg-surface border border-border rounded-lg p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-medium text-lg">
                      {member.user?.email?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="text-text-primary font-medium">
                        {member.user?.email || 'Unknown'}
                      </div>
                      <div className="text-sm text-text-secondary">
                        Member of {member.projects.length} project{member.projects.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {member.user_id === user?.id && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                      You
                    </span>
                  )}
                </div>

                {/* Projects */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-xs font-medium text-text-secondary mb-2">Projects</div>
                  <div className="flex flex-wrap gap-2">
                    {member.projects.map((project: any) => (
                      <Link
                        key={project.id}
                        to={`/projects/${project.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-background-secondary border border-border rounded-lg text-sm text-text-primary hover:bg-surface transition-colors"
                      >
                        <span>{project.name}</span>
                        <span className="px-2 py-0.5 bg-surface rounded text-xs text-text-secondary capitalize">
                          {project.role}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-lg p-12 text-center max-w-2xl mx-auto">
            <Users size={48} className="mx-auto mb-4 text-text-tertiary" />
            <div className="text-text-primary font-medium mb-2">
              {searchQuery ? 'No members found' : 'No team members yet'}
            </div>
            <div className="text-sm text-text-secondary mb-6">
              {searchQuery 
                ? 'Try adjusting your search query'
                : 'Invite members to your projects to see them here'}
            </div>
            {!searchQuery && (
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                View Projects
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
