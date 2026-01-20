import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OrganizationProvider } from './context/OrganizationContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SemedDashboard from './pages/SemedDashboard'; // [NEW]
import MemoriesPage from './pages/MemoriesPage';
import AgentMarketplace from './pages/AgentMarketplace';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import EducatorArea from './pages/EducatorArea';
import AnalyticsPage from './pages/AnalyticsPage';
import KidsPage from './pages/KidsPage';
import StudioPage from './pages/StudioPage';
import AdminDashboard from './pages/AdminDashboard';
import OrgManagement from './pages/OrgManagement';
import RoleManagement from './pages/RoleManagement';
import OrgList from './pages/admin/OrgList';
import AiSettings from './pages/admin/AiSettings';
import AuditLogs from './pages/admin/AuditLogs';
import EventCalendar from './pages/events/EventCalendar';
import FinancialReports from './pages/admin/FinancialReports';
import SocialDashboard from './pages/social/SocialDashboard';
import SystemSettings from './pages/SystemSettings';
import Units from './pages/admin/Units';
import MemoryModeration from './pages/admin/MemoryModeration';
import Home from './pages/Home';
import PublicVitrine from './pages/PublicVitrine';

function App() {
  return (
    <OrganizationProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/public/vitrine/:slug?" element={<PublicVitrine />} />

            <Route element={<MainLayout />}>
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              {/* [NEW] Dashboard SEMED (Gestão) */}
              <Route
                path="dashboard/semed"
                element={
                  <ProtectedRoute>
                    <SemedDashboard />
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
                path="agents"
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
              <Route
                path="admin/super"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/team"
                element={
                  <ProtectedRoute>
                    <OrgManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/roles"
                element={
                  <ProtectedRoute>
                    <RoleManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/org"
                element={
                  <ProtectedRoute>
                    <OrgList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/ai"
                element={
                  <ProtectedRoute>
                    <AiSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/finance"
                element={
                  <ProtectedRoute>
                    <FinancialReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/audit"
                element={
                  <ProtectedRoute>
                    <AuditLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/system"
                element={
                  <ProtectedRoute>
                    <SystemSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/units"
                element={
                  <ProtectedRoute>
                    <Units />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/moderation"
                element={
                  <ProtectedRoute>
                    <MemoryModeration />
                  </ProtectedRoute>
                }
              />

              <Route
                path="events"
                element={
                  <ProtectedRoute>
                    <EventCalendar />
                  </ProtectedRoute>
                }
              />

              <Route
                path="social"
                element={
                  <ProtectedRoute>
                    <SocialDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider >
    </OrganizationProvider >
  );
}

export default App;
