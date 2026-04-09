'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  getAllCertificationsAdmin,
  updateCertification,
  createCertification,
  deleteCertification,
} from '@/app/actions/certifications'

type Cert = Awaited<ReturnType<typeof getAllCertificationsAdmin>>[number]

const css = /* css */ `
.cw { max-width: 960px; }

.cw__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.cw__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FAFAFA;
}

.cw__card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  padding: 24px;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}
.cw__card:hover { border-color: rgba(255,255,255,0.12); }

.cw__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.cw__card-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
  color: #FAFAFA;
}
.cw__card-issuer {
  font-family: var(--font-mono);
  font-size: 10px;
  color: rgba(255,255,255,0.25);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.cw__fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
.cw__field { display: flex; flex-direction: column; gap: 6px; }
.cw__field--full { grid-column: 1 / -1; }

.cw__label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.35);
}
.cw__input {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  padding: 8px 12px;
  color: #FAFAFA;
  font-family: var(--font-mono);
  font-size: 12px;
  outline: none;
  transition: border-color 0.2s;
}
.cw__input:focus { border-color: rgba(0,255,148,0.4); }
.cw__input::placeholder { color: rgba(255,255,255,0.2); }

.cw__toggles {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.cw__toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.cw__toggle-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.cw__switch {
  position: relative;
  width: 36px;
  height: 20px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  transition: background 0.2s;
  flex-shrink: 0;
}
.cw__switch.on { background: rgba(0,255,148,0.5); }
.cw__switch::after {
  content: '';
  position: absolute;
  top: 2px; left: 2px;
  width: 16px; height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}
.cw__switch.on::after { transform: translateX(16px); }

.cw__preview-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.cw__preview-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  padding: 8px;
}
.cw__preview-empty {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  background: rgba(255,255,255,0.03);
  border: 1px dashed rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 9px;
  color: rgba(255,255,255,0.2);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  flex-shrink: 0;
}
.cw__upload-btn {
  padding: 7px 16px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.7);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.cw__upload-btn:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(0,255,148,0.3);
}
.cw__remove-img {
  padding: 7px 16px;
  background: rgba(255,50,50,0.1);
  border: 1px solid rgba(255,50,50,0.2);
  color: rgba(255,100,100,0.8);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition: background 0.2s;
}
.cw__remove-img:hover { background: rgba(255,50,50,0.2); }

.cw__actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.cw__save {
  padding: 8px 24px;
  background: #00FF94;
  color: #0A0A0A;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: opacity 0.2s;
}
.cw__save:disabled { opacity: 0.4; cursor: not-allowed; }
.cw__delete {
  padding: 8px 18px;
  background: transparent;
  border: 1px solid rgba(255,50,50,0.25);
  color: rgba(255,100,100,0.7);
  font-family: var(--font-mono);
  font-size: 11px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.cw__delete:hover {
  background: rgba(255,50,50,0.1);
  border-color: rgba(255,50,50,0.4);
}

.cw__add {
  padding: 10px 24px;
  background: rgba(0,255,148,0.08);
  border: 1px dashed rgba(0,255,148,0.25);
  color: var(--accent, #00FF94);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  letter-spacing: 0.04em;
}
.cw__add:hover { background: rgba(0,255,148,0.14); }

.cw__toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #111;
  border: 1px solid rgba(0,255,148,0.2);
  color: #00FF94;
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 10px 20px;
  border-radius: 6px;
  z-index: 999;
  animation: cw-fade 2s forwards;
}
@keyframes cw-fade {
  0% { opacity: 0; transform: translateY(8px); }
  10% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; }
  100% { opacity: 0; }
}
`

