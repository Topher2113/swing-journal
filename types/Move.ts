export type Category = 'Footwork' | 'Spins & Turns' | 'Dips & Drops' | 'Lifts & Tricks';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type Move = {
  id: string;
  name: string;
  category: Category;
  difficulty: Difficulty;
  notes: string;
  videoUri: string | null;
  practiceCount: number;
  createdAt: string;
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

export const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
};
