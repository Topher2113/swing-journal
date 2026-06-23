import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook } from '@testing-library/react-native';

import { mergeByUpdatedAt } from '@/hooks/useSyncedStorage';
import { useSortedLineDances } from '@/hooks/useSortedLineDances';
import { useSortedMoves } from '@/hooks/useSortedMoves';
import { useSortedSongs } from '@/hooks/useSortedSongs';
import { useStats } from '@/hooks/useStats';
import { CATEGORIES, DIFFICULTIES } from '@/types/Move';
import { getAllMoves, saveMove, deleteMoveById } from '@/storage/moves';
import { makeMove, makeLineDance, makeSong, makeStep, iso } from './factories';

// ── mergeByUpdatedAt ──────────────────────────────────────────────────────────

type Item = { id: string; updatedAt: string; syncStatus?: 'pending' | 'synced' };

function makeItem(id: string, updatedAt: string, syncStatus: 'pending' | 'synced' = 'pending'): Item {
  return { id, updatedAt, syncStatus };
}

describe('mergeByUpdatedAt', () => {
  describe('empty inputs', () => {
    it('returns empty array when all three inputs are empty', () => {
      const result = mergeByUpdatedAt([], [], []);

      expect(result).toEqual([]);
    });
  });

  describe('local-only items', () => {
    it('includes all local items and marks their syncStatus as synced', () => {
      const local = [makeItem('a', iso(0)), makeItem('b', iso(1))];

      const result = mergeByUpdatedAt(local, [], []);

      expect(result.every((i) => i.syncStatus === 'synced')).toBe(true);
      expect(result.length).toBe(2);
    });
  });

  describe('remote wins when newer', () => {
    it('replaces a local item with the remote version when the remote is newer', () => {
      const local = [makeItem('a', iso(0))];
      const remote = [makeItem('a', iso(5))];

      const result = mergeByUpdatedAt(local, remote, []);

      const item = result.find((i) => i.id === 'a')!;
      expect(item.updatedAt).toBe(iso(5));
    });
  });

  describe('local wins when newer or equal', () => {
    it('keeps the local item when local.updatedAt is newer than the remote', () => {
      const local = [makeItem('a', iso(10))];
      const remote = [makeItem('a', iso(1))];

      const result = mergeByUpdatedAt(local, remote, []);

      const item = result.find((i) => i.id === 'a')!;
      expect(item.updatedAt).toBe(iso(10));
    });

    it('keeps the local item when local.updatedAt equals the remote', () => {
      const local = [makeItem('a', iso(5))];
      const remote = [makeItem('a', iso(5))];

      const result = mergeByUpdatedAt(local, remote, []);

      const item = result.find((i) => i.id === 'a')!;
      expect(item.updatedAt).toBe(iso(5));
    });
  });

  describe('remote-only items', () => {
    it('adds an item that exists only in the remote list', () => {
      const local: Item[] = [];
      const remote = [makeItem('new-remote', iso(0))];

      const result = mergeByUpdatedAt(local, remote, []);

      expect(result.find((i) => i.id === 'new-remote')).toBeDefined();
    });
  });

  describe('justPushed protection', () => {
    it('does not overwrite a just-pushed item even when the remote row for the same id is older', () => {
      const local = [makeItem('a', iso(10))];
      const remote = [makeItem('a', iso(2))];
      const justPushed = [makeItem('a', iso(10))];

      const result = mergeByUpdatedAt(local, remote, justPushed);

      const item = result.find((i) => i.id === 'a')!;
      expect(item.updatedAt).toBe(iso(10));
    });

    it('marks just-pushed items as syncStatus synced', () => {
      const local = [makeItem('a', iso(10), 'pending')];
      const remote: Item[] = [];
      const justPushed = [makeItem('a', iso(10), 'pending')];

      const result = mergeByUpdatedAt(local, remote, justPushed);

      const item = result.find((i) => i.id === 'a')!;
      expect(item.syncStatus).toBe('synced');
    });
  });

  describe('mixed scenario', () => {
    it('correctly resolves local-only, remote-only, remote-newer conflict, and just-pushed in one call', () => {
      const localOnly = makeItem('local-only', iso(0));
      const conflict = makeItem('conflict', iso(1));
      const justPushedItem = makeItem('pushed', iso(5), 'pending');

      const local = [localOnly, conflict, justPushedItem];
      const remote = [
        makeItem('conflict', iso(10)),
        makeItem('remote-only', iso(3)),
        makeItem('pushed', iso(2)),
      ];
      const justPushed = [justPushedItem];

      const result = mergeByUpdatedAt(local, remote, justPushed);

      const resolvedLocal = result.find((i) => i.id === 'local-only')!;
      const resolvedConflict = result.find((i) => i.id === 'conflict')!;
      const resolvedPushed = result.find((i) => i.id === 'pushed')!;
      const resolvedRemoteOnly = result.find((i) => i.id === 'remote-only')!;

      expect(resolvedLocal).toBeDefined();
      expect(resolvedConflict.updatedAt).toBe(iso(10));
      expect(resolvedPushed.updatedAt).toBe(iso(5));
      expect(resolvedRemoteOnly).toBeDefined();
    });
  });
});

