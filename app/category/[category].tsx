import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMoves } from '@/hooks/useMoves';
import { useSortedMoves, SortKey, SortDir } from '@/hooks/useSortedMoves';
import { MoveCard } from '@/components/MoveCard';
import { SortDropdown } from '@/components/SortDropdown';
import { EmptyState } from '@/components/EmptyState';
import { CategoryHeaderTitle } from '@/components/CategoryHeaderTitle';
import { C, RADIUS } from '@/constants/theme';

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

  const handleSort = (key: SortKey, dir: SortDir) => {
    setSortKey(key);
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
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={C.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={`Search ${category}…`}
            placeholderTextColor={C.textSecondary}
            returnKeyType="search"
          />
        </View>

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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: RADIUS.control,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.textPrimary,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
});
