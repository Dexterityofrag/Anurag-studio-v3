import type { Metadata } from 'next'
import { Fragment } from 'react'
import { cv, letter } from '../cv-data'
import './letter.css'

export const metadata: Metadata = {
    title: 'Anurag Adhikari, Cover Letter',
    robots: { index: false, follow: false },
}

/** Header contact line, flattened so it can wrap between items. */
const contactItems: { text: string; href?: string }[] = [
    { text: cv.location },
    { text: cv.phone },
    { text: cv.email, href: `mailto:${cv.email}` },
    ...cv.links.map(link => ({ text: link.label, href: link.href })),
]

/**
 * Turns a bare "anurag.studio" mention in the body copy into a live link,
 * so the reader can reach the portfolio from the letter itself.
 */
function linkPortfolio(text: string) {
    return text.split('anurag.studio').map((chunk, i) => (
        <Fragment key={i}>
            {i > 0 && <a href="https://anurag.studio">anurag.studio</a>}
            {chunk}
        </Fragment>
    ))
}

export default function CoverLetterPage() {
    return (
        <div className="cv-page l-sheet">
            <main className="letter">

                {/* ── Header ─────────────────────────────────────── */}
                <header className="l-header">
                    <h1 className="l-name">{cv.name}</h1>
                    <p className="l-title">{cv.title}</p>
                    <p className="l-contact">
                        {contactItems.map((item, i) => (
                            <Fragment key={item.text}>
                                {i > 0 && <span className="l-sep"> / </span>}
                                {item.href ? (
                                    <a href={item.href}>{item.text}</a>
                                ) : (
                                    <span>{item.text}</span>
                                )}
                            </Fragment>
                        ))}
                    </p>
                </header>

                {/* ── Date and recipient ─────────────────────────── */}
                <p className="l-date">{letter.date}</p>

                <p className="l-recipient">
                    {letter.recipientLines.map(line => (
                        <span key={line}>{line}</span>
                    ))}
                </p>

                {/* ── Body ───────────────────────────────────────── */}
                <p className="l-salutation">{letter.salutation}</p>

                <div className="l-body">
                    {letter.paragraphs.map((para, i) => (
                        <p key={i}>{linkPortfolio(para)}</p>
                    ))}
                </div>

                {/* ── Signoff ────────────────────────────────────── */}
                <p className="l-signoff">
                    {letter.signoff}
                    <span className="l-signature">{cv.name}</span>
                </p>

            </main>
        </div>
    )
}
