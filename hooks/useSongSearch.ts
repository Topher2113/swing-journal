import { useCallback, useRef, useState } from 'react';
import { SpotifyTrackResult } from '@/types/Song';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SEARCH_URL = 'https://api.spotify.com/v1/search';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Self-contained base64 encoder for the Spotify Client Credentials
// Authorization header - avoids relying on `btoa`/Buffer being globally
// available across RN/Hermes versions.
function base64Encode(input: string): string {
  let result = '';
  let i = 0;
  for (; i + 3 <= input.length; i += 3) {
    const [a, b, c] = [input.charCodeAt(i), input.charCodeAt(i + 1), input.charCodeAt(i + 2)];
    result += BASE64_CHARS[a >> 2];
    result += BASE64_CHARS[((a & 0x03) << 4) | (b >> 4)];
    result += BASE64_CHARS[((b & 0x0f) << 2) | (c >> 6)];
    result += BASE64_CHARS[c & 0x3f];
  }
  const remaining = input.length - i;
  if (remaining === 1) {
    const a = input.charCodeAt(i);
    result += BASE64_CHARS[a >> 2];
    result += BASE64_CHARS[(a & 0x03) << 4];
    result += '==';
  } else if (remaining === 2) {
    const a = input.charCodeAt(i);
    const b = input.charCodeAt(i + 1);
    result += BASE64_CHARS[a >> 2];
    result += BASE64_CHARS[((a & 0x03) << 4) | (b >> 4)];
    result += BASE64_CHARS[(b & 0x0f) << 2];
    result += '=';
  }
  return result;
}

type CachedToken = { token: string; expiresAt: number };

export function useSongSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenRef = useRef<CachedToken | null>(null);

  const getToken = useCallback(async (): Promise<string | null> => {
    const cached = tokenRef.current;
    if (cached && cached.expiresAt > Date.now()) return cached.token;

    const clientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      console.warn('Spotify env vars missing — search disabled');
      return null;
    }
    const basic = base64Encode(`${clientId}:${clientSecret}`);

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basic}`,
      },
      body: 'grant_type=client_credentials',
    });
    if (!res.ok) throw new Error('Failed to authenticate with Spotify');
    const json = await res.json();
    const token = json.access_token as string;
    const expiresInMs = (json.expires_in as number) * 1000;
    tokenRef.current = { token, expiresAt: Date.now() + expiresInMs - 60_000 };
    return token;
  }, []);

  const search = useCallback(async (query: string): Promise<SpotifyTrackResult[]> => {
    if (!query.trim()) return [];
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) return [];
      const url = `${SEARCH_URL}?type=track&limit=10&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Spotify search failed');
      const json = await res.json();
      return (json.tracks?.items ?? []) as SpotifyTrackResult[];
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
      return [];
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { search, loading, error };
}
