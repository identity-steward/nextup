import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/media-urls`;

export interface SignedMediaResult {
  signedUrl: string | null;
  mediaType: string;
  caption: string | null;
  featured: boolean;
}

/**
 * Fetches signed URLs for media_uploads records by their IDs.
 * Calls the media-urls Edge Function which performs per-record authorization.
 * Returns a map of mediaUploadId -> signedUrl (null if access denied).
 */
export async function getSignedUrls(
  mediaUploadIds: string[]
): Promise<Record<string, string | null>> {
  if (mediaUploadIds.length === 0) return {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const { data: session } = await supabase.auth.getSession();
  if (session?.session?.access_token) {
    headers['Authorization'] = `Bearer ${session.session.access_token}`;
  } else {
    headers['apikey'] = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ mediaUploadIds }),
    });

    if (!response.ok) return {};

    const data = await response.json();
    if (!data || typeof data.urls !== 'object') return {};

    return data.urls as Record<string, string | null>;
  } catch {
    return {};
  }
}

/**
 * Resolves an athlete's image_url to a signed URL if it points to Supabase storage.
 * Non-storage URLs (local paths, Pexels URLs) pass through unchanged.
 * Storage URLs are resolved by looking up the media_uploads row by storage_path,
 * then requesting a signed URL from the Edge Function.
 */
export async function resolveAthleteImageUrl(
  imageUrl: string | undefined,
  athleteId: string
): Promise<string | null> {
  if (!imageUrl) return null;

  // Local paths and external URLs pass through unchanged
  if (!imageUrl.includes('storage/v1/object/public/')) {
    return imageUrl;
  }

  // Extract storage path from the public URL
  // Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const match = imageUrl.match(/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
  if (!match) return null;

  const bucket = match[1];
  const storagePath = match[2];

  // Look up the media_uploads row by storage_path
  const { data, error } = await supabase
    .from('media_uploads')
    .select('id')
    .eq('athlete_id', athleteId)
    .eq('bucket', bucket)
    .eq('storage_path', storagePath)
    .maybeSingle();

  if (error || !data) return null;

  const urls = await getSignedUrls([data.id]);
  return urls[data.id] ?? null;
}

/**
 * Replaces any img src with a placeholder if the URL is null or empty.
 * Returns the placeholder URL for use in onError handlers.
 */
/**
 * Checks whether an athlete has verified consent for public image display.
 * Returns true if the athlete has a consents row with consent_status='granted'
 * AND can_use_name_image_likeness=true. Used for local youth-identifiable images
 * that bypass storage but still require consent authorization.
 */
export async function checkAthleteMediaConsent(athleteId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('consents')
      .select('id')
      .eq('athlete_id', athleteId)
      .eq('consent_status', 'granted')
      .eq('can_use_name_image_likeness', true)
      .limit(1)
      .maybeSingle();

    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
}

/**
 * Resolves an athlete's image_url for display, applying consent checks.
 * - Storage URLs are resolved to signed URLs via the Edge Function.
 * - Local paths and external URLs pass through only if the athlete has
 *   verified consent (can_use_name_image_likeness=true). Otherwise returns null.
 */
export async function resolveAthleteImageWithConsent(
  imageUrl: string | undefined,
  athleteId: string
): Promise<string | null> {
  if (!imageUrl) return null;

  // Storage URLs go through the Edge Function (consent checked server-side)
  if (imageUrl.includes('storage/v1/object/public/')) {
    return resolveAthleteImageUrl(imageUrl, athleteId);
  }

  // Local paths and external URLs require client-side consent check
  const hasConsent = await checkAthleteMediaConsent(athleteId);
  if (!hasConsent) return null;

  return imageUrl;
}

export const MEDIA_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMzAwIiBmaWxsPSJub25UiPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iMjAwIiB5PSIxNTAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOGE5MWFiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qcm9maWxlIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

/**
 * React hook that renews signed URLs every 4 minutes (before the 5-minute expiry).
 * Pass the current media IDs and a callback to receive refreshed URLs.
 */
export function useSignedUrlRenewal(
  mediaIds: string[],
  onRenew: (urls: Record<string, string | null>) => void
): void {
  const savedIds = useRef(mediaIds);
  const savedCallback = useRef(onRenew);

  useEffect(() => {
    savedIds.current = mediaIds;
    savedCallback.current = onRenew;
  }, [mediaIds, onRenew]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const ids = savedIds.current;
      if (ids.length === 0) return;
      const urls = await getSignedUrls(ids);
      savedCallback.current(urls);
    }, 4 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);
}
