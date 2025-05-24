import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get user details from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userData
            });
          } else {
            console.error("User document not found in Firestore");
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      setError("");
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          ...userData
        });

        // Navigate based on user role
        if (userData.role === 'student') {
          navigate('/student');
        } else if (userData.role === 'lecturer') {
          navigate('/lecturer');
        } else {
          navigate('/');
        }
      } else {
        throw new Error("User document not found");
      }
    } catch (err) {
      console.error("Error signing in:", err);
      setError(err.message || "Failed to sign in");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError("");
      await firebaseSignOut(auth);
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error("Error signing out:", err);
      setError(err.message || "Failed to sign out");
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 