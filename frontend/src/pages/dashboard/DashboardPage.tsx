import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Grid3x3, List, TrendingUp, Users, CheckCircle2, Clock } from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContext';
import ProjectCard from '../../components/projects/ProjectCard';
import clsx from 'clsx';

export default function DashboardPage() {
    const navigate = useNavigate();
    const { projects, loading, fetchProjects, searchQuery } = useProjects();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'on-hold'>('all');

    useEffect(() => {
        fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filter projects by status and search query
    const filteredProjects = projects.filter(project => {
        // Status filter
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        
        // Search filter
        const matchesSearch = !searchQuery || 
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesStatus && matchesSearch;
    });

    // Calculate stats
    const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        onHold: projects.filter(p => p.status === 'on-hold').length,
        totalTasks: projects.reduce((sum, p) => sum + (p.tasks?.length || 0), 0),
        completedTasks: projects.reduce((sum, p) =>
            sum + (p.tasks?.filter(t => t.status === 'done').length || 0), 0
        ),
        totalMembers: new Set(projects.flatMap(p =>
            p.members?.map(m => m.user_id) || []
        )).size,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-[1600px] mx-auto p-8">
                {/* Hero Section */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary mb-2">
                                Welcome back! 👋
                            </h1>
                            <p className="text-text-secondary text-lg">
                                You have {stats.active} active projects
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/projects/new')}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Plus size={18} />
                            New Project
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp size={24} className="text-blue-400" />
                                </div>
                                <span className="text-xs font-medium text-blue-400 bg-blue-500/20 px-2 py-1 rounded">
                                    Total
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-text-primary mb-1">{stats.total}</div>
                            <div className="text-sm text-text-secondary">Projects</div>
                        </div>

                        <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                                    <Clock size={24} className="text-accent" />
                                </div>
                                <span className="text-xs font-medium text-accent bg-accent/20 px-2 py-1 rounded">
                                    Active
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-text-primary mb-1">{stats.active}</div>
                            <div className="text-sm text-text-secondary">In Progress</div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <CheckCircle2 size={24} className="text-green-400" />
                                </div>
                                <span className="text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded">
                                    Done
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-text-primary mb-1">{stats.completed}</div>
                            <div className="text-sm text-text-secondary">Completed</div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <Users size={24} className="text-purple-400" />
                                </div>
                                <span className="text-xs font-medium text-purple-400 bg-purple-500/20 px-2 py-1 rounded">
                                    Team
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-text-primary mb-1">{stats.totalMembers}</div>
                            <div className="text-sm text-text-secondary">Team Members</div>
                        </div>
                    </div>
                </div>

                {/* Search Results Info */}
                {searchQuery && (
                    <div className="mb-4 text-sm text-text-secondary">
                        Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} matching "{searchQuery}"
                    </div>
                )}

                {/* Filters and View Controls */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-text-secondary mr-2">Filter:</span>
                        {(['all', 'active', 'completed', 'on-hold'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={clsx(
                                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                                    statusFilter === status
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'bg-surface text-text-secondary hover:text-text-primary border border-border'
                                )}
                            >
                                {status === 'on-hold' ? 'On Hold' : status}
                                {status !== 'all' && (
                                    <span className={clsx(
                                        'ml-2 px-2 py-0.5 rounded-full text-xs',
                                        statusFilter === status
                                            ? 'bg-white/20'
                                            : 'bg-background-secondary'
                                    )}>
                                        {status === 'active' ? stats.active :
                                            status === 'completed' ? stats.completed : stats.onHold}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={clsx(
                                'p-2 rounded transition-colors',
                                viewMode === 'grid'
                                    ? 'bg-primary text-white'
                                    : 'text-text-secondary hover:text-text-primary'
                            )}
                            title="Grid View"
                        >
                            <Grid3x3 size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={clsx(
                                'p-2 rounded transition-colors',
                                viewMode === 'list'
                                    ? 'bg-primary text-white'
                                    : 'text-text-secondary hover:text-text-primary'
                            )}
                            title="List View"
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                {/* Projects Grid/List */}
                {filteredProjects.length > 0 ? (
                    <div className={clsx(
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
                            : 'space-y-4'
                    )}>
                        {filteredProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-surface rounded-2xl flex items-center justify-center mb-6 border border-border">
                            <Plus size={40} className="text-text-tertiary" />
                        </div>
                        <h3 className="text-2xl font-semibold text-text-primary mb-2">
                            {searchQuery 
                                ? 'No projects found' 
                                : statusFilter !== 'all' 
                                    ? `No ${statusFilter} projects` 
                                    : 'No projects yet'}
                        </h3>
                        <p className="text-text-secondary mb-8 max-w-md">
                            {searchQuery
                                ? `No projects match your search "${searchQuery}"`
                                : statusFilter !== 'all'
                                    ? `You don't have any ${statusFilter} projects at the moment`
                                    : 'Get started by creating your first project and organizing your work'}
                        </p>
                        {statusFilter === 'all' && !searchQuery && (
                            <button
                                onClick={() => navigate('/projects/new')}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <Plus size={18} />
                                Create Your First Project
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}