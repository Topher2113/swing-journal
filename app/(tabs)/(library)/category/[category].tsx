import { Stack, useLocalSearchParams } from 'expo-router';
import { CategoryHeaderTitle } from '@/components/CategoryHeaderTitle';
import { CategoryMovesList } from '@/components/CategoryMovesList';
import { useMoves } from '@/hooks/useMoves';

export default function LibraryCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const { moves } = useMoves();
  const count = moves.filter((m) => m.category === category).length;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <CategoryHeaderTitle category={category} count={count} />
          ),
        }}
      />
      <CategoryMovesList category={category} />
    </>
  );
}
