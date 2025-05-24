import { Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HomeIcon, CalendarIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../../assets/image/logo.png';

const Layout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location]);

  // If there's no user, we shouldn't render the layout
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: user?.role === 'student' ? '/student' : '/lecturer',
      icon: HomeIcon,
    },
    ...(user?.role === 'lecturer' ? [
      {
        name: 'Timetable',
        href: '/lecturer/timetable',
        icon: CalendarIcon,
      },
      {
        name: 'Profile',
        href: '/lecturer/profile',
        icon: UserIcon,
      },
    ] : [
      {
        name: 'Profile',
        href: '/student/profile',
        icon: UserIcon,
      },
    ]),
  ];

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary-50)]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo and Toggle Button */}
          <div className="flex items-center justify-between h-auto min-h-[4rem] px-4 py-3 border-b border-[var(--color-primary-200)]">
            <div className="flex flex-row gap-4 items-center">
              <img 
                src={logo} 
                alt="GEDU Scheduler Logo" 
                className="h-14 w-auto"
              />
              <p className="text-xs text-[var(--color-primary-600)] font-medium leading-tight">
                GEDU College of Business Studies
              </p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-md text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] md:hidden self-start"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  location.pathname === item.href
                    ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-900)]'
                    : 'text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-900)]'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-[var(--color-primary-200)]">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary-500)] flex items-center justify-center text-white">
                  {user?.name?.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-[var(--color-primary-900)]">
                  {user?.name}
                </p>
                <p className="text-xs text-[var(--color-primary-500)]">
                  {user?.role === 'lecturer' ? 'Lecturer' : 'Student'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[var(--color-primary-700)] bg-[var(--color-primary-50)] hover:bg-[var(--color-primary-100)]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-200 ease-in-out ${
        isSidebarOpen ? 'md:pl-64' : 'pl-0'
      }`}>
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-[var(--color-primary-200)] md:hidden">
          <div className="flex items-center justify-between h-auto min-h-[4rem] px-4 py-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] self-start"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center">
              <img 
                src={logo} 
                alt="GEDU Scheduler Logo" 
                className="h-14 w-auto mb-1"
              />
              <p className="text-xs text-[var(--color-primary-600)] font-medium leading-tight text-center">
                GEDU College of Business Studies
              </p>
            </div>
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>
        </div>

        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 