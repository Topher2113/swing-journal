import { useMemo } from 'react';
import { Song } from '@/types/Song';
import { SortDir } from '@/hooks/useSortedMoves';

export type SongSortKey = 'title' | 'artist' | 'createdAt';

export function useSortedSongs(
  songs: Song[],
  sortKey: SongSortKey,
  sortDir: SortDir,
  search: string
): Song[] {
  return useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? songs.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.artist.toLowerCase().includes(q)
        )
      : songs;

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'title') {
        cmp = a.title.localeCompare(b.title);
      } else if (sortKey === 'artist') {
        cmp = a.artist.localeCompare(b.artist);
      } else {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [songs, sortKey, sortDir, search]);
}
