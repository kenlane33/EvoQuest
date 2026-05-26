/**
 * Same-origin proxy for Pocket TTS ONNX bundles hosted on Hugging Face.
 * Browser/worker fetches hit the Worker; the Worker fetches upstream (no CORS).
 */

export const POCKET_TTS_HF_BUNDLE_BASE =
  'https://huggingface.co/spaces/KevinAHM/pocket-tts-web/resolve/main/onnx';

/** Public path prefix — must match POCKET_TTS_BUNDLE_BASE in pocket-tts-model-cache.ts */
export const POCKET_TTS_PROXY_PREFIX = '/api/pocket-tts/onnx';

const LANGUAGE_BUNDLES = [
  'english_2026-04',
  'german',
  'italian',
  'portuguese',
  'spanish',
] as const;

const ALLOWED_EXTENSIONS = ['.json', '.onnx', '.bin', '.model', '.npy'] as const;

const SAFE_FILENAME = /^[\w.-]+$/;

export function isPocketTtsProxyPath(pathname: string): boolean {
  return pathname === POCKET_TTS_PROXY_PREFIX || pathname.startsWith(`${POCKET_TTS_PROXY_PREFIX}/`);
}

/** Map a same-origin proxy path to the Hugging Face URL, or null if invalid. */
export function pocketTtsProxyUpstreamUrl(pathname: string): string | null {
  if (!pathname.startsWith(`${POCKET_TTS_PROXY_PREFIX}/`)) {
    return null;
  }

  const suffix = pathname.slice(POCKET_TTS_PROXY_PREFIX.length + 1);
  const slash = suffix.indexOf('/');
  if (slash <= 0) {
    return null;
  }

  const language = suffix.slice(0, slash);
  const filename = suffix.slice(slash + 1);

  if (!(LANGUAGE_BUNDLES as readonly string[]).includes(language)) {
    return null;
  }
  if (!filename || filename.includes('/') || filename.includes('..')) {
    return null;
  }
  if (!SAFE_FILENAME.test(filename)) {
    return null;
  }
  if (!ALLOWED_EXTENSIONS.some((ext) => filename.endsWith(ext))) {
    return null;
  }

  return `${POCKET_TTS_HF_BUNDLE_BASE}/${language}/${filename}`;
}

function cacheControlFor(filename: string): string {
  if (filename === 'bundle.json') {
    return 'public, max-age=3600';
  }
  return 'public, max-age=31536000, immutable';
}

export async function proxyPocketTtsRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const upstream = pocketTtsProxyUpstreamUrl(url.pathname);

  if (!upstream) {
    return new Response('Not found', { status: 404 });
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405 });
  }

  const upstreamResponse = await fetch(upstream, {
    method: request.method,
    redirect: 'follow',
    headers: {
      Accept: request.headers.get('Accept') ?? '*/*',
      'User-Agent': 'EvoQuest/1.0',
    },
  });

  if (!upstreamResponse.ok) {
    return new Response(upstreamResponse.statusText || 'Upstream error', {
      status: upstreamResponse.status,
    });
  }

  const filename = url.pathname.split('/').pop() ?? '';
  const headers = new Headers();
  const contentType = upstreamResponse.headers.get('Content-Type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }
  headers.set('Cache-Control', cacheControlFor(filename));

  return new Response(request.method === 'HEAD' ? null : upstreamResponse.body, {
    status: upstreamResponse.status,
    headers,
  });
}
