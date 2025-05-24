import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  ExclamationCircleIcon,
  CalendarIcon,
  ClockIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import logo from "../../assets/image/logo.png";
import background from "../../assets/image/background.jpeg";

const Login = () => {
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // For students, use their student ID as email
      const email = role === 'student' 
        ? `${username}@student.gedu.edu.bt`
        : username;

      await signIn(email, password);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Background Image - Always present but with different styles for mobile/desktop */}
      <div className="absolute inset-0 z-0">
        <img
          src={background}
          alt="GEDU College Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-600)]/95 to-[var(--color-primary-600)]/85 lg:from-[var(--color-primary-900)]/90 lg:to-[var(--color-primary-900)]/70" />
      </div>

      {/* Background Image Section - Desktop Only */}
      <div className="hidden lg:block lg:w-1/2 relative z-10">
        <div className="h-full flex flex-col justify-center px-12">
          <div className="max-w-md">
            <img 
              src={logo} 
              alt="GEDU Scheduler Logo" 
              className="h-30 w-auto mb-6"
            />
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to GEDU College
            </h1>
            <p className="text-lg text-white/90 mb-8">
              Access the appointment scheduling system to connect with lecturers and manage your academic meetings efficiently.
            </p>
            <div className="space-y-4">
              <div className="flex items-center text-white/90">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <span>Easy appointment scheduling</span>
              </div>
              <div className="flex items-center text-white/90">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                  <ClockIcon className="w-5 h-5" />
                </div>
                <span>Real-time availability updates</span>
              </div>
              <div className="flex items-center text-white/90">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                  <BookOpenIcon className="w-5 h-5" />
                </div>
                <span>Manage your time properly</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-md space-y-8 
          sm:bg-white/10 sm:backdrop-blur-[1px] lg:bg-white/95 lg:backdrop-blur-sm 
          sm:p-8 rounded-xl sm:shadow-lg lg:shadow-xl
          lg:border lg:border-white/20">
          <div className="text-center lg:text-left">
            <img 
              src={logo} 
              alt="GEDU Scheduler Logo" 
              className="h-32 w-auto mx-auto lg:mx-0 mb-4 drop-shadow-lg block lg:hidden"
            />
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white lg:text-[var(--color-primary-900)]">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/90 lg:text-[var(--color-primary-600)]">
              Access the appointment scheduling system
            </p>
          </div>

          <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-3 px-4 rounded-lg text-sm sm:text-base font-medium transition-all
                  ${role === 'student'
                    ? 'bg-[var(--color-primary-500)] text-white shadow-lg transform scale-[1.02] lg:bg-[var(--color-primary-500)]'
                    : 'bg-transparent border border-white text-white hover:bg-white/10 sm:bg-transparent sm:border-white sm:text-white sm:hover:bg-white/10 lg:bg-[var(--color-primary-100)] lg:border-transparent lg:text-[var(--color-primary-700)] lg:hover:bg-[var(--color-primary-200)]'
                  }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('lecturer')}
                className={`py-3 px-4 rounded-lg text-sm sm:text-base font-medium transition-all
                  ${role === 'lecturer'
                    ? 'bg-[var(--color-primary-500)] text-white shadow-lg transform scale-[1.02] lg:bg-[var(--color-primary-500)]'
                    : 'bg-transparent border border-white text-white hover:bg-white/10 sm:bg-transparent sm:border-white sm:text-white sm:hover:bg-white/10 lg:bg-[var(--color-primary-100)] lg:border-transparent lg:text-[var(--color-primary-700)] lg:hover:bg-[var(--color-primary-200)]'
                  }`}
              >
                Lecturer
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm sm:text-base font-medium text-white lg:text-[var(--color-primary-900)]">
                  {role === 'student' ? 'Student ID' : 'Email Address'}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full h-11 sm:h-12 px-4 rounded-lg 
                      bg-white border-[var(--color-primary-200)]
                      sm:bg-white sm:border-[var(--color-primary-200)]
                      lg:bg-white lg:border-[var(--color-primary-200)]
                      shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
                      sm:focus:border-[var(--color-primary-500)] sm:focus:ring-[var(--color-primary-500)]
                      lg:focus:border-[var(--color-primary-500)] lg:focus:ring-[var(--color-primary-500)]
                      text-[var(--color-primary-900)] placeholder-[var(--color-primary-400)]
                      sm:text-[var(--color-primary-900)] sm:placeholder-[var(--color-primary-400)]
                      lg:text-[var(--color-primary-900)] lg:placeholder-[var(--color-primary-400)]
                      text-sm sm:text-base transition-all"
                    placeholder={role === 'student' ? "Enter your student ID" : "Enter your email address"}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm sm:text-base font-medium text-white lg:text-[var(--color-primary-900)]">
                  CID Number
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full h-11 sm:h-12 px-4 rounded-lg 
                      bg-white border-[var(--color-primary-200)]
                      sm:bg-white sm:border-[var(--color-primary-200)]
                      lg:bg-white lg:border-[var(--color-primary-200)]
                      shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
                      sm:focus:border-[var(--color-primary-500)] sm:focus:ring-[var(--color-primary-500)]
                      lg:focus:border-[var(--color-primary-500)] lg:focus:ring-[var(--color-primary-500)]
                      text-[var(--color-primary-900)] placeholder-[var(--color-primary-400)]
                      sm:text-[var(--color-primary-900)] sm:placeholder-[var(--color-primary-400)]
                      lg:text-[var(--color-primary-900)] lg:placeholder-[var(--color-primary-400)]
                      text-sm sm:text-base transition-all"
                    placeholder="Enter your CID number"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-3 sm:p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm sm:text-base font-medium text-white">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg
                shadow-lg text-sm sm:text-base font-medium text-white 
                bg-white/20 hover:bg-white/30 backdrop-blur-sm
                lg:bg-[var(--color-primary-500)] lg:hover:bg-[var(--color-primary-600)]
                focus:outline-none focus:ring-2 focus:ring-white/40 
                lg:focus:ring-[var(--color-primary-500)]
                disabled:opacity-50 disabled:cursor-not-allowed transition-all
                hover:shadow-xl hover:transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-white/80 lg:text-[var(--color-primary-500)]">
              {role === 'student' 
                ? 'Use your Student ID and CID number to sign in'
                : 'Use your email address and CID number to sign in'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 