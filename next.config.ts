import type { NextConfig } from "next";

/* ── R2 public hostname (constructed from env or defaults) ── */
const parseR2PublicUrl = () => {
  const url = process.env.R2_PUBLIC_URL
  if (!url) return null
  try {
    const u = new URL(url)
    return u.hostname
  } catch {
    return null
  }
}
const r2Host = parseR2PublicUrl()

const nextConfig: NextConfig = {
  /* ── Hide "X-Powered-By: Next.js" header ────────────────────── */
  poweredByHeader: false,

  /* ── Never ship source maps to the browser in production ────── */
  productionBrowserSourceMaps: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: (() => {
      const patterns = [
        /* Blog cover images from Medium */
        { protocol: 'https' as const, hostname: 'miro.medium.com' },
        { protocol: 'https' as const, hostname: 'cdn-images-1.medium.com' },
      ]
      /* R2 public hostname (if configured) */
      if (r2Host) {
        patterns.unshift({ protocol: 'https' as const, hostname: r2Host })
      }
      return patterns
    })(),
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
              ...(r2Host ? [
                `img-src 'self' data: blob: https://${r2Host} https://miro.medium.com https://cdn-images-1.medium.com`,
                `connect-src 'self' https://${r2Host}`,
                // the showreel is served from R2; without media-src it falls back to
                // default-src 'self' and the <video> is blocked
                `media-src 'self' blob: https://${r2Host}`,
              ] : [
                "img-src 'self' data: blob: https://miro.medium.com https://cdn-images-1.medium.com",
                "connect-src 'self'",
                "media-src 'self' blob:",
              ]),
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
