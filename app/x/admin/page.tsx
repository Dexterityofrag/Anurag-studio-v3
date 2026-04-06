import Link from 'next/link'
import { db } from '@/lib/db'
import { projects, blogPosts, media } from '@/lib/db/schema'
import { eq, count, desc } from 'drizzle-orm'

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = `
.dash__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FAFAFA;
  margin-bottom: clamp(1.5rem, 3vw, 2rem);
}

/* Stats grid */
.dash__stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: clamp(2rem, 4vw, 3rem);
}
.dash__stat {
  background: #141414;
  border: 1px solid #262626;
  padding: 20px;
}
.dash__stat-num {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 2rem;
  color: #00FF94;
  line-height: 1;
  margin-bottom: 6px;
}
.dash__stat-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #8A8A8A;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Section */
.dash__section {
  background: #141414;
  border: 1px solid #262626;
  margin-bottom: 16px;
}
.dash__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #1A1A1A;
}
.dash__section-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  color: #FAFAFA;
}
.dash__section-link {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #00FF94;
  text-decoration: none;
  letter-spacing: 0.04em;
  transition: opacity 0.2s ease;
}
.dash__section-link:hover { opacity: 0.7; }

/* Table */
.dash__table {
  width: 100%;
  border-collapse: collapse;
}
.dash__table th {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #8A8A8A;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: left;
  padding: 10px 20px;
  font-weight: 500;
}
.dash__table td {
  padding: 12px 20px;
  font-family: var(--font-body);
  font-size: 13px;
  color: #FAFAFA;
  border-top: 1px solid #1A1A1A;
}
.dash__table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}
.dash__badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  padding: 3px 10px;
  border-radius: 999px;
}
.dash__badge--pub {
  background: rgba(0, 255, 148, 0.1);
  color: #00FF94;
}
.dash__badge--draft {
  background: rgba(138, 138, 138, 0.1);
  color: #8A8A8A;
}
.dash__edit {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #8A8A8A;
  text-decoration: none;
  transition: color 0.2s ease;
}
.dash__edit:hover { color: #00FF94; }

.dash__empty {
  padding: 24px 20px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: #555;
  text-align: center;
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Helper – format date                                         */
/* ────────────────────────────────────────────────────────────── */

function fmtDate(d: Date | null | undefined): string {
    if (!d) return '-'
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(d))
}

/* ────────────────────────────────────────────────────────────── */
/*  Page (server component)                                       */
/* ────────────────────────────────────────────────────────────── */
export const dynamic = 'force-dynamic'
export const revalidate = 0
export default async function AdminDashboard() {
    // ── Stats (parallel) ──────────────────────────────────────
    const [
        [{ value: totalProjects }],
        [{ value: pubProjects }],
        [{ value: totalPosts }],
        [{ value: pubPosts }],
        [{ value: totalMedia }],
    ] = await Promise.all([
        db.select({ value: count() }).from(projects),
        db.select({ value: count() }).from(projects).where(eq(projects.isPublished, true)),
        db.select({ value: count() }).from(blogPosts),
        db.select({ value: count() }).from(blogPosts).where(eq(blogPosts.isPublished, true)),
        db.select({ value: count() }).from(media),
    ])

    // ── Recent items ──────────────────────────────────────────
    const [recentProjects, recentPosts] = await Promise.all([
        db
            .select()
            .from(projects)
            .orderBy(desc(projects.createdAt))
            .limit(5),
        db
            .select()
            .from(blogPosts)
            .orderBy(desc(blogPosts.createdAt))
            .limit(5),
    ])

    const stats = [
        { num: totalProjects, label: 'Total Projects' },
        { num: pubProjects, label: 'Published Projects' },
        { num: totalPosts, label: 'Total Posts' },
        { num: pubPosts, label: 'Published Posts' },
        { num: totalMedia, label: 'Media Files' },
    ]

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            <h1 className="dash__title">Dashboard</h1>

            {/* Stats */}
            <div className="dash__stats">
                {stats.map((s) => (
                    <div key={s.label} className="dash__stat">
                        <p className="dash__stat-num">{s.num}</p>
                        <p className="dash__stat-label">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Projects */}
            <div className="dash__section">
                <div className="dash__section-header">
                    <h2 className="dash__section-title">Recent Projects</h2>
                    <Link href="/x/admin/projects" className="dash__section-link">
                        View All →
                    </Link>
                </div>
                {recentProjects.length > 0 ? (
                    <table className="dash__table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentProjects.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.title}</td>
                                    <td>
                                        <span
                                            className={`dash__badge ${p.isPublished ? 'dash__badge--pub' : 'dash__badge--draft'}`}
                                        >
                                            {p.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td style={{ color: '#8A8A8A', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                                        {fmtDate(p.createdAt)}
                                    </td>
                                    <td>
                                        <Link
                                            href={`/x/admin/projects/${p.id}`}
                                            className="dash__edit"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="dash__empty">No projects yet</p>
                )}
            </div>

            {/* Recent Posts */}
            <div className="dash__section">
                <div className="dash__section-header">
                    <h2 className="dash__section-title">Recent Posts</h2>
                    <Link href="/x/admin/posts" className="dash__section-link">
                        View All →
                    </Link>
                </div>
                {recentPosts.length > 0 ? (
                    <table className="dash__table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPosts.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.title}</td>
                                    <td>
                                        <span
                                            className={`dash__badge ${p.isPublished ? 'dash__badge--pub' : 'dash__badge--draft'}`}
                                        >
                                            {p.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td style={{ color: '#8A8A8A', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                                        {fmtDate(p.createdAt)}
                                    </td>
                                    <td>
                                        <Link
                                            href={`/x/admin/posts/${p.id}`}
                                            className="dash__edit"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="dash__empty">No posts yet</p>
                )}
            </div>
        </>
    )
}
