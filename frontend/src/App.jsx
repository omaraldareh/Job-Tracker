import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedLayout from './components/layout/ProtectedLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import JobsPage from './pages/JobsPage';
import AddJobPage from './pages/AddJobPage';
import EditJobPage from './pages/EditJobPage';
import JobDetailPage from './pages/JobDetailPage';   // Feature 1
import AnalyticsPage from './pages/AnalyticsPage';   // Feature 2

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter
         future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
  }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes (All wrapped inside ProtectedLayout) */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard"         element={<DashboardPage />} />
            <Route path="/jobs"              element={<JobsPage />} />
            <Route path="/jobs/new"          element={<AddJobPage />} />
            <Route path="/jobs/:id"          element={<JobDetailPage />} />   {/* Feature 1 */}
            <Route path="/jobs/:id/edit"     element={<EditJobPage />} />
            <Route path="/analytics"         element={<AnalyticsPage />} />  {/* Feature 2 */}
          </Route>

          {/* Fallbacks */}
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}