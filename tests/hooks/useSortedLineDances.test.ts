import { renderHook } from '@testing-library/react-native';
import { useSortedLineDances } from '@/hooks/useSortedLineDances';
import { makeLineDance, iso } from '../helpers/factories';

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
