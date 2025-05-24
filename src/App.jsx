import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './pages/auth/Login';
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import LecturerDashboard from './pages/lecturer/Dashboard';
import Timetable from './pages/lecturer/Timetable';
import Profile from './pages/lecturer/Profile';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route element={<Layout />}>
            <Route 
              path="/student" 
              element={<PrivateRoute role="student" />}
            >
              <Route index element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>
            <Route 
              path="/lecturer" 
              element={<PrivateRoute role="lecturer" />}
            >
              <Route index element={<LecturerDashboard />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
