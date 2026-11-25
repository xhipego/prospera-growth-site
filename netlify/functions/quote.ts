import nodemailer from 'nodemailer';

const RECIPIENT_EMAIL = (process.env.QUOTE_RECIPIENT_EMAIL || 'thulo@prosperagrowth.co.za').trim();

function cleanSingleLine(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.replace(/[\r\n\t]+/g, ' ').trim().slice(0, maxLen);
}

function cleanMultiLine(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.replace(/\r\n/g, '\n').trim().slice(0, maxLen);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'Method not allowed' });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { ok: false, error: 'Invalid request payload' });
  }

  const fullName = cleanSingleLine(body.fullName, 120);
  const company = cleanSingleLine(body.company, 150);
  const email = cleanSingleLine(body.email, 160);
  const phone = cleanSingleLine(body.phone, 40);
  const mineralAndTonnage = cleanSingleLine(body.mineralAndTonnage, 200);
  const sidingAndPort = cleanSingleLine(body.sidingAndPort, 200);
  const notes = cleanMultiLine(body.notes, 2000);

  if (!fullName || !email || !mineralAndTonnage) {
    return jsonResponse(400, {
      ok: false,
      error: 'Please provide your full name, email address, and mineral tonnage.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return jsonResponse(400, {
      ok: false,
      error: 'Please provide a valid email address.',
    });
  }

  const subject = `FOB Rail Quote Request — ${company || fullName}`;
  const textBody = [
    'New FOB Quote Request via Prospera Growth Website',
    '--------------------------------------------------',
    `Name: ${fullName}`,
    `Company: ${company || 'Not specified'}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not specified'}`,
    `Mineral & Tonnage: ${mineralAndTonnage}`,
    `Nearest Siding & Target Port: ${sidingAndPort || 'Not specified'}`,
    '',
    'Notes:',
    notes || 'None',
  ].join('\n');

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #142119; max-width: 600px; line-height: 1.5;">
      <h2 style="color: #163A22; margin-bottom: 12px;">New FOB Rail Quote Request</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5; font-weight: 600; width: 180px;">Full Name</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5;">${escapeHtml(fullName)}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5; font-weight: 600;">Company / Mine</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5;">${escapeHtml(company || 'Not specified')}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5; font-weight: 600;">Email</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5;">${escapeHtml(email)}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5; font-weight: 600;">Phone</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5;">${escapeHtml(phone || 'Not specified')}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5; font-weight: 600;">Mineral &amp; Tonnage</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5;">${escapeHtml(mineralAndTonnage)}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5; font-weight: 600;">Siding &amp; Port</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5;">${escapeHtml(sidingAndPort || 'Not specified')}</td></tr>
      </table>
      <p style="font-weight: 600; margin-bottom: 4px;">Additional Notes:</p>
      <p style="white-space: pre-wrap; background: #f6f4ef; padding: 12px; border-radius: 8px;">${escapeHtml(notes || 'None')}</p>
    </div>
  `;

  try {
    const resendKey = process.env.RESEND_API_KEY?.trim();
    if (resendKey) {
      const fromAddress =
        process.env.RESEND_FROM?.trim() || 'Prospera Growth Website <onboarding@resend.dev>';
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [RECIPIENT_EMAIL],
          reply_to: email,
          subject,
          text: textBody,
          html: htmlBody,
        }),
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        throw new Error(`Resend API error (${resp.status}): ${errBody}`);
      }
      return jsonResponse(200, { ok: true, emailSent: true, recipient: RECIPIENT_EMAIL });
    }

    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim();
    if (smtpHost && smtpUser && smtpPass) {
      const smtpPort = Number(process.env.SMTP_PORT) || 587;
      const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM?.trim() || `"Prospera Growth Website" <${smtpUser}>`,
        to: RECIPIENT_EMAIL,
        replyTo: email,
        subject,
        text: textBody,
        html: htmlBody,
      });
      return jsonResponse(200, { ok: true, emailSent: true, recipient: RECIPIENT_EMAIL });
    }

    return jsonResponse(200, { ok: true, emailSent: false, recipient: RECIPIENT_EMAIL });
  } catch (err) {
    console.error('Quote email error:', err);
    return jsonResponse(502, {
      ok: false,
      error: `Unable to send email automatically right now. Please email ${RECIPIENT_EMAIL} directly.`,
    });
  }
}
