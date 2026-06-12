export type SyncStatus = 'pending' | 'synced';

export type Song = {
  id: string;
  title: string;
  artist: string;
  albumArtUrl: string | null;
  spotifyUrl: string | null;
  spotifyTrackId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
};

// Trimmed shape from Spotify's /v1/search?type=track endpoint
export type SpotifyTrackResult = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string; width: number; height: number }[] };
  external_urls: { spotify: string };
};
