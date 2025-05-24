import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const StudentProfile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    year: ''
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        year: user.year || ''
      });
      setLoading(false);
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
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const result = await updateProfile(formData);
      if (result.success) {
        setSuccess('Profile updated successfully!');
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getMessageStyle = (type) => {
    switch (type) {
      case 'error':
        return 'bg-[var(--color-error-50)] border border-[var(--color-error-200)] text-[var(--color-error-700)]';
      case 'success':
        return 'bg-[var(--color-success-50)] border border-[var(--color-success-200)] text-[var(--color-success-700)]';
      default:
        return 'bg-[var(--color-gray-50)] border border-[var(--color-gray-200)] text-[var(--color-gray-700)]';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary-500)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-heading font-bold text-[var(--color-primary-900)]">
          Profile Settings
        </h1>
        <p className="mt-1 text-[var(--color-primary-600)]">
          Update your profile information
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className={`px-4 py-3 rounded-md ${getMessageStyle('error')}`}>
          {error}
        </div>
      )}
      {success && (
        <div className={`px-4 py-3 rounded-md ${getMessageStyle('success')}`}>
          {success}
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student ID (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-primary-700)] mb-2">
              Student ID
            </label>
            <input
              type="text"
              value={user.id}
              disabled
              className="block w-full h-11 px-4 rounded-md bg-[var(--color-primary-50)] 
                border border-[var(--color-primary-200)] text-[var(--color-primary-500)]
                cursor-not-allowed"
            />
            <p className="mt-1 text-sm text-[var(--color-primary-500)]">
              Student ID cannot be changed
            </p>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--color-primary-700)] mb-2">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
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
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
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
              Program
            </label>
            <input
              id="department"
              name="department"
              type="text"
              required
              value={formData.department}
              onChange={handleChange}
              className="block w-full h-11 px-4 rounded-md border-[var(--color-primary-200)] 
                shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
                text-[var(--color-primary-900)] placeholder-[var(--color-primary-400)]
                transition-colors"
              placeholder="Enter your program"
            />
          </div>

          {/* Year */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-[var(--color-primary-700)] mb-2">
              Year
            </label>
            <input
              id="year"
              name="year"
              type="text"
              required
              value={formData.year}
              onChange={handleChange}
              className="block w-full h-11 px-4 rounded-md border-[var(--color-primary-200)] 
                shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
                text-[var(--color-primary-900)] placeholder-[var(--color-primary-400)]
                transition-colors"
              placeholder="Enter your year"
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={saving}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                shadow-sm text-sm font-medium text-white bg-[var(--color-primary-500)] 
                hover:bg-[var(--color-primary-600)] focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-[var(--color-primary-500)] 
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
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

export default StudentProfile; 