// ── useSortedLineDances ───────────────────────────────────────────────────────

describe('useSortedLineDances', () => {
  it('returns all line dances when search is empty', async () => {
    const lineDances = [makeLineDance(), makeLineDance(), makeLineDance()];

    const { result } = await renderHook(() => useSortedLineDances(lineDances, 'name', 'asc', ''));

    expect(result.current.length).toBe(3);
  });

  it('filters by name (case-insensitive)', async () => {
    const lineDances = [
      makeLineDance({ name: 'Boot Scootin Boogie' }),
      makeLineDance({ name: 'Electric Slide' }),
      makeLineDance({ name: 'Boogie Nights' }),
    ];

    const { result } = await renderHook(() => useSortedLineDances(lineDances, 'name', 'asc', 'boogie'));

    expect(result.current.length).toBe(2);
  });

  it('sorts by name ascending', async () => {
    const lineDances = [
      makeLineDance({ name: 'Watermelon Crawl' }),
      makeLineDance({ name: 'Achy Breaky' }),
      makeLineDance({ name: 'Cotton Eye Joe' }),
    ];

    const { result } = await renderHook(() => useSortedLineDances(lineDances, 'name', 'asc', ''));

    expect(result.current.map((ld) => ld.name)).toEqual([
      'Achy Breaky',
      'Cotton Eye Joe',
      'Watermelon Crawl',
    ]);
  });

  it('sorts by name descending', async () => {
    const lineDances = [
      makeLineDance({ name: 'Watermelon Crawl' }),
      makeLineDance({ name: 'Achy Breaky' }),
      makeLineDance({ name: 'Cotton Eye Joe' }),
    ];

    const { result } = await renderHook(() => useSortedLineDances(lineDances, 'name', 'desc', ''));

    expect(result.current[0].name).toBe('Watermelon Crawl');
  });

  it('sorts by difficulty ascending using DIFFICULTY_ORDER (Beginner → Intermediate → Advanced)', async () => {
    const lineDances = [
      makeLineDance({ difficulty: 'Advanced' }),
      makeLineDance({ difficulty: 'Beginner' }),
      makeLineDance({ difficulty: 'Intermediate' }),
    ];

    const { result } = await renderHook(() => useSortedLineDances(lineDances, 'difficulty', 'asc', ''));

    expect(result.current.map((ld) => ld.difficulty)).toEqual([
      'Beginner',
      'Intermediate',
      'Advanced',
    ]);
  });

  it('sorts by practiceCount descending', async () => {
    const lineDances = [
      makeLineDance({ practiceCount: 3 }),
      makeLineDance({ practiceCount: 10 }),
      makeLineDance({ practiceCount: 1 }),
    ];

    const { result } = await renderHook(() => useSortedLineDances(lineDances, 'practiceCount', 'desc', ''));

    expect(result.current.map((ld) => ld.practiceCount)).toEqual([10, 3, 1]);
  });

  it('sorts by createdAt ascending', async () => {
    const lineDances = [
      makeLineDance({ createdAt: iso(2) }),
      makeLineDance({ createdAt: iso(0) }),
      makeLineDance({ createdAt: iso(1) }),
    ];

    const { result } = await renderHook(() => useSortedLineDances(lineDances, 'createdAt', 'asc', ''));

    expect(result.current[0].createdAt).toBe(iso(0));
  });

  it('returns empty array when no name matches the search', async () => {
    const lineDances = [makeLineDance({ name: 'Electric Slide' })];

    const { result } = await renderHook(() => useSortedLineDances(lineDances, 'name', 'asc', 'tango'));

    expect(result.current).toEqual([]);
  });

  it('does not mutate the original input array', async () => {
    const original = [makeLineDance({ name: 'B' }), makeLineDance({ name: 'A' })];

    await renderHook(() => useSortedLineDances(original, 'name', 'asc', ''));

    expect(original[0].name).toBe('B');
  });
});

