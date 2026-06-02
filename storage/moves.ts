import AsyncStorage from '@react-native-async-storage/async-storage';
import { Move } from '@/types/Move';

const KEY = '@moves';

export async function getAllMoves(): Promise<Move[]> {
  const json = await AsyncStorage.getItem(KEY);
  return json ? JSON.parse(json) : [];
}

export async function getMove(id: string): Promise<Move | null> {
  const moves = await getAllMoves();
  return moves.find((m) => m.id === id) ?? null;
}

export async function saveMove(move: Move): Promise<void> {
  const moves = await getAllMoves();
  const index = moves.findIndex((m) => m.id === move.id);
  if (index >= 0) {
    moves[index] = move;
  } else {
    moves.push(move);
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(moves));
}

export async function deleteMoveById(id: string): Promise<void> {
  const moves = await getAllMoves();
  await AsyncStorage.setItem(KEY, JSON.stringify(moves.filter((m) => m.id !== id)));
}
