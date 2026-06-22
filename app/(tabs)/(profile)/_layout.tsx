import { Stack } from 'expo-router';
import { C } from '@/constants/theme';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: C.bg },
        headerTintColor: C.textPrimary,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
      <Stack.Screen name="profile-category/[category]" options={{ headerBackTitle: 'Profile' }} />
    </Stack>
  );
}
