/**
 * Serve the maintenance page for EVERY path, with HTTP 503 + Retry-After.
 *
 * Why this file and not functions/_middleware.js:
 * Cloudflare Pages only compiles the `functions/` directory on Git-connected
 * builds. A drag-and-drop Direct Upload ignores it completely. `_worker.js` at
 * the project root is the Direct Upload equivalent, and it does run.
 *
 * Why 503 rather than 200 or 404:
 *   200 tells search engines every URL on anurag.studio genuinely contains
 *       "BACK SOON" now, so the real pages get replaced in the index.
 *   404 is worse. It tells them the pages are gone for good and should be
 *       deleted from search.
 *   503 says "temporarily unavailable, come back later", which is the truth,
 *       and existing rankings are held while the site is rebuilt.
 *
 * Note: while this file exists, Pages runs in Advanced Mode and `_redirects`,
 * `_headers` and `404.html` are all bypassed. That is fine, this worker already
 * catches every path. They stay in the folder as a fallback for anyone who
 * deletes this file.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    url.pathname = '/index.html';
    url.search = '';

    const asset = await env.ASSETS.fetch(new Request(url.toString(), { method: 'GET' }));
    const html = await asset.text();

    return new Response(request.method === 'HEAD' ? null : html, {
      status: 503,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'retry-after': '86400',
        'cache-control': 'no-store, must-revalidate',
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'strict-origin-when-cross-origin',
      },
    });
  },
};
