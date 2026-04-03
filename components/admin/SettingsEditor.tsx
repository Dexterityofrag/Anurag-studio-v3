'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { upsertContentKeys } from '@/app/actions/admin'

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.se__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FAFAFA;
  margin-bottom: 8px;
}
.se__subtitle {
  font-family: var(--font-body);
  font-size: 13px;
  color: #8A8A8A;
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
}
.se__card {
  background: #141414;
  border: 1px solid #262626;
  padding: 24px;
  margin-bottom: 16px;
}
.se__card-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 14px;
  color: #FAFAFA;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #1A1A1A;
}
.se__field {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 16px;
  align-items: start;
  padding: 12px 0;
  border-bottom: 1px solid #1A1A1A;
}
.se__field:last-of-type { border-bottom: none; padding-bottom: 0; }
.se__label {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #8A8A8A;
  padding-top: 8px;
}
.se__desc {
  font-size: 10px;
  color: #555;
  margin-top: 4px;
}
.se__input {
  width: 100%;
  background: #1A1A1A;
  border: 1px solid #262626;
  padding: 8px 12px;
  font-family: var(--font-body);
  font-size: 13px;
  color: #FAFAFA;
  outline: none;
  transition: border-color 0.25s ease;
}
.se__input:focus { border-color: #FF4D00; }
.se__select {
  width: 100%;
  background: #1A1A1A;
  border: 1px solid #262626;
  padding: 8px 12px;
  font-family: var(--font-body);
  font-size: 13px;
  color: #FAFAFA;
  outline: none;
  cursor: pointer;
  appearance: none;
}
/* ── Full Color Picker ─────────────────────────────────────── */
.se__picker-area {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
/* Preset chips */
.se__presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.se__preset-chip {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease;
  flex-shrink: 0;
}
.se__preset-chip:hover { transform: scale(1.15); }
.se__preset-chip.active { border-color: #FAFAFA; }
/* Input row */
.se__color-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.se__color-native {
  width: 48px;
  height: 40px;
  border: 1px solid #262626;
  background: none;
  padding: 3px;
  cursor: pointer;
  border-radius: 4px;
  flex-shrink: 0;
  overflow: hidden;
}
.se__color-native::-webkit-color-swatch-wrapper { padding: 0; border-radius: 2px; }
.se__color-native::-webkit-color-swatch { border: none; border-radius: 2px; }
/* Live preview */
.se__live-preview {
  padding: 16px;
  background: #0D0D0D;
  border: 1px solid #1A1A1A;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.se__live-preview__label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  flex-shrink: 0;
}
.se__live-btn {
  padding: 7px 16px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 12px;
  color: #0A0A0A;
  border: none;
  cursor: default;
  border-radius: 2px;
  pointer-events: none;
}
.se__live-link {
  font-family: var(--font-body);
  font-size: 13px;
  text-decoration: underline;
  text-underline-offset: 3px;
  pointer-events: none;
}
.se__live-hex {
  font-family: var(--font-mono);
  font-size: 12px;
}
.se__live-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.se__save-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
.se__save-btn {
  padding: 10px 28px;
  background: #FF4D00;
  color: #0A0A0A;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.se__save-btn:hover:not(:disabled) { opacity: 0.9; }
.se__save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.se__status {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #FF4D00;
  display: flex;
  align-items: center;
}
.se__note {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #555;
  padding: 12px 16px;
  background: #0D0D0D;
  border: 1px solid #1A1A1A;
  margin-top: 8px;
  line-height: 1.6;
}
@media (max-width: 640px) {
  .se__field { grid-template-columns: 1fr; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function SettingsEditor({ settings }: { settings: Record<string, string> }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [saved, setSaved] = useState(false)

    const [accentColor, setAccentColor] = useState(settings['settings.accentColor'] ?? '#FF4D00')
    const [element3d, setElement3d] = useState(settings['settings.element3d'] ?? 'icosahedron')
    const [fontDisplay, setFontDisplay] = useState(settings['settings.fontDisplay'] ?? 'Clash Display')

    const handleSave = () => {
        startTransition(async () => {
            await upsertContentKeys([
                { key: 'settings.accentColor', value: accentColor, groupName: 'settings', description: 'Brand accent color (hex)' },
                { key: 'settings.element3d', value: element3d, groupName: 'settings', description: '3D element shape' },
                { key: 'settings.fontDisplay', value: fontDisplay, groupName: 'settings', description: 'Display font name' },
            ])
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
            router.refresh()
        })
    }

    const PRESETS = [
        { hex: '#FF4D00', name: 'Lime' },
        { hex: '#00F5FF', name: 'Cyan' },
        { hex: '#FF6B35', name: 'Orange' },
        { hex: '#8B5CF6', name: 'Violet' },
        { hex: '#F43F5E', name: 'Rose' },
        { hex: '#FAFAFA', name: 'White' },
    ]

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            <h1 className="se__title">Site Settings</h1>
            <p className="se__subtitle">
                Control the visual identity: accent color, 3D element, and fonts.
                Changes apply site-wide after saving.
            </p>

            {/* ── Accent Color ───────────────────────────────── */}
            <div className="se__card">
                <p className="se__card-title">Brand Color</p>
                <div className="se__field">
                    <div className="se__label">
                        Accent Color
                        <div className="se__desc">Buttons, highlights, links</div>
                    </div>
                    <div className="se__picker-area">
                        {/* Preset chips */}
                        <div className="se__presets">
                            {PRESETS.map((p) => (
                                <button
                                    key={p.hex}
                                    type="button"
                                    className={`se__preset-chip${accentColor.toLowerCase() === p.hex.toLowerCase() ? ' active' : ''}`}
                                    style={{ background: p.hex }}
                                    title={p.name}
                                    onClick={() => setAccentColor(p.hex)}
                                />
                            ))}
                        </div>
                        {/* Native color + hex input */}
                        <div className="se__color-row">
                            <input
                                type="color"
                                className="se__color-native"
                                value={accentColor}
                                onChange={(e) => setAccentColor(e.target.value)}
                                title="Open color picker"
                            />
                            <input
                                className="se__input"
                                value={accentColor}
                                onChange={(e) => setAccentColor(e.target.value)}
                                placeholder="#FF4D00"
                                style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                            />
                        </div>
                        {/* Live preview */}
                        <div className="se__live-preview">
                            <span className="se__live-preview__label">Preview</span>
                            <span className="se__live-dot" style={{ background: accentColor }} />
                            <button
                                className="se__live-btn"
                                style={{ background: accentColor }}
                            >
                                CTA Button
                            </button>
                            <span
                                className="se__live-link"
                                style={{ color: accentColor, textDecorationColor: accentColor }}
                            >
                                Hover link
                            </span>
                            <span
                                className="se__live-hex"
                                style={{ color: accentColor }}
                            >
                                {accentColor.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 3D Element ─────────────────────────────────── */}
            <div className="se__card">
                <p className="se__card-title">3D Hero Element</p>
                <div className="se__field">
                    <div className="se__label">
                        Shape
                        <div className="se__desc">Wireframe mesh in hero section</div>
                    </div>
                    <select
                        className="se__select"
                        value={element3d}
                        onChange={(e) => setElement3d(e.target.value)}
                    >
                        <option value="icosahedron">Icosahedron (default)</option>
                        <option value="torus">Torus Knot</option>
                        <option value="sphere">Sphere</option>
                        <option value="octahedron">Octahedron</option>
                    </select>
                </div>
            </div>

            {/* ── Typography ─────────────────────────────────── */}
            <div className="se__card">
                <p className="se__card-title">Typography</p>
                <div className="se__field">
                    <div className="se__label">
                        Display Font
                        <div className="se__desc">Headlines, nav, brand name</div>
                    </div>
                    <div>
                        <select
                            className="se__select"
                            value={fontDisplay}
                            onChange={(e) => setFontDisplay(e.target.value)}
                        >
                            <option value="Clash Display">Clash Display (default)</option>
                            <option value="Cabinet Grotesk">Cabinet Grotesk</option>
                            <option value="Satoshi">Satoshi</option>
                            <option value="General Sans">General Sans</option>
                        </select>
                        <div className="se__note">
                            Font changes require a Fontshare CDN update in layout.tsx to take full effect.
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Save ───────────────────────────────────────── */}
            <div className="se__save-row">
                {saved && <span className="se__status">✓ Settings saved</span>}
                <button className="se__save-btn" onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Saving…' : 'Save Settings'}
                </button>
            </div>
        </>
    )
}
