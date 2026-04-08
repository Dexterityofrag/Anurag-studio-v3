import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import ProjectEditor from '@/components/admin/ProjectEditor'

type PageArgs = { params: Promise<{ id: string }> }
export const dynamic = 'force-dynamic'
export const revalidate = 0
export default async function AdminProjectEditorPage({ params }: PageArgs) {
    const { id } = await params

    if (id === 'new') {
        return <ProjectEditor project={null} />
    }

    const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1)

    if (!project) notFound()

    return <ProjectEditor project={project} />
}
