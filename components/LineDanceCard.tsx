import { useCallback, useRef } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Ionicons } from '@expo/vector-icons';
import { DifficultyBadge } from './DifficultyBadge';
import { SwipeActions } from './SwipeActions';
import { LineDance } from '@/types/LineDance';
import { useTheme } from '@/context/ThemeContext';
import { useCommonStyles } from '@/constants/commonStyles';

type Props = {
  lineDance: LineDance;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function LineDanceCard({ lineDance, onPress, onEdit, onDelete }: Props) {
  const { colors: C } = useTheme();
  const cs = useCommonStyles();
  const swipeableRef = useRef<any>(null);

  const handleEdit = useCallback(() => {
    swipeableRef.current?.close();
    onEdit();
  }, [onEdit]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Line Dance',
      `Delete "${lineDance.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  }, [lineDance.name, onDelete]);

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderRightActions={() => <SwipeActions onEdit={handleEdit} onDelete={handleDelete} />}
      overshootRight={false}
    >
      <Pressable
        style={({ pressed }) => [cs.listCard, { opacity: pressed ? 0.85 : 1 }]}
        android_ripple={{ color: 'transparent' }}
        onPress={onPress}
      >
        <View style={[cs.videoDot, { backgroundColor: lineDance.videoUri ? C.accent : C.border }]} />
        <View style={cs.cardInfo}>
          <Text style={cs.cardName} numberOfLines={1}>{lineDance.name}</Text>
          <View style={cs.cardMeta}>
            <DifficultyBadge difficulty={lineDance.difficulty} />
            <Text style={cs.metaText}>{lineDance.steps.length} steps</Text>
            <Text style={cs.metaText}>↻ {lineDance.practiceCount}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={C.chevron} />
      </Pressable>
    </ReanimatedSwipeable>
  );
}

