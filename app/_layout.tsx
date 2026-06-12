import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { C } from '@/constants/theme';

SystemUI.setBackgroundColorAsync(C.bg);

const headerStyle = { backgroundColor: C.bg };
const contentStyle = { backgroundColor: C.bg };
const rootStyle = { flex: 1 };

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={rootStyle}>
      <StatusBar style="light" />
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
      <Stack.Screen name="motion-trail/[id]" options={{ headerBackTitle: 'Detail' }} />
      <Stack.Screen name="song/[id]" options={{ headerBackTitle: 'Library' }} />
      <Stack.Screen name="edit-song/[id]" options={{ title: 'Edit Song', headerBackTitle: 'Detail' }} />
    </Stack>
    </GestureHandlerRootView>
  );
}
