'use client'

import { useState, useTransition } from 'react'
import { Eye, EyeOff, Shield, Check, AlertCircle } from 'lucide-react'
import { updateAdminCredentials } from '@/app/actions/admin'

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.cred__card {
  background: #141414;
  border: 1px solid #262626;
  padding: 24px;
  margin-bottom: 16px;
}
.cred__card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #1A1A1A;
}
.cred__card-icon {
  width: 20px;
  height: 20px;
  color: #00FF94;
}
.cred__card-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 14px;
  color: #FAFAFA;
}
.cred__card-badge {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(0, 255, 148, 0.08);
  color: #00FF94;
  text-transform: uppercase;
}

/* Fields */
.cred__field {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 16px;
  align-items: start;
  padding: 12px 0;
  border-bottom: 1px solid #1A1A1A;
}
.cred__field:last-of-type { border-bottom: none; padding-bottom: 0; }
.cred__label {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #8A8A8A;
  padding-top: 8px;
}
.cred__desc {
  font-size: 10px;
  color: #555;
  margin-top: 4px;
}
.cred__input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.cred__input {
  width: 100%;
  background: #1A1A1A;
  border: 1px solid #262626;
  padding: 10px 14px;
  font-family: var(--font-body);
  font-size: 13px;
  color: #FAFAFA;
  outline: none;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  border-radius: 0;
  -webkit-appearance: none;
}
.cred__input:focus {
  border-color: #00FF94;
  box-shadow: 0 0 0 1px rgba(0, 255, 148, 0.1);
}
.cred__input--pw { padding-right: 44px; }
.cred__input--error { border-color: #ef4444 !important; }
.cred__toggle {
  position: absolute;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  color: #8A8A8A;
  cursor: pointer;
  transition: color 0.2s ease;
}
.cred__toggle:hover { color: #FAFAFA; }
.cred__toggle svg { width: 16px; height: 16px; }

/* Actions */
.cred__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #1A1A1A;
}
.cred__save {
  padding: 10px 28px;
  background: #00FF94;
  color: #0A0A0A;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.15s ease;
}
.cred__save:hover:not(:disabled) { opacity: 0.9; }
.cred__save:active:not(:disabled) { transform: scale(0.98); }
.cred__save:disabled { opacity: 0.5; cursor: not-allowed; }

/* Feedback */
.cred__feedback {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 8px 14px;
  border-radius: 4px;
  animation: cred-slide-in 0.3s ease;
}
.cred__feedback--success {
  background: rgba(0, 255, 148, 0.06);
  border: 1px solid rgba(0, 255, 148, 0.15);
  color: #00FF94;
}
.cred__feedback--error {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
.cred__feedback svg { width: 14px; height: 14px; flex-shrink: 0; }

@keyframes cred-slide-in {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.cred__hint {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #555;
  margin-top: 6px;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .cred__field { grid-template-columns: 1fr; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function CredentialsEditor({
    currentEmail,
}: {
    currentEmail: string
}) {
    const [isPending, startTransition] = useTransition()
    const [email, setEmail] = useState(currentEmail)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const [feedback, setFeedback] = useState<{
        type: 'success' | 'error'
        message: string
    } | null>(null)

    const handleSave = () => {
        setFeedback(null)

        if (!currentPassword.trim()) {
            setFeedback({ type: 'error', message: 'Current password is required to make changes.' })
            return
        }

        if (!email.trim()) {
            setFeedback({ type: 'error', message: 'Email cannot be empty.' })
            return
        }

        if (newPassword && newPassword.length < 8) {
            setFeedback({ type: 'error', message: 'New password must be at least 8 characters.' })
            return
        }

        if (newPassword && newPassword !== confirmPassword) {
            setFeedback({ type: 'error', message: 'New passwords do not match.' })
            return
        }

        startTransition(async () => {
            const res = await updateAdminCredentials({
                currentPassword,
                newEmail: email,
                newPassword: newPassword || undefined,
            })

            if (res.error) {
                setFeedback({ type: 'error', message: res.error })
            } else {
                setFeedback({ type: 'success', message: 'Credentials updated. Use new details on next login.' })
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
            }

            // Auto-dismiss after 5s
            setTimeout(() => setFeedback(null), 5000)
        })
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            <div className="cred__card">
                <div className="cred__card-header">
                    <Shield className="cred__card-icon" />
                    <span className="cred__card-title">Admin Credentials</span>
                    <span className="cred__card-badge">Secured</span>
                </div>

                {/* Current Password (always required) */}
                <div className="cred__field">
                    <div className="cred__label">
                        Current Password
                        <div className="cred__desc">Required to save any changes</div>
                    </div>
                    <div>
                        <div className="cred__input-wrap">
                            <input
                                id="cred-current-pw"
                                type={showCurrent ? 'text' : 'password'}
                                className={`cred__input cred__input--pw${!currentPassword && feedback?.type === 'error' ? ' cred__input--error' : ''}`}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="cred__toggle"
                                onClick={() => setShowCurrent((v) => !v)}
                                aria-label={showCurrent ? 'Hide' : 'Show'}
                                tabIndex={-1}
                            >
                                {showCurrent ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Email */}
                <div className="cred__field">
                    <div className="cred__label">
                        Admin Email
                        <div className="cred__desc">Used for login</div>
                    </div>
                    <div className="cred__input-wrap">
                        <input
                            id="cred-email"
                            type="email"
                            className="cred__input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            autoComplete="email"
                        />
                    </div>
                </div>

                {/* New Password */}
                <div className="cred__field">
                    <div className="cred__label">
                        New Password
                        <div className="cred__desc">Leave blank to keep current</div>
                    </div>
                    <div>
                        <div className="cred__input-wrap">
                            <input
                                id="cred-new-pw"
                                type={showNew ? 'text' : 'password'}
                                className="cred__input cred__input--pw"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New password (min 8 chars)"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="cred__toggle"
                                onClick={() => setShowNew((v) => !v)}
                                aria-label={showNew ? 'Hide' : 'Show'}
                                tabIndex={-1}
                            >
                                {showNew ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                        <p className="cred__hint">
                            Min 8 characters. Leave empty to keep your existing password.
                        </p>
                    </div>
                </div>

                {/* Confirm Password */}
                {newPassword && (
                    <div className="cred__field">
                        <div className="cred__label">
                            Confirm Password
                            <div className="cred__desc">Must match new password</div>
                        </div>
                        <div className="cred__input-wrap">
                            <input
                                id="cred-confirm-pw"
                                type={showConfirm ? 'text' : 'password'}
                                className={`cred__input cred__input--pw${newPassword && confirmPassword && newPassword !== confirmPassword ? ' cred__input--error' : ''}`}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="cred__toggle"
                                onClick={() => setShowConfirm((v) => !v)}
                                aria-label={showConfirm ? 'Hide' : 'Show'}
                                tabIndex={-1}
                            >
                                {showConfirm ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="cred__actions">
                    {feedback && (
                        <div className={`cred__feedback cred__feedback--${feedback.type}`}>
                            {feedback.type === 'success' ? <Check /> : <AlertCircle />}
                            {feedback.message}
                        </div>
                    )}
                    <button
                        className="cred__save"
                        onClick={handleSave}
                        disabled={isPending}
                    >
                        {isPending ? 'Updating…' : 'Update Credentials'}
                    </button>
                </div>
            </div>
        </>
    )
}
