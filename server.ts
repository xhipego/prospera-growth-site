import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const RECIPIENT_EMAIL = (process.env.QUOTE_RECIPIENT_EMAIL || 'thulo@prosperagrowth.co.za').trim();

interface QuotePayload {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  mineralAndTonnage: string;
  sidingAndPort: string;
  notes: string;
}

interface StoredQuote extends QuotePayload {
  id: string;
  createdAt: string;
  emailSent: boolean;
}

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

function saveQuoteLocally(quote: StoredQuote): void {
  const dataDir = path.resolve(__dirname, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const filePath = path.join(dataDir, 'quotes.json');

  let existing: StoredQuote[] = [];
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        existing = parsed;
      }
    } catch {
      existing = [];
    }
  }
  existing.unshift(quote);
  fs.writeFileSync(filePath, JSON.stringify(existing.slice(0, 500), null, 2), 'utf-8');
}

async function sendQuoteEmail(quote: QuotePayload): Promise<{ sent: boolean; provider?: string }> {
  const subject = `FOB Rail Quote Request — ${quote.company || quote.fullName}`;
  const textBody = [
    'New FOB Quote Request via Prospera Growth Website',
    '--------------------------------------------------',
    `Name: ${quote.fullName}`,
    `Company: ${quote.company || 'Not specified'}`,
    `Email: ${quote.email}`,
    `Phone: ${quote.phone || 'Not specified'}`,
    `Mineral & Tonnage: ${quote.mineralAndTonnage}`,
    `Nearest Siding & Target Port: ${quote.sidingAndPort || 'Not specified'}`,
    '',
    'Notes:',
    quote.notes || 'None',
  ].join('\n');

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #142119; max-width: 600px; line-height: 1.5;">
      <h2 style="color: #163A22; margin-bottom: 12px;">New FOB Rail Quote Request</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5; font-weight: 600; width: 180px;">Full Name</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5;">${escapeHtml(quote.fullName)}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5; font-weight: 600;">Company / Mine</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5;">${escapeHtml(quote.company || 'Not specified')}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5; font-weight: 600;">Email</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5;">${escapeHtml(quote.email)}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5; font-weight: 600;">Phone</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5;">${escapeHtml(quote.phone || 'Not specified')}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5; font-weight: 600;">Mineral &amp; Tonnage</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5;">${escapeHtml(quote.mineralAndTonnage)}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5; font-weight: 600;">Siding &amp; Port</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e0d5;">${escapeHtml(quote.sidingAndPort || 'Not specified')}</td></tr>
      </table>
      <p style="font-weight: 600; margin-bottom: 4px;">Additional Notes:</p>
      <p style="white-space: pre-wrap; background: #f6f4ef; padding: 12px; border-radius: 8px;">${escapeHtml(quote.notes || 'None')}</p>
    </div>
  `;

  // Provider 1: Resend HTTPS API
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    const fromAddress = process.env.RESEND_FROM?.trim() || 'Prospera Growth Website <onboarding@resend.dev>';
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [RECIPIENT_EMAIL],
        reply_to: quote.email,
        subject,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      throw new Error(`Resend API error (${resp.status}): ${errBody}`);
    }
    return { sent: true, provider: 'resend' };
  }

  // Provider 2: Domain SMTP (nodemailer)
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
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM?.trim() || `"Prospera Growth Website" <${smtpUser}>`,
      to: RECIPIENT_EMAIL,
      replyTo: quote.email,
      subject,
      text: textBody,
      html: htmlBody,
    });
    return { sent: true, provider: 'smtp' };
  }

  return { sent: false };
}

async function startServer() {
  const app = express();

  app.post('/api/quote', express.json({ limit: '64kb' }), async (req, res) => {
    const fullName = cleanSingleLine(req.body?.fullName, 120);
    const company = cleanSingleLine(req.body?.company, 150);
    const email = cleanSingleLine(req.body?.email, 160);
    const phone = cleanSingleLine(req.body?.phone, 40);
    const mineralAndTonnage = cleanSingleLine(req.body?.mineralAndTonnage, 200);
    const sidingAndPort = cleanSingleLine(req.body?.sidingAndPort, 200);
    const notes = cleanMultiLine(req.body?.notes, 2000);

    if (!fullName || !email || !mineralAndTonnage) {
      res.status(400).json({
        ok: false,
        error: 'Please provide your full name, email address, and mineral tonnage.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        ok: false,
        error: 'Please provide a valid email address.',
      });
      return;
    }

    const payload: QuotePayload = {
      fullName,
      company,
      email,
      phone,
      mineralAndTonnage,
      sidingAndPort,
      notes,
    };

    try {
      const delivery = await sendQuoteEmail(payload);
      saveQuoteLocally({
        ...payload,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        emailSent: delivery.sent,
      });

      res.status(200).json({
        ok: true,
        emailSent: delivery.sent,
        recipient: RECIPIENT_EMAIL,
      });
    } catch (err) {
      console.error('Failed to send quote email:', err);
      saveQuoteLocally({
        ...payload,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        emailSent: false,
      });
      res.status(502).json({
        ok: false,
        error: `Unable to deliver email automatically right now. Your details were saved; please email ${RECIPIENT_EMAIL} directly.`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const mediaDir = path.resolve(__dirname, 'public', 'assets', 'media');
    app.use(
      '/assets/media',
      express.static(mediaDir, {
        etag: false,
        lastModified: true,
        setHeaders: (res) => {
          res.setHeader('Cache-Control', 'no-store');
        },
      })
    );

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
