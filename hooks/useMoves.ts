import { useCallback, useEffect, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { Move } from '@/types/Move';
import { getAllMoves, saveMove, deleteMoveById } from '@/storage/moves';

export function useMoves() {
  const [moves, setMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await getAllMoves();
    setMoves(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const addMove = useCallback(async (
    fields: Omit<Move, 'id' | 'practiceCount' | 'createdAt'>
  ): Promise<Move> => {
    const move: Move = {
      ...fields,
      id: Crypto.randomUUID(),
      practiceCount: 0,
      createdAt: new Date().toISOString(),
    };
    await saveMove(move);
    setMoves((prev) => [...prev, move]);
    return move;
  }, []);

  const updateMove = useCallback(async (move: Move): Promise<void> => {
    await saveMove(move);
    setMoves((prev) => prev.map((m) => (m.id === move.id ? move : m)));
  }, []);

  const deleteMove = useCallback(async (id: string): Promise<void> => {
    await deleteMoveById(id);
    setMoves((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { moves, loading, reload, addMove, updateMove, deleteMove };
}
