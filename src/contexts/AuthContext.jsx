import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password, role) => {
    try {
      // TODO: Replace with actual API call
      // This is a mock login - replace with your actual authentication logic
      const mockUser = {
        id: username,
        name: role === 'student' ? `Student ${username}` : `Lecturer ${username}`,
        role,
        email: `${username}@rub.edu.bt`,
        cid: password, // In real app, this should be verified, not stored
        profilePicture: null,
        // Additional role-specific data
        ...(role === 'student' 
          ? { program: 'BSc CS', year: '3rd Year' }
          : { department: 'Computer Science' }
        ),
      };

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // Redirect based on role
      navigate(role === 'student' ? '/student' : '/lecturer');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Invalid credentials. Please try again.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const updateProfile = async (profileData) => {
    try {
      // TODO: Replace with actual API call
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: 'Failed to update profile. Please try again.' 
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 