// User Types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  provider?: string;
}

// Project Types
export interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on-hold';
  start_date?: string;
  end_date?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  tasks?: Task[];
  members?: ProjectMember[];
  files?: FileRecord[];
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// Task Types - FIXED: Changed 'in_progress' to 'in_progress'
export interface Task {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';  // Changed from 'in_progress'
  assigned_to?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  created_by: string;
  created_at: string;
  updated_at?: string;
  project?: {
    id: number;
    name: string;
  };
  assignee?: User;
}

// File Types
export interface FileRecord {
  id: number;
  project_id: number;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  uploaded_at: string;
  uploader?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Form Types - FIXED: Changed 'in_progress' to 'in_progress'
export interface ProjectFormData {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: 'active' | 'completed' | 'on-hold';
}

export interface TaskFormData {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';  // Changed from 'in_progress'
  assigned_to?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface TeamMember {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  tasks: Task[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: number) => Promise<void>;
  fetchTasks: (projectId: number) => Promise<void>;
  createProject: (data: ProjectFormData) => Promise<Project>;
  updateProject: (id: number, data: Partial<ProjectFormData>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  createTask: (projectId: number, data: TaskFormData) => Promise<Task>;
  updateTask: (id: number, data: Partial<TaskFormData>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}