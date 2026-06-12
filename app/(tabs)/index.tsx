import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMoves } from '@/hooks/useMoves';
import { useSongs } from '@/hooks/useSongs';
import { useLineDances } from '@/hooks/useLineDances';
import { useSortedLineDances } from '@/hooks/useSortedLineDances';
import { useSortedSongs, SongSortKey } from '@/hooks/useSortedSongs';
import { CategorySection } from '@/components/CategorySection';
import { SongCard } from '@/components/SongCard';
import { LineDanceCard } from '@/components/LineDanceCard';
import { LibraryHeader } from '@/components/LibraryHeader';
import { SearchBar } from '@/components/SearchBar';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SortDropdown } from '@/components/SortDropdown';
import { CATEGORIES } from '@/types/Move';
import { SortKey, SortDir } from '@/hooks/useSortedMoves';
import { C, RADIUS } from '@/constants/theme';

const SEGMENTS = ['Moves', 'Line Dances', 'Songs'];
type Segment = 'Moves' | 'Line Dances' | 'Songs';

const SONG_SORT_OPTIONS = [
  { key: 'title', label: 'A–Z' },
  { key: 'artist', label: 'Artist' },
  { key: 'createdAt', label: 'Date added' },
];

export default function LibraryScreen() {
  const router = useRouter();
  const { moves, reload: reloadMoves, deleteMove } = useMoves();
  const { songs, reload: reloadSongs, deleteSong } = useSongs();
  const { lineDances, reload: reloadLineDances, deleteLineDance } = useLineDances();
  const [segment, setSegment] = useState<Segment>('Moves');

  // Songs search + sort
  const [songSearch, setSongSearch] = useState('');
  const [songSortKey, setSongSortKey] = useState<SongSortKey>('createdAt');
  const [songSortDir, setSongSortDir] = useState<SortDir>('desc');

  // Line Dances search + sort
  const [ldSearch, setLdSearch] = useState('');
  const [ldSortKey, setLdSortKey] = useState<SortKey>('createdAt');
  const [ldSortDir, setLdSortDir] = useState<SortDir>('desc');

  useFocusEffect(
    useCallback(() => {
      reloadMoves();
      reloadSongs();
      reloadLineDances();
    }, [reloadMoves, reloadSongs, reloadLineDances])
  );

  const byCategory = useMemo(
    () => Object.fromEntries(CATEGORIES.map((cat) => [cat, moves.filter((m) => m.category === cat)])),
    [moves]
  );

  const filteredSongs = useSortedSongs(songs, songSortKey, songSortDir, songSearch);
  const filteredLineDances = useSortedLineDances(lineDances, ldSortKey, ldSortDir, ldSearch);

  const headerProps = useMemo(() => {
    switch (segment) {
      case 'Songs':
        return { title: 'My Songs', count: songs.length, label: 'song' };
      case 'Line Dances':
        return { title: 'Line Dances', count: lineDances.length, label: 'line dance' };
      default:
        return { title: 'My Moves', count: moves.length, label: 'move' };
    }
  }, [segment, moves.length, songs.length, lineDances.length]);

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
            <FlatList
              data={CATEGORIES}
              keyExtractor={(cat) => cat}
              contentContainerStyle={styles.content}
              renderItem={({ item: cat }) => (
                <CategorySection
                  category={cat}
                  moves={byCategory[cat]}
                  onPressHeader={() =>
                    router.push({ pathname: '/category/[category]', params: { category: cat } })
                  }
                  onPressMove={(id) => router.push({ pathname: '/move/[id]', params: { id } })}
                  onEditMove={(id) => router.push({ pathname: '/edit/[id]', params: { id } })}
                  onDeleteMove={deleteMove}
                />
              )}
            />
          )
        )}

        {segment === 'Songs' && (
          songs.length === 0 ? (
            <View style={styles.fullEmpty}>
              <Ionicons name="musical-notes-outline" size={64} color={C.textSecondary} />
              <Text style={styles.emptyTitle}>No songs yet</Text>
              <Text style={styles.emptyBody}>Search Spotify from the Add tab to save your first song.</Text>
            </View>
          ) : (
            <View style={styles.flex}>
              <SearchBar value={songSearch} onChange={setSongSearch} placeholder="Search songs…" />
              <SortDropdown
                sortKey={songSortKey}
                sortDir={songSortDir}
                options={SONG_SORT_OPTIONS}
                onSort={(key, dir) => {
                  setSongSortKey(key as SongSortKey);
                  setSongSortDir(dir);
                }}
              />
              <FlatList
                data={filteredSongs}
                keyExtractor={(s) => s.id}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item: song }) => (
                  <SongCard
                    song={song}
                    onPress={() => router.push(`/song/${song.id}`)}
                    onEdit={() => router.push(`/edit-song/${song.id}`)}
                    onDelete={() => deleteSong(song.id)}
                  />
                )}
                ListEmptyComponent={
                  <Text style={styles.noResults}>No songs match "{songSearch}"</Text>
                }
              />
            </View>
          )
        )}

        {segment === 'Line Dances' && (
          lineDances.length === 0 ? (
            <View style={styles.fullEmpty}>
              <Ionicons name="walk-outline" size={64} color={C.textSecondary} />
              <Text style={styles.emptyTitle}>No line dances yet</Text>
              <Text style={styles.emptyBody}>Add a routine from the Add tab.</Text>
              <Pressable
                style={({ pressed }) => [styles.emptyBtn, { opacity: pressed ? 0.8 : 1 }]}
                android_ripple={{ color: 'transparent' }}
                onPress={() => router.push({ pathname: '/(tabs)/add', params: { segment: 'Line Dance' } })}
              >
                <Text style={styles.emptyBtnText}>Add your first routine</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.flex}>
              <SearchBar value={ldSearch} onChange={setLdSearch} placeholder="Search line dances…" />
              <SortDropdown
                sortKey={ldSortKey}
                sortDir={ldSortDir}
                onSort={(key, dir) => {
                  setLdSortKey(key as SortKey);
                  setLdSortDir(dir);
                }}
              />
              <FlatList
                data={filteredLineDances}
                keyExtractor={(ld) => ld.id}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item: ld }) => (
                  <LineDanceCard
                    lineDance={ld}
                    onPress={() => router.push(`/line-dance/${ld.id}` as any)}
                    onEdit={() => router.push(`/edit-line-dance/${ld.id}` as any)}
                    onDelete={() => deleteLineDance(ld.id)}
                  />
                )}
                ListEmptyComponent={
                  <Text style={styles.noResults}>No line dances match "{ldSearch}"</Text>
                }
              />
            </View>
          )
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
  content: {
    padding: 20,
    paddingTop: 4,
    paddingBottom: 32,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
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
  noResults: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: 32,
  },
});
