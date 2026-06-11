import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMoves } from '@/hooks/useMoves';
import { useSongs } from '@/hooks/useSongs';
import { CategorySection } from '@/components/CategorySection';
import { SongCard } from '@/components/SongCard';
import { LibraryHeader } from '@/components/LibraryHeader';
import { SegmentedControl } from '@/components/SegmentedControl';
import { ComingSoon } from '@/components/ComingSoon';
import { CATEGORIES } from '@/types/Move';
import { C, RADIUS } from '@/constants/theme';

const SEGMENTS = ['Moves', 'Line Dances', 'Songs'];
type Segment = 'Moves' | 'Line Dances' | 'Songs';

export default function LibraryScreen() {
  const router = useRouter();
  const { moves, reload: reloadMoves, deleteMove } = useMoves();
  const { songs, reload: reloadSongs, deleteSong } = useSongs();
  const [segment, setSegment] = useState<Segment>('Moves');

  useFocusEffect(
    useCallback(() => {
      reloadMoves();
      reloadSongs();
    }, [reloadMoves, reloadSongs])
  );

  const byCategory = useMemo(
    () => Object.fromEntries(CATEGORIES.map((cat) => [cat, moves.filter((m) => m.category === cat)])),
    [moves]
  );

  const sortedSongs = useMemo(
    () => [...songs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [songs]
  );

  const headerProps = useMemo(() => {
    switch (segment) {
      case 'Songs':
        return { title: 'My Songs', count: songs.length, label: 'song' };
      case 'Line Dances':
        return { title: 'Line Dances', count: 0, label: 'line dance' };
      default:
        return { title: 'My Moves', count: moves.length, label: 'move' };
    }
  }, [segment, moves.length, songs.length]);

  return (
    <>
      <Stack.Screen options={{ headerTitle: () => <LibraryHeader {...headerProps} /> }} />
      <View style={styles.flex}>
        <View style={styles.segmentWrap}>
          <SegmentedControl options={SEGMENTS} value={segment} onChange={(v) => setSegment(v as Segment)} />
        </View>

        {segment === 'Moves' && (
          moves.length === 0 ? (
            <View style={styles.fullEmpty}>
              <Ionicons name="musical-notes-outline" size={64} color={C.textSecondary} />
              <Text style={styles.emptyTitle}>No moves yet</Text>
              <Text style={styles.emptyBody}>Start logging your swing dance moves.</Text>
              <Pressable
                style={({ pressed }) => [styles.emptyBtn, { opacity: pressed ? 0.8 : 1 }]}
                android_ripple={{ color: 'transparent' }}
                onPress={() => router.push('/(tabs)/add')}
              >
                <Text style={styles.emptyBtnText}>Add your first move</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
              {CATEGORIES.map((cat) => (
                <CategorySection
                  key={cat}
                  category={cat}
                  moves={byCategory[cat]}
                  onPressHeader={() =>
                    router.push({ pathname: '/category/[category]', params: { category: cat } })
                  }
                  onPressMove={(id) => router.push({ pathname: '/move/[id]', params: { id } })}
                  onEditMove={(id) => router.push({ pathname: '/edit/[id]', params: { id } })}
                  onDeleteMove={deleteMove}
                />
              ))}
            </ScrollView>
          )
        )}

        {segment === 'Songs' && (
          sortedSongs.length === 0 ? (
            <View style={styles.fullEmpty}>
              <Ionicons name="musical-notes-outline" size={64} color={C.textSecondary} />
              <Text style={styles.emptyTitle}>No songs yet</Text>
              <Text style={styles.emptyBody}>Search Spotify from the Add tab to save your first song.</Text>
            </View>
          ) : (
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
              {sortedSongs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onPress={() => router.push(`/song/${song.id}`)}
                  onEdit={() => router.push(`/edit-song/${song.id}`)}
                  onDelete={() => deleteSong(song.id)}
                />
              ))}
            </ScrollView>
          )
        )}

        {segment === 'Line Dances' && (
          <ComingSoon
            icon="walk-outline"
            title="Line Dances"
            message="Coming in a future phase — track line dance routines separately from partner moves."
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: C.bg,
  },
  segmentWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 20,
    paddingTop: 4,
    paddingBottom: 32,
  },
  fullEmpty: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: C.textPrimary,
    marginTop: 8,
  },
  emptyBody: {
    fontSize: 15,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtn: {
    backgroundColor: C.accent,
    borderRadius: RADIUS.card,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  emptyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textPrimary,
  },
});
