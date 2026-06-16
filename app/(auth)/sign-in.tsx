import { useState } from 'react';
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
import { signIn, signUp } from '@/lib/auth';
import { C, RADIUS } from '@/constants/theme';

type Mode = 'signin' | 'signup';

export default function SignInScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchMode = (next: Mode) => {
    setError(null);
    setInfo(null);
    setMode(next);
  };

  const handleSubmit = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    if (mode === 'signup' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error: err } = await signUp(email.trim(), password);
        if (err) throw err;
        setInfo('Account created! Check your email to confirm, then sign in.');
        switchMode('signin');
      } else {
        const { error: err } = await signIn(email.trim(), password);
        if (err) throw err;
        router.replace('/(tabs)');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
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
        {info ? <Text style={styles.info}>{info}</Text> : null}

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
  info: {
    color: '#86EFAC',
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
