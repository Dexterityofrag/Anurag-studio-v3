'use client'

/* ─────────────────────────────────────────────────────────────────
   CSSHeroShape  - replaces the Three.js / R3F wireframe icosahedron
   ─────────────────────────────────────────────────────────────────
   Zero WebGL.  Zero canvas.  Zero JS runtime cost.
   Pure CSS transform animations - run on the compositor thread,
   completely off the main thread and off the JS call stack.
   ───────────────────────────────────────────────────────────────── */

const css = /* css */ `
.hero-shape {
  position: relative;
  width: 380px;
  height: 380px;
  /* Float: compositor-thread transform, no layout cost */
  animation: shape-float 5s ease-in-out infinite;
}

@keyframes shape-float {
  0%,  100% { transform: translateY(0px) rotate(0deg); }
  50%        { transform: translateY(-20px) rotate(0.4deg); }
}

/* 3D parent - one perspective, shared by all rings */
.hero-shape__frame {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}

/* Shared ring base */
.hero-shape__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid rgba(200, 255, 0, 0.20);
  will-change: transform;
}

/* Ring 1 - primary equatorial plane */
.hero-shape__ring--1 {
  border-color: rgba(200, 255, 0, 0.22);
  animation: ring-spin-1 9s linear infinite;
}
/* Ring 2 - tilted 42° on X, 55° on Y */
.hero-shape__ring--2 {
  border-color: rgba(200, 255, 0, 0.16);
  animation: ring-spin-2 14s linear infinite;
}
/* Ring 3 - mostly vertical */
.hero-shape__ring--3 {
  border-color: rgba(200, 255, 0, 0.13);
  animation: ring-spin-3 19s linear infinite reverse;
}

/* Rings use rotateX/Y so they look like a 3-axis gyroscope */
@keyframes ring-spin-1 {
  from { transform: rotateX(68deg) rotateZ(0deg); }
  to   { transform: rotateX(68deg) rotateZ(360deg); }
}
@keyframes ring-spin-2 {
  from { transform: rotateX(22deg) rotateY(55deg) rotateZ(0deg); }
  to   { transform: rotateX(22deg) rotateY(55deg) rotateZ(360deg); }
}
@keyframes ring-spin-3 {
  from { transform: rotateY(78deg) rotateX(12deg) rotateZ(0deg); }
  to   { transform: rotateY(78deg) rotateX(12deg) rotateZ(360deg); }
}

/* Central glowing node */
.hero-shape__node {
  position: absolute;
  top: 50%; left: 50%;
  width: 10px; height: 10px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: var(--accent);
  box-shadow:
    0 0 0 1px rgba(200, 255, 0, 0.5),
    0 0 18px 4px rgba(200, 255, 0, 0.55),
    0 0 55px 14px rgba(200, 255, 0, 0.18),
    0 0 120px 35px rgba(200, 255, 0, 0.07);
  animation: node-pulse 3s ease-in-out infinite;
}
@keyframes node-pulse {
  0%,  100% { transform: translate(-50%, -50%) scale(1);   opacity: 1;    }
  50%        { transform: translate(-50%, -50%) scale(1.25); opacity: 0.75; }
}

/* Accent dots at cardinal ring positions */
.hero-shape__dot {
  position: absolute;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px 2px rgba(200, 255, 0, 0.7);
}
.hero-shape__dot--n { top: -2px;   left: 50%; transform: translateX(-50%); }
.hero-shape__dot--s { bottom: -2px;left: 50%; transform: translateX(-50%); }
.hero-shape__dot--e { right: -2px; top: 50%;  transform: translateY(-50%); }
.hero-shape__dot--w { left: -2px;  top: 50%;  transform: translateY(-50%); }

/* Outer atmospheric haze - one static radial gradient, no filter:blur */
.hero-shape__haze {
  position: absolute;
  inset: -30%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(200, 255, 0, 0.06) 0%,
    rgba(200, 255, 0, 0.02) 40%,
    transparent 70%
  );
  pointer-events: none;
}

/* Mobile: scale down */
@media (max-width: 768px) {
  .hero-shape { width: 220px; height: 220px; }
}

/* Reduced motion: stop spinning, keep float */
@media (prefers-reduced-motion: reduce) {
  .hero-shape__ring  { animation: none !important; }
  .hero-shape__node  { animation: none !important; }
}
`

export default function CSSHeroShape() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="hero-shape" aria-hidden="true">
        {/* Outer glow haze */}
        <div className="hero-shape__haze" />

        {/* 3D frame - preserve-3d context */}
        <div className="hero-shape__frame">
          <div className="hero-shape__ring hero-shape__ring--1" />
          <div className="hero-shape__ring hero-shape__ring--2" />
          <div className="hero-shape__ring hero-shape__ring--3" />
        </div>

        {/* Cardinal accent dots */}
        <div className="hero-shape__dot hero-shape__dot--n" />
        <div className="hero-shape__dot hero-shape__dot--s" />
        <div className="hero-shape__dot hero-shape__dot--e" />
        <div className="hero-shape__dot hero-shape__dot--w" />

        {/* Central glowing core */}
        <div className="hero-shape__node" />
      </div>
    </>
  )
}
