import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OrganizationProvider } from './context/OrganizationContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MemoriesPage from './pages/MemoriesPage';
import AgentMarketplace from './pages/AgentMarketplace';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import EducatorArea from './pages/EducatorArea';
import AnalyticsPage from './pages/AnalyticsPage';
import KidsPage from './pages/KidsPage';
import StudioPage from './pages/StudioPage';

function App() {
  return (
    <OrganizationProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<div className="text-gray-600">Bem-vindo ao Memória Cultural Viva!</div>} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="memories"
                element={
                  <ProtectedRoute>
                    <MemoriesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="marketplace"
                element={
                  <ProtectedRoute>
                    <AgentMarketplace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="educator"
                element={
                  <ProtectedRoute>
                    <EducatorArea />
                  </ProtectedRoute>
                }
              />
              <Route
                path="analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="kids"
                element={
                  <ProtectedRoute>
                    <KidsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="studio"
                element={
                  <ProtectedRoute>
                    <StudioPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </OrganizationProvider>
  );
}

export default App;
