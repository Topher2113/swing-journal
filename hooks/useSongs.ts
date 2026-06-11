import { useCallback } from 'react';
import * as Crypto from 'expo-crypto';
import { useSyncedStorage } from './useSyncedStorage';
import { Song } from '@/types/Song';

const STORAGE_KEY = '@songs';
const TABLE = 'songs';

function toRow(song: Song): Record<string, unknown> {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    album_art_url: song.albumArtUrl,
    spotify_url: song.spotifyUrl,
    spotify_track_id: song.spotifyTrackId,
    notes: song.notes,
    created_at: song.createdAt,
    updated_at: song.updatedAt,
  };
}

function fromRow(row: Record<string, unknown>): Song {
  return {
    id: row.id as string,
    title: row.title as string,
    artist: row.artist as string,
    albumArtUrl: (row.album_art_url as string | null) ?? null,
    spotifyUrl: (row.spotify_url as string | null) ?? null,
    spotifyTrackId: (row.spotify_track_id as string | null) ?? null,
    notes: (row.notes as string) ?? '',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    syncStatus: 'synced',
  };
}

export function useSongs() {
  const { items, loading, syncing, upsertLocal, removeLocal, sync, reload } =
    useSyncedStorage<Song>({ storageKey: STORAGE_KEY, table: TABLE, toRow, fromRow });

  const addSong = useCallback(async (
    fields: Omit<Song, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>
  ): Promise<Song> => {
    const now = new Date().toISOString();
    return upsertLocal({
      ...fields,
      id: Crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    });
  }, [upsertLocal]);

  const updateSong = useCallback(async (song: Song): Promise<void> => {
    await upsertLocal(song);
  }, [upsertLocal]);

  const deleteSong = useCallback(async (id: string): Promise<void> => {
    await removeLocal(id);
  }, [removeLocal]);

  return { songs: items, loading, syncing, addSong, updateSong, deleteSong, sync, reload };
}
