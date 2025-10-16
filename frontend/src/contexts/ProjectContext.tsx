import { createContext, useContext, useState} from 'react';
import type { ReactNode } from 'react';
import type { Project, Task } from '../types';
import { projectsAPI, tasksAPI } from '../services/api';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  tasks: Task[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: number) => Promise<void>;
  fetchTasks: (projectId: number) => Promise<void>;
  createProject: (data: any) => Promise<Project>;
  updateProject: (id: number, data: any) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  createTask: (projectId: number, data: any) => Promise<Task>;
  updateTask: (id: number, data: any) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async (id: number) => {
    setLoading(true);
    try {
      const response = await projectsAPI.getById(id);
      setCurrentProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId: number) => {
    setLoading(true);
    try {
      const response = await tasksAPI.getByProject(projectId);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (data: any) => {
    const response = await projectsAPI.create(data);
    await fetchProjects();
    return response.data;
  };

  const updateProject = async (id: number, data: any) => {
    await projectsAPI.update(id, data);
    await fetchProjects();
    if (currentProject?.id === id) {
      await fetchProject(id);
    }
  };

  const deleteProject = async (id: number) => {
    await projectsAPI.delete(id);
    await fetchProjects();
    if (currentProject?.id === id) {
      setCurrentProject(null);
    }
  };

  const createTask = async (projectId: number, data: any) => {
    const response = await tasksAPI.create(projectId, data);
    await fetchTasks(projectId);
    return response.data;
  };

  const updateTask = async (id: number, data: any) => {
    await tasksAPI.update(id, data);
    if (currentProject) {
      await fetchTasks(currentProject.id);
    }
  };

  const deleteTask = async (id: number) => {
    await tasksAPI.delete(id);
    if (currentProject) {
      await fetchTasks(currentProject.id);
    }
  };

  const value = {
    projects,
    currentProject,
    tasks,
    loading,
    searchQuery,
    setSearchQuery,
    fetchProjects,
    fetchProject,
    fetchTasks,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}