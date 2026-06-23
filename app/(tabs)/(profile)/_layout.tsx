import { useMemo } from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function ProfileLayout() {
  const { colors: C } = useTheme();

  const headerStyle = useMemo(() => ({ backgroundColor: C.bg }), [C]);

  return (
    <Stack
      screenOptions={{
        headerStyle,
        headerTintColor: C.textPrimary,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
      <Stack.Screen name="profile-category/[category]" options={{ headerBackTitle: 'Profile' }} />
    </Stack>
  );
}
