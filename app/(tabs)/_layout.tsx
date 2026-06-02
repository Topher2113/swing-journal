import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: C.bg },
        headerTintColor: C.textPrimary,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.border,
          borderTopWidth: 0.5,
        },
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.textSecondary,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Moves',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add Move',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
