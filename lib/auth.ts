import { supabase } from './supabase';

export const signUp = (email: string, password: string, redirectTo: string) =>
  supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });

export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOut = () => supabase.auth.signOut();
