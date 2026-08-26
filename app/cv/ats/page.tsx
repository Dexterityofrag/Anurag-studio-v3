import type { Metadata } from 'next'
import { cv, contactLine } from '../cv-data'
import './ats.css'

export const metadata: Metadata = {
    title: 'Anurag Adhikari, CV (ATS)',
    robots: { index: false, follow: false },
}

/**
 * ATS document. Single column, no images, no tables, standard headings.
 *
 * Links render their own URL as the anchor text, so the document reads
 * correctly whether or not the application portal preserves the link layer.
 */
export default function AtsCvPage() {
    return (
        <div className="cv-page ats-sheet">
            <main className="ats">

                {/* ── Header ─────────────────────────────────────── */}
                <h1 className="ats-name">{cv.name}</h1>
                <p className="ats-title">{cv.title}</p>
                <p className="ats-contact">
                    {cv.location} | {cv.phone} |{' '}
                    <a href={`mailto:${cv.email}`}>{cv.email}</a>
                </p>
                <p className="ats-contact">
                    {cv.links.map((link, i) => (
                        <span key={link.href}>
                            {i > 0 && ' | '}
                            <a href={link.href}>{link.label}</a>
                        </span>
                    ))}
                </p>

                {/* ── Summary ────────────────────────────────────── */}
                <section className="ats-section">
                    <h2 className="ats-h2">Professional Summary</h2>
                    <p className="ats-summary">{cv.summary}</p>
                </section>

                {/* ── Skills ─────────────────────────────────────── */}
                <section className="ats-section">
                    <h2 className="ats-h2">Core Skills</h2>
                    {/* Each skill is one unbreakable unit. A plain wrapped
                        paragraph splits phrases across lines ("Cross-" /
                        "Functional"), which costs the keyword match in any
                        parser that reads the text layer line by line. */}
                    <p className="ats-skills">
                        {cv.coreSkills.map((skill, i) => (
                            <span key={skill}>
                                {i > 0 && ' | '}
                                <span className="ats-nowrap">{skill}</span>
                            </span>
                        ))}
                    </p>
                </section>

                {/* ── Experience ─────────────────────────────────── */}
                <section className="ats-section">
                    <h2 className="ats-h2">Professional Experience</h2>
                    {cv.experience.map(entry => (
                        <div className="ats-entry cv-avoid-break" key={`${entry.org}-${entry.dates}`}>
                            <p className="ats-role">{entry.role}</p>
                            <p className="ats-org">
                                {entry.org} | {entry.location} | {entry.dates}
                            </p>
                            <ul className="ats-list">
                                {entry.bullets.map(bullet => (
                                    <li key={bullet}>{bullet}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>

                {/* ── Projects ───────────────────────────────────── */}
                <section className="ats-section">
                    <h2 className="ats-h2">Selected Projects</h2>
                    {cv.projects.map(project => (
                        <div className="ats-entry cv-avoid-break" key={project.name}>
                            <p className="ats-role">{project.name}</p>
                            <p className="ats-org">
                                {project.meta}
                                {project.link && (
                                    <>
                                        {' | '}
                                        <a href={project.link.href}>{project.link.label}</a>
                                    </>
                                )}
                            </p>
                            <ul className="ats-list">
                                <li>{project.description}</li>
                            </ul>
                        </div>
                    ))}
                </section>

                {/* ── Education ──────────────────────────────────── */}
                <section className="ats-section">
                    <h2 className="ats-h2">Education</h2>
                    {cv.education.map(entry => (
                        <p className="ats-line" key={entry.qualification}>
                            <strong>{entry.qualification}</strong>
                            <br />
                            {entry.institution} | {entry.dates}
                        </p>
                    ))}
                </section>

                {/* ── Certifications ─────────────────────────────── */}
                <section className="ats-section">
                    <h2 className="ats-h2">Certifications</h2>
                    <ul className="ats-list" style={{ marginTop: '6pt' }}>
                        {cv.certifications.map(cert => (
                            <li key={cert.name}>
                                {cert.name}, {cert.issuer}, {cert.date}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* ── Tools ──────────────────────────────────────── */}
                <section className="ats-section">
                    <h2 className="ats-h2">Tools and Technologies</h2>
                    {cv.tools.map(group => (
                        <p className="ats-tools" key={group.group}>
                            <strong>{group.group}:</strong> {group.items}
                        </p>
                    ))}
                </section>

                {/* ── Languages ──────────────────────────────────── */}
                <section className="ats-section">
                    <h2 className="ats-h2">Languages</h2>
                    <p className="ats-tools">{cv.languages}</p>
                </section>

            </main>
        </div>
    )
}
