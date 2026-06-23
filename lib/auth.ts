import { supabase } from './supabase';

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e: unknown) {
      const isNetwork = e instanceof TypeError && /network|fetch/i.test(e.message);
      if (!isNetwork || i === attempts - 1) throw e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw new Error('Unreachable');
}

export const signUp = (email: string, password: string, redirectTo: string) =>
  withRetry(() => supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } }));

export const signIn = (email: string, password: string) =>
  withRetry(() => supabase.auth.signInWithPassword({ email, password }));

export const signOut = () => supabase.auth.signOut();
