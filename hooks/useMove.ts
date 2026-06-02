import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Move } from '@/types/Move';
import { getMove } from '@/storage/moves';

export function useMove(id: string) {
  const [move, setMove] = useState<Move | null>(null);

  useFocusEffect(
    useCallback(() => {
      getMove(id).then(setMove);
    }, [id])
  );

  return { move, setMove };
}
