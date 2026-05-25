import { createStart, createMiddleware } from '@tanstack/react-start';

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
  requestMiddleware: [crossOriginIsolationMiddleware],
}));