function CertCard({
  cert,
  onSaved,
  onDeleted,
}: {
  cert: Cert
  onSaved: () => void
  onDeleted: () => void
}) {
  const [name, setName] = useState(cert.name)
  const [issuer, setIssuer] = useState(cert.issuer)
  const [verifyUrl, setVerifyUrl] = useState(cert.verifyUrl ?? '')
  const [logoUrl, setLogoUrl] = useState(cert.logoUrl ?? '')
  const [isVisible, setIsVisible] = useState(cert.isVisible ?? true)
  const [displayOrder, setDisplayOrder] = useState(cert.displayOrder ?? 0)
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)

  const handleSave = () => {
    startTransition(async () => {
      await updateCertification(cert.id, {
        name,
        issuer,
        verifyUrl: verifyUrl.trim() || null,
        logoUrl: logoUrl.trim() || null,
        isVisible,
        displayOrder,
      })
      onSaved()
    })
  }

  const handleDelete = () => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    startTransition(async () => {
      await deleteCertification(cert.id)
      onDeleted()
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'certifications')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const { publicUrl, error } = await res.json()
      if (error) throw new Error(error)
      setLogoUrl(publicUrl)
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Upload failed. Check console.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="cw__card">
      <div className="cw__card-header">
        <span className="cw__card-name">{cert.name}</span>
        <span className="cw__card-issuer">{issuer} · ORDER {displayOrder}</span>
      </div>

      <div className="cw__fields">
        <div className="cw__field">
          <label className="cw__label">Certification Name</label>
          <input className="cw__input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="cw__field">
          <label className="cw__label">Issuer</label>
          <input className="cw__input" value={issuer} onChange={(e) => setIssuer(e.target.value)} />
        </div>
        <div className="cw__field">
          <label className="cw__label">Verification URL</label>
          <input
            className="cw__input"
            value={verifyUrl}
            onChange={(e) => setVerifyUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="cw__field">
          <label className="cw__label">Display Order</label>
          <input
            className="cw__input"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="cw__toggles">
        <label className="cw__toggle" onClick={() => setIsVisible(!isVisible)}>
          <div className={`cw__switch ${isVisible ? 'on' : ''}`} />
          <span className="cw__toggle-label">Visible</span>
        </label>
      </div>

      {/* Logo */}
      <div className="cw__preview-row">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={issuer} className="cw__preview-img" />
        ) : (
          <div className="cw__preview-empty">No logo</div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label className="cw__upload-btn" style={{ position: 'relative' }}>
            {uploading ? 'Uploading...' : 'Upload Logo'}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
            />
          </label>
          {logoUrl && (
            <button className="cw__remove-img" onClick={() => setLogoUrl('')}>Remove</button>
          )}
        </div>
        {logoUrl && (
          <input
            className="cw__input"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="Or paste URL directly"
            style={{ flex: 1 }}
          />
        )}
      </div>

      <div className="cw__actions">
        <button className="cw__delete" onClick={handleDelete} disabled={isPending}>Delete</button>
        <button className="cw__save" onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

export default function CertificationsAdminPage() {
  const [certs, setCerts] = useState<Cert[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [isPending, startTransition] = useTransition()

  const load = async () => {
    const rows = await getAllCertificationsAdmin()
    setCerts(rows)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const handleAdd = () => {
    startTransition(async () => {
      const nextOrder = certs.length > 0
        ? Math.max(...certs.map(c => c.displayOrder ?? 0)) + 1
        : 0
      await createCertification({
        name: 'New Certification',
        issuer: 'Issuer',
        displayOrder: nextOrder,
      })
      await load()
      showToast('Certification added')
    })
  }

  if (loading) {
    return (
      <div style={{ padding: 40, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        Loading certifications...
      </div>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="cw">
        <div className="cw__header">
          <h1 className="cw__title">Certifications</h1>
          <button className="cw__add" onClick={handleAdd} disabled={isPending}>
            + Add Certification
          </button>
        </div>

        {certs.map((c) => (
          <CertCard
            key={c.id}
            cert={c}
            onSaved={() => { load(); showToast(`${c.name} saved`) }}
            onDeleted={() => { load(); showToast('Certification deleted') }}
          />
        ))}
      </div>

      {toast && <div className="cw__toast">{toast}</div>}
    </>
  )
}
