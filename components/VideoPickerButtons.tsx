import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VideoPlayer } from './VideoPlayer';
import { RADIUS } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  videoUri: string | null;
  onRecord: () => void;
  onPick: () => void;
  onClear: () => void;
};

export function VideoPickerButtons({ videoUri, onRecord, onPick, onClear }: Props) {
  const { colors: C } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    buttonsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    pickBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: C.surface,
      borderRadius: RADIUS.control,
      paddingVertical: 12,
      minHeight: 44,
    },
    pickBtnText: {
      fontSize: 14,
      color: C.accent,
      fontWeight: '500',
    },
    previewContainer: {
      gap: 10,
    },
    changeRow: {
      flexDirection: 'row',
      gap: 10,
    },
    changeBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: C.surface,
      borderRadius: RADIUS.control,
      paddingVertical: 10,
      minHeight: 44,
    },
    changeBtnText: {
      fontSize: 13,
      color: C.accent,
      fontWeight: '500',
    },
    removeBtn: {
      paddingHorizontal: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.surface,
      borderRadius: RADIUS.control,
      minHeight: 44,
    },
    removeBtnText: {
      fontSize: 13,
      color: C.deleteSwipe,
      fontWeight: '500',
    },
  }), [C]);

  if (videoUri) {
    return (
      <View style={styles.previewContainer}>
        <VideoPlayer uri={videoUri} />
        <View style={styles.changeRow}>
          <Pressable
            style={({ pressed }) => [styles.changeBtn, { opacity: pressed ? 0.7 : 1 }]}
            android_ripple={{ color: 'transparent' }}
            onPress={onRecord}
          >
            <Ionicons name="camera-outline" size={16} color={C.accent} />
            <Text style={styles.changeBtnText}>Re-record</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.changeBtn, { opacity: pressed ? 0.7 : 1 }]}
            android_ripple={{ color: 'transparent' }}
            onPress={onPick}
          >
            <Ionicons name="folder-open-outline" size={16} color={C.accent} />
            <Text style={styles.changeBtnText}>Replace</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.removeBtn, { opacity: pressed ? 0.7 : 1 }]}
            android_ripple={{ color: 'transparent' }}
            onPress={onClear}
          >
            <Text style={styles.removeBtnText}>Remove</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.buttonsRow}>
      <Pressable
        style={({ pressed }) => [styles.pickBtn, { opacity: pressed ? 0.7 : 1 }]}
        android_ripple={{ color: 'transparent' }}
        onPress={onRecord}
      >
        <Ionicons name="camera-outline" size={18} color={C.accent} />
        <Text style={styles.pickBtnText}>Record clip</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.pickBtn, { opacity: pressed ? 0.7 : 1 }]}
        android_ripple={{ color: 'transparent' }}
        onPress={onPick}
      >
        <Ionicons name="folder-open-outline" size={18} color={C.accent} />
        <Text style={styles.pickBtnText}>From library</Text>
      </Pressable>
    </View>
  );
}
