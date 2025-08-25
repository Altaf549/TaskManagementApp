import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { auth } from '../config/firebase';

type AuthContextType = {
  isEmailVerified: boolean;
  sendEmailVerification: () => Promise<void>;
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {children: ReactNode;};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (userState) => {
      if (userState) {
        // Refresh the user's token to get the latest email verification status
        await userState.reload();
        const updatedUser = auth().currentUser;
        setUser(updatedUser);
        setIsEmailVerified(updatedUser?.emailVerified || false);
      } else {
        setUser(null);
        setIsEmailVerified(false);
      }
      setLoading(false);
      setError(null);
    });

    return subscriber;
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      if (userCredential.user) {
        await sendEmailVerification();
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendEmailVerification = async () => {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    
    try {
      await user.sendEmailVerification();
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await auth().signOut();
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    isEmailVerified,
    signUp,
    signIn,
    signOut,
    sendEmailVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
