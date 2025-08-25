import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useNavigation } from '@react-navigation/native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { Formik, FormikHelpers, FormikProps as FormikBaseProps } from 'formik';
import * as Yup from 'yup';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@react-native-vector-icons/material-icons';


// Validation schema
const SignInSchema = Yup.object().shape({
  email: Yup.string().email('Please enter a valid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

interface FormValues {
  email: string;
  password: string;
}

type FormikProps = FormikBaseProps<FormValues>;

export const SignInScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { signIn, loading } = useAuth();

  const handleSignIn = async (values: FormValues, actions: FormikHelpers<FormValues>) => {
    try {
      await signIn(values.email, values.password);
      // Check if email is verified after successful sign-in
      const currentUser = auth().currentUser;
      if (currentUser && !currentUser.emailVerified) {
        navigation.replace('EmailVerification');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in. Please check your credentials.');
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Sign in to continue
          </Text>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={SignInSchema}
            onSubmit={handleSignIn}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, isValid }: FormikProps) => (
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Email"
                    mode="outlined"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={touched.email && !!errors.email}
                    left={<TextInput.Icon icon={({ size, color }) => (
                        <MaterialIcons name="email" size={size + 4} color={theme.colors.onSurfaceVariant} />
                    )} />}
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    theme={{
                      colors: {
                        primary: theme.colors.primary,
                        text: theme.colors.onSurface,
                        placeholder: theme.colors.onSurfaceVariant,
                        background: theme.colors.surface,
                        surface: theme.colors.surface,
                        onSurfaceVariant: theme.colors.onSurfaceVariant,
                        outline: theme.colors.outline,
                      },
                      roundness: 8,
                    }}
                    outlineStyle={{ borderColor: theme.colors.outline }}
                  />
                  {touched.email && errors.email && (
                    <HelperText type="error" visible={!!errors.email}>
                      {errors.email}
                    </HelperText>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    label="Password"
                    mode="outlined"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    secureTextEntry={secureTextEntry}
                    error={touched.password && !!errors.password}
                    left={<TextInput.Icon icon={({ size, color }) => (
                      <MaterialIcons name="lock" size={size + 4} color={theme.colors.onSurfaceVariant} />
                    )} />}
                    right={
                      <TextInput.Icon
                        icon={({ size, color }) => (
                          <MaterialIcons
                            name={secureTextEntry ? 'visibility-off' : 'visibility'}
                            size={24}
                            color={theme.colors.onSurfaceVariant}
                          />
                        )}
                        onPress={() => setSecureTextEntry(!secureTextEntry)}
                      />
                    }
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    theme={{
                      colors: {
                        primary: theme.colors.primary,
                        text: theme.colors.onSurface,
                        placeholder: theme.colors.onSurfaceVariant,
                        background: theme.colors.surface,
                        surface: theme.colors.surface,
                        onSurfaceVariant: theme.colors.onSurfaceVariant,
                        outline: theme.colors.outline,
                      },
                      roundness: 8,
                    }}
                    outlineStyle={{ borderColor: theme.colors.outline }}
                  />
                  {touched.password && errors.password && (
                    <HelperText type="error" visible={!!errors.password}>
                      {errors.password}
                    </HelperText>
                  )}
                </View>

                <Button
                  mode="text"
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={styles.forgotPasswordButton}
                  labelStyle={{ color: theme.colors.primary }}
                >
                  Forgot Password?
                </Button>

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={!isValid || isSubmitting}
                  style={[styles.button, { backgroundColor: theme.colors.primary }]}
                  labelStyle={{ color: theme.colors.onPrimary }}
                >
                  Sign In
                </Button>

                <View style={styles.footer}>
                  <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
                    Don't have an account?{' '}
                  </Text>
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('SignUp')}
                    labelStyle={{ color: theme.colors.primary }}
                    compact
                  >
                    Sign Up
                  </Button>
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  forgotPasswordLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 0,
    marginBottom: 8,
    height: 36,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 6,
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
});
