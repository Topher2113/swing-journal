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

// Shared across all hook instances for the same table so that sync() on one
// instance cannot re-add a row that another instance is in the middle of deleting.
const pendingDeletionsByTable = new Map<string, Set<string>>();
function getPendingDeletions(table: string): Set<string> {
    if (!pendingDeletionsByTable.has(table)) pendingDeletionsByTable.set(table, new Set());
    return pendingDeletionsByTable.get(table)!;
}

export function useSyncedStorage<T extends SyncableEntity>(config: SyncedStorageConfig<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const itemsRef = useRef<T[]>([]);
  const mountedRef = useRef(true);
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => () => { mountedRef.current = false; }, []);

  const setItemsBoth = useCallback((next: T[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const loadLocal = useCallback(async () => {
    const json = await AsyncStorage.getItem(configRef.current.storageKey);
    setItemsBoth(json ? JSON.parse(json) : []);
    setLoading(false);
  }, [setItemsBoth]);

  // Re-run whenever the storageKey changes (e.g. partnerLinkId goes from '' to a real ID)
  useEffect(() => {
    setLoading(true);
    loadLocal();
  }, [loadLocal, config.storageKey]);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const cfg = configRef.current;
      const local = itemsRef.current;
      const pending = local.filter((i) => i.syncStatus === 'pending');
      for (const item of pending) {
        const { error: upsertError } = await supabase.from(cfg.table).upsert(cfg.toRow(item));
        if (upsertError) throw upsertError;
      }

      const { data: remoteRows, error } = await supabase.from(cfg.table).select('*');
      if (error) throw error;
      const dels = getPendingDeletions(cfg.table);
      const remote = (remoteRows ?? []).map(cfg.fromRow).filter((r) => !dels.has(r.id));

      const merged = mergeByUpdatedAt(itemsRef.current, remote, pending);
      if (!mountedRef.current) return;
      setItemsBoth(merged);
      await AsyncStorage.setItem(cfg.storageKey, JSON.stringify(merged));
    } catch {
      // offline or Supabase unreachable — local data stays source of truth, retried on next sync
    } finally {
      if (mountedRef.current) setSyncing(false);
    }
  }, [setItemsBoth]);

  const upsertLocal = useCallback(async (item: T) => {
    const next = { ...item, updatedAt: new Date().toISOString(), syncStatus: 'pending' as const };
    const prev = itemsRef.current;
    const idx = prev.findIndex((i) => i.id === next.id);
    const updated = idx >= 0 ? prev.map((i) => (i.id === next.id ? next : i)) : [...prev, next];
    setItemsBoth(updated);
    await AsyncStorage.setItem(configRef.current.storageKey, JSON.stringify(updated));
    sync();
    return next;
  }, [setItemsBoth, sync]);

  const removeLocal = useCallback(async (id: string) => {
    const dels = getPendingDeletions(configRef.current.table);
    dels.add(id);
    const updated = itemsRef.current.filter((i) => i.id !== id);
    setItemsBoth(updated);
    await AsyncStorage.setItem(configRef.current.storageKey, JSON.stringify(updated));
    await supabase.from(configRef.current.table).delete().eq('id', id);
    dels.delete(id);
  }, [setItemsBoth]);

  return { items, loading, syncing, upsertLocal, removeLocal, sync, reload: loadLocal };
}

// Items just pushed in this sync pass keep their local version even if the
// immediately-following select returns a stale (pre-write) remote row.
// Items absent from remote that were already synced are treated as remotely deleted and dropped.
export function mergeByUpdatedAt<T extends SyncableEntity>(local: T[], remote: T[], justPushed: T[]): T[] {
  // Capture which local IDs are still pending BEFORE we overwrite syncStatus below.
  const pendingIds = new Set(local.filter((i) => i.syncStatus === 'pending').map((i) => i.id));

  const byId = new Map<string, T>();
  for (const item of local) byId.set(item.id, { ...item, syncStatus: 'synced' as const });

  const justPushedIds = new Set(justPushed.map((i) => i.id));
  const remoteIds = new Set(remote.map((r) => r.id));

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

  // Drop items that have been deleted on the server.
  // Keep an item if: it exists in remote, it was just pushed (may not appear in remote yet),
  // or it is still pending locally (not yet pushed at all).
  for (const id of byId.keys()) {
    if (!remoteIds.has(id) && !justPushedIds.has(id) && !pendingIds.has(id)) {
      byId.delete(id);
    }
  }

  return Array.from(byId.values());
}
