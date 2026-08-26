import Link from 'next/link'
import { cv } from './cv-data'

const documents = [
    {
        href: '/cv/designed',
        name: 'Designed CV',
        detail: 'One page. Typeset. Send this to a human.',
    },
    {
        href: '/cv/ats',
        name: 'ATS CV',
        detail: 'Two pages. Single column, parser-safe. Upload this to the application portal.',
    },
    {
        href: '/cv/letter',
        name: 'Cover Letter',
        detail: 'One page. Written for Apple ETS Insight, role 200678614-0321.',
    },
]

export default function CvIndexPage() {
    return (
        <div className="cv-page" style={{ padding: '80px 24px', fontFamily: 'var(--font-body), sans-serif' }}>
            <div style={{ maxWidth: 620, margin: '0 auto' }}>
                <h1
                    style={{
                        fontFamily: 'var(--font-display), sans-serif',
                        fontSize: 28,
                        fontWeight: 500,
                        letterSpacing: '-0.02em',
                        margin: 0,
                    }}
                >
                    {cv.name}
                </h1>
                <p style={{ color: '#6b7076', margin: '6px 0 40px', fontSize: 14 }}>
                    Two documents, one source of truth in <code>app/cv/cv-data.ts</code>.
                </p>

                {documents.map(doc => (
                    <Link
                        key={doc.href}
                        href={doc.href}
                        style={{
                            display: 'block',
                            padding: '18px 20px',
                            marginBottom: 10,
                            border: '1px solid #e3e3df',
                            borderRadius: 8,
                        }}
                    >
                        <strong style={{ fontSize: 15, fontWeight: 600 }}>{doc.name}</strong>
                        <span style={{ display: 'block', color: '#6b7076', fontSize: 13, marginTop: 3 }}>
                            {doc.detail}
                        </span>
                    </Link>
                ))}

                <p style={{ color: '#6b7076', fontSize: 13, marginTop: 32, lineHeight: 1.6 }}>
                    Export both to PDF with live links: <code>npm run cv:render</code>. Files land in{' '}
                    <code>out/cv/</code>, which is gitignored, so the phone number never ships to the live site.
                </p>
            </div>
        </div>
    )
}
