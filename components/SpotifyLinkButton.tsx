import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { C, RADIUS } from '@/constants/theme';

type Props = { url: string };

async function openSpotify(url: string) {
  const trackId = url.split('/track/')[1]?.split('?')[0];
  if (trackId) {
    const uri = `spotify:track:${trackId}`;
    try {
      const supported = await Linking.canOpenURL(uri);
      if (supported) {
        Linking.openURL(uri);
        return;
      }
    } catch {}
  }
  Linking.openURL(url);
}

export function SpotifyLinkButton({ url }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.8 : 1 }]}
      android_ripple={{ color: 'transparent' }}
      onPress={() => openSpotify(url)}
    >
      <MaterialCommunityIcons name="spotify" size={18} color="#1DB954" />
      <Text style={styles.label}>Open in Spotify</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: RADIUS.chip,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignSelf: 'center',
    minHeight: 44,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
  },
});
