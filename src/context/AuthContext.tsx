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
}

interface AuthContextType {
  user: User | null;
  signup: (email: string, password: string, name?: string, contact?: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Fetch user data from Firestore using UID
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        let userDoc = await getDoc(userDocRef);
        // Auto-create user doc if missing (for logins)
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: firebaseUser.email || '',
            membershipType: 'basic',
            bookings: [],
          });
          userDoc = await getDoc(userDocRef);
        }
        setUser({ email: firebaseUser.email || '', uid: firebaseUser.uid, ...userDoc.data() } as User);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, name?: string, contact?: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Create user doc in Firestore with default membership using UID
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        name: name || '',
        contact: contact || '',
        membershipType: 'basic',
        bookings: [],
      });
      return null;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        return 'This email is already registered. Please login instead.';
      }
      return error.message;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user) {
        return 'Login failed. Please try again.';
      }
      return null;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        return 'This email is not registered. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        return 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        return 'Invalid email format.';
      } else if (error.code === 'auth/too-many-requests') {
        return 'Too many failed attempts. Please try again later.';
      }
      return 'An error occurred during login. Please try again.';
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 