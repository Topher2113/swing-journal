import { Move } from '@/types/Move';
import { Song } from '@/types/Song';
import { LineDance, LineDanceStep } from '@/types/LineDance';

let counter = 0;
const uid = () => `id-${++counter}`;

// offset in seconds — iso(0) < iso(1) < iso(2) makes ordering explicit and readable
export const iso = (offset = 0) =>
  new Date(Date.UTC(2024, 0, 1) + offset * 1000).toISOString();

export function makeMove(overrides: Partial<Move> = {}): Move {
  return {
    id: uid(),
    name: 'Test Move',
    category: 'Footwork',
    difficulty: 'Beginner',
    notes: '',
    videoUri: null,
    practiceCount: 0,
    createdAt: iso(),
    updatedAt: iso(),
    motionData: null,
    syncStatus: 'synced',
    ...overrides,
  };
}

export function makeSong(overrides: Partial<Song> = {}): Song {
  return {
    id: uid(),
    title: 'Test Song',
    artist: 'Test Artist',
    albumArtUrl: null,
    spotifyUrl: null,
    spotifyTrackId: null,
    notes: '',
    createdAt: iso(),
    updatedAt: iso(),
    syncStatus: 'synced',
    ...overrides,
  };
}

export function makeLineDance(overrides: Partial<LineDance> = {}): LineDance {
  return {
    id: uid(),
    name: 'Test Line Dance',
    steps: [],
    difficulty: 'Beginner',
    videoUri: null,
    linkedSongId: null,
    notes: '',
    practiceCount: 0,
    createdAt: iso(),
    updatedAt: iso(),
    syncStatus: 'synced',
    ...overrides,
  };
}

export function makeStep(order: number): LineDanceStep {
  return { order, name: `Step ${order}`, description: '' };
}
