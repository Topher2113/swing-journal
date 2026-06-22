import { Stack } from 'expo-router';
import { C } from '@/constants/theme';

export default function LibraryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: C.bg },
        headerTintColor: C.textPrimary,
      }}
    >
      <Stack.Screen name="index" options={{ title: '' }} />
      <Stack.Screen name="category/[category]" options={{ headerBackTitle: 'Library' }} />
    </Stack>
  );
}
