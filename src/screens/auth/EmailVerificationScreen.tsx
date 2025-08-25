import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from 'react-native-paper';
import { Text, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'EmailVerification'>;

export const EmailVerificationScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const { user, isEmailVerified, sendEmailVerification, loading } = useAuth();
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isEmailVerified) {
      // Navigate to home or wherever appropriate
      navigation.replace('Home');
    }
  }, [isEmailVerified, navigation]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handleResendEmail = async () => {
    try {
      setSending(true);
      await sendEmailVerification();
      setCountdown(60); // 1 minute cooldown
      Alert.alert('Success', 'Verification email has been resent. Please check your inbox.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send verification email');
    } finally {
      setSending(false);
    }
  };

  const handleContinue = () => {
    if (isEmailVerified) {
      navigation.replace('Home');
    } else {
      Alert.alert(
        'Email Not Verified',
        'Please verify your email before continuing. Check your inbox for the verification email.',
        [
          { text: 'Resend Email', onPress: handleResendEmail },
          { text: 'OK', style: 'cancel' },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
          Verify Your Email
        </Text>
        
        <Text style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
          We've sent a verification email to {user?.email}. Please check your inbox and click the verification link to activate your account.
        </Text>

        <Text style={[styles.note, { color: theme.colors.onSurfaceVariant }]}>
          If you don't see the email, check your spam folder or request a new verification email below.
        </Text>

        <Button
          mode="contained"
          onPress={handleResendEmail}
          disabled={sending || countdown > 0}
          loading={sending}
          style={styles.button}
        >
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}
        </Button>

        <Button
          mode="outlined"
          onPress={handleContinue}
          disabled={loading}
          style={styles.button}
        >
          {loading ? <ActivityIndicator /> : 'Continue'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  note: {
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
    fontSize: 14,
    opacity: 0.8,
  },
  button: {
    marginTop: 12,
  },
});
