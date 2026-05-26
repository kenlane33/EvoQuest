import { createStart, createMiddleware } from '@tanstack/react-start';
import { isPocketTtsProxyPath, proxyPocketTtsRequest } from '@/server/pocket-tts-proxy';

/** Proxy Pocket TTS ONNX assets from Hugging Face (same-origin for the browser). */
const pocketTtsProxyMiddleware = createMiddleware().server(async ({ request, next }) => {
  const pathname = new URL(request.url).pathname;
  if (isPocketTtsProxyPath(pathname)) {
    return proxyPocketTtsRequest(request);
  }
  return next();
});

/** Pocket TTS (ONNX WASM) needs cross-origin isolation for SharedArrayBuffer. */
const crossOriginIsolationMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next();
  const response = result.response;
  if (!(response instanceof Response)) return result;

  const headers = new Headers(response.headers);
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

  return {
    ...result,
    response: new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    }),
  };
});

export const startInstance = createStart(() => ({
  requestMiddleware: [crossOriginIsolationMiddleware, pocketTtsProxyMiddleware],
}));
