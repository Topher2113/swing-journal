import { useMemo } from 'react';
import { Move, DIFFICULTY_ORDER } from '@/types/Move';

export type SortKey = 'name' | 'difficulty' | 'practiceCount' | 'createdAt';
export type SortDir = 'asc' | 'desc';

export function useSortedMoves(
  moves: Move[],
  sortKey: SortKey,
  sortDir: SortDir,
  search: string
): Move[] {
  return useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q ? moves.filter((m) => m.name.toLowerCase().includes(q)) : moves;

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === 'difficulty') {
        cmp = DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
      } else if (sortKey === 'practiceCount') {
        cmp = a.practiceCount - b.practiceCount;
      } else {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [moves, sortKey, sortDir, search]);
}
