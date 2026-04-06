import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

const css = `
.admin-shell {
  display: flex;
  min-height: 100dvh;
  background: #0A0A0A;
}
.admin-main {
  flex: 1;
  margin-left: 240px;
  padding: clamp(1.5rem, 3vw, 2.5rem);
  overflow-y: auto;
}
@media (max-width: 768px) {
  .admin-main { margin-left: 0; }
}
`

export default async function AdminLayout({
    children,
}: {
    children: ReactNode
}) {
    const session = await auth()
    if (!session) redirect('/x/admin/login')

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <div className="admin-shell">
                <AdminSidebar />
                <main className="admin-main">{children}</main>
            </div>
        </>
    )
}
