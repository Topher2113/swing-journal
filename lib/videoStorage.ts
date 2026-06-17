import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';

const BUCKET = 'move-videos';

export async function uploadVideoForSharing(
  localUri: string,
  userId: string,
): Promise<string | null> {
  try {
    const ext = localUri.split('.').pop()?.split('?')[0] ?? 'mp4';
    const path = `${userId}/${Crypto.randomUUID()}.${ext}`;

    const response = await fetch(localUri);
    if (!response.ok) return null;
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, {
        contentType: blob.type || 'video/mp4',
        upsert: false,
      });

    if (error) return null;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return null;
  }
}

export function isLocalUri(uri: string): boolean {
  return uri.startsWith('file://') || uri.startsWith('content://');
}
