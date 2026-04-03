'use client'

import { useActionState, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExt from '@tiptap/extension-image'
import LinkExt from '@tiptap/extension-link'
import { savePost, type PostFormState } from '@/app/actions/posts'
import type { BlogPost } from '@/lib/types'
import type { JSONContent } from '@tiptap/core'

/* ────────────────────────────────────────────────────────────── */
/*  Props                                                         */
/* ────────────────────────────────────────────────────────────── */

interface PostEditorProps {
    post: BlogPost | null
}

/* ────────────────────────────────────────────────────────────── */
/*  Helpers                                                       */
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

function toDateInputValue(d: Date | null | undefined): string {
    if (!d) return ''
    const dt = new Date(d)
    return dt.toISOString().slice(0, 16) // datetime-local format
}

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.ped {
  max-width: 820px;
}
.ped__back {
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
.ped__back:hover { color: #FAFAFA; }
.ped__back svg { width: 14px; height: 14px; }

.ped__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FAFAFA;
  margin-bottom: 24px;
}

.ped__form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ped__group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ped__label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #8A8A8A;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.ped__hint {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #555;
  letter-spacing: 0.02em;
}
.ped__input {
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
.ped__input:focus { border-color: #C8FF00; }
.ped__textarea {
  resize: vertical;
  min-height: 80px;
}

.ped__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Toggle */
.ped__toggle-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ped__switch {
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
.ped__switch--on { background: #C8FF00; }
.ped__switch__knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #FAFAFA;
  transition: transform 0.2s ease;
}
.ped__switch--on .ped__switch__knob { transform: translateX(20px); }
.ped__toggle-label {
  font-family: var(--font-body);
  font-size: 13px;
  color: #FAFAFA;
}

/* Tiptap editor */
.ped__editor-card {
  background: #1A1A1A;
  border: 1px solid #262626;
}
.ped__toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 8px 10px;
  border-bottom: 1px solid #262626;
  flex-wrap: wrap;
}
.ped__toolbar-btn {
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
.ped__toolbar-btn:hover { background: #262626; color: #FAFAFA; }
.ped__toolbar-btn--active { background: #262626; color: #C8FF00; }

.ped__editor-content {
  padding: 16px;
  min-height: 260px;
  font-family: var(--font-body);
  font-size: 14px;
  color: #FAFAFA;
  line-height: 1.7;
}
.ped__editor-content .tiptap { outline: none; min-height: 240px; }
.ped__editor-content .tiptap h2 { font-family: var(--font-display); font-size: 1.4em; margin: 1em 0 0.5em; color: #FAFAFA; }
.ped__editor-content .tiptap h3 { font-family: var(--font-display); font-size: 1.2em; margin: 1em 0 0.5em; color: #FAFAFA; }
.ped__editor-content .tiptap p { margin-bottom: 0.8em; }
.ped__editor-content .tiptap blockquote { border-left: 3px solid #C8FF00; padding-left: 16px; color: #8A8A8A; font-style: italic; margin: 1em 0; }
.ped__editor-content .tiptap a { color: #C8FF00; }
.ped__editor-content .tiptap img { max-width: 100%; border: 1px solid #262626; margin: 1em 0; }

/* Collapsible SEO section */
.ped__seo-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 0;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 12px;
  color: #8A8A8A;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: color 0.2s ease;
  width: 100%;
}
.ped__seo-toggle:hover { color: #FAFAFA; }
.ped__seo-toggle svg {
  width: 14px;
  height: 14px;
  transition: transform 0.3s ease;
}
.ped__seo-toggle--open svg { transform: rotate(180deg); }
.ped__seo-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease;
}
.ped__seo-content--open {
  max-height: 400px;
}

/* Submit */
.ped__submit-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-top: 8px;
}
.ped__submit {
  padding: 12px 28px;
  background: #C8FF00;
  color: #0A0A0A;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.ped__submit:hover:not(:disabled) { opacity: 0.9; }
.ped__submit:disabled { opacity: 0.5; cursor: not-allowed; }
.ped__feedback {
  font-family: var(--font-mono);
  font-size: 12px;
}
.ped__feedback--ok { color: #C8FF00; }
.ped__feedback--err { color: #FF4444; }

@media (max-width: 640px) {
  .ped__row { grid-template-columns: 1fr; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function PostEditor({ post }: PostEditorProps) {
    const router = useRouter()
    const isNew = !post

    const [title, setTitle] = useState(post?.title ?? '')
    const [slug, setSlug] = useState(post?.slug ?? '')
    const [slugTouched, setSlugTouched] = useState(false)
    const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
    const [externalUrl, setExternalUrl] = useState((post as any)?.externalUrl ?? '')
    const [coverUrl, setCoverUrl] = useState(post?.coverUrl ?? '')
    const [tags, setTags] = useState(post?.tags?.join(', ') ?? '')
    const [isPublished, setIsPublished] = useState(post?.isPublished ?? false)
    const [publishedAt, setPublishedAt] = useState(toDateInputValue(post?.publishedAt))
    const [readingTime, setReadingTime] = useState(post?.readingTimeMinutes?.toString() ?? '')
    const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? '')
    const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? '')
    const [seoOpen, setSeoOpen] = useState(false)

    // Auto-slug
    useEffect(() => {
        if (!slugTouched) setSlug(slugify(title))
    }, [title, slugTouched])

    // Tiptap
    const editor = useEditor({
        extensions: [
            StarterKit,
            ImageExt.configure({ inline: false }),
            LinkExt.configure({ openOnClick: false }),
        ],
        content: (post?.content as JSONContent) ?? '',
        editorProps: {
            attributes: { class: 'tiptap' },
        },
    })

    // Server action wrapper
    const actionWrapper = useCallback(
        async (_prev: PostFormState, formData: FormData): Promise<PostFormState> => {
            if (editor) {
                formData.set('content', JSON.stringify(editor.getJSON()))
                formData.set('contentHtml', editor.getHTML())
            }
            const result = await savePost(_prev, formData)
            if (result?.success && isNew && result.id) {
                router.push(`/x/admin/posts/${result.id}`)
            }
            return result
        },
        [editor, isNew, router]
    )

    const [state, formAction, isPending] = useActionState<PostFormState, FormData>(
        actionWrapper,
        null
    )

    const tb = (label: string, cmd: () => void, active: boolean) => (
        <button
            type="button"
            key={label}
            className={`ped__toolbar-btn${active ? ' ped__toolbar-btn--active' : ''}`}
            onClick={cmd}
        >
            {label}
        </button>
    )

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            <div className="ped">
                <Link href="/x/admin/posts" className="ped__back">
                    <ArrowLeft /> Back to Posts
                </Link>

                <h1 className="ped__title">{isNew ? 'New Post' : 'Edit Post'}</h1>

                <form className="ped__form" action={formAction}>
                    {post?.id && <input type="hidden" name="id" value={post.id} />}

                    {/* Title + Slug */}
                    <div className="ped__row">
                        <div className="ped__group">
                            <label className="ped__label">Title *</label>
                            <input
                                name="title"
                                className="ped__input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="ped__group">
                            <label className="ped__label">Slug</label>
                            <input
                                name="slug"
                                className="ped__input"
                                value={slug}
                                onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }}
                            />
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div className="ped__group">
                        <label className="ped__label">Excerpt</label>
                        <textarea
                            name="excerpt"
                            className="ped__input ped__textarea"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            maxLength={300}
                            rows={3}
                        />
                        <span className="ped__hint">{excerpt.length}/300 characters</span>
                    </div>

                    {/* External URL (Medium / external post) */}
                    <div className="ped__group">
                        <label className="ped__label">External URL (Medium / Link Post)</label>
                        <input
                            name="externalUrl"
                            className="ped__input"
                            value={externalUrl}
                            onChange={(e) => setExternalUrl(e.target.value)}
                            placeholder="https://medium.com/@anurag/..."
                        />
                        <span className="ped__hint">If set, clicking the card on the site redirects here instead of showing content. Use for Medium posts.</span>
                    </div>

                    {/* Cover URL */}
                    <div className="ped__group">
                        <label className="ped__label">Cover Image URL</label>
                        <input
                            name="coverUrl"
                            className="ped__input"
                            value={coverUrl}
                            onChange={(e) => setCoverUrl(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>

                    {/* Tags */}
                    <div className="ped__group">
                        <label className="ped__label">Tags (comma-separated)</label>
                        <input
                            name="tags"
                            className="ped__input"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="Design, Development, Thoughts"
                        />
                    </div>

                    {/* Tiptap editor */}
                    <div className="ped__group">
                        <label className="ped__label">Content</label>
                        <input type="hidden" name="content" value="" />
                        <input type="hidden" name="contentHtml" value="" />
                        <div className="ped__editor-card">
                            {editor && (
                                <div className="ped__toolbar">
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
                            <div className="ped__editor-content">
                                <EditorContent editor={editor} />
                            </div>
                        </div>
                    </div>

                    {/* Published + Date + Reading time */}
                    <div className="ped__row">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="ped__toggle-row">
                                <input type="hidden" name="isPublished" value={String(isPublished)} />
                                <button
                                    type="button"
                                    className={`ped__switch${isPublished ? ' ped__switch--on' : ''}`}
                                    onClick={() => setIsPublished((v) => !v)}
                                    aria-label="Toggle published"
                                >
                                    <span className="ped__switch__knob" />
                                </button>
                                <span className="ped__toggle-label">Published</span>
                            </div>
                            <div className="ped__group">
                                <label className="ped__label">Published At</label>
                                <input
                                    name="publishedAt"
                                    type="datetime-local"
                                    className="ped__input"
                                    value={publishedAt}
                                    onChange={(e) => setPublishedAt(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="ped__group">
                            <label className="ped__label">Reading Time (min)</label>
                            <input
                                name="readingTimeMinutes"
                                type="number"
                                className="ped__input"
                                value={readingTime}
                                onChange={(e) => setReadingTime(e.target.value)}
                                placeholder="Auto-calculate if empty"
                                min={1}
                            />
                            <span className="ped__hint">Leave blank to auto-calculate from word count</span>
                        </div>
                    </div>

                    {/* SEO section (collapsible) */}
                    <div>
                        <button
                            type="button"
                            className={`ped__seo-toggle${seoOpen ? ' ped__seo-toggle--open' : ''}`}
                            onClick={() => setSeoOpen((v) => !v)}
                        >
                            <ChevronDown /> SEO Settings
                        </button>
                        <div className={`ped__seo-content${seoOpen ? ' ped__seo-content--open' : ''}`}>
                            <div className="ped__group">
                                <label className="ped__label">Meta Title</label>
                                <input
                                    name="metaTitle"
                                    className="ped__input"
                                    value={metaTitle}
                                    onChange={(e) => setMetaTitle(e.target.value)}
                                    placeholder="Defaults to post title"
                                />
                            </div>
                            <div className="ped__group">
                                <label className="ped__label">Meta Description</label>
                                <textarea
                                    name="metaDescription"
                                    className="ped__input ped__textarea"
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    maxLength={160}
                                    rows={2}
                                    placeholder="Defaults to excerpt"
                                />
                                <span className="ped__hint">{metaDescription.length}/160 characters</span>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="ped__submit-row">
                        <button type="submit" className="ped__submit" disabled={isPending}>
                            {isPending ? 'Saving…' : 'Save Post'}
                        </button>
                        {state?.success && (
                            <span className="ped__feedback ped__feedback--ok">Saved ✓</span>
                        )}
                        {state?.error && (
                            <span className="ped__feedback ped__feedback--err">{state.error}</span>
                        )}
                    </div>
                </form>
            </div>
        </>
    )
}