// ── useSortedMoves ────────────────────────────────────────────────────────────

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

// ── useSortedSongs ────────────────────────────────────────────────────────────

describe('useSortedSongs', () => {
  describe('filtering', () => {
    it('returns all songs when search is empty', async () => {
      const songs = [makeSong(), makeSong(), makeSong()];

      const { result } = await renderHook(() => useSortedSongs(songs, 'title', 'asc', ''));

      expect(result.current.length).toBe(3);
    });

    it('matches songs whose title contains the search term (case-insensitive)', async () => {
      const songs = [
        makeSong({ title: 'Boogie Woogie Bugle Boy', artist: 'Andrews Sisters' }),
        makeSong({ title: 'In The Mood', artist: 'Glenn Miller' }),
      ];

      const { result } = await renderHook(() => useSortedSongs(songs, 'title', 'asc', 'boogie'));

      expect(result.current.length).toBe(1);
      expect(result.current[0].title).toBe('Boogie Woogie Bugle Boy');
    });

    it('matches songs whose artist contains the search term (case-insensitive)', async () => {
      const songs = [
        makeSong({ title: 'Sing Sing Sing', artist: 'Benny Goodman' }),
        makeSong({ title: 'In The Mood', artist: 'Glenn Miller' }),
      ];

      const { result } = await renderHook(() => useSortedSongs(songs, 'title', 'asc', 'miller'));

      expect(result.current.length).toBe(1);
      expect(result.current[0].artist).toBe('Glenn Miller');
    });

    it('returns empty array when neither title nor artist matches', async () => {
      const songs = [makeSong({ title: 'Jazz', artist: 'Artist' })];

      const { result } = await renderHook(() => useSortedSongs(songs, 'title', 'asc', 'classical'));

      expect(result.current).toEqual([]);
    });
  });

  describe('sort by title', () => {
    it('returns songs A→Z when sortDir is asc', async () => {
      const songs = [
        makeSong({ title: 'Zoot Suit Riot' }),
        makeSong({ title: 'At The Hop' }),
        makeSong({ title: 'Minnie The Moocher' }),
      ];

      const { result } = await renderHook(() => useSortedSongs(songs, 'title', 'asc', ''));

      expect(result.current.map((s) => s.title)).toEqual([
        'At The Hop',
        'Minnie The Moocher',
        'Zoot Suit Riot',
      ]);
    });

    it('returns songs Z→A when sortDir is desc', async () => {
      const songs = [
        makeSong({ title: 'Zoot Suit Riot' }),
        makeSong({ title: 'At The Hop' }),
        makeSong({ title: 'Minnie The Moocher' }),
      ];

      const { result } = await renderHook(() => useSortedSongs(songs, 'title', 'desc', ''));

      expect(result.current[0].title).toBe('Zoot Suit Riot');
    });
  });

  describe('sort by artist', () => {
    it('returns songs A→Z by artist when sortDir is asc', async () => {
      const songs = [
        makeSong({ artist: 'Count Basie' }),
        makeSong({ artist: 'Artie Shaw' }),
        makeSong({ artist: 'Duke Ellington' }),
      ];

      const { result } = await renderHook(() => useSortedSongs(songs, 'artist', 'asc', ''));

      expect(result.current.map((s) => s.artist)).toEqual([
        'Artie Shaw',
        'Count Basie',
        'Duke Ellington',
      ]);
    });
  });

  describe('sort by createdAt', () => {
    it('returns oldest song first when sortDir is asc', async () => {
      const songs = [
        makeSong({ createdAt: iso(2) }),
        makeSong({ createdAt: iso(0) }),
        makeSong({ createdAt: iso(1) }),
      ];

      const { result } = await renderHook(() => useSortedSongs(songs, 'createdAt', 'asc', ''));

      expect(result.current[0].createdAt).toBe(iso(0));
    });
  });

  describe('combined filter and sort', () => {
    it('filters by artist then sorts the matching results by title ascending', async () => {
      const songs = [
        makeSong({ title: 'Zebra Blues', artist: 'Count Basie' }),
        makeSong({ title: 'April Jazz', artist: 'Count Basie' }),
        makeSong({ title: 'Something Else', artist: 'Miles Davis' }),
      ];

      const { result } = await renderHook(() => useSortedSongs(songs, 'title', 'asc', 'count basie'));

      expect(result.current.length).toBe(2);
      expect(result.current[0].title).toBe('April Jazz');
      expect(result.current[1].title).toBe('Zebra Blues');
    });
  });
});

