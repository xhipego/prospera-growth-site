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

const ALLOWED_MEDIA_SLOTS = new Set([
  'heroVideo',
  'companyLogo',
  'mdPortrait',
  'chromeRail1',
  'chromeRail2',
  'chromeRail3',
  'chromeRail4',
  'chromeRail5',
  'chromeRail6',
  'chromeRail7',
  'chromeRail8',
]);

const VIDEO_MIME_EXT: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/x-m4v': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

const IMAGE_MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

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
    fs.mkdirSync(mediaDir, { recursive: true });

    // Reconcile any custom_<slot>.<ext> files already saved on disk into media-config.json
    const configPathOnBoot = path.resolve(mediaDir, 'media-config.json');
    if (configPathOnBoot.startsWith(mediaDir + path.sep)) {
      let bootConfig: Record<string, unknown> = {};
      if (fs.existsSync(configPathOnBoot)) {
        try {
          const parsed = JSON.parse(fs.readFileSync(configPathOnBoot, 'utf-8'));
          if (parsed && typeof parsed === 'object') {
            bootConfig = parsed as Record<string, unknown>;
          }
        } catch {
          bootConfig = {};
        }
      }

      const reconciled: Record<string, unknown> = {
        locked: Boolean(bootConfig.locked),
      };
      for (const key of ALLOWED_MEDIA_SLOTS) {
        if (typeof bootConfig[key] === 'string') {
          reconciled[key] = bootConfig[key];
        }
      }

      const validExts = new Set([...Object.values(VIDEO_MIME_EXT), ...Object.values(IMAGE_MIME_EXT)]);
      const filesOnDisk = fs.readdirSync(mediaDir);
      for (const fileName of filesOnDisk) {
        const match = /^custom_([A-Za-z0-9]+)\.([a-z0-9]+)$/.exec(fileName);
        if (!match) continue;
        const [, slotKey, ext] = match;
        if (ALLOWED_MEDIA_SLOTS.has(slotKey) && validExts.has(ext)) {
          reconciled[slotKey] = `/assets/media/${fileName}`;
        }
      }
      fs.writeFileSync(configPathOnBoot, JSON.stringify(reconciled, null, 2) + '\n', 'utf-8');
    }

    // Serve media files with full HTTP Range (206) support and no stale dev cache
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

    app.post('/api/persist-media', express.json({ limit: '4mb' }), (req, res) => {
      const slot = typeof req.body?.slot === 'string' ? req.body.slot.trim() : '';
      if (!ALLOWED_MEDIA_SLOTS.has(slot)) {
        res.status(400).json({ ok: false, error: 'Invalid media slot.' });
        return;
      }

      const mediaType =
        typeof req.body?.mimeType === 'string'
          ? req.body.mimeType.split(';')[0].trim().toLowerCase()
          : '';
      const ext =
        slot === 'heroVideo' ? VIDEO_MIME_EXT[mediaType] : IMAGE_MIME_EXT[mediaType];

      if (!ext) {
        res.status(400).json({ ok: false, error: 'Unsupported media format for slot.' });
        return;
      }

      const chunkIndex = Number(req.body?.chunkIndex ?? 0);
      const totalChunks = Number(req.body?.totalChunks ?? 1);
      const chunkBase64 = typeof req.body?.chunkBase64 === 'string' ? req.body.chunkBase64 : '';

      if (
        !Number.isInteger(chunkIndex) ||
        !Number.isInteger(totalChunks) ||
        totalChunks < 1 ||
        totalChunks > 250 ||
        chunkIndex < 0 ||
        chunkIndex >= totalChunks ||
        !chunkBase64
      ) {
        res.status(400).json({ ok: false, error: 'Invalid media chunk payload.' });
        return;
      }

      const chunkBuffer = Buffer.from(chunkBase64, 'base64');
      if (chunkBuffer.length === 0 || chunkBuffer.length > 2.5 * 1024 * 1024) {
        res.status(400).json({ ok: false, error: 'Invalid decoded chunk size.' });
        return;
      }

      const targetFileName = `custom_${slot}.${ext}`;
      const targetPath = path.resolve(mediaDir, targetFileName);
      if (!targetPath.startsWith(mediaDir + path.sep)) {
        res.status(400).json({ ok: false, error: 'Invalid target path.' });
        return;
      }

      const configPath = path.resolve(mediaDir, 'media-config.json');
      if (!configPath.startsWith(mediaDir + path.sep)) {
        res.status(400).json({ ok: false, error: 'Invalid config path.' });
        return;
      }

      const partPath = path.resolve(mediaDir, `.uploading_${slot}.${ext}.part`);
      if (!partPath.startsWith(mediaDir + path.sep)) {
        res.status(400).json({ ok: false, error: 'Invalid staging path.' });
        return;
      }

      if (totalChunks === 1) {
        const allowedExts = new Set(
          Object.values(slot === 'heroVideo' ? VIDEO_MIME_EXT : IMAGE_MIME_EXT)
        );
        for (const oldExt of allowedExts) {
          if (oldExt !== ext) {
            const stalePath = path.resolve(mediaDir, `custom_${slot}.${oldExt}`);
            if (stalePath.startsWith(mediaDir + path.sep) && fs.existsSync(stalePath)) {
              fs.unlinkSync(stalePath);
            }
          }
        }
        fs.writeFileSync(targetPath, chunkBuffer);
      } else {
        if (chunkIndex === 0) {
          fs.writeFileSync(partPath, chunkBuffer);
        } else {
          if (!fs.existsSync(partPath)) {
            res.status(400).json({ ok: false, error: 'Missing initial media chunk.' });
            return;
          }
          fs.appendFileSync(partPath, chunkBuffer);
        }

        if (chunkIndex < totalChunks - 1) {
          res.status(200).json({ ok: true, partial: true, chunkIndex, totalChunks });
          return;
        }

        const allowedExts = new Set(
          Object.values(slot === 'heroVideo' ? VIDEO_MIME_EXT : IMAGE_MIME_EXT)
        );
        for (const oldExt of allowedExts) {
          if (oldExt !== ext) {
            const stalePath = path.resolve(mediaDir, `custom_${slot}.${oldExt}`);
            if (stalePath.startsWith(mediaDir + path.sep) && fs.existsSync(stalePath)) {
              fs.unlinkSync(stalePath);
            }
          }
        }
        fs.renameSync(partPath, targetPath);
      }

      let existingConfig: Record<string, unknown> = {};
      if (fs.existsSync(configPath)) {
        try {
          const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          if (parsed && typeof parsed === 'object') {
            existingConfig = parsed as Record<string, unknown>;
          }
        } catch {
          existingConfig = {};
        }
      }

      const nextConfig: Record<string, unknown> = {
        locked: Boolean(existingConfig.locked),
      };
      for (const key of ALLOWED_MEDIA_SLOTS) {
        if (typeof existingConfig[key] === 'string') {
          nextConfig[key] = existingConfig[key];
        }
      }
      const publicPath = `/assets/media/${targetFileName}`;
      nextConfig[slot] = publicPath;

      fs.writeFileSync(configPath, JSON.stringify(nextConfig, null, 2) + '\n', 'utf-8');

      const stats = fs.statSync(targetPath);
      res.status(200).json({ ok: true, slot, path: publicPath, sizeBytes: stats.size });
    });

    app.post('/api/lock-media', express.json({ limit: '64kb' }), (_req, res) => {
      const configPath = path.resolve(mediaDir, 'media-config.json');
      if (!configPath.startsWith(mediaDir + path.sep)) {
        res.status(400).json({ ok: false, error: 'Invalid config path.' });
        return;
      }

      let existingConfig: Record<string, unknown> = {};
      if (fs.existsSync(configPath)) {
        try {
          const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          if (parsed && typeof parsed === 'object') {
            existingConfig = parsed as Record<string, unknown>;
          }
        } catch {
          existingConfig = {};
        }
      }

      const nextConfig: Record<string, unknown> = { locked: true };
      for (const key of ALLOWED_MEDIA_SLOTS) {
        if (typeof existingConfig[key] === 'string') {
          nextConfig[key] = existingConfig[key];
        }
      }

      fs.writeFileSync(configPath, JSON.stringify(nextConfig, null, 2) + '\n', 'utf-8');
      res.status(200).json({ ok: true, locked: true });
    });

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
