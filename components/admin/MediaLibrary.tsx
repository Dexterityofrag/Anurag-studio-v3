'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Upload, Copy, Trash2, X, Check, ImageIcon } from 'lucide-react'
import { saveMediaRecord, updateMediaAlt, deleteMedia } from '@/app/actions/media'

/* ────────────────────────────────────────────────────────────── */
/*  Types                                                         */
/* ────────────────────────────────────────────────────────────── */

type MediaFile = {
    id: string
    filename: string
    storagePath: string
    url: string
    altText: string | null
    mimeType: string | null
    width: number | null
    height: number | null
    folder: string | null
    createdAt: Date | null
}

type UploadItem = {
    file: File
    progress: number
    status: 'uploading' | 'done' | 'error'
    error?: string
}

interface Props {
    files: MediaFile[]
}

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.ml__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FAFAFA;
  margin-bottom: clamp(1.5rem, 3vw, 2rem);
}

/* Upload zone */
.ml__drop {
  border: 2px dashed #262626;
  padding: clamp(2rem, 4vw, 3rem);
  text-align: center;
  margin-bottom: 20px;
  cursor: pointer;
  transition: border-color 0.3s ease, background 0.3s ease;
}
.ml__drop:hover, .ml__drop--active {
  border-color: #FF4D00;
  background: rgba(255, 77, 0, 0.03);
}
.ml__drop-icon { color: #8A8A8A; margin-bottom: 8px; }
.ml__drop-text {
  font-family: var(--font-body);
  font-size: 14px;
  color: #8A8A8A;
}
.ml__drop-text strong { color: #FF4D00; }
.ml__drop-hint {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #555;
  margin-top: 4px;
}

/* Upload progress */
.ml__uploads {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.ml__upload-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #141414;
  border: 1px solid #262626;
}
.ml__upload-name {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #FAFAFA;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ml__upload-bar {
  width: 100px;
  height: 3px;
  background: #262626;
  border-radius: 2px;
  overflow: hidden;
}
.ml__upload-fill {
  height: 100%;
  background: #FF4D00;
  border-radius: 2px;
  transition: width 0.2s ease;
}
.ml__upload-status {
  font-family: var(--font-mono);
  font-size: 10px;
}
.ml__upload-status--done { color: #FF4D00; }
.ml__upload-status--error { color: #FF4444; }
.ml__upload-status--uploading { color: #8A8A8A; }

/* Grid */
.ml__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.ml__card {
  position: relative;
  background: #141414;
  border: 1px solid #262626;
  overflow: hidden;
}
.ml__card-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background: #1A1A1A;
  display: block;
}
.ml__card-placeholder {
  width: 100%;
  aspect-ratio: 1;
  background: #1A1A1A;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #262626;
}
.ml__card-info {
  padding: 8px 10px;
}
.ml__card-name {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #FAFAFA;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ml__card-folder {
  font-family: var(--font-mono);
  font-size: 9px;
  color: #555;
  background: #1A1A1A;
  padding: 1px 6px;
  border-radius: 3px;
  display: inline-block;
  margin-top: 4px;
}

/* Hover overlay */
.ml__card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.ml__card:hover .ml__card-overlay { opacity: 1; }
.ml__overlay-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 14px;
  font-family: var(--font-mono);
  font-size: 11px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.ml__overlay-btn:hover { opacity: 0.85; }
.ml__overlay-btn--copy { background: #FAFAFA; color: #0A0A0A; }
.ml__overlay-btn--del { background: #FF4444; color: #FAFAFA; }
.ml__overlay-btn--alt { background: #262626; color: #FAFAFA; }
.ml__overlay-btn svg { width: 12px; height: 12px; }

/* Slide-over panel */
.ml__slideover {
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: 360px;
  background: #141414;
  border-left: 1px solid #262626;
  z-index: 200;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.ml__slideover--open { transform: translateX(0); }
.ml__slide-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 199;
}
.ml__slide-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ml__slide-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16px;
  color: #FAFAFA;
}
.ml__slide-close {
  display: flex;
  width: 28px; height: 28px;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #8A8A8A;
  cursor: pointer;
}
.ml__slide-close:hover { color: #FAFAFA; }
.ml__slide-close svg { width: 16px; height: 16px; }
.ml__slide-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background: #1A1A1A;
}
.ml__slide-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ml__slide-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #8A8A8A;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.ml__slide-input {
  width: 100%;
  background: #1A1A1A;
  border: 1px solid #262626;
  padding: 8px 12px;
  font-family: var(--font-body);
  font-size: 13px;
  color: #FAFAFA;
  outline: none;
  border-radius: 0;
  transition: border-color 0.25s ease;
}
.ml__slide-input:focus { border-color: #FF4D00; }
.ml__slide-save {
  padding: 10px;
  background: #FF4D00;
  color: #0A0A0A;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.ml__slide-save:hover:not(:disabled) { opacity: 0.9; }
.ml__slide-save:disabled { opacity: 0.5; }
.ml__slide-url {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #555;
  word-break: break-all;
}

/* Toast */
.ml__toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 10px 20px;
  background: #FF4D00;
  color: #0A0A0A;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  z-index: 250;
  animation: ml-toast 2s ease forwards;
}
@keyframes ml-toast {
  0% { opacity: 0; transform: translateY(8px); }
  10% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-4px); }
}

.ml__empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px 0;
  font-family: var(--font-mono);
  font-size: 13px;
  color: #555;
}

@media (max-width: 1024px) { .ml__grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 640px) { .ml__grid { grid-template-columns: repeat(2, 1fr); } }
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function MediaLibrary({ files }: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploads, setUploads] = useState<UploadItem[]>([])
    const [dragOver, setDragOver] = useState(false)
    const [toast, setToast] = useState<string | null>(null)
    const [slideFile, setSlideFile] = useState<MediaFile | null>(null)
    const [altText, setAltText] = useState('')

    const showToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(null), 2200)
    }

    // Upload handler
    const uploadFiles = useCallback(async (fileList: FileList | File[]) => {
        const arr = Array.from(fileList)
        const items: UploadItem[] = arr.map((f) => ({
            file: f,
            progress: 0,
            status: 'uploading',
        }))
        setUploads((prev) => [...items, ...prev])

        for (let i = 0; i < arr.length; i++) {
            const file = arr[i]
            try {
                // 1. Get presigned URL
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filename: file.name,
                        contentType: file.type,
                        folder: 'media',
                    }),
                })
                const { uploadUrl, key, publicUrl } = await res.json()

                // 2. Upload directly to DO Spaces
                setUploads((prev) =>
                    prev.map((u) =>
                        u.file === file ? { ...u, progress: 30 } : u
                    )
                )

                await fetch(uploadUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type },
                    body: file,
                })

                setUploads((prev) =>
                    prev.map((u) =>
                        u.file === file ? { ...u, progress: 80 } : u
                    )
                )

                // 3. Save record to DB
                await saveMediaRecord({
                    filename: file.name,
                    storagePath: key,
                    url: publicUrl,
                    mimeType: file.type,
                    folder: 'media',
                })

                setUploads((prev) =>
                    prev.map((u) =>
                        u.file === file ? { ...u, progress: 100, status: 'done' } : u
                    )
                )
            } catch (err) {
                setUploads((prev) =>
                    prev.map((u) =>
                        u.file === file
                            ? { ...u, status: 'error', error: 'Upload failed' }
                            : u
                    )
                )
            }
        }

        router.refresh()
    }, [router])

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
    }

    const handleDelete = (id: string) => {
        if (!confirm('Delete this file?')) return
        startTransition(async () => {
            await deleteMedia(id)
            router.refresh()
        })
    }

    const copyUrl = async (url: string) => {
        await navigator.clipboard.writeText(url)
        showToast('Copied!')
    }

    const openSlide = (file: MediaFile) => {
        setSlideFile(file)
        setAltText(file.altText ?? '')
    }

    const saveAlt = () => {
        if (!slideFile) return
        startTransition(async () => {
            await updateMediaAlt(slideFile.id, altText)
            setSlideFile(null)
            router.refresh()
        })
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            <h1 className="ml__title">Media Library</h1>

            {/* Upload zone */}
            <div
                className={`ml__drop${dragOver ? ' ml__drop--active' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                <Upload className="ml__drop-icon" size={28} />
                <p className="ml__drop-text">
                    Drag & drop files here, or <strong>click to browse</strong>
                </p>
                <p className="ml__drop-hint">PNG, JPG, SVG, WebP, GIF, up to 10MB each</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => e.target.files && uploadFiles(e.target.files)}
                />
            </div>

            {/* Upload progress */}
            {uploads.length > 0 && (
                <div className="ml__uploads">
                    {uploads.map((u, i) => (
                        <div key={i} className="ml__upload-item">
                            <span className="ml__upload-name">{u.file.name}</span>
                            <div className="ml__upload-bar">
                                <div className="ml__upload-fill" style={{ width: `${u.progress}%` }} />
                            </div>
                            <span className={`ml__upload-status ml__upload-status--${u.status}`}>
                                {u.status === 'done' ? '✓' : u.status === 'error' ? '✕' : `${u.progress}%`}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Grid */}
            <div className="ml__grid">
                {files.length > 0 ? (
                    files.map((f) => (
                        <div key={f.id} className="ml__card">
                            {f.mimeType?.startsWith('image/') ? (
                                <Image
                                    src={f.url}
                                    alt={f.altText ?? f.filename}
                                    width={300}
                                    height={300}
                                    className="ml__card-img"
                                />
                            ) : (
                                <div className="ml__card-placeholder">
                                    <ImageIcon size={32} />
                                </div>
                            )}
                            <div className="ml__card-info">
                                <p className="ml__card-name">{f.filename}</p>
                                {f.folder && <span className="ml__card-folder">{f.folder}</span>}
                            </div>
                            <div className="ml__card-overlay">
                                <button
                                    className="ml__overlay-btn ml__overlay-btn--copy"
                                    onClick={() => copyUrl(f.url)}
                                >
                                    <Copy /> Copy
                                </button>
                                <button
                                    className="ml__overlay-btn ml__overlay-btn--alt"
                                    onClick={() => openSlide(f)}
                                >
                                    Alt
                                </button>
                                <button
                                    className="ml__overlay-btn ml__overlay-btn--del"
                                    onClick={() => handleDelete(f.id)}
                                >
                                    <Trash2 />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="ml__empty">No media files yet. Upload your first one!</p>
                )}
            </div>

            {/* Toast */}
            {toast && <div className="ml__toast">{toast}</div>}

            {/* Alt text slide-over */}
            {slideFile && (
                <>
                    <div className="ml__slide-overlay" onClick={() => setSlideFile(null)} />
                    <div className={`ml__slideover ml__slideover--open`}>
                        <div className="ml__slide-header">
                            <span className="ml__slide-title">Edit Media</span>
                            <button className="ml__slide-close" onClick={() => setSlideFile(null)}>
                                <X />
                            </button>
                        </div>
                        {slideFile.mimeType?.startsWith('image/') && (
                            <Image
                                src={slideFile.url}
                                alt={slideFile.altText ?? slideFile.filename}
                                width={320}
                                height={320}
                                className="ml__slide-img"
                            />
                        )}
                        <div className="ml__slide-group">
                            <label className="ml__slide-label">Alt Text</label>
                            <input
                                className="ml__slide-input"
                                value={altText}
                                onChange={(e) => setAltText(e.target.value)}
                                placeholder="Describe this image..."
                            />
                        </div>
                        <div className="ml__slide-group">
                            <label className="ml__slide-label">URL</label>
                            <p className="ml__slide-url">{slideFile.url}</p>
                        </div>
                        <button className="ml__slide-save" onClick={saveAlt} disabled={isPending}>
                            {isPending ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </>
            )}
        </>
    )
}
