import { useCallback } from 'react';
import * as Crypto from 'expo-crypto';
import { Move, Category, Difficulty } from '@/types/Move';
import { useSyncedStorage } from './useSyncedStorage';
import { useAuth } from '@/context/AuthContext';
import { uploadVideo, isLocalUri } from '@/lib/videoStorage';

function fromRow(row: Record<string, unknown>): Move {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as Category,
    difficulty: row.difficulty as Difficulty,
    notes: (row.notes as string) ?? '',
    videoUri: (row.video_uri as string | null) ?? null,
    practiceCount: (row.practice_count as number) ?? 0,
    motionData: (row.motion_data as Move['motionData']) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    syncStatus: 'synced',
  };
}

export function useMoves() {
  const { user } = useAuth();

  const toRow = (m: Move): Record<string, unknown> => ({
    id: m.id,
    user_id: user!.id,
    name: m.name,
    category: m.category,
    difficulty: m.difficulty,
    notes: m.notes,
    video_uri: m.videoUri,
    practice_count: m.practiceCount,
    motion_data: m.motionData,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
  });

  const { items, loading, syncing, upsertLocal, removeLocal, sync, reload } =
    useSyncedStorage<Move>({ storageKey: '@moves', table: 'moves', toRow, fromRow });

  const addMove = useCallback(async (
    fields: Omit<Move, 'id' | 'practiceCount' | 'createdAt' | 'updatedAt' | 'syncStatus'>
  ): Promise<Move> => {
    const now = new Date().toISOString();
    const move = await upsertLocal({
      ...fields,
      id: Crypto.randomUUID(),
      practiceCount: 0,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    });

    // Background upload: save returns immediately with the local URI, then
    // we replace it with the public cloud URL once the upload finishes.
    if (move.videoUri && isLocalUri(move.videoUri) && user) {
      uploadVideo(move.videoUri, user.id).then((publicUrl) => {
        if (publicUrl) {
          upsertLocal({
            ...move,
            videoUri: publicUrl,
            updatedAt: new Date().toISOString(),
            syncStatus: 'pending',
          });
        }
      }).catch(() => {});
    }

    return move;
  }, [upsertLocal, user]);

  const updateMove = useCallback(async (move: Move): Promise<void> => {
    await upsertLocal(move);

    // Background upload if the video was changed to a new local file
    if (move.videoUri && isLocalUri(move.videoUri) && user) {
      uploadVideo(move.videoUri, user.id).then((publicUrl) => {
        if (publicUrl) {
          upsertLocal({
            ...move,
            videoUri: publicUrl,
            updatedAt: new Date().toISOString(),
            syncStatus: 'pending',
          });
        }
      }).catch(() => {});
    }
  }, [upsertLocal, user]);

  const deleteMove = useCallback(async (id: string): Promise<void> => {
    await removeLocal(id);
  }, [removeLocal]);

  return { moves: items, loading, syncing, reload, addMove, updateMove, deleteMove, sync };
}
