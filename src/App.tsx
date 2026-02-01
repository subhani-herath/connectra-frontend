import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { StudentDashboard } from './features/student/StudentDashboard';
import { AttendanceHistoryPage } from './features/student/AttendanceHistoryPage';
import { LecturerDashboard } from './features/lecturer/LecturerDashboard';
import { CreateMeetingPage } from './features/lecturer/CreateMeetingPage';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { MeetingRoom } from './features/meeting/MeetingRoom';
import { DashboardLayout } from './components/layout';
import { useAuthStore } from './stores/authStore';

// Protected Route Wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center p-10">
        <div className="bg-background-card p-8 rounded-2xl text-center max-w-md border border-white/5">
          <div className="text-6xl mb-4">⛔</div>
          <h1 className="text-2xl font-bold text-status-error mb-2">Access Denied</h1>
          <p className="text-text-secondary">
            You are logged in as <span className="text-primary font-semibold">{user.role}</span>.
            <br />
            This page requires: {allowedRoles.join(', ')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A2E',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#22C55E',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Student Routes with Layout */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/meetings" element={<StudentDashboard />} />
          <Route path="/student/attendance" element={<AttendanceHistoryPage />} />
        </Route>

        {/* Student Meeting Room (full screen, no sidebar) */}
        <Route
          path="/student/meeting/:meetingId"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <MeetingRoom />
            </ProtectedRoute>
          }
        />

        {/* Lecturer Routes with Layout */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['LECTURER']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
          <Route path="/lecturer/create-meeting" element={<CreateMeetingPage />} />
        </Route>

        {/* Lecturer Meeting Room (full screen, no sidebar) */}
        <Route
          path="/lecturer/meeting/:meetingId"
          element={
            <ProtectedRoute allowedRoles={['LECTURER']}>
              <MeetingRoom />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes with Layout */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/lecturers" element={<AdminDashboard />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
