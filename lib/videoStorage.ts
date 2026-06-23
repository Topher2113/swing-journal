import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';

const BUCKET = 'move-videos';

export function isLocalUri(uri: string): boolean {
  return uri.startsWith('file://') || uri.startsWith('content://');
}

export async function uploadVideo(
  localUri: string,
  userId: string,
): Promise<string | null> {
  try {
    const ext = (localUri.split('.').pop()?.split('?')[0] ?? 'mp4').toLowerCase();
    const contentType = ext === 'mov' ? 'video/quicktime' : 'video/mp4';
    const path = `${userId}/${Crypto.randomUUID()}.${ext}`;

    const response = await fetch(localUri);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (error) return null;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return null;
  }
}
