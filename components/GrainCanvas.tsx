'use client'

import { useEffect, useRef } from 'react'

/* ────────────────────────────────────────────────────────────────
   GrainCanvas - procedural noise, perf-optimised
   • 256×256 canvas only - stretched to viewport via CSS (grain is
     random noise so pixelation is invisible at 2.5 % opacity)
   • Updates every 4th frame (≈ 15 fps) - motion still feels alive
     but GPU/CPU load drops 16× vs full-res 60 fps
   ──────────────────────────────────────────────────────────────── */

export default function GrainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Fixed small resolution - stretched to fill viewport via CSS
    const W = 256
    const H = 256
    canvas.width  = W
    canvas.height = H

    let rafId = 0
    let frame = 0

    const imageData = ctx.createImageData(W, H)
    const data = imageData.data

    const draw = () => {
      frame++
      // Only repaint every 4th frame (≈ 15 fps) - imperceptible at 2.5 % opacity
      if (frame % 4 === 0) {
        for (let i = 0; i < data.length; i += 4) {
          const v = (Math.random() * 255) | 0
          data[i]     = v
          data[i + 1] = v
          data[i + 2] = v
          data[i + 3] = 255
        }
        ctx.putImageData(imageData, 0, 0)
      }
      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)

    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        'var(--z-grain, 8000)' as unknown as number,
        pointerEvents: 'none',
        opacity:       0.012,
        width:         '100%',
        height:        '100%',
        display:       'block',
      }}
    />
  )
}
