import nodemailer from 'nodemailer'
import { env } from '@/core/config/env'
import { logger } from '@/core/logger/logger'

interface InviteEmailPayload {
  to: string
  name: string
  role: string
  inviteLink: string
  tempPassword: string
}

async function sendViaMailpit(payload: InviteEmailPayload): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
  })

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: payload.to,
    subject: `You've been invited to UniClear as ${payload.role}`,
    html: buildInviteHtml(payload),
  })

  logger.info({ to: payload.to }, 'Invite email sent via Mailpit → http://localhost:8025')
}

async function sendViaResend(payload: InviteEmailPayload): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: payload.to,
      subject: `You've been invited to UniClear as ${payload.role}`,
      html: buildInviteHtml(payload),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    logger.error({ err }, 'Resend email failed')
    throw new Error(`Resend error: ${err}`)
  }

  logger.info({ to: payload.to }, 'Invite email sent via Resend')
}

export async function sendInviteEmail(payload: InviteEmailPayload): Promise<void> {
  try {
    if (env.EMAIL_PROVIDER === 'resend') {
      await sendViaResend(payload)
    } else {
      await sendViaMailpit(payload)
    }
  } catch (err) {
    // Email failure should never crash the invite flow — log and continue
    logger.error({ err, to: payload.to }, 'Failed to send invite email — invite link still returned in response')
  }
}

function buildInviteHtml({ name, role, inviteLink, tempPassword }: InviteEmailPayload): string {
  const isReset = role === 'password reset'

  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px">
      <h2 style="color:#1B4F72">${isReset ? 'Password Reset Request' : 'Welcome to UniClear'}</h2>
      <p>Hi ${name},</p>
      ${isReset
        ? `<p>We received a request to reset your password. Click the button below. This link expires in <strong>1 hour</strong>.</p>`
        : `<p>You've been invited to join UniClear as <strong>${role}</strong>.</p>
           <p>Your temporary password is:</p>
           <div style="background:#f4f4f4;padding:12px 20px;border-radius:6px;font-size:20px;letter-spacing:2px;font-weight:bold">${tempPassword}</div>
           <p style="margin-top:24px">Click the button below to set your own password:</p>`
      }
      <a href="${inviteLink}" style="display:inline-block;background:#1B4F72;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:8px">
        ${isReset ? 'Reset Password' : 'Set My Password'}
      </a>
      <p style="margin-top:32px;color:#888;font-size:12px">
        ${isReset
          ? 'If you did not request a password reset, ignore this email.'
          : 'This link expires in 7 days. If you did not expect this invitation, ignore this email.'
        }
      </p>
    </div>
  `
}
