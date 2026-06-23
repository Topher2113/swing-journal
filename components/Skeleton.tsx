import { useEffect, useMemo, useRef } from 'react';
import { Animated, DimensionValue, StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: object;
};

export function Skeleton({ width = '100%', height, borderRadius = 8, style }: Props) {
  const { colors: C } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: C.surface, opacity }, style]}
    />
  );
}

export function SkeletonRow({ children }: { children: React.ReactNode }) {
  const styles = useMemo(() => StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
  }), []);

  return <View style={styles.row}>{children}</View>;
}
