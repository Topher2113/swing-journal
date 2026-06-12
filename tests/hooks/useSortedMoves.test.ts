import { renderHook } from '@testing-library/react-native';
import { useSortedMoves } from '@/hooks/useSortedMoves';
import { makeMove, iso } from '../helpers/factories';

describe('useSortedMoves', () => {
  describe('filtering', () => {
    it('returns all moves when search is empty', async () => {
      const moves = [makeMove(), makeMove(), makeMove()];

      const { result } = await renderHook(() => useSortedMoves(moves, 'name', 'asc', ''));

      expect(result.current.length).toBe(3);
    });

    it('returns only moves whose name contains the search string (case-insensitive)', async () => {
      const moves = [
        makeMove({ name: 'Charleston' }),
        makeMove({ name: 'Lindy Hop' }),
        makeMove({ name: 'Charleston Kick' }),
      ];

      const { result } = await renderHook(() => useSortedMoves(moves, 'name', 'asc', 'charlest'));

      expect(result.current.length).toBe(2);
    });

    it('returns empty array when no move name matches search', async () => {
      const moves = [makeMove({ name: 'Spin' }), makeMove({ name: 'Dip' })];

      const { result } = await renderHook(() => useSortedMoves(moves, 'name', 'asc', 'zzz'));

      expect(result.current).toEqual([]);
    });

    it('trims leading and trailing whitespace from search before matching', async () => {
      const moves = [makeMove({ name: 'Spin' }), makeMove({ name: 'Dip' })];

      const { result } = await renderHook(() => useSortedMoves(moves, 'name', 'asc', '  spin  '));

      expect(result.current.length).toBe(1);
    });
  });

  describe('sort by name', () => {
    it('returns moves A→Z when sortDir is asc', async () => {
      const moves = [
        makeMove({ name: 'Zen' }),
        makeMove({ name: 'Anchor' }),
        makeMove({ name: 'Mash' }),
      ];

      const { result } = await renderHook(() => useSortedMoves(moves, 'name', 'asc', ''));

      expect(result.current.map((m) => m.name)).toEqual(['Anchor', 'Mash', 'Zen']);
    });

    it('returns moves Z→A when sortDir is desc', async () => {
      const moves = [
        makeMove({ name: 'Zen' }),
        makeMove({ name: 'Anchor' }),
        makeMove({ name: 'Mash' }),
      ];

      const { result } = await renderHook(() => useSortedMoves(moves, 'name', 'desc', ''));

      expect(result.current.map((m) => m.name)).toEqual(['Zen', 'Mash', 'Anchor']);
    });
  });

  describe('sort by difficulty', () => {
    it('returns Beginner before Intermediate before Advanced when sortDir is asc', async () => {
      const moves = [
        makeMove({ difficulty: 'Advanced' }),
        makeMove({ difficulty: 'Beginner' }),
        makeMove({ difficulty: 'Intermediate' }),
      ];

      const { result } = await renderHook(() => useSortedMoves(moves, 'difficulty', 'asc', ''));

      expect(result.current.map((m) => m.difficulty)).toEqual([
        'Beginner',
        'Intermediate',
        'Advanced',
      ]);
    });

    it('returns Advanced before Intermediate before Beginner when sortDir is desc', async () => {
      const moves = [
        makeMove({ difficulty: 'Beginner' }),
        makeMove({ difficulty: 'Advanced' }),
        makeMove({ difficulty: 'Intermediate' }),
      ];

      const { result } = await renderHook(() => useSortedMoves(moves, 'difficulty', 'desc', ''));

      expect(result.current.map((m) => m.difficulty)).toEqual([
        'Advanced',
        'Intermediate',
        'Beginner',
      ]);
    });
  });

  describe('sort by practiceCount', () => {
    it('returns lowest practiceCount first when sortDir is asc', async () => {
      const moves = [
        makeMove({ practiceCount: 10 }),
        makeMove({ practiceCount: 1 }),
        makeMove({ practiceCount: 5 }),
      ];

      const { result } = await renderHook(() => useSortedMoves(moves, 'practiceCount', 'asc', ''));

      expect(result.current.map((m) => m.practiceCount)).toEqual([1, 5, 10]);
    });

    it('returns highest practiceCount first when sortDir is desc', async () => {
      const moves = [
        makeMove({ practiceCount: 10 }),
        makeMove({ practiceCount: 1 }),
        makeMove({ practiceCount: 5 }),
      ];

      const { result } = await renderHook(() => useSortedMoves(moves, 'practiceCount', 'desc', ''));

      expect(result.current.map((m) => m.practiceCount)).toEqual([10, 5, 1]);
    });
  });

  describe('sort by createdAt', () => {
    it('returns oldest move first when sortDir is asc', async () => {
      const moves = [
        makeMove({ createdAt: iso(2) }),
        makeMove({ createdAt: iso(0) }),
        makeMove({ createdAt: iso(1) }),
      ];

      const { result } = await renderHook(() => useSortedMoves(moves, 'createdAt', 'asc', ''));

      expect(result.current[0].createdAt).toBe(iso(0));
    });

    it('returns newest move first when sortDir is desc', async () => {
      const moves = [
        makeMove({ createdAt: iso(2) }),
        makeMove({ createdAt: iso(0) }),
        makeMove({ createdAt: iso(1) }),
      ];

      const { result } = await renderHook(() => useSortedMoves(moves, 'createdAt', 'desc', ''));

      expect(result.current[0].createdAt).toBe(iso(2));
    });
  });

  describe('immutability', () => {
    it('does not mutate the original input array', async () => {
      const original = [makeMove({ name: 'B' }), makeMove({ name: 'A' })];

      await renderHook(() => useSortedMoves(original, 'name', 'asc', ''));

      expect(original[0].name).toBe('B');
    });
  });
});
