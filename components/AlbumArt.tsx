import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  url: string | null;
  size: number;
  borderRadius?: number;
  iconSize?: number;
};

export function AlbumArt({ url, size, borderRadius = 6, iconSize }: Props) {
  const { colors: C } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    placeholder: {
      backgroundColor: C.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }), [C]);

  const style = { width: size, height: size, borderRadius };

  if (url) {
    return <Image source={{ uri: url }} style={style} contentFit="cover" />;
  }

  return (
    <View style={[style, styles.placeholder]}>
      <Ionicons name="musical-note" size={iconSize ?? Math.round(size * 0.4)} color={C.textSecondary} />
    </View>
  );
}
