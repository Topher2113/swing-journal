import { useMemo } from 'react';
import { Move, CATEGORIES, DIFFICULTIES, Category, Difficulty } from '@/types/Move';
import { LineDance } from '@/types/LineDance';
import { Song } from '@/types/Song';

type CategoryStat = { category: Category; count: number };
type DifficultyStat = { difficulty: Difficulty; count: number };

export function useStats(
  moves: Move[],
  lineDances: LineDance[] = [],
  songs: Song[] = [],
) {
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

    const totalLineDances = lineDances.length;
    const totalLineDancePractices = lineDances.reduce((sum, ld) => sum + ld.practiceCount, 0);
    const totalSteps = lineDances.reduce((sum, ld) => sum + ld.steps.length, 0);
    const totalSongs = songs.length;

    const ldByDifficulty: DifficultyStat[] = DIFFICULTIES.map((diff) => ({
      difficulty: diff,
      count: lineDances.filter((ld) => ld.difficulty === diff).length,
    }));

    return {
      totalMoves,
      totalPractices,
      byCategory,
      byDifficulty,
      maxCategoryCount,
      totalLineDances,
      totalLineDancePractices,
      totalSteps,
      totalSongs,
      ldByDifficulty,
    };
  }, [moves, lineDances, songs]);
}
