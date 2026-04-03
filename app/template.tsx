import type { ReactNode } from 'react'

// template.tsx re-mounts on every navigation, giving Next.js the signal
// to run route transitions. PageTransition (in layout.tsx) owns the actual
// animation; this file is a plain passthrough so we don't double-animate.
export default function Template({ children }: { children: ReactNode }) {
  return <>{children}</>
}
