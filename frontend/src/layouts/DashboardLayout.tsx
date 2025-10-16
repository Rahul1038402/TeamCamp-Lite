import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectContext';
import { LogOut, Bell, Search, Code2, X } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const { setSearchQuery } = useProjects();
  const location = useLocation();
  const [localSearch, setLocalSearch] = useState('');

  // Check if we're on a project detail page
  const isProjectDetailPage = location.pathname.startsWith('/projects/') && 
                               location.pathname.split('/').length >= 3;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    setSearchQuery('');
  };

  return (
    <div className="flex h-screen bg-background-primary">
      {/* Top Header - Always visible */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Code2 className="text-white" size={24} />
              </div>
              <span className="text-text-primary font-semibold">TeamCamp Lite</span>
            </div>

            {/* Search - Only on dashboard */}
            {!isProjectDetailPage && (
              <div className="relative ml-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={localSearch}
                  onChange={handleSearchChange}
                  className="w-96 pl-10 pr-10 py-2 bg-background-secondary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {localSearch && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="text-right mr-2">
                <div className="text-sm font-medium text-text-primary">
                  {user?.email}
                </div>
                <div className="text-xs text-text-secondary">Admin</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <button
                onClick={handleSignOut}
                className="text-text-secondary hover:text-text-primary transition-colors"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}