import { Stack } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { C } from '@/constants/theme';

SystemUI.setBackgroundColorAsync(C.bg);

const headerStyle = { backgroundColor: C.bg };
const contentStyle = { backgroundColor: C.bg };

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle,
        headerTintColor: C.textPrimary,
        contentStyle,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="move/[id]" options={{ headerBackTitle: 'Moves' }} />
      <Stack.Screen name="category/[category]" options={{ headerBackTitle: 'My Moves' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Edit Move', headerBackTitle: 'Detail' }} />
    </Stack>
  );
}
