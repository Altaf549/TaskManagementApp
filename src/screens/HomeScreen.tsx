import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to TaskList screen when user is authenticated
    if (user) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'TaskList' as never }],
      });
    }
  }, [user, navigation]);

  // This screen doesn't render anything visible
  return null;
};
