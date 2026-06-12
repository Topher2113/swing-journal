import { useCallback } from 'react';
import * as Crypto from 'expo-crypto';
import { useSyncedStorage } from './useSyncedStorage';
import { LineDance, LineDanceStep } from '@/types/LineDance';
import { Difficulty } from '@/types/Move';

const STORAGE_KEY = '@line_dances';
const TABLE = 'line_dances';

function toRow(ld: LineDance): Record<string, unknown> {
  return {
    id: ld.id,
    name: ld.name,
    steps: ld.steps,
    difficulty: ld.difficulty,
    video_uri: ld.videoUri,
    linked_song_id: ld.linkedSongId,
    notes: ld.notes,
    practice_count: ld.practiceCount,
    created_at: ld.createdAt,
    updated_at: ld.updatedAt,
  };
}

function fromRow(row: Record<string, unknown>): LineDance {
  return {
    id: row.id as string,
    name: row.name as string,
    steps: (row.steps as LineDanceStep[]) ?? [],
    difficulty: row.difficulty as Difficulty,
    videoUri: (row.video_uri as string | null) ?? null,
    linkedSongId: (row.linked_song_id as string | null) ?? null,
    notes: (row.notes as string) ?? '',
    practiceCount: (row.practice_count as number) ?? 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    syncStatus: 'synced',
  };
}

export function useLineDances() {
  const { items, loading, syncing, upsertLocal, removeLocal, sync, reload } =
    useSyncedStorage<LineDance>({ storageKey: STORAGE_KEY, table: TABLE, toRow, fromRow });

  const addLineDance = useCallback(async (
    fields: Omit<LineDance, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>
  ): Promise<LineDance> => {
    const now = new Date().toISOString();
    return upsertLocal({
      ...fields,
      id: Crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    });
  }, [upsertLocal]);

  const updateLineDance = useCallback(async (ld: LineDance): Promise<void> => {
    await upsertLocal(ld);
  }, [upsertLocal]);

  const deleteLineDance = useCallback(async (id: string): Promise<void> => {
    await removeLocal(id);
  }, [removeLocal]);

  return { lineDances: items, loading, syncing, addLineDance, updateLineDance, deleteLineDance, sync, reload };
}
