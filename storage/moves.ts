import AsyncStorage from '@react-native-async-storage/async-storage';
import { Move } from '@/types/Move';

const KEY = '@moves';

export async function getAllMoves(): Promise<Move[]> {
  const json = await AsyncStorage.getItem(KEY);
  if (!json) return [];
  const moves: Move[] = JSON.parse(json);
  // Backward compat: moves saved before Phase 2 lack motionData
  return moves.map((m) => ({ ...m, motionData: m.motionData ?? null }));
}

export async function getMove(id: string): Promise<Move | null> {
  const moves = await getAllMoves();
  return moves.find((m) => m.id === id) ?? null;
}

let writeQueue = Promise.resolve();

function enqueue(fn: () => Promise<void>): Promise<void> {
  const next = writeQueue.then(fn, fn);
  writeQueue = next;
  return next;
}

export function saveMove(move: Move): Promise<void> {
  return enqueue(async () => {
    const moves = await getAllMoves();
    const idx = moves.findIndex((m) => m.id === move.id);
    if (idx >= 0) {
      moves[idx] = move;
    } else {
      moves.push(move);
    }
    await AsyncStorage.setItem(KEY, JSON.stringify(moves));
  });
}

export function deleteMoveById(id: string): Promise<void> {
  return enqueue(async () => {
    const moves = await getAllMoves();
    const filtered = moves.filter((m) => m.id !== id);
    await AsyncStorage.setItem(KEY, JSON.stringify(filtered));
  });
}

