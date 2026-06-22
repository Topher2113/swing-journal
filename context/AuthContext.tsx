import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { Linking } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/Auth';

function profileFromRow(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    name: row.name as string,
    dancePreference: row.dance_preference as UserProfile['dancePreference'],
    level: row.level as UserProfile['level'],
    createdAt: row.created_at as string,
  };
}

type AuthContextValue = {
  session: Session | null;
  user: Session['user'] | null;
  loading: boolean;
  profile: UserProfile | null;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
  linkError: string | null;
  clearLinkError: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  profile: null,
  profileLoading: false,
  refreshProfile: async () => {},
  linkError: null,
  clearLinkError: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);

  const clearLinkError = useCallback(() => setLinkError(null), []);

  const refreshProfile = useCallback(async (userId?: string) => {
    const id = userId ?? session?.user?.id;
    if (!id) return;
    setProfileLoading(true);
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    setProfile(data ? profileFromRow(data as Record<string, unknown>) : null);
    setProfileLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    const handleDeepLink = async (url: string) => {
      const fragment = url.split('#')[1];
      if (!fragment) return;
      const params = Object.fromEntries(new URLSearchParams(fragment));

      if (params.error) {
        const code = params.error_code ?? params.error;
        if (code === 'otp_expired') {
          setLinkError('This confirmation link has expired. Request a new one below.');
        } else {
          setLinkError('The confirmation link is invalid. Request a new one below.');
        }
        return;
      }

      if (params.access_token && params.refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        if (error) {
          setLinkError('Could not sign in with this link. It may have expired — request a new one below.');
        }
      }
    };

    Linking.getInitialURL().then((url) => { if (url) handleDeepLink(url); });
    const linkSub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));

    return () => {
      subscription.unsubscribe();
      linkSub.remove();
    };
  }, []);

  // Load profile whenever the logged-in user changes.
  // Gate the else branch on !loading so profileLoading stays true during the
  // window between auth state restoration and profile fetch — prevents a brief
  // redirect to onboarding for returning users.
  useEffect(() => {
    if (session?.user?.id) {
      refreshProfile(session.user.id);
    } else if (!loading) {
      setProfile(null);
      setProfileLoading(false);
    }
  }, [session?.user?.id, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      loading,
      profile,
      profileLoading,
      refreshProfile,
      linkError,
      clearLinkError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
