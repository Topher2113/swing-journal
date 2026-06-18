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

