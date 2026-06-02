import { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useMoves } from '@/hooks/useMoves';
import { useSortedMoves, SortKey, SortDir } from '@/hooks/useSortedMoves';
import { MoveCard } from '@/components/MoveCard';
import { SortChip } from '@/components/SortChip';
import { EmptyState } from '@/components/EmptyState';
import { Category } from '@/types/Move';
import { C, RADIUS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'A–Z' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'practiceCount', label: 'Practice' },
  { key: 'createdAt', label: 'Date added' },
];

function HeaderTitle({ category, count }: { category: string; count: number }) {
  return (
    <View>
      <Text style={styles.headerTitle}>{category}</Text>
      <Text style={styles.headerSubtitle}>{count} move{count !== 1 ? 's' : ''}</Text>
    </View>
  );
}

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

  const handleChipPress = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <HeaderTitle category={category} count={categoryMoves.length} />
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {SORT_OPTIONS.map(({ key, label }) => (
            <SortChip
              key={key}
              label={label}
              active={sortKey === key}
              direction={sortDir}
              onPress={() => handleChipPress(key)}
            />
          ))}
        </ScrollView>

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
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.textPrimary,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: C.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 1,
  },
});
