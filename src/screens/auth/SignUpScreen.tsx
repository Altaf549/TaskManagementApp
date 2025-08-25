import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import MaterialIcons from '@react-native-vector-icons/material-icons';

// Validation schema
const SignUpSchema = Yup.object().shape({
  email: Yup.string().email('Please enter a valid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

interface FormValues {
  email: string;
  password: string;
  confirmPassword: string;
}


export const SignUpScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const { signUp, loading } = useAuth();

  const handleSignUp = async (values: FormValues, actions: FormikHelpers<FormValues>) => {
    try {
      await signUp(values.email, values.password);
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
      console.error('Sign up error:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onBackground }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Sign up to get started
            </Text>
          </View>
          <Formik
            initialValues={{ email: '', password: '', confirmPassword: '' }}
            validationSchema={SignUpSchema}
            onSubmit={handleSignUp}
          >
            {(formikProps: FormikProps<FormValues>) => {
              const {
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isSubmitting,
              } = formikProps;
              return (
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Email"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    mode="outlined"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={touched.email && !!errors.email}
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    left={<TextInput.Icon icon={({ size, color }) => (
                        <MaterialIcons name="email" size={size + 4} color={theme.colors.onSurfaceVariant} />
                    )} />}
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
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    mode="outlined"
                    secureTextEntry={secureTextEntry}
                    error={touched.password && !!errors.password}
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    left={<TextInput.Icon icon={({ size, color }) => (
                      <MaterialIcons name="lock" size={size + 4} color={theme.colors.onSurfaceVariant} />
                    )} />}
                    right={
                      <TextInput.Icon
                        icon={() => (
                          <MaterialIcons
                            name={secureTextEntry ? 'visibility-off' : 'visibility'}
                            size={24}
                          />
                        )}
                        onPress={() => setSecureTextEntry(!secureTextEntry)}
                      />
                    }
                    theme={{
                      colors: {
                        primary: theme.colors.primary,
                        text: theme.colors.onSurface,
                      },
                    }}
                  />
                  {touched.password && errors.password && (
                    <HelperText type="error" visible={!!errors.password}>
                      {errors.password}
                    </HelperText>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    label="Confirm Password"
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    mode="outlined"
                    secureTextEntry={confirmSecureTextEntry}
                    error={touched.confirmPassword && !!errors.confirmPassword}
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    left={<TextInput.Icon icon={({ size, color }) => (
                      <MaterialIcons name="lock" size={size + 4} color={theme.colors.onSurfaceVariant} />
                    )} />}
                    right={
                      <TextInput.Icon
                        icon={() => (
                          <MaterialIcons
                            name={secureTextEntry ? 'visibility-off' : 'visibility'}
                            size={24}
                          />
                        )}
                        onPress={() => setSecureTextEntry(!secureTextEntry)}
                      />
                    }
                    theme={{
                      colors: {
                        primary: theme.colors.primary,
                        text: theme.colors.onSurface,
                      },
                    }}
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <HelperText type="error" visible={!!errors.confirmPassword}>
                      {errors.confirmPassword}
                    </HelperText>
                  )}
                </View>

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={[styles.button, { backgroundColor: theme.colors.primary }]}
                  labelStyle={[styles.buttonLabel, { color: theme.colors.onPrimary }]}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {!isSubmitting && 'Sign Up'}
                </Button>

                <View style={styles.footer}>
                  <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
                    Already have an account?{' '}
                  </Text>
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('SignIn')}
                    labelStyle={{ color: theme.colors.primary }}
                    compact
                  >
                    Sign In
                  </Button>
                </View>
              </View>
            )}}
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
  header: {
    marginBottom: 32,
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
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 6,
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
