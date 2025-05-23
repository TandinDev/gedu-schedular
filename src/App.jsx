import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './pages/auth/Login';
import StudentDashboard from './pages/student/Dashboard';
import LecturerDashboard from './pages/lecturer/Dashboard';
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
              path="/student/*" 
              element={
                <PrivateRoute role="student">
                  <StudentDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/lecturer/*" 
              element={
                <PrivateRoute role="lecturer">
                  <LecturerDashboard />
                </PrivateRoute>
              } 
            />
          </Route>

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
