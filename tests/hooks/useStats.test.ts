import { renderHook } from '@testing-library/react-native';
import { useStats } from '@/hooks/useStats';
import { CATEGORIES, DIFFICULTIES } from '@/types/Move';
import { makeMove, makeLineDance, makeSong, makeStep } from '../helpers/factories';

describe('useStats', () => {
  describe('empty data', () => {
    it('returns 0 for all numeric totals when all inputs are empty arrays', async () => {
      const { result } = await renderHook(() => useStats([], [], []));

      expect(result.current.totalMoves).toBe(0);
      expect(result.current.totalPractices).toBe(0);
      expect(result.current.totalLineDances).toBe(0);
      expect(result.current.totalLineDancePractices).toBe(0);
      expect(result.current.totalSteps).toBe(0);
      expect(result.current.totalSongs).toBe(0);
    });

    it('maxCategoryCount is 1 when there are no moves', async () => {
      const { result } = await renderHook(() => useStats([], [], []));

      expect(result.current.maxCategoryCount).toBe(1);
    });

    it('byCategory contains exactly 4 entries matching CATEGORIES, all with count 0', async () => {
      const { result } = await renderHook(() => useStats([], [], []));

      expect(result.current.byCategory.map((c) => c.category)).toEqual(CATEGORIES);
      expect(result.current.byCategory.every((c) => c.count === 0)).toBe(true);
    });

    it('byDifficulty contains exactly 3 entries matching DIFFICULTIES, all with count 0', async () => {
      const { result } = await renderHook(() => useStats([], [], []));

      expect(result.current.byDifficulty.map((d) => d.difficulty)).toEqual(DIFFICULTIES);
      expect(result.current.byDifficulty.every((d) => d.count === 0)).toBe(true);
    });
  });

  describe('move totals', () => {
    it('totalMoves equals the length of the moves array', async () => {
      const moves = [makeMove(), makeMove(), makeMove()];

      const { result } = await renderHook(() => useStats(moves));

      expect(result.current.totalMoves).toBe(3);
    });

    it('totalPractices equals the sum of practiceCount across all moves', async () => {
      const moves = [
        makeMove({ practiceCount: 5 }),
        makeMove({ practiceCount: 3 }),
        makeMove({ practiceCount: 7 }),
      ];

      const { result } = await renderHook(() => useStats(moves));

      expect(result.current.totalPractices).toBe(15);
    });
  });

  describe('byCategory', () => {
    it('each category count reflects only moves in that category', async () => {
      const moves = [
        makeMove({ category: 'Footwork' }),
        makeMove({ category: 'Footwork' }),
        makeMove({ category: 'Spins & Turns' }),
      ];

      const { result } = await renderHook(() => useStats(moves));

      const footwork = result.current.byCategory.find((c) => c.category === 'Footwork');
      const spins = result.current.byCategory.find((c) => c.category === 'Spins & Turns');
      const dips = result.current.byCategory.find((c) => c.category === 'Dips & Drops');

      expect(footwork?.count).toBe(2);
      expect(spins?.count).toBe(1);
      expect(dips?.count).toBe(0);
    });
  });

  describe('byDifficulty', () => {
    it('each difficulty count reflects only moves at that difficulty', async () => {
      const moves = [
        makeMove({ difficulty: 'Beginner' }),
        makeMove({ difficulty: 'Beginner' }),
        makeMove({ difficulty: 'Advanced' }),
      ];

      const { result } = await renderHook(() => useStats(moves));

      const beginner = result.current.byDifficulty.find((d) => d.difficulty === 'Beginner');
      const intermediate = result.current.byDifficulty.find((d) => d.difficulty === 'Intermediate');
      const advanced = result.current.byDifficulty.find((d) => d.difficulty === 'Advanced');

      expect(beginner?.count).toBe(2);
      expect(intermediate?.count).toBe(0);
      expect(advanced?.count).toBe(1);
    });
  });

  describe('maxCategoryCount', () => {
    it('equals the highest individual category count', async () => {
      const moves = [
        makeMove({ category: 'Footwork' }),
        makeMove({ category: 'Footwork' }),
        makeMove({ category: 'Footwork' }),
        makeMove({ category: 'Spins & Turns' }),
      ];

      const { result } = await renderHook(() => useStats(moves));

      expect(result.current.maxCategoryCount).toBe(3);
    });

    it('is at least 1 even when all category counts are zero', async () => {
      const { result } = await renderHook(() => useStats([]));

      expect(result.current.maxCategoryCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('line dance stats', () => {
    it('totalLineDances equals the number of line dances passed', async () => {
      const lineDances = [makeLineDance(), makeLineDance()];

      const { result } = await renderHook(() => useStats([], lineDances));

      expect(result.current.totalLineDances).toBe(2);
    });

    it('totalLineDancePractices is the sum of practiceCount across all line dances', async () => {
      const lineDances = [
        makeLineDance({ practiceCount: 4 }),
        makeLineDance({ practiceCount: 6 }),
      ];

      const { result } = await renderHook(() => useStats([], lineDances));

      expect(result.current.totalLineDancePractices).toBe(10);
    });

    it('totalSteps is the sum of steps.length across all line dances', async () => {
      const lineDances = [
        makeLineDance({ steps: [makeStep(1), makeStep(2), makeStep(3)] }),
        makeLineDance({ steps: [makeStep(1), makeStep(2)] }),
      ];

      const { result } = await renderHook(() => useStats([], lineDances));

      expect(result.current.totalSteps).toBe(5);
    });

    it('ldByDifficulty counts line dances by difficulty correctly', async () => {
      const lineDances = [
        makeLineDance({ difficulty: 'Intermediate' }),
        makeLineDance({ difficulty: 'Intermediate' }),
        makeLineDance({ difficulty: 'Advanced' }),
      ];

      const { result } = await renderHook(() => useStats([], lineDances));

      const intermediate = result.current.ldByDifficulty.find((d) => d.difficulty === 'Intermediate');
      const advanced = result.current.ldByDifficulty.find((d) => d.difficulty === 'Advanced');

      expect(intermediate?.count).toBe(2);
      expect(advanced?.count).toBe(1);
    });
  });

  describe('song stats', () => {
    it('totalSongs equals the number of songs passed', async () => {
      const songs = [makeSong(), makeSong(), makeSong(), makeSong()];

      const { result } = await renderHook(() => useStats([], [], songs));

      expect(result.current.totalSongs).toBe(4);
    });
  });

  describe('optional parameters', () => {
    it('calling useStats(moves) with no lineDances/songs returns 0 for all LD and song fields', async () => {
      const { result } = await renderHook(() => useStats([makeMove()]));

      expect(result.current.totalLineDances).toBe(0);
      expect(result.current.totalLineDancePractices).toBe(0);
      expect(result.current.totalSteps).toBe(0);
      expect(result.current.totalSongs).toBe(0);
    });
  });
});
