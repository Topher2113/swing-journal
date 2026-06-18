import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { C } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

SystemUI.setBackgroundColorAsync(C.bg);

const headerStyle = { backgroundColor: C.bg };
const contentStyle = { backgroundColor: C.bg };
const rootStyle = { flex: 1 };

function RootLayoutInner() {
  const { session, loading, profile, profileLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading || profileLoading) return;
    const inAuthGroup = (segments[0] as string) === '(auth)';
    const onOnboarding = (segments[1] as string) === 'onboarding';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/sign-in' as never);
    } else if (session && !profile && !onOnboarding) {
      // Logged in but hasn't completed onboarding yet
      router.replace('/(auth)/onboarding' as never);
    } else if (session && profile && inAuthGroup) {
      router.replace('/(tabs)/home' as never);
    }
  }, [session, loading, profile, profileLoading, segments]);

  return (
    <Stack
      screenOptions={{
        headerStyle,
        headerTintColor: C.textPrimary,
        contentStyle,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/verify-email" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="move/[id]" options={{ headerBackTitle: 'Moves' }} />
      <Stack.Screen name="category/[category]" options={{ headerBackTitle: 'My Moves' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Edit Move', headerBackTitle: 'Detail' }} />
      <Stack.Screen name="motion-trail/[id]" options={{ headerBackTitle: 'Detail' }} />
      <Stack.Screen name="song/[id]" options={{ headerBackTitle: 'Library' }} />
      <Stack.Screen name="edit-song/[id]" options={{ title: 'Edit Song', headerBackTitle: 'Detail' }} />
      <Stack.Screen name="line-dance/[id]" options={{ headerBackTitle: 'Library' }} />
      <Stack.Screen name="edit-line-dance/[id]" options={{ title: 'Edit Line Dance', headerBackTitle: 'Detail' }} />
      <Stack.Screen name="shared-move/[id]" options={{ title: '', headerBackTitle: 'Journal' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile', headerBackTitle: 'Profile' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={rootStyle}>
      <StatusBar style="light" />
      <AuthProvider>
        <RootLayoutInner />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
