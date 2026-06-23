import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
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
  const { status } = useEvent(player, 'statusChange', { status: 'loading' as const });

  const isReady = status === 'readyToPlay';

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
        contentFit="contain"
        nativeControls={false}
      />
      {!isReady && (
        <View style={styles.skeleton}>
          <ActivityIndicator size="large" color="rgba(255,255,255,0.5)" />
        </View>
      )}
      {isReady && !isPlaying && (
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
    aspectRatio: 1,
    width: '100%',
  },
  video: {
    flex: 1,
  },
  skeleton: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
});
