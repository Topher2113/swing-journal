import { useCallback, useEffect, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { PartnerLink } from '@/types/Auth';

const SECURE_KEY = 'partner_link_id';

function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'SWING-';
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function fromRow(row: Record<string, unknown>): PartnerLink {
  return {
    id: row.id as string,
    userIdA: row.user_id_a as string,
    userIdB: (row.user_id_b as string | null) ?? null,
    userEmailA: row.user_email_a as string,
    userEmailB: (row.user_email_b as string | null) ?? null,
    userNameA: (row.user_name_a as string | null) ?? null,
    userNameB: (row.user_name_b as string | null) ?? null,
    inviteCode: row.invite_code as string,
    status: row.status as 'pending' | 'linked',
    createdAt: row.created_at as string,
  };
}

export function usePartnerLink() {
  const { user, profile } = useAuth();
  const [link, setLink] = useState<PartnerLink | null>(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLink = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('partner_links')
      .select('*')
      .eq('id', id)
      .single();
    if (!error && data) setLink(fromRow(data as Record<string, unknown>));
  }, []);

  useEffect(() => {
    (async () => {
      const storedId = await SecureStore.getItemAsync(SECURE_KEY);
      if (storedId) await fetchLink(storedId);
      setLoading(false);
    })();
  }, [fetchLink]);

  // Poll every 5 seconds while pending so the inviter sees their link activate
  useEffect(() => {
    if (link?.status !== 'pending') {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }
    pollRef.current = setInterval(() => fetchLink(link.id), 5000);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [link?.status, link?.id, fetchLink]);

  const generateInviteCode = useCallback(async () => {
    if (!user) return;
    const code = randomCode();
    const { data, error } = await supabase
      .from('partner_links')
      .insert({
        user_id_a: user.id,
        user_email_a: user.email,
        user_name_a: profile?.name ?? null,
        invite_code: code,
        status: 'pending',
      })
      .select()
      .single();
    if (error) {
      if (error.code === '23505') {
        throw new Error('Could not generate a unique code. Please try again.');
      }
      throw new Error('Could not create an invite code. Check your connection and try again.');
    }
    const newLink = fromRow(data as Record<string, unknown>);
    await SecureStore.setItemAsync(SECURE_KEY, newLink.id);
    setLink(newLink);
  }, [user]);

  const redeemInviteCode = useCallback(async (code: string) => {
    if (!user) return;
    const trimmed = code.trim().toUpperCase();

    // Pre-flight: find the code and validate before committing the update
    const { data: existing } = await supabase
      .from('partner_links')
      .select('id, user_id_a, status')
      .eq('invite_code', trimmed)
      .maybeSingle();

    if (!existing) {
      throw new Error('Invite code not found. Double-check the code and try again.');
    }
    if (existing.user_id_a === user.id) {
      throw new Error("That's your own invite code! Share it with your dance partner instead.");
    }
    if (existing.status !== 'pending') {
      throw new Error('This code has already been used.');
    }

    const { data, error } = await supabase
      .from('partner_links')
      .update({ user_id_b: user.id, user_email_b: user.email, user_name_b: profile?.name ?? null, status: 'linked' })
      .eq('invite_code', trimmed)
      .eq('status', 'pending')
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to join. Please try again.');
    }
    const updated = fromRow(data as Record<string, unknown>);
    await SecureStore.setItemAsync(SECURE_KEY, updated.id);
    setLink(updated);
  }, [user]);

  const cancelInviteCode = useCallback(async () => {
    if (!link) return;
    await supabase.from('partner_links').delete().eq('id', link.id);
    await SecureStore.deleteItemAsync(SECURE_KEY);
    setLink(null);
  }, [link]);

  return { link, loading, generateInviteCode, redeemInviteCode, cancelInviteCode };
}
