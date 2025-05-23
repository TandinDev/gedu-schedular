import { Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // If there's no user, we shouldn't render the layout
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-primary-50)]">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo/Home */}
              <button
                onClick={() => navigate(`/${user.role}`)}
                className="flex items-center px-4 text-[var(--color-primary-900)] font-heading font-bold"
              >
                GCBS Appointment
              </button>

              {/* Navigation Links */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => navigate(`/${user.role}/profile`)}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-[var(--color-primary-700)] hover:text-[var(--color-primary-900)]"
                >
                  Profile
                </button>
                {user.role === 'lecturer' && (
                  <button
                    onClick={() => navigate('/lecturer/timetable')}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-[var(--color-primary-700)] hover:text-[var(--color-primary-900)]"
                  >
                    Timetable
                  </button>
                )}
                {user.role === 'student' && (
                  <button
                    onClick={() => navigate('/student/appointments')}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-[var(--color-primary-700)] hover:text-[var(--color-primary-900)]"
                  >
                    My Appointments
                  </button>
                )}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-[var(--color-primary-700)]">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)]"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 