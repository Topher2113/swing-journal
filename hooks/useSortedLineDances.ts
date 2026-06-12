import { useMemo } from 'react';
import { LineDance } from '@/types/LineDance';
import { DIFFICULTY_ORDER } from '@/types/Move';
import { SortKey, SortDir } from '@/hooks/useSortedMoves';

export function useSortedLineDances(
  lineDances: LineDance[],
  sortKey: SortKey,
  sortDir: SortDir,
  search: string
): LineDance[] {
  return useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q ? lineDances.filter((ld) => ld.name.toLowerCase().includes(q)) : lineDances;

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
  }, [lineDances, sortKey, sortDir, search]);
}
