'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    Settings,
    ImageIcon,
    Link as LinkIcon,
    LogOut,
    Menu,
    X,
    Home,
    Users,
    Award,
} from 'lucide-react'

/* ────────────────────────────────────────────────────────────── */
/*  Nav items                                                     */
/* ────────────────────────────────────────────────────────────── */

const NAV = [
    { href: '/x/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/x/admin/hero', icon: Home, label: 'Hero Section' },
    { href: '/x/admin/projects', icon: FolderKanban, label: 'Projects' },
    { href: '/x/admin/posts', icon: FileText, label: 'Blog Posts' },
    { href: '/x/admin/content', icon: Settings, label: 'Site Content' },
    { href: '/x/admin/settings', icon: Settings, label: 'Settings' },
    { href: '/x/admin/media', icon: ImageIcon, label: 'Media' },
    { href: '/x/admin/partners', icon: Users, label: 'Partners' },
    { href: '/x/admin/certifications', icon: Award, label: 'Certifications' },
    { href: '/x/admin/social', icon: LinkIcon, label: 'Social Links' },
]

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ─── SIDEBAR (desktop) ──────────────────────────────────────── */
.as {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 240px;
  background: #0D0D0D;
  border-right: 1px solid #262626;
  display: flex;
  flex-direction: column;
  z-index: 200;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ─── LOGO ───────────────────────────────────────────────────── */
.as__logo {
  padding: 24px 20px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #1A1A1A;
}
.as__brand {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
  color: #FAFAFA;
}
.as__brand-dot { color: #00FF94; }
.as__badge {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  padding: 2px 8px;
  border-radius: 999px;
  background: #00FF94;
  color: #0A0A0A;
  font-weight: 600;
}

/* ─── NAV ────────────────────────────────────────────────────── */
.as__nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}
.as__link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  font-family: var(--font-body);
  font-size: 13px;
  color: #8A8A8A;
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
.as__link:hover {
  background: rgba(255, 255, 255, 0.03);
  color: #FAFAFA;
}
.as__link--active {
  border-left-color: #00FF94;
  background: #141414;
  color: #00FF94;
}
.as__link svg { width: 18px; height: 18px; flex-shrink: 0; }

/* ─── SIGN OUT ───────────────────────────────────────────────── */
.as__bottom {
  padding: 12px 8px 16px;
  border-top: 1px solid #1A1A1A;
}
.as__signout {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  width: 100%;
  font-family: var(--font-body);
  font-size: 13px;
  color: #8A8A8A;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}
.as__signout:hover { color: #FF4444; }
.as__signout svg { width: 18px; height: 18px; }

/* ─── MOBILE TOP BAR ─────────────────────────────────────────── */
.as-mobile-bar {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 56px;
  background: #0D0D0D;
  border-bottom: 1px solid #262626;
  z-index: 99;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
}
.as-mobile-bar__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  color: #FAFAFA;
  cursor: pointer;
}
.as-mobile-bar__btn svg { width: 22px; height: 22px; }
.as-mobile-bar__title {
  font-family: var(--font-display);
  font-size: 16px;
  color: #FAFAFA;
  font-weight: 700;
}
.as-mobile-bar__title span { color: #00FF94; }

/* ─── OVERLAY ────────────────────────────────────────────────── */
.as-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 99;
}

/* ─── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 768px) {
  .as {
    transform: translateX(-100%);
  }
  .as--open { transform: translateX(0); }
  .as-mobile-bar { display: flex; }
  .as-overlay--open { display: block; }
  .admin-main { padding-top: calc(56px + 1.5rem) !important; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function AdminSidebar() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    const isActive = (href: string) => {
        if (href === '/x/admin') return pathname === '/x/admin'
        return pathname.startsWith(href)
    }

    const sidebar = (
        <aside className={`as${open ? ' as--open' : ''}`}>
            <div className="as__logo">
                <span className="as__brand">
                    ANURAG<span className="as__brand-dot">.</span>
                </span>
                <span className="as__badge">Admin</span>
            </div>

            <nav className="as__nav">
                {NAV.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`as__link${isActive(item.href) ? ' as__link--active' : ''}`}
                        onClick={() => setOpen(false)}
                    >
                        <item.icon />
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="as__bottom">
                <button
                    className="as__signout"
                    onClick={() => signOut({ callbackUrl: '/x/admin/login' })}
                >
                    <LogOut />
                    Sign Out
                </button>
            </div>
        </aside>
    )

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            {/* Mobile top bar */}
            <div className="as-mobile-bar">
                <button
                    className="as-mobile-bar__btn"
                    onClick={() => setOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu />
                </button>
                <span className="as-mobile-bar__title">
                    ANURAG<span>.</span>
                </span>
            </div>

            {/* Overlay */}
            <div
                className={`as-overlay${open ? ' as-overlay--open' : ''}`}
                onClick={() => setOpen(false)}
            />

            {sidebar}
        </>
    )
}
