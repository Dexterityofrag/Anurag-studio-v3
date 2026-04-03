'use client'

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.prose {
  font-family: var(--font-body);
  color: rgba(250, 250, 250, 0.9);
  font-size: clamp(1rem, 1.6vw, 1.125rem);
  line-height: 1.8;
  max-width: 720px;
}

.prose h1, .prose h2, .prose h3, .prose h4 {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--text);
  margin-top: 2em;
  margin-bottom: 0.6em;
  line-height: 1.15;
}
.prose h1 { font-size: 2em; }
.prose h2 { font-size: 1.5em; }
.prose h3 { font-size: 1.25em; }

.prose p {
  margin-bottom: 1.4em;
}

.prose a {
  color: var(--accent);
  text-decoration: none;
  transition: text-decoration 0.2s ease;
}
.prose a:hover {
  text-decoration: underline;
}

.prose blockquote {
  border-left: 3px solid var(--accent);
  padding-left: 1.5rem;
  margin: 1.6em 0;
  font-style: italic;
  color: var(--muted);
}

.prose ul, .prose ol {
  padding-left: 1.5rem;
  margin-bottom: 1.4em;
}
.prose li {
  margin-bottom: 0.4em;
}

.prose img {
  width: 100%;
  height: auto;
  border: 1px solid var(--border);
  border-radius: 4px;
  margin: 1.5em 0;
}

.prose pre {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1rem 1.25rem;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.875em;
  margin: 1.4em 0;
}
.prose code {
  font-family: var(--font-mono);
  font-size: 0.875em;
  background: var(--surface);
  padding: 2px 6px;
  border-radius: 3px;
}
.prose pre code {
  background: none;
  padding: 0;
}

.prose hr {
  border: none;
  height: 1px;
  background: var(--border);
  margin: 2em 0;
}

.prose strong { color: var(--text); }
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function TiptapRenderer({ html }: { html: string }) {
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </>
    )
}
