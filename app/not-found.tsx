import Link from 'next/link'

const css = `
.nf {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  background: #0A0A0A;
  text-align: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}
.nf__ghost {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(12rem, 30vw, 24rem);
  color: #1A1A1A;
  line-height: 1;
  position: absolute;
  user-select: none;
  pointer-events: none;
}
.nf__content {
  position: relative;
  z-index: 1;
}
.nf__heading {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  color: #FAFAFA;
  margin-bottom: 12px;
}
.nf__sub {
  font-family: var(--font-body);
  font-size: 15px;
  color: #8A8A8A;
  margin-bottom: 32px;
  line-height: 1.5;
}
.nf__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 14px 28px;
  background: #00FF94;
  color: #0A0A0A;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
  letter-spacing: 0.04em;
  transition: opacity 0.2s ease;
}
.nf__link:hover { opacity: 0.9; }
`

export default function NotFound() {
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <div className="nf">
                <span className="nf__ghost">404</span>
                <div className="nf__content">
                    <h1 className="nf__heading">Page not found</h1>
                    <p className="nf__sub">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                    <Link href="/" className="nf__link">
                        Go Home →
                    </Link>
                </div>
            </div>
        </>
    )
}
