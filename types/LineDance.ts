import { Difficulty } from './Move';
import { SyncStatus } from './Song';

export type LineDanceStep = {
  order: number;
  name: string;
  description: string;
};

export type LineDance = {
  id: string;
  name: string;
  steps: LineDanceStep[];
  difficulty: Difficulty;
  videoUri: string | null;
  linkedSongId: string | null;
  notes: string;
  practiceCount: number;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
};
