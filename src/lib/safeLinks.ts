/*
  Link safety helpers.

  Profile fields such as the highlight video URL and the payment link are
  written by the profile owner, so they are untrusted input by the time they
  are rendered on a public page. These helpers reduce any user-supplied value
  to a known-safe form (or nothing at all).
*/

const VIDEO_HOSTS = [
  'www.youtube.com',
  'youtube.com',
  'youtu.be',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
  'player.vimeo.com',
  'vimeo.com',
  'www.vimeo.com',
];

const PAYMENT_HOSTS = ['buy.stripe.com', 'checkout.stripe.com', 'donate.stripe.com'];

function parseHttpsUrl(raw?: string | null): URL | null {
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== 'https:') return null;
    return url;
  } catch {
    return null;
  }
}

/** Returns a safe embeddable video URL, or an empty string when untrusted. */
export function safeVideoEmbedUrl(raw?: string | null): string {
  const url = parseHttpsUrl(raw);
  if (!url || !VIDEO_HOSTS.includes(url.hostname)) return '';

  if (url.hostname === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : '';
  }

  if (url.hostname.endsWith('youtube.com') || url.hostname.endsWith('youtube-nocookie.com')) {
    if (url.pathname.startsWith('/embed/')) {
      const id = url.pathname.replace('/embed/', '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : '';
    }
    const id = url.searchParams.get('v');
    return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : '';
  }

  // Vimeo
  const segments = url.pathname.split('/').filter(Boolean);
  const videoId = segments.filter(s => /^\d+$/.test(s)).pop();
  return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
}

/** Returns a safe payment link, or undefined when the value is not a trusted payment host. */
export function safePaymentLink(raw?: string | null): string | undefined {
  const url = parseHttpsUrl(raw);
  if (!url || !PAYMENT_HOSTS.includes(url.hostname)) return undefined;
  return url.toString();
}
