import { getAllPartnersAdmin, updatePartner } from '@/app/actions/partners'

const css = `
.ap-partners__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FAFAFA;
  margin-bottom: 2rem;
}
.ap-partners__grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ap-partners__card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px;
  padding: 20px 24px;
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 16px;
  align-items: end;
}
.ap-partners__info { display: flex; flex-direction: column; gap: 4px; }
.ap-partners__name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
  color: #FAFAFA;
}
.ap-partners__sector {
  font-family: var(--font-mono);
  font-size: 10px;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.ap-partners__field { display: flex; flex-direction: column; gap: 6px; }
.ap-partners__label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.35);
}
.ap-partners__input {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  padding: 8px 12px;
  color: #FAFAFA;
  font-family: var(--font-mono);
  font-size: 12px;
  width: 100%;
  outline: none;
  transition: border-color 0.2s;
}
.ap-partners__input:focus { border-color: rgba(0,255,148,0.4); }
.ap-partners__input::placeholder { color: rgba(255,255,255,0.2); }
.ap-partners__save {
  padding: 9px 20px;
  background: #00FF94;
  color: #0A0A0A;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}
.ap-partners__preview {
  width: 120px;
  height: 68px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid rgba(255,255,255,0.08);
}
.ap-partners__no-preview {
  width: 120px;
  height: 68px;
  border-radius: 4px;
  background: rgba(255,255,255,0.04);
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
.ap-partners__card-inner {
  display: flex;
  gap: 20px;
  align-items: center;
  flex: 1;
}
`
export const dynamic = 'force-dynamic'
export const revalidate = 0
export default async function PartnersAdminPage() {
  const rows = await getAllPartnersAdmin()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <h1 className="ap-partners__title">Partner Previews</h1>
      <div className="ap-partners__grid">
        {rows.map((p) => (
          <div key={p.id} className="ap-partners__card">
            {/* Left: info + preview thumbnail */}
            <div className="ap-partners__card-inner">
              {p.previewImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.previewImageUrl}
                  alt={p.name}
                  className="ap-partners__preview"
                />
              ) : (
                <div className="ap-partners__no-preview">No image</div>
              )}
              <div className="ap-partners__info">
                <span className="ap-partners__name">{p.name}</span>
                <span className="ap-partners__sector">{p.sector}</span>
              </div>
            </div>

            {/* Right: URL input form */}
            <form
              action={async (fd: FormData) => {
                'use server'
                const url = (fd.get('url') as string)?.trim() || null
                await updatePartner(p.id, { previewImageUrl: url })
              }}
              style={{ display: 'contents' }}
            >
              <div className="ap-partners__field">
                <label className="ap-partners__label" htmlFor={`url-${p.id}`}>
                  Preview image URL
                </label>
                <input
                  id={`url-${p.id}`}
                  name="url"
                  type="url"
                  defaultValue={p.previewImageUrl ?? ''}
                  placeholder="https://..."
                  className="ap-partners__input"
                />
              </div>
              <button type="submit" className="ap-partners__save">
                Save
              </button>
            </form>
          </div>
        ))}
      </div>
    </>
  )
}
