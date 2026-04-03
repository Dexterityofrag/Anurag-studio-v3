'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const TO_EMAIL = 'hello@anurag.studio'

export type ContactState = {
    success?: boolean
    error?: string
} | null

export async function submitContact(
    _prev: ContactState,
    formData: FormData
): Promise<ContactState> {
    const name = formData.get('name')?.toString().trim() ?? ''
    const email = formData.get('email')?.toString().trim() ?? ''
    const projectType = formData.get('projectType')?.toString().trim() ?? ''
    const message = formData.get('message')?.toString().trim() ?? ''

    // ── Validation ─────────────────────────────────────────────
    if (!name || !email || !projectType || !message) {
        return { error: 'All fields are required.' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return { error: 'Please enter a valid email address.' }
    }

    // ── Send via Resend ────────────────────────────────────────
    try {
        await resend.emails.send({
            from: 'Portfolio Contact <onboarding@resend.dev>',
            to: [TO_EMAIL],
            replyTo: email,
            subject: `New inquiry from ${name}: ${projectType}`,
            html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #333;">
          <h2 style="font-size: 20px; margin-bottom: 24px;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 13px; width: 120px;">Name</td>
              <td style="padding: 8px 0; font-size: 15px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 13px;">Email</td>
              <td style="padding: 8px 0; font-size: 15px;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 13px;">Project Type</td>
              <td style="padding: 8px 0; font-size: 15px;">${projectType}</td>
            </tr>
          </table>
          <div style="margin-top: 24px; padding: 16px; background: #f9f9f9; border-left: 3px solid #C8FF00; font-size: 14px; line-height: 1.7;">
            ${message.replace(/\n/g, '<br />')}
          </div>
          <p style="margin-top: 32px; font-size: 12px; color: #aaa;">
            Sent from anurag.studio contact form
          </p>
        </div>
      `,
        })

        return { success: true }
    } catch (err) {
        console.error('Resend error:', err)
        return { error: 'Failed to send message. Please try again.' }
    }
}
