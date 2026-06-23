import { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TextStyle, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type TabIconProps = { color: string; size: number };

const HomeIcon = ({ color, size }: TabIconProps) => <Ionicons name="home-outline" size={size} color={color} />;
const LibraryIcon = ({ color, size }: TabIconProps) => <Ionicons name="library" size={size} color={color} />;
const AddIcon = ({ color, size }: TabIconProps) => <Ionicons name="add-circle" size={size} color={color} />;
const JournalIcon = ({ color, size }: TabIconProps) => <Ionicons name="people" size={size} color={color} />;
const ProfileIcon = ({ color, size }: TabIconProps) => <Ionicons name="person-circle-outline" size={size} color={color} />;

// HIG: labels use a small system font (~10pt), same active color as icon
const tabBarLabelStyle: TextStyle = {
  fontSize: 10,
  fontWeight: '500',
};

const tabBarItemStyle: ViewStyle = {
  paddingTop: 4,
  paddingBottom: 2,
};

export default function TabLayout() {
  const { colors: C } = useTheme();

  const headerStyle = useMemo(() => ({ backgroundColor: C.bg }), [C]);

  // Apple HIG Tab Bars: icon + label stacked, ~49pt content height, short single-word labels
  // https://developer.apple.com/design/human-interface-guidelines/tab-bars
  const tabBarStyle: ViewStyle = useMemo(() => ({
    backgroundColor: C.surface,
    borderTopColor: C.border,
    borderTopWidth: 0.5,
    // No explicit height — let React Navigation include the safe area inset
    // automatically so content is never clipped by the home indicator.
  }), [C]);

  return (
    <Tabs
      screenOptions={{
        headerStyle,
        headerTintColor: C.textPrimary,
        tabBarStyle,
        tabBarItemStyle,
        tabBarLabelStyle,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.textSecondary,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', tabBarIcon: HomeIcon }}
      />
      <Tabs.Screen
        name="(library)"
        options={{ title: 'Library', headerShown: false, tabBarIcon: LibraryIcon }}
      />
      <Tabs.Screen
        name="add"
        options={{ title: 'Add', tabBarIcon: AddIcon }}
      />
      <Tabs.Screen
        name="journal"
        options={{ title: 'Partner', tabBarIcon: JournalIcon }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{ title: 'Profile', headerShown: false, tabBarIcon: ProfileIcon }}
      />
    </Tabs>
  );
}
