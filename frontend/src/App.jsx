import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load pages for performance
const Login              = lazy(() => import('./pages/Login'));

// Citizen
const CitizenDashboard   = lazy(() => import('./pages/CitizenDashboard'));
const CitizenTimeline    = lazy(() => import('./pages/CitizenTimeline'));
const CitizenAISummary   = lazy(() => import('./pages/CitizenAISummary'));
const CitizenQR          = lazy(() => import('./pages/CitizenQR'));
const CitizenNotifications = lazy(() => import('./pages/CitizenNotifications'));
const CitizenProfile     = lazy(() => import('./pages/CitizenProfile'));
const ReportDetail       = lazy(() => import('./pages/ReportDetail'));

// Doctor
const DoctorDashboard    = lazy(() => import('./pages/DoctorDashboard'));
const DoctorQRScan       = lazy(() => import('./pages/DoctorQRScan'));
const DoctorEmergency    = lazy(() => import('./pages/DoctorEmergency'));
const DoctorPatientSummary = lazy(() => import('./pages/DoctorPatientSummary'));
const DoctorAuditLog     = lazy(() => import('./pages/DoctorAuditLog'));

// Diagnostic Center
const DiagnosticDashboard = lazy(() => import('./pages/DiagnosticDashboard'));
const DiagnosticUpload   = lazy(() => import('./pages/DiagnosticUpload'));
const DiagnosticHistory  = lazy(() => import('./pages/DiagnosticHistory'));
const DiagnosticAuditLog = lazy(() => import('./pages/DiagnosticAuditLog'));

// Admin
const AdminDashboard     = lazy(() => import('./pages/AdminDashboard'));
const AdminManageCitizens = lazy(() => import('./pages/AdminManageCitizens'));
const AdminManageDoctors = lazy(() => import('./pages/AdminManageDoctors'));
const AdminManageHospitals = lazy(() => import('./pages/AdminManageHospitals'));
const AdminAuditLog      = lazy(() => import('./pages/AdminAuditLog'));
const AdminReports       = lazy(() => import('./pages/AdminReports'));

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-govbg">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-navy-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-navy-800 font-medium">Loading MedTrace AI...</p>
    </div>
  </div>
);

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Role-based home redirect
function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const roleRoutes = {
    citizen: '/citizen-dashboard',
    doctor: '/doctor-dashboard',
    diagnostic: '/diagnostic-dashboard',
    admin: '/admin-dashboard',
  };
  return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<HomeRedirect />} />

          {/* Requested Redirects */}
          <Route path="/citizen-dashboard" element={<Navigate to="/citizen" replace />} />
          <Route path="/doctor-dashboard" element={<Navigate to="/doctor" replace />} />
          <Route path="/diagnostic-dashboard" element={<Navigate to="/diagnostic" replace />} />
          <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />

          {/* Citizen Routes */}
          <Route path="/citizen" element={<ProtectedRoute allowedRoles={['citizen']}><CitizenDashboard /></ProtectedRoute>} />
          <Route path="/citizen/timeline" element={<ProtectedRoute allowedRoles={['citizen']}><CitizenTimeline /></ProtectedRoute>} />
          <Route path="/citizen/ai-summary" element={<ProtectedRoute allowedRoles={['citizen']}><CitizenAISummary /></ProtectedRoute>} />
          <Route path="/citizen/qr" element={<ProtectedRoute allowedRoles={['citizen']}><CitizenQR /></ProtectedRoute>} />
          <Route path="/citizen/notifications" element={<ProtectedRoute allowedRoles={['citizen']}><CitizenNotifications /></ProtectedRoute>} />
          <Route path="/citizen/profile" element={<ProtectedRoute allowedRoles={['citizen']}><CitizenProfile /></ProtectedRoute>} />
          <Route path="/citizen/report/:id" element={<ProtectedRoute allowedRoles={['citizen', 'doctor', 'admin']}><ReportDetail /></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/qr-scan" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorQRScan /></ProtectedRoute>} />
          <Route path="/doctor/emergency" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorEmergency /></ProtectedRoute>} />
          <Route path="/doctor/patient/:id" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPatientSummary /></ProtectedRoute>} />
          <Route path="/doctor/audit-log" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAuditLog /></ProtectedRoute>} />

          {/* Diagnostic Center Routes */}
          <Route path="/diagnostic" element={<ProtectedRoute allowedRoles={['diagnostic']}><DiagnosticDashboard /></ProtectedRoute>} />
          <Route path="/diagnostic/upload" element={<ProtectedRoute allowedRoles={['diagnostic']}><DiagnosticUpload /></ProtectedRoute>} />
          <Route path="/diagnostic/history" element={<ProtectedRoute allowedRoles={['diagnostic']}><DiagnosticHistory /></ProtectedRoute>} />
          <Route path="/diagnostic/audit-log" element={<ProtectedRoute allowedRoles={['diagnostic']}><DiagnosticAuditLog /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/citizens" element={<ProtectedRoute allowedRoles={['admin']}><AdminManageCitizens /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['admin']}><AdminManageDoctors /></ProtectedRoute>} />
          <Route path="/admin/hospitals" element={<ProtectedRoute allowedRoles={['admin']}><AdminManageHospitals /></ProtectedRoute>} />
          <Route path="/admin/audit-log" element={<ProtectedRoute allowedRoles={['admin']}><AdminAuditLog /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />

          {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
