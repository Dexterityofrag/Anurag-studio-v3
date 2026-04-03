/**
 * Instant loading shell shown while the home page server component fetches data.
 * Appears as a blank dark screen — the Preloader component in layout.tsx handles
 * the actual loading animation, so this just needs to not flash white.
 */
export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#060606',
        zIndex: 9999,
      }}
      aria-hidden="true"
    />
  )
}
