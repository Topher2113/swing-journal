import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEvent } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS } from '@/constants/theme';

type Props = { uri: string; style?: ViewStyle };

export function VideoPlayer({ uri, style }: Props) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: false });

  const toggle = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <Pressable onPress={toggle} style={[styles.container, style]}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />
      {!isPlaying && (
        <View style={styles.overlay}>
          <Ionicons name="play-circle" size={56} color="rgba(255,255,255,0.85)" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    backgroundColor: '#000',
    aspectRatio: 16 / 9,
    width: '100%',
  },
  video: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
});
