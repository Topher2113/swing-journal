import { renderHook } from '@testing-library/react-native';
import { useSortedSongs } from '@/hooks/useSortedSongs';
import { makeSong, iso } from '../helpers/factories';

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
