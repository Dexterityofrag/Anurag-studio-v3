'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* ────────────────────────────────────────────────────────────── */
/*  CSS fallback for low-end devices                              */
/* ────────────────────────────────────────────────────────────── */

const fallbackCss = /* css */ `
.r3f-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.r3f-fallback__shape {
  width: 120px;
  height: 120px;
  border: 2px solid var(--accent);
  transform: rotate(45deg);
  animation: r3f-spin 12s linear infinite, r3f-float 4s ease-in-out infinite;
  opacity: 0.35;
}
@keyframes r3f-spin {
  to { transform: rotate(405deg); }
}
@keyframes r3f-float {
  0%, 100% { translate: 0 0; }
  50%      { translate: 0 -12px; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Floating wireframe mesh                                       */
/* ────────────────────────────────────────────────────────────── */

function FloatingMesh() {
    const meshRef = useRef<THREE.Mesh>(null)
    const mouse = useRef({ x: 0, y: 0 })
    const scrollY = useRef(0)
    const { camera } = useThree()

    // Track mouse position (normalised 0→1)
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
            mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
        }
        const onScroll = () => {
            scrollY.current = window.scrollY
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('scroll', onScroll)
        }
    }, [])

    useFrame((state) => {
        const mesh = meshRef.current
        if (!mesh) return

        // 1. Float
        mesh.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.15

        // 2. Mouse follow (lerp rotation)
        const targetRotY = mouse.current.x * 0.6
        const targetRotX = mouse.current.y * 0.4
        mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.05
        mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.05

        // Idle spin
        mesh.rotation.z += 0.002

        // 3. Scroll parallax - pull camera back
        camera.position.z = 5 + scrollY.current * 0.003
    })

    return (
        <mesh ref={meshRef}>
            <icosahedronGeometry args={[1.8, 2]} />
            <meshStandardMaterial
                color="#FF4D00"
                wireframe
                transparent
                opacity={0.35}
                emissive="#FF4D00"
                emissiveIntensity={0.2}
            />
        </mesh>
    )
}

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function R3FHero() {
    const [isLowEnd, setIsLowEnd] = useState(false)

    useEffect(() => {
        const cores = navigator.hardwareConcurrency ?? 4
        if (cores < 4) setIsLowEnd(true)
    }, [])

    if (isLowEnd) {
        return (
            <>
                <style dangerouslySetInnerHTML={{ __html: fallbackCss }} />
                <div className="r3f-fallback">
                    <div className="r3f-fallback__shape" />
                </div>
            </>
        )
    }

    return (
        <Canvas
            gl={{ alpha: true, antialias: false }}
            camera={{ position: [0, 0, 5], fov: 45 }}
            style={{ pointerEvents: 'none' }}
            dpr={[1, 1]}
            performance={{ min: 0.5 }}
        >
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <FloatingMesh />
        </Canvas>
    )
}
