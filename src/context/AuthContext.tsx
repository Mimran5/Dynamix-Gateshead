import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface User {
  email: string;
  uid: string;
  membershipType?: string;
  name?: string;
  contact?: string;
  bookings?: any[];
  recurringBookings?: any[];
  history?: any[];
  createdAt?: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, name?: string, contact?: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Fetch user data from Firestore using UID
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          let userDoc = await getDoc(userDocRef);
          
          // Auto-create user doc if missing (for logins)
          if (!userDoc.exists()) {
            const defaultUserData = {
              email: firebaseUser.email || '',
              name: '',
              contact: '',
              membershipType: 'basic',
              bookings: [],
              recurringBookings: [],
              history: [],
              createdAt: new Date()
            };
            await setDoc(userDocRef, defaultUserData);
            userDoc = await getDoc(userDocRef);
          }
          
          const userData = userDoc.data();
          setUser({
            email: firebaseUser.email || '',
            uid: firebaseUser.uid,
            ...userData
          } as User);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, name?: string, contact?: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Create user doc in Firestore with default membership using UID
      const defaultUserData = {
        email,
        name: name || '',
        contact: contact || '',
        membershipType: 'basic',
        bookings: [],
        recurringBookings: [],
        history: [],
        createdAt: new Date()
      };
      await setDoc(doc(db, 'users', cred.user.uid), defaultUserData);
      return null;
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        return 'This email is already registered. Please login instead.';
      }
      return error.message || 'An error occurred during signup.';
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return null;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        return 'This email is not registered. Please sign up first.';
      }
      if (error.code === 'auth/wrong-password') {
        return 'Incorrect password. Please try again.';
      }
      return error.message || 'An error occurred during login.';
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 