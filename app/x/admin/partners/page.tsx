'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  getAllPartnersAdmin,
  updatePartner,
  createPartner,
  deletePartner,
  fixPartnerImageAcl,
} from '@/app/actions/partners'

/* ────────────────────────────────────────────────────────────── */
/*  Types                                                         */
/* ────────────────────────────────────────────────────────────── */

type Partner = Awaited<ReturnType<typeof getAllPartnersAdmin>>[number]

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.pw { max-width: 960px; }

.pw__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.pw__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FAFAFA;
}

/* ─── Card ─────────────────────────────────────────────────── */
.pw__card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  padding: 24px;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}
.pw__card:hover {
  border-color: rgba(255,255,255,0.12);
}

.pw__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.pw__card-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
  color: #FAFAFA;
}
.pw__card-order {
  font-family: var(--font-mono);
  font-size: 10px;
  color: rgba(255,255,255,0.25);
  letter-spacing: 0.1em;
}

/* ─── Grid of fields ───────────────────────────────────────── */
.pw__fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
.pw__field { display: flex; flex-direction: column; gap: 6px; }
.pw__field--full { grid-column: 1 / -1; }

.pw__label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.35);
}
.pw__input {
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
.pw__input:focus { border-color: rgba(0,255,148,0.4); }
.pw__input::placeholder { color: rgba(255,255,255,0.2); }

/* ─── Toggles row ──────────────────────────────────────────── */
.pw__toggles {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.pw__toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.pw__toggle-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.pw__switch {
  position: relative;
  width: 36px;
  height: 20px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  transition: background 0.2s;
  flex-shrink: 0;
}
.pw__switch.on {
  background: rgba(0,255,148,0.5);
}
.pw__switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}
.pw__switch.on::after {
  transform: translateX(16px);
}

/* ─── Preview image ────────────────────────────────────────── */
.pw__preview-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.pw__preview-img {
  width: 160px;
  height: 90px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.08);
}
.pw__preview-empty {
  width: 160px;
  height: 90px;
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
.pw__upload-btn {
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
.pw__upload-btn:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(0,255,148,0.3);
}
.pw__remove-img {
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
.pw__remove-img:hover {
  background: rgba(255,50,50,0.2);
}
.pw__fix-img {
  padding: 7px 16px;
  background: rgba(255,200,50,0.1);
  border: 1px solid rgba(255,200,50,0.25);
  color: rgba(255,200,100,0.9);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition: background 0.2s;
}
.pw__fix-img:hover {
  background: rgba(255,200,50,0.2);
}

/* ─── Actions ──────────────────────────────────────────────── */
.pw__actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.pw__save {
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
.pw__save:disabled { opacity: 0.4; cursor: not-allowed; }
.pw__delete {
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
.pw__delete:hover {
  background: rgba(255,50,50,0.1);
  border-color: rgba(255,50,50,0.4);
}

/* ─── Add new ──────────────────────────────────────────────── */
.pw__add {
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
.pw__add:hover {
  background: rgba(0,255,148,0.14);
}

/* ─── Toast ────────────────────────────────────────────────── */
.pw__toast {
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
  animation: pw-fade 2s forwards;
}
@keyframes pw-fade {
  0% { opacity: 0; transform: translateY(8px); }
  10% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; }
  100% { opacity: 0; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Partner Card                                                  */
/* ────────────────────────────────────────────────────────────── */

function PartnerCard({
  partner,
  onSaved,
  onDeleted,
}: {
  partner: Partner
  onSaved: () => void
  onDeleted: () => void
}) {
  const [name, setName] = useState(partner.name)
  const [sector, setSector] = useState(partner.sector)
  const [link, setLink] = useState(partner.link)
  const [external, setExternal] = useState(partner.external ?? false)
  const [comingSoon, setComingSoon] = useState(partner.comingSoon ?? false)
  const [isVisible, setIsVisible] = useState(partner.isVisible ?? true)
  const [displayOrder, setDisplayOrder] = useState(partner.displayOrder ?? 0)
  const [previewUrl, setPreviewUrl] = useState(partner.previewImageUrl ?? '')
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [fixing, setFixing] = useState(false)

  const handleSave = () => {
    startTransition(async () => {
      await updatePartner(partner.id, {
        name,
        sector,
        link,
        external,
        comingSoon,
        isVisible,
        displayOrder,
        previewImageUrl: previewUrl.trim() || null,
      })
      onSaved()
    })
  }

  const handleDelete = () => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    startTransition(async () => {
      await deletePartner(partner.id)
      onDeleted()
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      // Upload via server-side FormData (guarantees ACL: public-read)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'partners')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const { publicUrl, error } = await res.json()
      if (error) throw new Error(error)

      setPreviewUrl(publicUrl)
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Upload failed. Check console.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="pw__card">
      <div className="pw__card-header">
        <span className="pw__card-name">{partner.name}</span>
        <span className="pw__card-order">ORDER: {displayOrder}</span>
      </div>

      {/* Text fields */}
      <div className="pw__fields">
        <div className="pw__field">
          <label className="pw__label">Name</label>
          <input
            className="pw__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="pw__field">
          <label className="pw__label">Sector / Tag</label>
          <input
            className="pw__input"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
          />
        </div>
        <div className="pw__field">
          <label className="pw__label">Link URL</label>
          <input
            className="pw__input"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://... or /coming-soon"
          />
        </div>
        <div className="pw__field">
          <label className="pw__label">Display Order</label>
          <input
            className="pw__input"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="pw__toggles">
        <label className="pw__toggle" onClick={() => setExternal(!external)}>
          <div className={`pw__switch ${external ? 'on' : ''}`} />
          <span className="pw__toggle-label">External Link</span>
        </label>
        <label className="pw__toggle" onClick={() => setComingSoon(!comingSoon)}>
          <div className={`pw__switch ${comingSoon ? 'on' : ''}`} />
          <span className="pw__toggle-label">Coming Soon</span>
        </label>
        <label className="pw__toggle" onClick={() => setIsVisible(!isVisible)}>
          <div className={`pw__switch ${isVisible ? 'on' : ''}`} />
          <span className="pw__toggle-label">Visible</span>
        </label>
      </div>

      {/* Preview image */}
      <div className="pw__preview-row">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={name} className="pw__preview-img" />
        ) : (
          <div className="pw__preview-empty">No preview</div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label className="pw__upload-btn" style={{ position: 'relative' }}>
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
            />
          </label>
        {previewUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="pw__fix-img"
              disabled={fixing}
              onClick={async () => {
                setFixing(true)
                const result = await fixPartnerImageAcl(previewUrl)
                if (result.error) {
                  alert(result.error)
                } else {
                  alert('Image ACL fixed! Refresh the page to see the image.')
                }
                setFixing(false)
              }}
            >
              {fixing ? 'Fixing...' : '🔧 Fix Image'}
            </button>
            <button
              className="pw__remove-img"
              onClick={() => setPreviewUrl('')}
            >
              Remove
            </button>
          </div>
        )}
        </div>
        {previewUrl && (
          <input
            className="pw__input"
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
            placeholder="Or paste URL directly"
            style={{ flex: 1 }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="pw__actions">
        <button className="pw__delete" onClick={handleDelete} disabled={isPending}>
          Delete
        </button>
        <button className="pw__save" onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Page                                                          */
/* ────────────────────────────────────────────────────────────── */

export default function PartnersAdminPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [isPending, startTransition] = useTransition()

  const load = async () => {
    const rows = await getAllPartnersAdmin()
    setPartners(rows)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const handleAdd = () => {
    startTransition(async () => {
      const nextOrder = partners.length > 0
        ? Math.max(...partners.map(p => p.displayOrder ?? 0)) + 1
        : 0
      await createPartner({
        name: 'NEW PARTNER',
        sector: 'SECTOR',
        link: '/coming-soon',
        external: false,
        comingSoon: true,
        displayOrder: nextOrder,
      })
      await load()
      showToast('Partner added')
    })
  }

  if (loading) {
    return (
      <div style={{ padding: 40, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        Loading partners...
      </div>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="pw">
        <div className="pw__header">
          <h1 className="pw__title">Worked With — Partners</h1>
          <button
            className="pw__add"
            onClick={handleAdd}
            disabled={isPending}
          >
            + Add Partner
          </button>
        </div>

        {partners.map((p) => (
          <PartnerCard
            key={p.id}
            partner={p}
            onSaved={() => { load(); showToast(`${p.name} saved`) }}
            onDeleted={() => { load(); showToast('Partner deleted') }}
          />
        ))}
      </div>

      {toast && <div className="pw__toast">{toast}</div>}
    </>
  )
}
