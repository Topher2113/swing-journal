import { useMemo } from 'react';
import { SharedMove } from '@/types/Move';
import { SortDir } from './useSortedMoves';

export const JOURNAL_SORT_OPTIONS = [
  { key: 'createdAt', label: 'Date added' },
  { key: 'name', label: 'A–Z' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'practiceCount', label: 'Practice' },
];

const DIFF_ORDER: Record<string, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 };

export function useSortedSharedMoves(
  items: SharedMove[],
  sortKey: string,
  sortDir: SortDir
): SharedMove[] {
  return useMemo(() => {
    return [...items].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'difficulty':
          cmp = (DIFF_ORDER[a.difficulty] ?? 0) - (DIFF_ORDER[b.difficulty] ?? 0);
          break;
        case 'practiceCount':
          cmp = a.practiceCount - b.practiceCount;
          break;
        case 'createdAt':
        default:
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [items, sortKey, sortDir]);
}
