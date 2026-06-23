import { useMemo } from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function LibraryLayout() {
  const { colors: C } = useTheme();

  const headerStyle = useMemo(() => ({ backgroundColor: C.bg }), [C]);

  return (
    <Stack
      screenOptions={{
        headerStyle,
        headerTintColor: C.textPrimary,
      }}
    >
      <Stack.Screen name="index" options={{ title: '' }} />
      <Stack.Screen name="category/[category]" options={{ headerBackTitle: 'Library' }} />
    </Stack>
  );
}
