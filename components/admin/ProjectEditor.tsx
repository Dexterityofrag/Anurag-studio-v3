'use client'

import { useActionState, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExt from '@tiptap/extension-image'
import LinkExt from '@tiptap/extension-link'
import { saveProject, type ProjectFormState } from '@/app/actions/projects'
import type { Project } from '@/lib/types'
import type { JSONContent } from '@tiptap/core'

/* ────────────────────────────────────────────────────────────── */
/*  Props                                                         */
/* ────────────────────────────────────────────────────────────── */

interface ProjectEditorProps {
    project: Project | null // null = new project mode
}

/* ────────────────────────────────────────────────────────────── */
/*  Slug helper                                                   */
/* ────────────────────────────────────────────────────────────── */

function slugify(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
}

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.pe {
  max-width: 820px;
}
.pe__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: #8A8A8A;
  text-decoration: none;
  margin-bottom: 20px;
  transition: color 0.2s ease;
}
.pe__back:hover { color: #FAFAFA; }
.pe__back svg { width: 14px; height: 14px; }

.pe__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FAFAFA;
  margin-bottom: 24px;
}

/* Form */
.pe__form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pe__group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pe__label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #8A8A8A;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.pe__input {
  width: 100%;
  background: #1A1A1A;
  border: 1px solid #262626;
  padding: 10px 14px;
  font-family: var(--font-body);
  font-size: 14px;
  color: #FAFAFA;
  outline: none;
  transition: border-color 0.25s ease;
  border-radius: 0;
  -webkit-appearance: none;
}
.pe__input:focus { border-color: #FF4D00; }
.pe__textarea {
  resize: vertical;
  min-height: 80px;
}

/* Row groups */
.pe__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.pe__row3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

/* Toggle */
.pe__toggle-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pe__switch {
  position: relative;
  width: 42px;
  height: 22px;
  background: #262626;
  border: none;
  border-radius: 11px;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
}
.pe__switch--on { background: #FF4D00; }
.pe__switch__knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #FAFAFA;
  transition: transform 0.2s ease;
}
.pe__switch--on .pe__switch__knob { transform: translateX(20px); }
.pe__toggle-label {
  font-family: var(--font-body);
  font-size: 13px;
  color: #FAFAFA;
}

/* Tiptap editor */
.pe__editor-card {
  background: #1A1A1A;
  border: 1px solid #262626;
}
.pe__toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 8px 10px;
  border-bottom: 1px solid #262626;
  flex-wrap: wrap;
}
.pe__toolbar-btn {
  padding: 6px 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: #8A8A8A;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 3px;
  transition: background 0.15s ease, color 0.15s ease;
}
.pe__toolbar-btn:hover { background: #262626; color: #FAFAFA; }
.pe__toolbar-btn--active { background: #262626; color: #FF4D00; }

.pe__editor-content {
  padding: 16px;
  min-height: 200px;
  font-family: var(--font-body);
  font-size: 14px;
  color: #FAFAFA;
  line-height: 1.7;
}
.pe__editor-content .tiptap { outline: none; min-height: 180px; }
.pe__editor-content .tiptap h2 { font-family: var(--font-display); font-size: 1.4em; margin: 1em 0 0.5em; color: #FAFAFA; }
.pe__editor-content .tiptap h3 { font-family: var(--font-display); font-size: 1.2em; margin: 1em 0 0.5em; color: #FAFAFA; }
.pe__editor-content .tiptap p { margin-bottom: 0.8em; }
.pe__editor-content .tiptap blockquote { border-left: 3px solid #FF4D00; padding-left: 16px; color: #8A8A8A; font-style: italic; margin: 1em 0; }
.pe__editor-content .tiptap a { color: #FF4D00; }
.pe__editor-content .tiptap img { max-width: 100%; border: 1px solid #262626; margin: 1em 0; }

/* Submit */
.pe__submit-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-top: 8px;
}
.pe__submit {
  padding: 12px 28px;
  background: #FF4D00;
  color: #0A0A0A;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.pe__submit:hover:not(:disabled) { opacity: 0.9; }
.pe__submit:disabled { opacity: 0.5; cursor: not-allowed; }

.pe__feedback {
  font-family: var(--font-mono);
  font-size: 12px;
}
.pe__feedback--ok { color: #FF4D00; }
.pe__feedback--err { color: #FF4444; }

@media (max-width: 640px) {
  .pe__row, .pe__row3 { grid-template-columns: 1fr; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function ProjectEditor({ project }: ProjectEditorProps) {
    const router = useRouter()
    const isNew = !project

    const [title, setTitle] = useState(project?.title ?? '')
    const [slug, setSlug] = useState(project?.slug ?? '')
    const [slugTouched, setSlugTouched] = useState(false)
    const [tagline, setTagline] = useState(project?.tagline ?? '')
    const [thumbnailUrl, setThumbnailUrl] = useState(project?.thumbnailUrl ?? '')
    const [coverUrl, setCoverUrl] = useState(project?.coverUrl ?? '')
    const [tags, setTags] = useState(project?.tags?.join(', ') ?? '')
    const [client, setClient] = useState(project?.client ?? '')
    const [role, setRole] = useState(project?.role ?? '')
    const [year, setYear] = useState(project?.year?.toString() ?? '')
    const [externalUrl, setExternalUrl] = useState(project?.externalUrl ?? '')
    const [isFeatured, setIsFeatured] = useState(project?.isFeatured ?? false)
    const [isPublished, setIsPublished] = useState(project?.isPublished ?? false)
    const [displayOrder, setDisplayOrder] = useState(project?.displayOrder?.toString() ?? '0')

    // Auto-slug from title
    useEffect(() => {
        if (!slugTouched) {
            setSlug(slugify(title))
        }
    }, [title, slugTouched])

    // Tiptap
    const editor = useEditor({
        extensions: [
            StarterKit,
            ImageExt.configure({ inline: false }),
            LinkExt.configure({ openOnClick: false }),
        ],
        content: (project?.description as JSONContent) ?? '',
        editorProps: {
            attributes: { class: 'tiptap' },
        },
    })

    // Server action wrapper
    const actionWrapper = useCallback(
        async (_prev: ProjectFormState, formData: FormData): Promise<ProjectFormState> => {
            // Inject Tiptap JSON + HTML
            if (editor) {
                formData.set('description', JSON.stringify(editor.getJSON()))
                formData.set('descriptionHtml', editor.getHTML())
            }
            const result = await saveProject(_prev, formData)
            if (result?.success && isNew && result.id) {
                router.push(`/x/admin/projects/${result.id}`)
            }
            return result
        },
        [editor, isNew, router]
    )

    const [state, formAction, isPending] = useActionState<ProjectFormState, FormData>(
        actionWrapper,
        null
    )

    // Toolbar helper
    const tb = (label: string, cmd: () => void, active: boolean) => (
        <button
            type="button"
            key={label}
            className={`pe__toolbar-btn${active ? ' pe__toolbar-btn--active' : ''}`}
            onClick={cmd}
        >
            {label}
        </button>
    )

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            <div className="pe">
                <Link href="/x/admin/projects" className="pe__back">
                    <ArrowLeft /> Back to Projects
                </Link>

                <h1 className="pe__title">{isNew ? 'New Project' : 'Edit Project'}</h1>

                <form className="pe__form" action={formAction}>
                    {project?.id && <input type="hidden" name="id" value={project.id} />}

                    {/* Title + Slug */}
                    <div className="pe__row">
                        <div className="pe__group">
                            <label className="pe__label">Title *</label>
                            <input
                                name="title"
                                className="pe__input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="pe__group">
                            <label className="pe__label">Slug</label>
                            <input
                                name="slug"
                                className="pe__input"
                                value={slug}
                                onChange={(e) => {
                                    setSlug(e.target.value)
                                    setSlugTouched(true)
                                }}
                            />
                        </div>
                    </div>

                    {/* Tagline */}
                    <div className="pe__group">
                        <label className="pe__label">Tagline</label>
                        <input
                            name="tagline"
                            className="pe__input"
                            value={tagline}
                            onChange={(e) => setTagline(e.target.value)}
                        />
                    </div>

                    {/* Rich text editor */}
                    <div className="pe__group">
                        <label className="pe__label">Description</label>
                        <input type="hidden" name="description" value="" />
                        <div className="pe__editor-card">
                            {editor && (
                                <div className="pe__toolbar">
                                    {tb('B', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
                                    {tb('I', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
                                    {tb('H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
                                    {tb('H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }))}
                                    {tb('Quote', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'))}
                                    {tb('Link', () => {
                                        const url = window.prompt('URL')
                                        if (url) editor.chain().focus().setLink({ href: url }).run()
                                    }, editor.isActive('link'))}
                                    {tb('Image', () => {
                                        const url = window.prompt('Image URL')
                                        if (url) editor.chain().focus().setImage({ src: url }).run()
                                    }, false)}
                                </div>
                            )}
                            <div className="pe__editor-content">
                                <EditorContent editor={editor} />
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="pe__row">
                        <div className="pe__group">
                            <label className="pe__label">Cover Image URL</label>
                            <input
                                name="coverUrl"
                                className="pe__input"
                                value={coverUrl}
                                onChange={(e) => setCoverUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="pe__group">
                            <label className="pe__label">Thumbnail URL</label>
                            <input
                                name="thumbnailUrl"
                                className="pe__input"
                                value={thumbnailUrl}
                                onChange={(e) => setThumbnailUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="pe__group">
                        <label className="pe__label">Tags (comma-separated)</label>
                        <input
                            name="tags"
                            className="pe__input"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="UI/UX, Branding, Development"
                        />
                    </div>

                    {/* Client / Role / Year */}
                    <div className="pe__row3">
                        <div className="pe__group">
                            <label className="pe__label">Client</label>
                            <input
                                name="client"
                                className="pe__input"
                                value={client}
                                onChange={(e) => setClient(e.target.value)}
                            />
                        </div>
                        <div className="pe__group">
                            <label className="pe__label">Role</label>
                            <input
                                name="role"
                                className="pe__input"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            />
                        </div>
                        <div className="pe__group">
                            <label className="pe__label">Year</label>
                            <input
                                name="year"
                                type="number"
                                className="pe__input"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* External URL */}
                    <div className="pe__group">
                        <label className="pe__label">External URL</label>
                        <input
                            name="externalUrl"
                            className="pe__input"
                            value={externalUrl}
                            onChange={(e) => setExternalUrl(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>

                    {/* Toggles + Display Order */}
                    <div className="pe__row3">
                        <div className="pe__toggle-row">
                            <input type="hidden" name="isFeatured" value={String(isFeatured)} />
                            <button
                                type="button"
                                className={`pe__switch${isFeatured ? ' pe__switch--on' : ''}`}
                                onClick={() => setIsFeatured((v) => !v)}
                                aria-label="Toggle featured"
                            >
                                <span className="pe__switch__knob" />
                            </button>
                            <span className="pe__toggle-label">Featured</span>
                        </div>
                        <div className="pe__toggle-row">
                            <input type="hidden" name="isPublished" value={String(isPublished)} />
                            <button
                                type="button"
                                className={`pe__switch${isPublished ? ' pe__switch--on' : ''}`}
                                onClick={() => setIsPublished((v) => !v)}
                                aria-label="Toggle published"
                            >
                                <span className="pe__switch__knob" />
                            </button>
                            <span className="pe__toggle-label">Published</span>
                        </div>
                        <div className="pe__group">
                            <label className="pe__label">Display Order</label>
                            <input
                                name="displayOrder"
                                type="number"
                                className="pe__input"
                                value={displayOrder}
                                onChange={(e) => setDisplayOrder(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pe__submit-row">
                        <button type="submit" className="pe__submit" disabled={isPending}>
                            {isPending ? 'Saving…' : 'Save Project'}
                        </button>
                        {state?.success && (
                            <span className="pe__feedback pe__feedback--ok">Saved ✓</span>
                        )}
                        {state?.error && (
                            <span className="pe__feedback pe__feedback--err">{state.error}</span>
                        )}
                    </div>
                </form>
            </div>
        </>
    )
}
