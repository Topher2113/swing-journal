import { Stack } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { C } from '@/constants/theme';

SystemUI.setBackgroundColorAsync(C.bg);

const headerStyle = { backgroundColor: C.bg };
const contentStyle = { backgroundColor: C.bg };

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}
