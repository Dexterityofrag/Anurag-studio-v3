'use client'

import { useEffect } from 'react'

/**
 * TouchDetect - adds `is-touch` class to <body> on touch devices.
 * This disables the custom cursor and restores native cursor behaviour.
 * Renders nothing; purely a side-effect component.
 */
export default function TouchDetect() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'ontouchstart' in window) {
      document.body.classList.add('is-touch')
    }
  }, [])

  return null
}
