import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password, role);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-primary-50)] p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-heading font-bold text-[var(--color-primary-900)]">
            GCBS Appointment System
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--color-primary-600)]">
            Sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Role Selection */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
                  ${role === 'student'
                    ? 'bg-[var(--color-primary-500)] text-white'
                    : 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] hover:bg-[var(--color-primary-200)]'
                  }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('lecturer')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
                  ${role === 'lecturer'
                    ? 'bg-[var(--color-primary-500)] text-white'
                    : 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] hover:bg-[var(--color-primary-200)]'
                  }`}
              >
                Lecturer
              </button>
            </div>

            {/* Username/ID Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[var(--color-primary-900)]">
                {role === 'student' ? 'Student Number' : 'Lecturer Name'}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border-[var(--color-primary-200)] 
                  shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
                placeholder={role === 'student' ? 'Enter student number' : 'Enter lecturer name'}
              />
            </div>

            {/* Password/CID Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-primary-900)]">
                CID Number
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-[var(--color-primary-200)] 
                  shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
                placeholder="Enter your CID number"
              />
            </div>
          </div>

          {error && (
            <div className="text-[var(--color-error-500)] text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
              shadow-sm text-sm font-medium text-white bg-[var(--color-primary-500)] 
              hover:bg-[var(--color-primary-600)] focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-[var(--color-primary-500)] 
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 