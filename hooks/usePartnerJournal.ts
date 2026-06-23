import { useEffect } from 'react';
import { AppState } from 'react-native';
import { SharedMove } from '@/types/Move';
import { Category, Difficulty } from '@/types/Move';
import { useSyncedStorage } from './useSyncedStorage';
import { useAuth } from '@/context/AuthContext';

function fromRow(row: Record<string, unknown>): SharedMove {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as Category,
    difficulty: row.difficulty as Difficulty,
    notes: (row.notes as string) ?? '',
    videoUri: (row.video_uri as string | null) ?? null,
    practiceCount: (row.practice_count as number) ?? 0,
    motionData: (row.motion_data as SharedMove['motionData']) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    syncStatus: 'synced',
    partnerLinkId: row.partner_link_id as string,
    addedByUserId: row.added_by_user_id as string,
    originalMoveId: (row.original_move_id as string | null) ?? null,
  };
}

export function usePartnerJournal(partnerLinkId: string) {
  const { user } = useAuth();

  const toRow = (m: SharedMove): Record<string, unknown> => ({
    id: m.id,
    partner_link_id: m.partnerLinkId,
    added_by_user_id: m.addedByUserId,
    name: m.name,
    category: m.category,
    difficulty: m.difficulty,
    notes: m.notes,
    video_uri: m.videoUri,
    practice_count: m.practiceCount,
    motion_data: m.motionData,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
    original_move_id: m.originalMoveId,
  });

  const storage = useSyncedStorage<SharedMove>({
    storageKey: `@partner-moves-${partnerLinkId}`,
    table: 'partner_moves',
    toRow,
    fromRow,
  });

  // Sync whenever app comes back to the foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') storage.sync();
    });
    return () => sub.remove();
  }, [storage.sync]);

  return { ...storage, currentUserId: user?.id ?? null };
}
