import { SyncStatus } from './Song';

export type Category = 'Footwork' | 'Spins & Turns' | 'Dips & Drops' | 'Lifts & Tricks';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type MotionFrame = {
  t: number;      // ms since recording started
  alpha: number;  // yaw, 0–360°
  beta: number;   // pitch, −180–180°
  gamma: number;  // roll, −90–90°
};

export type Move = {
  id: string;
  name: string;
  category: Category;
  difficulty: Difficulty;
  notes: string;
  videoUri: string | null;
  practiceCount: number;
  createdAt: string;
  updatedAt: string;
  motionData: MotionFrame[] | null;
  syncStatus: SyncStatus;
};

export type SharedMove = Move & {
  partnerLinkId: string;
  addedByUserId: string;
  originalMoveId: string | null;
};

export const CATEGORIES: Category[] = [
  'Footwork',
  'Spins & Turns',
  'Dips & Drops',
  'Lifts & Tricks',
];

export const DIFFICULTIES: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

export const CATEGORY_SHORT: Record<Category, string> = {
  'Footwork': 'Footwork',
  'Spins & Turns': 'Spins',
  'Dips & Drops': 'Dips',
  'Lifts & Tricks': 'Lifts',
};

export const CATEGORY_LABELS = CATEGORIES.map((c) => CATEGORY_SHORT[c]);

export const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
};
