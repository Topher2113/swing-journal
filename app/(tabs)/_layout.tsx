import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ViewStyle } from 'react-native';
import { C } from '@/constants/theme';

type TabIconProps = { color: string; size: number };

const ListIcon = ({ color, size }: TabIconProps) => <Ionicons name="list" size={size} color={color} />;
const AddIcon = ({ color, size }: TabIconProps) => <Ionicons name="add-circle" size={size} color={color} />;
const BarChartIcon = ({ color, size }: TabIconProps) => <Ionicons name="bar-chart" size={size} color={color} />;

const headerStyle = { backgroundColor: C.bg };

const tabBarStyle: ViewStyle = {
  backgroundColor: C.surface,
  borderTopColor: C.border,
  borderTopWidth: 0.5,
  height: 60,
  paddingTop: 0,
  paddingBottom: 0,
};

const tabBarItemStyle: ViewStyle = {
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingBottom: 12,
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle,
        headerTintColor: C.textPrimary,
        tabBarStyle,
        tabBarItemStyle,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.textSecondary,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'My Moves', tabBarIcon: ListIcon }}
      />
      <Tabs.Screen
        name="add"
        options={{ title: 'Add Move', tabBarIcon: AddIcon }}
      />
      <Tabs.Screen
        name="stats"
        options={{ title: 'Stats', tabBarIcon: BarChartIcon }}
      />
    </Tabs>
  );
}
