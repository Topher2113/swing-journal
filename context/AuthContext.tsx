import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { Linking } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: Session['user'] | null;
  loading: boolean;
  linkError: string | null;
  clearLinkError: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  linkError: null,
  clearLinkError: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);

  const clearLinkError = useCallback(() => setLinkError(null), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    // Handle email confirmation deep links.
    // Supabase redirects back to the app with tokens or errors in the URL hash:
    //   Success: swingjournal://#access_token=xxx&refresh_token=xxx&type=signup
    //   Failure: swingjournal://#error=access_denied&error_code=otp_expired&error_description=...
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

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, linkError, clearLinkError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
