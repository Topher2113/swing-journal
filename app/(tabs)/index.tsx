import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useMoves } from '@/hooks/useMoves';
import { CategorySection } from '@/components/CategorySection';
import { CATEGORIES } from '@/types/Move';
import { C } from '@/constants/theme';

function MovesHeader({ count }: { count: number }) {
  return (
    <View style={styles.headerTitle}>
      <Text style={styles.title}>My Moves</Text>
      <Text style={styles.subtitle}>{count} move{count !== 1 ? 's' : ''} logged</Text>
    </View>
  );
}

export default function MovesScreen() {
  const router = useRouter();
  const { moves, reload, deleteMove } = useMoves();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => <MovesHeader count={moves.length} />,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {CATEGORIES.map((cat) => (
          <CategorySection
            key={cat}
            category={cat}
            moves={moves.filter((m) => m.category === cat)}
            onPressHeader={() =>
              router.push({
                pathname: '/category/[category]',
                params: { category: cat },
              })
            }
            onPressMove={(id) =>
              router.push({ pathname: '/move/[id]', params: { id } })
            }
            onEditMove={(id) =>
              router.push({ pathname: '/edit/[id]', params: { id } })
            }
            onDeleteMove={(id) => deleteMove(id)}
          />
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerTitle: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: C.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 1,
  },
});
