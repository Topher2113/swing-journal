import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import { Stack, useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMoves } from '@/hooks/useMoves';
import { useSongs } from '@/hooks/useSongs';
import { useLineDances } from '@/hooks/useLineDances';
import { usePartnerLink } from '@/hooks/usePartnerLink';
import { usePartnerJournal } from '@/hooks/usePartnerJournal';
import { useAuth } from '@/context/AuthContext';
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
import { RADIUS } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const SEGMENTS = ['Moves', 'Line Dances', 'Songs'] as const;
type Segment = (typeof SEGMENTS)[number];

const SONG_SORT_OPTIONS = [
  { key: 'title', label: 'A–Z' },
  { key: 'artist', label: 'Artist' },
  { key: 'createdAt', label: 'Date added' },
];

export default function LibraryScreen() {
  const { colors: C } = useTheme();
  const router = useRouter();
  const pagerRef = useRef<PagerView>(null);
  const { segment: segmentParam } = useLocalSearchParams<{ segment?: string }>();
  const { user } = useAuth();
  const { moves, reload: reloadMoves, deleteMove } = useMoves();
  const { songs, reload: reloadSongs, deleteSong } = useSongs();
  const { lineDances, reload: reloadLineDances, deleteLineDance } = useLineDances();
  const { link } = usePartnerLink();
  const { items: journalItems } = usePartnerJournal(link?.id ?? '');
  const [segment, setSegment] = useState<Segment>('Moves');

  useFocusEffect(
    useCallback(() => {
      if (segmentParam === 'Moves' || segmentParam === 'Line Dances' || segmentParam === 'Songs') {
        setSegment(segmentParam);
        pagerRef.current?.setPageWithoutAnimation(SEGMENTS.indexOf(segmentParam));
      }
    }, [segmentParam])
  );

  const handleSegmentChange = useCallback((v: string) => {
    const seg = v as Segment;
    setSegment(seg);
    pagerRef.current?.setPage(SEGMENTS.indexOf(seg));
  }, []);

  const handlePageSelected = useCallback((e: { nativeEvent: { position: number } }) => {
    setSegment(SEGMENTS[e.nativeEvent.position]);
  }, []);

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

  const sharedMoveIds = useMemo(() => {
    if (!link || link.status !== 'linked') return new Set<string>();
    return new Set(
      journalItems
        .filter((m) => m.addedByUserId === user?.id && m.originalMoveId)
        .map((m) => m.originalMoveId as string)
    );
  }, [journalItems, link, user?.id]);

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

  const styles = useMemo(() => StyleSheet.create({
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
    noResults: {
      fontSize: 14,
      color: C.textSecondary,
      textAlign: 'center',
      marginTop: 32,
    },
  }), [C]);

  return (
    <>
      <Stack.Screen options={{ headerTitle: () => <LibraryHeader {...headerProps} /> }} />
      <View style={styles.flex}>
        <View style={styles.segmentWrap}>
          <SegmentedControl options={[...SEGMENTS]} value={segment} onChange={handleSegmentChange} />
        </View>

        <PagerView
          ref={pagerRef}
          style={styles.flex}
          initialPage={0}
          onPageSelected={handlePageSelected}
        >
          {/* Page 0: Moves */}
          <View key="0" style={styles.flex}>
            {moves.length === 0 ? (
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
                    sharedMoveIds={sharedMoveIds}
                  />
                )}
              />
            )}
          </View>

          {/* Page 1: Line Dances */}
          <View key="1" style={styles.flex}>
            {lineDances.length === 0 ? (
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
            )}
          </View>

          {/* Page 2: Songs */}
          <View key="2" style={styles.flex}>
            {songs.length === 0 ? (
              <View style={styles.fullEmpty}>
                <Ionicons name="musical-notes-outline" size={64} color={C.textSecondary} />
                <Text style={styles.emptyTitle}>No songs yet</Text>
                <Text style={styles.emptyBody}>Search Spotify from the Add tab to save your first song.</Text>
                <Pressable
                  style={({ pressed }) => [styles.emptyBtn, { opacity: pressed ? 0.8 : 1 }]}
                  android_ripple={{ color: 'transparent' }}
                  onPress={() => router.push('/(tabs)/add')}
                >
                  <Text style={styles.emptyBtnText}>Add your first song</Text>
                </Pressable>
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
            )}
          </View>
        </PagerView>
      </View>
    </>
  );
}
