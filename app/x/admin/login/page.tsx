'use client'

import { useState, type FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.login {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0A0A0A;
  padding: 1rem;
}

.login__card {
  width: 100%;
  max-width: 400px;
  background: #141414;
  border: 1px solid #262626;
  padding: 2rem;
}

/* Logo */
.login__logo {
  text-align: center;
  margin-bottom: 2rem;
}
.login__brand {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  color: #FAFAFA;
  letter-spacing: -0.02em;
}
.login__brand-dot {
  color: #00FF94;
}
.login__role {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #8A8A8A;
  letter-spacing: 0.06em;
  margin-top: 4px;
}

/* Form */
.login__form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Input group */
.login__group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.login__label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #8A8A8A;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.login__input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.login__input {
  width: 100%;
  background: #1A1A1A;
  border: 1px solid #262626;
  padding: 12px 14px;
  font-family: var(--font-body);
  font-size: 14px;
  color: #FAFAFA;
  outline: none;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  border-radius: 0;
  -webkit-appearance: none;
}
.login__input:focus {
  border-color: #00FF94;
  box-shadow: 0 0 0 1px rgba(0, 255, 148, 0.1);
}
.login__input--error {
  border-color: #ef4444;
}
.login__input--pw {
  padding-right: 44px;
}
.login__toggle {
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
.login__toggle:hover { color: #FAFAFA; }
.login__toggle svg { width: 16px; height: 16px; }

/* Submit */
.login__submit {
  width: 100%;
  padding: 14px;
  background: #00FF94;
  color: #0A0A0A;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.04em;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s ease, transform 0.15s ease;
  margin-top: 4px;
}
.login__submit:hover:not(:disabled) { opacity: 0.9; }
.login__submit:active:not(:disabled) { transform: scale(0.98); }
.login__submit:disabled { opacity: 0.6; cursor: not-allowed; }
.login__submit svg { width: 16px; height: 16px; }

@keyframes login-spin {
  to { transform: rotate(360deg); }
}
.login__spinner { animation: login-spin 0.8s linear infinite; }

/* Messages */
.login__error {
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.02em;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.15);
  color: #ef4444;
  text-align: center;
}
.login__rate-limit {
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.02em;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  text-align: center;
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [rateLimited, setRateLimited] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        setRateLimited(false)

        if (!email.trim() || !password.trim()) {
            setError('All fields are required.')
            return
        }

        setLoading(true)

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (res?.error) {
                if (res.status === 429) {
                    setRateLimited(true)
                } else {
                    setError('Invalid credentials.')
                }
            } else {
                router.push('/x/admin')
            }
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const hasError = !!error

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            <div className="login">
                <div className="login__card">
                    {/* Logo */}
                    <div className="login__logo">
                        <p className="login__brand">
                            ANURAG<span className="login__brand-dot">.</span>
                        </p>
                        <p className="login__role">Admin</p>
                    </div>

                    {/* Form */}
                    <form className="login__form" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="login__group">
                            <label className="login__label" htmlFor="admin-email">
                                Email
                            </label>
                            <div className="login__input-wrap">
                                <input
                                    id="admin-email"
                                    type="email"
                                    className={`login__input${hasError ? ' login__input--error' : ''}`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="login__group">
                            <label className="login__label" htmlFor="admin-pw">
                                Password
                            </label>
                            <div className="login__input-wrap">
                                <input
                                    id="admin-pw"
                                    type={showPw ? 'text' : 'password'}
                                    className={`login__input login__input--pw${hasError ? ' login__input--error' : ''}`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="login__toggle"
                                    onClick={() => setShowPw((v) => !v)}
                                    aria-label={showPw ? 'Hide password' : 'Show password'}
                                    tabIndex={-1}
                                >
                                    {showPw ? <EyeOff /> : <Eye />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="login__submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="login__spinner" /> Signing in…
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        {/* Error */}
                        {error && <p className="login__error">{error}</p>}

                        {/* Rate limit */}
                        {rateLimited && (
                            <p className="login__rate-limit">
                                Too many attempts. Try again in a few minutes.
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </>
    )
}
