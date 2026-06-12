import { mergeByUpdatedAt } from '@/hooks/useSyncedStorage';
import { iso } from '../helpers/factories';

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
