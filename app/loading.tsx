/**
 * Next.js Suspense loading fallback.
 * The Preloader in layout.tsx handles the actual loading animation —
 * this returns null to avoid a second opaque overlay covering the page.
 */
export default function Loading() {
  return null
}
