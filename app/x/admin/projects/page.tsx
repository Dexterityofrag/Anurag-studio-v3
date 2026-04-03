import Link from 'next/link'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import ProjectListClient from '@/components/admin/ProjectListClient'

const css = `
.ap__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: clamp(1.5rem, 3vw, 2rem);
  flex-wrap: wrap;
  gap: 12px;
}
.ap__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FAFAFA;
}
.ap__new-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: #00FF94;
  color: #0A0A0A;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  text-decoration: none;
  letter-spacing: 0.04em;
  transition: opacity 0.2s ease;
}
.ap__new-btn:hover { opacity: 0.9; }
`

export default async function AdminProjectsPage() {
    const allProjects = await db
        .select()
        .from(projects)
        .orderBy(asc(projects.displayOrder))

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            <div className="ap__header">
                <h1 className="ap__title">Projects</h1>
                <Link href="/x/admin/projects/new" className="ap__new-btn">
                    + New Project
                </Link>
            </div>

            <ProjectListClient projects={allProjects} />
        </>
    )
}
