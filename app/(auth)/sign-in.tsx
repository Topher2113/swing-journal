import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { signIn, signUp } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { C, RADIUS } from '@/constants/theme';

type Mode = 'signin' | 'signup';

function friendlyError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('invalid login credentials')) return 'Email or password is incorrect.';
  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return 'An account with this email already exists. Sign in instead.';
  }
  if (lower.includes('password should be at least')) return 'Password must be at least 6 characters.';
  if (lower.includes('invalid email') || lower.includes('unable to validate email')) {
    return 'Please enter a valid email address.';
  }
  if (lower.includes('rate limit') || lower.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch')) {
    return 'Connection failed. Check your internet and try again.';
  }
  return msg || 'Something went wrong. Please try again.';
}

export default function SignInScreen() {
  const { linkError, clearLinkError } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Show errors surfaced by AuthContext (e.g. expired confirmation link)
  useEffect(() => {
    if (linkError) {
      setError(linkError);
      clearLinkError();
    }
  }, [linkError, clearLinkError]);

  const switchMode = (next: Mode) => {
    setError(null);
    setMode(next);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirm) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const redirectTo = Linking.createURL('/');
        const { error: err } = await signUp(email.trim(), password, redirectTo);
        if (err) throw err;
        router.push(
          `/(auth)/verify-email?email=${encodeURIComponent(email.trim())}` as never
        );
      } else {
        const { error: err } = await signIn(email.trim(), password);
        if (err) throw err;
        router.replace('/(tabs)');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // "Email not confirmed" → send them to the verify screen to resend
      if (msg.toLowerCase().includes('email not confirmed')) {
        router.push(
          `/(auth)/verify-email?email=${encodeURIComponent(email.trim())}` as never
        );
        return;
      }
      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Swing Journal</Text>
        <Text style={styles.subtitle}>
          {mode === 'signin' ? 'Sign in to your account' : 'Create an account'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={C.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={C.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          textContentType={mode === 'signup' ? 'newPassword' : 'password'}
        />
        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor={C.textSecondary}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            textContentType="newPassword"
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={C.textPrimary} />
          ) : (
            <Text style={styles.buttonText}>
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}>
          <Text style={styles.toggleText}>
            {mode === 'signin'
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: C.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: C.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.control,
    padding: 14,
    fontSize: 16,
    color: C.textPrimary,
    borderWidth: 1,
    borderColor: C.border,
  },
  error: {
    color: '#FCA5A5',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: C.accent,
    borderRadius: RADIUS.control,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonPressed: {
    backgroundColor: C.accentDark,
  },
  buttonText: {
    color: C.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  toggleText: {
    color: C.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
