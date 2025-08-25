import React, { useCallback, useMemo } from 'react';
import { Alert, View } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { EmailVerificationScreen } from '../screens/auth/EmailVerificationScreen';
import { HomeScreen } from '../screens/HomeScreen';
import TaskListScreen from '../screens/TaskListScreen';
import AddEditTaskScreen from '../screens/AddEditTaskScreen';
import { RootStackParamList } from '../types/navigation';
import { useTheme, Provider as PaperProvider} from 'react-native-paper';
import { ThemeProvider, useThemeContext } from '../theme/ThemeContext';
import ThemeToggle from '../components/common/ThemeToggle';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Custom header component with theme toggle
const CustomHeaderRight = () => {
  const { signOut } = useAuth();
  const theme = useTheme();
  const { isDark } = useThemeContext();
  const navigation = useNavigation<any>();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <ThemeToggle />
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
                onPress: async () => {
                  await signOut();
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
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
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
          color={isDark ? '#fff' : theme.colors.primary}
          style={{
            textShadowColor: isDark ? 'rgba(0, 0, 0, 0.)' : 'rgba(255, 255, 255, 0.5)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

const MainNavigator = () => {
  const { user, loading, isEmailVerified } = useAuth();
  const { theme, isDark } = useThemeContext();
  
  const navigationTheme = useMemo(
    () => ({
      ...(isDark ? NavigationDarkTheme : NavigationDefaultTheme),
      colors: {
        ...(isDark ? NavigationDarkTheme.colors : NavigationDefaultTheme.colors),
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.onSurface,
        border: theme.colors.outline,
        notification: theme.colors.error,
      },
    }),
    [theme, isDark]
  );

  if (loading) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: theme.colors.surface,
            headerTitleStyle: {
              fontWeight: '600',
              color: theme.colors.surface,
            },
            headerRight: () => <CustomHeaderRight />,
          }}
        >
          {!user || !isEmailVerified ? (
            // Auth screens
            <>
              <Stack.Screen 
                name="SignIn" 
                component={SignInScreen} 
                options={{ 
                  title: 'Sign In',
                  headerShown: false,
                }} 
              />
              <Stack.Screen 
                name="SignUp" 
                component={SignUpScreen} 
                options={({ navigation }) => ({
                  title: 'Create Account',
                  headerShown: false,
                  headerRight: () => null, // Hide theme toggle on auth screens
                })} 
              />
              <Stack.Screen 
                name="EmailVerification" 
                component={EmailVerificationScreen} 
                options={{ 
                  headerShown: false,
                  headerRight: () => null,
                }}
              />
              <Stack.Screen 
                name="ForgotPassword" 
                component={ForgotPasswordScreen} 
                options={{
                  title: 'Forgot Password',
                  headerShown: false,
                  headerRight: () => null,
                }}
              />
            </>
          ) : (
            // Authenticated screens
            <>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="TaskList" 
                component={TaskListScreen} 
                options={{ 
                  title: 'My Tasks',
                }} 
              />
              <Stack.Screen 
                name="AddEditTask" 
                component={AddEditTaskScreen} 
                options={({ route }) => ({
                  title: route.params?.taskId ? 'Edit Task' : 'Add Task',
                  presentation: 'modal',
                })} 
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export const AppNavigator = () => {
  return (
    <ThemeProvider>
      <MainNavigator />
    </ThemeProvider>
  );
};

export default AppNavigator;
