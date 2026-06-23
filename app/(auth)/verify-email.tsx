import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { RADIUS } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailScreen() {
  const { colors: C } = useTheme();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { linkError, clearLinkError } = useAuth();
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Show any deep-link error (e.g. expired token) surfaced by AuthContext
  useEffect(() => {
    if (linkError) {
      setError(linkError);
      clearLinkError();
    }
  }, [linkError, clearLinkError]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (!email || cooldown > 0 || sending) return;
    setError(null);
    setSuccess(null);
    setSending(true);
    try {
      const { error: err } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (err) throw err;
      setSuccess('Email resent! Check your inbox and spam folder.');
      startCooldown();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('too many')) {
        setError('Too many resend attempts. Please wait a few minutes before trying again.');
      } else {
        setError('Could not resend. Check your connection and try again.');
      }
    } finally {
      setSending(false);
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg,
    },
    inner: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      gap: 14,
    },
    iconWrap: {
      marginBottom: 4,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: C.textPrimary,
      textAlign: 'center',
    },
    body: {
      fontSize: 16,
      color: C.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    emailHighlight: {
      color: C.textPrimary,
      fontWeight: '600',
    },
    hint: {
      fontSize: 14,
      color: C.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    error: {
      color: C.error,
      fontSize: 14,
      textAlign: 'center',
    },
    successText: {
      color: C.success,
      fontSize: 14,
      textAlign: 'center',
    },
    button: {
      backgroundColor: C.accent,
      borderRadius: RADIUS.control,
      paddingVertical: 14,
      paddingHorizontal: 32,
      alignItems: 'center',
      minWidth: 200,
      marginTop: 8,
    },
    buttonDisabled: {
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
    },
    buttonPressed: {
      backgroundColor: C.accentDark,
    },
    buttonText: {
      color: C.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonTextMuted: {
      color: C.textSecondary,
    },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
    },
    backLink: {
      color: C.textSecondary,
      fontSize: 14,
    },
  }), [C]);

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.iconWrap}>
          <Ionicons name="mail-outline" size={64} color={C.accent} />
        </View>

        <Text style={styles.title}>Check your email</Text>

        <Text style={styles.body}>
          We sent a confirmation link to{'\n'}
          <Text style={styles.emailHighlight}>{email ?? 'your email address'}</Text>
        </Text>

        <Text style={styles.hint}>
          Tap the link in the email to confirm your account. The app will open automatically and sign you in.
        </Text>
        <Text style={styles.hint}>
          Don't see it? Check your spam or junk folder.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            (cooldown > 0 || sending) && styles.buttonDisabled,
            pressed && cooldown === 0 && !sending && styles.buttonPressed,
          ]}
          onPress={handleResend}
          disabled={cooldown > 0 || sending}
        >
          {sending ? (
            <ActivityIndicator color={C.textPrimary} />
          ) : (
            <Text style={[styles.buttonText, cooldown > 0 && styles.buttonTextMuted]}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Email'}
            </Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.backRow, { opacity: pressed ? 0.8 : 1 }]}
          onPress={() => router.replace('/(auth)/sign-in' as never)}
        >
          <Ionicons name="arrow-back" size={16} color={C.textSecondary} />
          <Text style={styles.backLink}>Back to sign in</Text>
        </Pressable>
      </View>
    </View>
  );
}
