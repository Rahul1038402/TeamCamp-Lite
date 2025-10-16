import { useState, useEffect } from 'react';
import { TrendingUp, Users, CheckCircle2, Clock, AlertCircle, FileText, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { tasksAPI, membersAPI, filesAPI } from '../../services/api';

interface StatisticsTabProps {
  projectId: number;
  project: any;
}

export default function StatisticsTab({ projectId, project }: StatisticsTabProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [tasksRes, membersRes, filesRes] = await Promise.all([
          tasksAPI.getByProject(projectId),
          membersAPI.getByProject(projectId),
          filesAPI.getByProject(projectId)
        ]);
        
        setTasks(tasksRes.data || []);
        setMembers(membersRes.data || []);
        setFiles(filesRes.data || []);
      } catch (error) {
        console.error('Error fetching statistics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate statistics
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Priority breakdown
  const highPriority = tasks.filter(t => t.priority === 'high').length;
  const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
  const lowPriority = tasks.filter(t => t.priority === 'low').length;

  // Overdue tasks
  const now = new Date();
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'done').length;

  // Filter out owners from members
  const invitedMembers = members.filter(m => m.role !== 'owner');

  // Member task assignment
  const memberTaskCount = invitedMembers.map(member => ({
    name: member.user?.full_name || member.user?.email?.split('@')[0] || 'Unknown',
    tasks: tasks.filter(t => t.assigned_to === member.user_id).length,
    completed: tasks.filter(t => t.assigned_to === member.user_id && t.status === 'done').length
  })).filter(m => m.tasks > 0);

  // File statistics
  const totalFileSize = files.reduce((sum, file) => sum + (file.file_size || 0), 0);
  const fileSizeMB = (totalFileSize / (1024 * 1024)).toFixed(2);

  // Task status data for pie chart
  const statusData = [
    { name: 'To Do', value: todoTasks, color: '#6B7280' },
    { name: 'In Progress', value: inProgressTasks, color: '#3B82F6' },
    { name: 'Done', value: doneTasks, color: '#10B981' }
  ].filter(item => item.value > 0);

  // Priority data for pie chart
  const priorityData = [
    { name: 'High', value: highPriority, color: '#EF4444' },
    { name: 'Medium', value: mediumPriority, color: '#F59E0B' },
    { name: 'Low', value: lowPriority, color: '#10B981' }
  ].filter(item => item.value > 0);

  // Task creation timeline (last 7 days)
  const today = new Date();
  const dailyTasks = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const tasksOnDay = tasks.filter(t => {
      const taskDate = new Date(t.created_at).toISOString().split('T')[0];
      return taskDate === dateStr;
    }).length;
    
    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    dailyTasks.push({
      date: monthDay,
      tasks: tasksOnDay
    });
  }

  // Project duration calculation
  let projectDuration = 'Not set';
  let daysRemaining = null;
  
  if (project.start_date && project.end_date) {
    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    daysRemaining = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    projectDuration = `${totalDays} days`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">Project Statistics</h2>
        <p className="text-text-secondary">Insights and analytics for {project.name}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={20} className="text-blue-500" />
            </div>
            <span className="text-2xl font-bold text-text-primary">{completionRate}%</span>
          </div>
          <h3 className="text-sm font-medium text-text-secondary">Completion Rate</h3>
          <p className="text-xs text-text-tertiary mt-1">{doneTasks} of {totalTasks} tasks done</p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <span className="text-2xl font-bold text-text-primary">{inProgressTasks}</span>
          </div>
          <h3 className="text-sm font-medium text-text-secondary">Active Tasks</h3>
          <p className="text-xs text-text-tertiary mt-1">Currently in progress</p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} className="text-red-500" />
            </div>
            <span className="text-2xl font-bold text-text-primary">{overdueTasks}</span>
          </div>
          <h3 className="text-sm font-medium text-text-secondary">Overdue Tasks</h3>
          <p className="text-xs text-text-tertiary mt-1">Needs attention</p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-purple-500" />
            </div>
            <span className="text-2xl font-bold text-text-primary">{invitedMembers.length}</span>
          </div>
          <h3 className="text-sm font-medium text-text-secondary">Team Members</h3>
          <p className="text-xs text-text-tertiary mt-1">Active contributors</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Task Status Distribution</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#2c5282', border: '1px solid #374151', borderRadius: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-text-tertiary">
              No tasks to display
            </div>
          )}
        </div>

        {/* Priority Distribution */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Priority Distribution</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#2c5282', border: '1px solid #374151', borderRadius: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-text-tertiary">
              No priority data available
            </div>
          )}
        </div>
      </div>

      {/* Task Creation Timeline */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Task Creation (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyTasks}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" allowDecimals={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#F9FAFB' }}
            />
            <Legend />
            <Line type="monotone" dataKey="tasks" stroke="#3B82F6" strokeWidth={2} name="Tasks Created" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Member Performance */}
      {memberTaskCount.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Team Member Tasks</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memberTaskCount}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F9FAFB' }}
              />
              <Legend />
              <Bar dataKey="tasks" fill="#3B82F6" name="Total Tasks" />
              <Bar dataKey="completed" fill="#10B981" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Additional Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText size={18} className="text-primary" />
            <h4 className="font-medium text-text-primary">Files</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Total Files:</span>
              <span className="text-text-primary font-medium">{files.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Storage Used:</span>
              <span className="text-text-primary font-medium">{fileSizeMB} MB</span>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Calendar size={18} className="text-primary" />
            <h4 className="font-medium text-text-primary">Timeline</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Duration:</span>
              <span className="text-text-primary font-medium">{projectDuration}</span>
            </div>
            {daysRemaining !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Days Remaining:</span>
                <span className={`font-medium ${daysRemaining < 0 ? 'text-red-400' : 'text-text-primary'}`}>
                  {daysRemaining < 0 ? `Overdue by ${Math.abs(daysRemaining)}` : daysRemaining}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Clock size={18} className="text-primary" />
            <h4 className="font-medium text-text-primary">Status Breakdown</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">To Do:</span>
              <span className="text-text-primary font-medium">{todoTasks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">In Progress:</span>
              <span className="text-text-primary font-medium">{inProgressTasks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Done:</span>
              <span className="text-text-primary font-medium">{doneTasks}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}