import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { apiService } from '../services/api';

const AuthContext = createContext(null);
const demoMode = import.meta.env.DEV && !isFirebaseConfigured;

const DEFAULT_ADMIN = {
  userId: 'ADMIN001',
  name: 'Ramanathan M (Village Officer)',
  email: 'admin@example.com',
  role: 'admin',
  villageId: 'V001',
  villageName: 'Green Valley Village',
  createdAt: '2026-01-01T08:00:00Z',
};

const DEFAULT_FARMER = {
  userId: 'USER001',
  name: 'Arun Kumar',
  email: 'arun@example.com',
  role: 'farmer',
  villageId: 'V001',
  villageName: 'Green Valley Village',
  farmName: 'Green Valley Farm',
  createdAt: '2026-01-15T09:30:00Z',
};

const readDemoUser = () => {
  try {
    const savedUser = localStorage.getItem('smart_village_user');
    return savedUser ? JSON.parse(savedUser) : DEFAULT_ADMIN;
  } catch (error) {
    console.warn('Could not read the saved local demo account.', error);
    return DEFAULT_ADMIN;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => (demoMode ? readDemoUser() : null));
  const [loading, setLoading] = useState(!demoMode && isFirebaseConfigured);

  useEffect(() => {
    if (demoMode || !isFirebaseConfigured || !auth) return undefined;

    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await apiService.getProfile();
        setUser(response.data);
      } catch (error) {
        console.error('Could not load the authenticated user profile.', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!demoMode) return;
    if (user) {
      localStorage.setItem('smart_village_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smart_village_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (demoMode) {
        const demoUser = email.toLowerCase().includes('admin')
          ? { ...DEFAULT_ADMIN, email, name: `${email.split('@')[0]} (Admin)` }
          : { ...DEFAULT_FARMER, email, name: email.split('@')[0] };
        setUser(demoUser);
        return { success: true, user: demoUser };
      }
      if (!isFirebaseConfigured || !auth) {
        return { success: false, error: 'Firebase Authentication is not configured.' };
      }
      await signInWithEmailAndPassword(auth, email, password);
      const response = await apiService.getProfile();
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed. Check your credentials.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, profileData = {}) => {
    setLoading(true);
    try {
      if (demoMode) {
        const newUser = {
          userId: `USER_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          name,
          email,
          role: 'farmer',
          villageId: profileData.villageId || 'V001',
          villageName: profileData.villageName || 'Green Valley Village',
          createdAt: new Date().toISOString(),
        };
        setUser(newUser);
        return { success: true, user: newUser };
      }
      if (!isFirebaseConfigured || !auth) {
        return { success: false, error: 'Firebase Authentication is not configured.' };
      }

      await createUserWithEmailAndPassword(auth, email, password);
      const response = await apiService.createProfile({
        name,
        villageId: profileData.villageId || 'V001',
        villageName: profileData.villageName || 'Green Valley Village',
      });
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed.' };
    } finally {
      setLoading(false);
    }
  };

  const loginAsAdmin = () => {
    if (demoMode) setUser(DEFAULT_ADMIN);
  };

  const loginAsFarmer = () => {
    if (demoMode) setUser(DEFAULT_FARMER);
  };

  const logout = async () => {
    setUser(null);
    if (demoMode) return;
    try {
      if (auth) await signOut(auth);
    } catch (error) {
      console.error('Could not sign out from Firebase Authentication.', error);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isFarmer = user?.role === 'farmer';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        demoMode,
        isAdmin,
        isFarmer,
        login,
        register,
        loginAsAdmin,
        loginAsFarmer,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