// ── useStats ──────────────────────────────────────────────────────────────────

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

// ── moves storage ─────────────────────────────────────────────────────────────

beforeEach(() => AsyncStorage.clear());

describe('getAllMoves', () => {
  it('returns empty array when storage contains no data', async () => {
    const result = await getAllMoves();

    expect(result).toEqual([]);
  });

  it('returns parsed moves when storage has saved data', async () => {
    const move = makeMove({ name: 'Saved Move' });
    await saveMove(move);

    const result = await getAllMoves();

    expect(result.find((m) => m.id === move.id)?.name).toBe('Saved Move');
  });

  it('adds motionData: null to legacy moves that were saved without that field', async () => {
    const legacyMove = makeMove();
    const { motionData: _omit, ...withoutMotionData } = legacyMove;
    await AsyncStorage.setItem('@moves', JSON.stringify([withoutMotionData]));

    const result = await getAllMoves();

    expect(result[0].motionData).toBeNull();
  });

  it('preserves existing motionData when it is already present', async () => {
    const move = makeMove({ motionData: { frames: [1, 2, 3] } as any });
    await saveMove(move);

    const result = await getAllMoves();

    expect(result.find((m) => m.id === move.id)?.motionData).toEqual({ frames: [1, 2, 3] });
  });
});

describe('saveMove', () => {
  it('inserts a new move when no move with that id exists yet', async () => {
    const move = makeMove();

    await saveMove(move);

    const result = await getAllMoves();
    expect(result.length).toBe(1);
  });

  it('updates an existing move without creating a duplicate when the same id is saved again', async () => {
    const move = makeMove({ name: 'Original' });
    await saveMove(move);

    await saveMove({ ...move, name: 'Updated' });

    const result = await getAllMoves();
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Updated');
  });
});

describe('deleteMoveById', () => {
  it('removes the move with the matching id', async () => {
    const move = makeMove();
    await saveMove(move);

    await deleteMoveById(move.id);

    const result = await getAllMoves();
    expect(result.find((m) => m.id === move.id)).toBeUndefined();
  });

  it('leaves all other moves intact after deletion', async () => {
    const keep1 = makeMove({ name: 'Keep 1' });
    const keep2 = makeMove({ name: 'Keep 2' });
    const remove = makeMove({ name: 'Remove Me' });
    await saveMove(keep1);
    await saveMove(keep2);
    await saveMove(remove);

    await deleteMoveById(remove.id);

    const result = await getAllMoves();
    expect(result.length).toBe(2);
  });

  it('does nothing when the given id does not exist', async () => {
    const move = makeMove();
    await saveMove(move);

    await deleteMoveById('non-existent-id');

    const result = await getAllMoves();
    expect(result.length).toBe(1);
  });
});

describe('write queue', () => {
  it('serializes concurrent saves so no write is lost', async () => {
    const moves = [makeMove(), makeMove(), makeMove(), makeMove(), makeMove()];

    await Promise.all(moves.map(saveMove));

    const result = await getAllMoves();
    expect(result.length).toBe(5);
  });
});
