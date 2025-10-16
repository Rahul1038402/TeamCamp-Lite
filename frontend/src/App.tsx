import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectDetailPage from './pages/dashboard/ProjectDetailPage';
import MyTasksPage from './pages/dashboard/MyTasksPage';
import GlobalTeamPage from './pages/dashboard/GlobalTeamPage';
import EditProjectPage from './components/projects/EditProject';
import CreateProjectPage from './components/projects/CreateProject';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Protected Routes - All use DashboardLayout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard */}
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Projects */}
              <Route path="projects/new" element={<CreateProjectPage />} />
              <Route path="projects/:id" element={<ProjectDetailPage />} />
              <Route path="projects/:id/edit" element={<EditProjectPage />} />

              {/* My Tasks */}
              <Route path="my-tasks" element={<MyTasksPage />} />
              
              {/* Team */}
              <Route path="team" element={<GlobalTeamPage />} />
            
              {/* Files
              <Route path="files" element={<FilesPage />} />*/}
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;