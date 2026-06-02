import AsyncStorage from '@react-native-async-storage/async-storage';
import { Move } from '@/types/Move';

const KEY = '@moves';

// Serialize all writes so concurrent callers never produce a lost update.
let writeQueue: Promise<void> = Promise.resolve();

function enqueue(fn: () => Promise<void>): Promise<void> {
  const next = writeQueue.then(fn);
  writeQueue = next.catch(() => {}); // keep queue alive if a write fails
  return next;
}

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

export async function saveMove(move: Move): Promise<void> {
  return enqueue(async () => {
    const moves = await getAllMoves();
    const index = moves.findIndex((m) => m.id === move.id);
    if (index >= 0) {
      moves[index] = move;
    } else {
      moves.push(move);
    }
    await AsyncStorage.setItem(KEY, JSON.stringify(moves));
  });
}

export async function deleteMoveById(id: string): Promise<void> {
  return enqueue(async () => {
    const moves = await getAllMoves();
    await AsyncStorage.setItem(KEY, JSON.stringify(moves.filter((m) => m.id !== id)));
  });
}
