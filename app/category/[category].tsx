import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useMoves } from '@/hooks/useMoves';
import { useSortedMoves, SortKey, SortDir } from '@/hooks/useSortedMoves';
import { MoveCard } from '@/components/MoveCard';
import { SearchBar } from '@/components/SearchBar';
import { SortDropdown } from '@/components/SortDropdown';
import { EmptyState } from '@/components/EmptyState';
import { CategoryHeaderTitle } from '@/components/CategoryHeaderTitle';
import { C } from '@/constants/theme';

export default function CategoryDetailScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const { moves, reload, deleteMove } = useMoves();

  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const categoryMoves = moves.filter((m) => m.category === category);
  const sorted = useSortedMoves(categoryMoves, sortKey, sortDir, search);

  const handleSort = (key: string, dir: SortDir) => {
    setSortKey(key as SortKey);
    setSortDir(dir);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <CategoryHeaderTitle category={category} count={categoryMoves.length} />
          ),
        }}
      />
      <View style={styles.container}>
        <SearchBar value={search} onChange={setSearch} placeholder={`Search ${category}…`} />

        <SortDropdown sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />

        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <MoveCard
              move={item}
              onPress={() =>
                router.push({ pathname: '/move/[id]', params: { id: item.id } })
              }
              onEdit={() =>
                router.push({ pathname: '/edit/[id]', params: { id: item.id } })
              }
              onDelete={() => deleteMove(item.id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              message={
                search
                  ? `No moves match "${search}"`
                  : `No ${category.toLowerCase()} moves yet`
              }
            />
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
});
