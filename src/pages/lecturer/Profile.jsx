import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setSuccess('Profile updated successfully');
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-heading font-bold text-[var(--color-primary-900)]">
          Profile Management
        </h1>
        <p className="mt-1 text-[var(--color-primary-600)]">
          Update your profile information
        </p>
      </div>

      {error && (
        <div className="bg-[var(--color-error-50)] border border-[var(--color-error-200)] text-[var(--color-error-700)] px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[var(--color-success-50)] border border-[var(--color-success-200)] text-[var(--color-success-700)] px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--color-primary-700)] mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="block w-full h-11 px-4 rounded-md border-[var(--color-primary-200)] 
                shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
                text-[var(--color-primary-900)] placeholder-[var(--color-primary-400)]
                transition-colors"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--color-primary-700)] mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="block w-full h-11 px-4 rounded-md border-[var(--color-primary-200)] 
                shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
                text-[var(--color-primary-900)] placeholder-[var(--color-primary-400)]
                transition-colors"
              placeholder="Enter your email address"
            />
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-[var(--color-primary-700)] mb-2">
              Department
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="block w-full h-11 px-4 rounded-md border-[var(--color-primary-200)] 
                shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
                text-[var(--color-primary-900)] placeholder-[var(--color-primary-400)]
                transition-colors"
              placeholder="Enter your department"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white 
                bg-[var(--color-primary-500)] rounded-md 
                hover:bg-[var(--color-primary-600)]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile; 