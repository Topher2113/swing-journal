import { useMemo } from 'react';
import { useSongs } from './useSongs';

export function useSong(id: string) {
  const { songs, loading, updateSong, deleteSong, ...rest } = useSongs();
  const song = useMemo(() => songs.find((s) => s.id === id) ?? null, [songs, id]);
  return { song, songs, loading, updateSong, deleteSong, ...rest };
}
