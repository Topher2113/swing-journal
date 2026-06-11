import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export type SyncableEntity = {
  id: string;
  updatedAt: string;
  syncStatus?: 'pending' | 'synced';
};

export type SyncedStorageConfig<T extends SyncableEntity> = {
  storageKey: string;
  table: string;
  toRow: (item: T) => Record<string, unknown>;
  fromRow: (row: Record<string, unknown>) => T;
};

export function useSyncedStorage<T extends SyncableEntity>(config: SyncedStorageConfig<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const itemsRef = useRef<T[]>([]);

  const setItemsBoth = useCallback((next: T[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const loadLocal = useCallback(async () => {
    const json = await AsyncStorage.getItem(config.storageKey);
    setItemsBoth(json ? JSON.parse(json) : []);
    setLoading(false);
  }, [config.storageKey, setItemsBoth]);

  useEffect(() => {
    loadLocal();
  }, [loadLocal]);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const local = itemsRef.current;
      const pending = local.filter((i) => i.syncStatus === 'pending');
      for (const item of pending) {
        await supabase.from(config.table).upsert(config.toRow(item));
      }

      const { data: remoteRows, error } = await supabase.from(config.table).select('*');
      if (error) throw error;
      const remote = (remoteRows ?? []).map(config.fromRow);

      const merged = mergeByUpdatedAt(itemsRef.current, remote, pending);
      setItemsBoth(merged);
      await AsyncStorage.setItem(config.storageKey, JSON.stringify(merged));
    } catch {
      // offline or Supabase unreachable - local data stays source of truth, retried on next sync
    } finally {
      setSyncing(false);
    }
  }, [config, setItemsBoth]);

  const upsertLocal = useCallback(async (item: T) => {
    const next = { ...item, updatedAt: new Date().toISOString(), syncStatus: 'pending' as const };
    const prev = itemsRef.current;
    const idx = prev.findIndex((i) => i.id === next.id);
    const updated = idx >= 0 ? prev.map((i) => (i.id === next.id ? next : i)) : [...prev, next];
    setItemsBoth(updated);
    await AsyncStorage.setItem(config.storageKey, JSON.stringify(updated));
    sync();
    return next;
  }, [config.storageKey, setItemsBoth, sync]);

  const removeLocal = useCallback(async (id: string) => {
    const updated = itemsRef.current.filter((i) => i.id !== id);
    setItemsBoth(updated);
    await AsyncStorage.setItem(config.storageKey, JSON.stringify(updated));
    supabase.from(config.table).delete().eq('id', id).then(() => {});
  }, [config.storageKey, config.table, setItemsBoth]);

  return { items, loading, syncing, upsertLocal, removeLocal, sync, reload: loadLocal };
}

// Items just pushed in this sync pass keep their local version even if the
// immediately-following select returns a stale (pre-write) remote row.
function mergeByUpdatedAt<T extends SyncableEntity>(local: T[], remote: T[], justPushed: T[]): T[] {
  const byId = new Map<string, T>();
  for (const item of local) byId.set(item.id, { ...item, syncStatus: 'synced' as const });

  const justPushedIds = new Set(justPushed.map((i) => i.id));
  for (const r of remote) {
    if (justPushedIds.has(r.id)) continue;
    const existing = byId.get(r.id);
    if (!existing || new Date(r.updatedAt) > new Date(existing.updatedAt)) {
      byId.set(r.id, { ...r, syncStatus: 'synced' as const });
    }
  }

  for (const id of justPushedIds) {
    const item = byId.get(id);
    if (item) byId.set(id, { ...item, syncStatus: 'synced' as const });
  }

  return Array.from(byId.values());
}
