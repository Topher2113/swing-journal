import { useMemo } from 'react';
import { Move, CATEGORIES, DIFFICULTIES, Category, Difficulty } from '@/types/Move';

type CategoryStat = { category: Category; count: number };
type DifficultyStat = { difficulty: Difficulty; count: number };

export function useStats(moves: Move[]) {
  return useMemo(() => {
    const totalMoves = moves.length;
    const totalPractices = moves.reduce((sum, m) => sum + m.practiceCount, 0);

    const byCategory: CategoryStat[] = CATEGORIES.map((cat) => ({
      category: cat,
      count: moves.filter((m) => m.category === cat).length,
    }));

    const maxCategoryCount = Math.max(...byCategory.map((c) => c.count), 1);

    const byDifficulty: DifficultyStat[] = DIFFICULTIES.map((diff) => ({
      difficulty: diff,
      count: moves.filter((m) => m.difficulty === diff).length,
    }));

    return { totalMoves, totalPractices, byCategory, byDifficulty, maxCategoryCount };
  }, [moves]);
}
