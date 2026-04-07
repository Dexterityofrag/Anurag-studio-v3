import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ── Hide "X-Powered-By: Next.js" header ────────────────────── */
  poweredByHeader: false,

  /* ── Never ship source maps to the browser in production ────── */
  productionBrowserSourceMaps: false,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.digitaloceanspaces.com' },
      { protocol: 'https', hostname: '*.cdn.digitaloceanspaces.com' },
      { protocol: 'https', hostname: 'miro.medium.com' },
      { protocol: 'https', hostname: 'cdn-images-1.medium.com' },
    ],
  },

  /* ── Security headers on every response ─────────────────────── */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          /* Prevent click-jacking */
          { key: 'X-Frame-Options', value: 'DENY' },
          /* Stop MIME-type sniffing */
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          /* Referrer — send origin only to foreign origins */
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          /* Block browser features the site doesn't need */
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          /* Enforce HTTPS for 1 year (incl. subdomains) */
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          /* XSS filter — modern browsers have this on by default */
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          /* Content-Security-Policy — restrictive but allowing what the site needs */
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://*.digitaloceanspaces.com https://*.cdn.digitaloceanspaces.com https://miro.medium.com https://cdn-images-1.medium.com",
              "connect-src 'self' https://*.digitaloceanspaces.com https://*.cdn.digitaloceanspaces.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
};

export default nextConfig;
