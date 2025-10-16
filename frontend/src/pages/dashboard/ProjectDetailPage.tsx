import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useProjects } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';
import ProjectSidebar from '../../components/projects/ProjectSidebar';
import TasksTab from '../../components/tasks/TasksTab';
import AddMemberModal from '../../components/team/AddMembersModal';
import EditMemberModal from '../../components/team/EditMemberModal';
import MemberCard from '../../components/team/MemberCard';
import FilesTab from '../../components/files/FilesTab';
import StatisticsTab from '../../components/stats/StatisticsTab';
import { membersAPI, tasksAPI, filesAPI } from '../../services/api';
import { Users, FileText, LayoutGrid, Plus, UserPlus, ListTodo, BarChart3 } from 'lucide-react';

type TabType = 'overview' | 'tasks' | 'members' | 'files' | 'statistics';

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { projects, loading, fetchProjects } = useProjects();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<any>(null);

    // Separate state for each resource
    const [members, setMembers] = useState<any[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [tasksCount, setTasksCount] = useState(0);
    const [filesCount, setFilesCount] = useState(0);
    const [membersCount, setMembersCount] = useState(0);

    // Statistics data state
    const [statsData, setStatsData] = useState({
        tasks: [] as any[],
        members: [] as any[],
        files: [] as any[]
    });

    const projectId = id ? Number(id) : null;
    const project = projects.find(p => p.id === projectId);

    // Check if user is creator (owner) OR has admin/owner role in members
    const isCreator = project?.created_by === user?.id;
    const currentMember = members.find((m: any) => m.user_id === user?.id);
    const memberRole = currentMember?.role;

    // User has admin rights if they're creator OR have admin/owner role
    const isAdmin = isCreator || memberRole === 'admin' || memberRole === 'owner';

    // Don't show any owners in member list - show only invited members
    const invitedMembers = members.filter((m: any) => m.role !== 'owner');

    useEffect(() => {
        if (!loading && !project && projectId) {
            navigate('/dashboard');
        }
    }, [project, loading, navigate, projectId]);

    // Fetch all counts on mount
    useEffect(() => {
        if (projectId) {
            fetchAllCounts();
        }
    }, [projectId]);

    // Fetch members when members tab is active
    useEffect(() => {
        if (projectId && activeTab === 'members') {
            fetchMembers();
        }
    }, [projectId, activeTab]);

    // Fetch statistics data when statistics tab is active
    useEffect(() => {
        if (projectId && activeTab === 'statistics') {
            fetchStatsData();
        }
    }, [projectId, activeTab]);

    const fetchAllCounts = async () => {
        if (!projectId) return;

        try {
            const [tasksRes, filesRes, membersRes] = await Promise.all([
                tasksAPI.getByProject(projectId).catch(() => ({ data: [] })),
                filesAPI.getByProject(projectId).catch(() => ({ data: [] })),
                membersAPI.getByProject(projectId).catch(() => ({ data: [] }))
            ]);

            setTasksCount(tasksRes.data?.length || 0);
            setFilesCount(filesRes.data?.length || 0);

            // Filter out owners for count
            const invitedCount = (membersRes.data || []).filter((m: any) => m.role !== 'owner').length;
            setMembersCount(invitedCount);
        } catch (error) {
            console.error('Error fetching counts:', error);
        }
    };

    const fetchMembers = async () => {
        if (!projectId) return;

        setLoadingMembers(true);
        try {
            const response = await membersAPI.getByProject(projectId);
            setMembers(response.data || []);

            // Update count
            const invitedCount = (response.data || []).filter((m: any) => m.role !== 'owner').length;
            setMembersCount(invitedCount);
        } catch (error) {
            console.error('Error fetching members:', error);
            setMembers([]);
        } finally {
            setLoadingMembers(false);
        }
    };

    const fetchStatsData = async () => {
        if (!projectId) return;

        try {
            const [tasksRes, membersRes, filesRes] = await Promise.all([
                tasksAPI.getByProject(projectId).catch(() => ({ data: [] })),
                membersAPI.getByProject(projectId).catch(() => ({ data: [] })),
                filesAPI.getByProject(projectId).catch(() => ({ data: [] }))
            ]);

            setStatsData({
                tasks: tasksRes.data || [],
                members: membersRes.data || [],
                files: filesRes.data || []
            });
        } catch (error) {
            console.error('Error fetching stats data:', error);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!projectId) return;

        try {
            await membersAPI.remove(projectId, userId);
            await fetchMembers();
            if (fetchProjects) {
                fetchProjects();
            }
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
        if (fetchProjects) {
            fetchProjects();
        }
    };

    const handleMemberUpdated = () => {
        fetchMembers();
        setShowEditModal(false);
        setSelectedMember(null);
        if (fetchProjects) {
            fetchProjects();
        }
    };

    // Update counts when resources change
    const handleTasksUpdate = async () => {
        if (!projectId) return;
        try {
            const response = await tasksAPI.getByProject(projectId);
            setTasksCount(response.data?.length || 0);
        } catch (error) {
            console.error('Error updating tasks count:', error);
        }
        if (fetchProjects) {
            fetchProjects();
        }
    };

    const handleFilesUpdate = async () => {
        if (!projectId) return;
        try {
            const response = await filesAPI.getByProject(projectId);
            setFilesCount(response.data?.length || 0);
        } catch (error) {
            console.error('Error updating files count:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!project) {
        return null;
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutGrid },
        { id: 'tasks', label: 'Tasks', icon: ListTodo, badge: tasksCount },
        { id: 'members', label: 'Team', icon: Users, badge: membersCount },
        { id: 'files', label: 'Files', icon: FileText, badge: filesCount },
        { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    ];

    return (
        <div className="flex h-full">
            {/* Project Sidebar */}
            <ProjectSidebar project={project} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-border bg-surface px-6 flex items-center gap-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={clsx(
                                    'px-4 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
                                    activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-text-secondary hover:text-text-primary'
                                )}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                                {tab.badge !== undefined && tab.badge > 0 && (
                                    <span className="ml-1 px-2 py-0.5 bg-background-secondary rounded-full text-xs">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'overview' && (
                        <div>
                            <h2 className="text-2xl font-semibold text-text-primary mb-4">Project Overview</h2>
                            {project.description ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <div className="text-text-secondary">
                                        <ReactMarkdown
                                            components={{
                                                // Custom styling for markdown elements
                                                h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-text-primary mb-4" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-text-primary mb-3" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-text-primary mb-2" {...props} />,
                                                p: ({ node, ...props }) => <p className="text-text-secondary mb-4 leading-relaxed" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2 text-text-secondary" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-text-secondary" {...props} />,
                                                li: ({ node, ...props }) => <li className="text-text-secondary" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-semibold text-text-primary" {...props} />,
                                                em: ({ node, ...props }) => <em className="italic text-text-secondary" {...props} />,
                                                code: ({ node, ...props }) => <code className="bg-background-secondary px-2 py-1 rounded text-primary text-sm" {...props} />,
                                                pre: ({ node, ...props }) => <pre className="bg-background-secondary p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                                                a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} />,
                                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary pl-4 italic text-text-secondary mb-4" {...props} />,
                                            }}
                                        >
                                            {project.description}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-text-tertiary italic">No description provided</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'tasks' && projectId && (
                        <TasksTab
                            projectId={projectId}
                            project={project}
                            onTasksUpdate={handleTasksUpdate}
                        />
                    )}

                    {activeTab === 'members' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-semibold text-text-primary mb-1">Team Members</h2>
                                    <p className="text-sm text-text-secondary">
                                        {membersCount === 0
                                            ? 'No team members invited yet'
                                            : `${membersCount} team ${membersCount === 1 ? 'member' : 'members'}`}
                                    </p>
                                </div>
                                {isAdmin && (
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        <Plus size={18} />
                                        Add Member
                                    </button>
                                )}
                            </div>

                            {loadingMembers ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : invitedMembers.length > 0 ? (
                                <div className="grid gap-4">
                                    {invitedMembers.map((member: any) => (
                                        <MemberCard
                                            key={member.user_id}
                                            member={member}
                                            currentUserId={user?.id || ''}
                                            onRemove={isAdmin ? handleRemoveMember : undefined}
                                            onEdit={isCreator ? handleEditMember : undefined}
                                            isOwner={isAdmin}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-surface border border-border rounded-lg p-12 text-center">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <UserPlus size={32} className="text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                                        No team members yet
                                    </h3>
                                    <p className="text-text-secondary mb-6 max-w-md mx-auto">
                                        Invite team members to collaborate on this project. They'll be able to view and contribute based on their role.
                                    </p>
                                    {isAdmin && (
                                        <button
                                            onClick={() => setShowInviteModal(true)}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                            <Plus size={20} />
                                            Add First Member
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'files' && projectId && (
                        <FilesTab
                            projectId={projectId}
                            canUpload={isAdmin}
                            onFilesUpdate={handleFilesUpdate}
                        />
                    )}

                    {activeTab === 'statistics' && projectId && (
                        <StatisticsTab
                            projectId={projectId}
                            project={project}
                        />
                    )}
                </div>
            </div>

            {/* Modals */}
            {projectId && (
                <>
                    <AddMemberModal
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