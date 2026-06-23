import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

const rootStyle = { flex: 1 };

function RootLayoutInner() {
  const { session, loading, profile, profileLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();
  const [navReady, setNavReady] = useState(false);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg);
  }, [colors.bg]);

  const headerStyle = { backgroundColor: colors.bg };
  const contentStyle = { backgroundColor: colors.bg };

  useEffect(() => {
    if (loading || profileLoading) return;
    const inAuthGroup = (segments[0] as string) === '(auth)';
    const onOnboarding = (segments[1] as string) === 'onboarding';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/sign-in' as never);
    } else if (session && !profile && !onOnboarding) {
      router.replace('/(auth)/onboarding' as never);
    } else if (session && profile && inAuthGroup) {
      router.replace('/(tabs)/home' as never);
    }
    setNavReady(true);
  }, [session, loading, profile, profileLoading, segments]);

  return (
    <>
    {!navReady && <View style={[styles.splash, { backgroundColor: colors.bg }]} />}
    <StatusBar style={isDark ? 'light' : 'dark'} />
    <Stack
      screenOptions={{
        headerStyle,
        headerTintColor: colors.textPrimary,
        contentStyle,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/verify-email" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="move/[id]" options={{ headerBackTitle: 'Moves' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Edit Move', headerBackTitle: 'Detail' }} />
      <Stack.Screen name="motion-trail/[id]" options={{ headerBackTitle: 'Detail' }} />
      <Stack.Screen name="song/[id]" options={{ headerBackTitle: 'Library' }} />
      <Stack.Screen name="edit-song/[id]" options={{ title: 'Edit Song', headerBackTitle: 'Detail' }} />
      <Stack.Screen name="line-dance/[id]" options={{ headerBackTitle: 'Library' }} />
      <Stack.Screen name="edit-line-dance/[id]" options={{ title: 'Edit Line Dance', headerBackTitle: 'Detail' }} />
      <Stack.Screen name="shared-move/[id]" options={{ title: '', headerBackTitle: 'Journal' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile', headerBackTitle: 'Profile' }} />
    </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={rootStyle}>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutInner />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
