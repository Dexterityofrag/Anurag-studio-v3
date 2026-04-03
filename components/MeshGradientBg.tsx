'use client'

/* ────────────────────────────────────────────────────────────────────────
   MeshGradientBg
   ─────────────────────────────────────────────────────────────────────
   Global animated mesh-gradient backdrop.

   Performance strategy:
   • All orbs live inside ONE blurred wrapper  → 1 GPU compositing layer
     instead of N separate filter:blur() elements (was the main lag source).
   • Animations use transform:translate() ONLY  → runs on compositor thread,
     zero layout / paint cost.
   • will-change:transform on each orb  → pre-promotes to GPU before scroll.
   • Extend wrapper 20% past viewport edges so blurred edge artefacts
     never show.
   ──────────────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ── Outer shell ── */
/* z-index: 0 + body:transparent = mesh always visible behind all content */
.mesh-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  /* No background - html provides #0A0A0A base */
}

/* ── Single blur container - ONE compositing layer for all orbs ── */
.mesh-bg__inner {
  position: absolute;
  inset: -20%;          /* extend to hide blurred edges */
  filter: blur(50px) saturate(1.2);
  transform: translateZ(0); /* promote to own GPU layer */
  backface-visibility: hidden;
}

/* ── Shared orb base ── */
.mesh-orb {
  position: absolute;
  border-radius: 50%;
  will-change: transform;
}

/* ── Orb definitions - neon mint / teal / deep green family ──────
   Base accent: #00FF94 = rgb(0, 255, 148)
   Orb 1: neon mint               rgb(0 255 148)   - core accent
   Orb 2: electric teal           rgb(0 220 160)   - warm shift
   Orb 3: deep aqua               rgb(0 180 120)   - cooler
   Orb 4: forest deep             rgb(0 120 70)    - dark anchor
   Orb 5: pale mint               rgb(100 255 180) - lighter, centre
   Orb 6: cyan-teal               rgb(0 200 200)   - cool shift
   ────────────────────────────────────────────────────────────────── */

/* 1 - Neon mint, largest, top-left anchor */
.mesh-orb-1 {
  width: 900px; height: 900px;
  background: radial-gradient(circle,
    rgba(0, 255, 148, 0.09) 0%,
    rgba(0, 255, 148, 0.03) 45%,
    transparent 70%
  );
  top: -5%; left: -5%;
  animation: mesh-drift-1 26s ease-in-out infinite alternate;
}

/* 2 - Electric teal, right side */
.mesh-orb-2 {
  width: 720px; height: 720px;
  background: radial-gradient(circle,
    rgba(0, 220, 160, 0.07) 0%,
    rgba(0, 220, 160, 0.02) 50%,
    transparent 70%
  );
  top: 10%; right: -8%;
  animation: mesh-drift-2 34s ease-in-out infinite alternate;
}

/* 3 - Deep aqua, bottom-left */
.mesh-orb-3 {
  width: 620px; height: 620px;
  background: radial-gradient(circle,
    rgba(0, 180, 120, 0.07) 0%,
    rgba(0, 180, 120, 0.02) 50%,
    transparent 70%
  );
  bottom: 5%; left: 10%;
  animation: mesh-drift-3 28s ease-in-out infinite alternate;
}

/* 4 - Forest deep, bottom-right */
.mesh-orb-4 {
  width: 560px; height: 560px;
  background: radial-gradient(circle,
    rgba(0, 120, 70, 0.10) 0%,
    rgba(0, 120, 70, 0.03) 50%,
    transparent 70%
  );
  bottom: -5%; right: 5%;
  animation: mesh-drift-4 22s ease-in-out infinite alternate;
}

/* 5 - Pale mint, floating centre */
.mesh-orb-5 {
  width: 500px; height: 500px;
  background: radial-gradient(circle,
    rgba(100, 255, 180, 0.05) 0%,
    rgba(100, 255, 180, 0.01) 55%,
    transparent 70%
  );
  top: 45%; left: 35%;
  animation: mesh-drift-5 38s ease-in-out infinite alternate;
}

/* 6 - Cyan-teal, top-right */
.mesh-orb-6 {
  width: 480px; height: 480px;
  background: radial-gradient(circle,
    rgba(0, 200, 200, 0.06) 0%,
    rgba(0, 200, 200, 0.02) 50%,
    transparent 70%
  );
  top: -10%; right: 18%;
  animation: mesh-drift-6 30s ease-in-out infinite alternate;
}

/* ── Keyframes - transform only, no paint cost ── */
@keyframes mesh-drift-1 {
  0%   { transform: translate(0px, 0px); }
  30%  { transform: translate(120px, 80px); }
  70%  { transform: translate(60px, 200px); }
  100% { transform: translate(220px, 140px); }
}
@keyframes mesh-drift-2 {
  0%   { transform: translate(0px, 0px); }
  25%  { transform: translate(-140px, 100px); }
  60%  { transform: translate(-60px, -90px); }
  100% { transform: translate(-200px, 80px); }
}
@keyframes mesh-drift-3 {
  0%   { transform: translate(0px, 0px); }
  40%  { transform: translate(100px, -130px); }
  80%  { transform: translate(-80px, -60px); }
  100% { transform: translate(60px, -180px); }
}
@keyframes mesh-drift-4 {
  0%   { transform: translate(0px, 0px); }
  35%  { transform: translate(-110px, -90px); }
  70%  { transform: translate(-50px, -170px); }
  100% { transform: translate(-160px, -120px); }
}
@keyframes mesh-drift-5 {
  0%   { transform: translate(0px, 0px); }
  20%  { transform: translate(90px, 60px); }
  55%  { transform: translate(-70px, 110px); }
  80%  { transform: translate(120px, -50px); }
  100% { transform: translate(-40px, 90px); }
}
@keyframes mesh-drift-6 {
  0%   { transform: translate(0px, 0px); }
  45%  { transform: translate(80px, 120px); }
  100% { transform: translate(-60px, 180px); }
}

/* ── Very subtle noise grain overlay (static, no animation) ── */
.mesh-bg__grain {
  position: absolute;
  inset: 0;
  opacity: 0.028;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px 256px;
  pointer-events: none;
}

/* ── Reduce motion: freeze all orbs ── */
@media (prefers-reduced-motion: reduce) {
  .mesh-orb { animation: none !important; }
}
`

export default function MeshGradientBg() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="mesh-bg" aria-hidden="true">
        {/* Blurred orb layer - single filter = single GPU layer */}
        <div className="mesh-bg__inner">
          <div className="mesh-orb mesh-orb-1" />
          <div className="mesh-orb mesh-orb-2" />
          <div className="mesh-orb mesh-orb-3" />
          <div className="mesh-orb mesh-orb-4" />
          <div className="mesh-orb mesh-orb-5" />
          <div className="mesh-orb mesh-orb-6" />
        </div>
        {/* Static grain - no animation, no paint cost */}
        <div className="mesh-bg__grain" />
      </div>
    </>
  )
}
