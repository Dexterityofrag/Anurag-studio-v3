import type { Metadata } from 'next'
import { Fragment } from 'react'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { cv } from '../cv-data'
import './designed.css'

/** Header contact line, flattened so it can wrap between items. */
const contactItems: { text: string; href?: string }[] = [
    { text: cv.location },
    { text: cv.phone },
    { text: cv.email, href: `mailto:${cv.email}` },
    ...cv.links.map(link => ({ text: link.label, href: link.href })),
]

export const metadata: Metadata = {
    title: 'Anurag Adhikari, CV',
    robots: { index: false, follow: false },
}

const HEADSHOT = '/cv/headshot.jpg'

/**
 * Designed document. One A4 page.
 *
 * Reads the same `cv` object as the ATS version and clips each role to its
 * `designedBullets` count, so the two documents can never say different things.
 */
export default function DesignedCvPage() {
    /* Drops in the moment public/cv/headshot.jpg exists. Until then the
       header collapses to type only rather than rendering a broken image. */
    const hasHeadshot = existsSync(path.join(process.cwd(), 'public', 'cv', 'headshot.jpg'))

    return (
        <div className="cv-page d-sheet">
            <main className="designed">

                {/* ── Header ─────────────────────────────────────── */}
                <header className="d-header">
                    <div className="d-header-text">
                        <h1 className="d-name">{cv.name}</h1>
                        <p className="d-title">{cv.title}</p>
                        <p className="d-contact">
                            {contactItems.map((item, i) => (
                                <Fragment key={item.text}>
                                    {/* Real spaces inside the separator: they are the only
                                        break opportunities on this line, since each item
                                        itself is nowrap. */}
                                    {i > 0 && <span className="d-sep"> / </span>}
                                    {item.href ? (
                                        <a href={item.href}>{item.text}</a>
                                    ) : (
                                        <span>{item.text}</span>
                                    )}
                                </Fragment>
                            ))}
                        </p>
                    </div>
                    {hasHeadshot && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="d-photo" src={HEADSHOT} alt={cv.name} />
                    )}
                </header>

                {/* ── Summary ────────────────────────────────────── */}
                <section className="d-section">
                    <p className="d-label">Profile</p>
                    <div className="d-body">
                        <p className="d-summary">{cv.summaryShort}</p>
                    </div>
                </section>

                {/* ── Experience ─────────────────────────────────── */}
                <section className="d-section">
                    <p className="d-label">Experience</p>
                    <div className="d-body">
                        {cv.experience.map(entry => (
                            <div className="d-entry" key={`${entry.org}-${entry.dates}`}>
                                <div className="d-entry-head">
                                    <p className="d-role">
                                        {entry.role}
                                        <span className="d-org">, {entry.org}</span>
                                    </p>
                                    <span className="d-dates">{entry.dates}</span>
                                </div>
                                <ul className="d-list">
                                    {entry.bullets.slice(0, entry.designedBullets).map(bullet => (
                                        <li key={bullet}>{bullet}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Projects ───────────────────────────────────── */}
                <section className="d-section">
                    <p className="d-label">Selected Work</p>
                    <div className="d-body">
                        {cv.projects
                            .filter(project => project.inDesigned)
                            .map(project => (
                                <div className="d-entry" key={project.name}>
                                    <div className="d-entry-head">
                                        <p className="d-role">
                                            {project.link ? (
                                                <a href={project.link.href}>{project.name}</a>
                                            ) : (
                                                project.name
                                            )}
                                        </p>
                                        <span className="d-dates">{project.meta}</span>
                                    </div>
                                    <ul className="d-list">
                                        <li>{project.description}</li>
                                    </ul>
                                </div>
                            ))}
                    </div>
                </section>

                {/* ── Capabilities ───────────────────────────────── */}
                <section className="d-section">
                    <p className="d-label">Capabilities</p>
                    <div className="d-body">
                        <p className="d-skills">
                            {cv.coreSkillsShort.map((skill, i) => (
                                <span key={skill}>
                                    {i > 0 && <span className="d-sep">/</span>}
                                    {skill}
                                </span>
                            ))}
                        </p>
                    </div>
                </section>

                {/* ── Tools ──────────────────────────────────────── */}
                <section className="d-section">
                    <p className="d-label">Toolkit</p>
                    <div className="d-body">
                        {cv.tools.map(group => (
                            <p className="d-inline" key={group.group}>
                                <span className="d-key">{group.group}</span>&nbsp;&nbsp;{group.items}
                            </p>
                        ))}
                    </div>
                </section>

                {/* ── Education and certifications ───────────────── */}
                <section className="d-section">
                    <p className="d-label">Education</p>
                    <div className="d-body">
                        {cv.education
                            .filter(entry => entry.inDesigned)
                            .map(entry => (
                                <div className="d-entry-head" key={entry.qualification}>
                                    <p className="d-role">
                                        {entry.qualification}
                                        <span className="d-org">, {entry.institution}</span>
                                    </p>
                                    <span className="d-dates">{entry.dates}</span>
                                </div>
                            ))}
                        <p className="d-inline">
                            <span className="d-key">Certifications</span>&nbsp;&nbsp;
                            {cv.certifications.map(c => `${c.name} (${c.date})`).join('. ')}
                        </p>
                        <p className="d-inline">
                            <span className="d-key">Languages</span>&nbsp;&nbsp;{cv.languages}
                        </p>
                    </div>
                </section>

            </main>
        </div>
    )
}
