import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS } from '@/constants/theme';

type Props = { uri: string; style?: ViewStyle };

export function VideoPlayer({ uri, style }: Props) {
  const videoRef = useRef<Video>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = async () => {
    if (!videoRef.current) return;
    if (playing) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setPlaying((p) => !p);
  };

  return (
    <Pressable onPress={toggle} style={[styles.container, style]}>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={false}
        isLooping
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded) setPlaying(status.isPlaying);
        }}
      />
      {!playing && (
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
