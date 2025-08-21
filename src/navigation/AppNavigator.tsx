import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import { TouchableOpacity } from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { HomeScreen } from '../screens/HomeScreen';
import TaskListScreen from '../screens/TaskListScreen';
import AddEditTaskScreen from '../screens/AddEditTaskScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer
      theme={{
        colors: {
          primary: '#6200ee',
          background: '#f5f5f5',
          card: '#6200ee',
          text: '#fff',
          border: 'transparent',
          notification: '#ff3d71',
        },
        dark: false,
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '800',
          },
        },
      }}
    >
      <Stack.Navigator>
        {user ? (
          // Authenticated screens
          <>
            <Stack.Screen 
              name="TaskList" 
              component={TaskListScreen} 
              options={({ navigation }) => ({
                title: 'My Tasks',
                headerShown: true,
                headerBackVisible: false,
                headerRight: () => (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Logout',
                        'Are you sure you want to logout?',
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel',
                          },
                          {
                            text: 'Logout',
                            style: 'destructive',
                            onPress: () => {
                              const { signOut } = useAuth();
                              signOut();
                              navigation.reset({
                                index: 0,
                                routes: [{ name: 'SignIn' }],
                              });
                            },
                          },
                        ],
                      );
                    }}
                    style={{
                      marginRight: 16,
                      padding: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 20,
                      width: 40,
                      height: 40,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons 
                      name="logout" 
                      size={24} 
                      color="#fff"
                      style={{
                        textShadowColor: 'rgba(0, 0, 0, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}
                    />
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen 
              name="AddEditTask" 
              component={AddEditTaskScreen}
              options={{ 
                title: 'Add Task',
                headerShown: true,
              }}
            />
          </>
        ) : (
          // Auth screens
          <>
            <Stack.Screen 
              name="SignIn" 
              component={SignInScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="SignUp" 
              component={SignUpScreen} 
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
