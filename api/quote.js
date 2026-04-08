/* ═══════════════════════════════════════════════
   WashPro SFV — /api/quote.js
   Vercel serverless function (Node 18+)
   Receives quote form POSTs, sends emails via Resend.
   Set RESEND_API_KEY in Vercel environment variables.
═══════════════════════════════════════════════ */

const OWNER_EMAIL = 'info@washprosfv.com';
const FROM_EMAIL  = 'WashPro SFV <noreply@washprosfv.com>';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, service, address, date, message } = req.body || {};

  // Validate required fields
  if (!name || !phone || !email || !service) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Log and return success so users aren't blocked when key is missing
    console.warn('RESEND_API_KEY not set — skipping email send');
    return res.status(200).json({ ok: true });
  }

  const serviceLabels = {
    'house-washing':      'House Washing',
    'roof-cleaning':      'Roof Cleaning',
    'driveway-concrete':  'Driveway & Concrete',
    'solar-panels':       'Solar Panel Cleaning',
    'commercial':         'Commercial Washing',
    'fence-deck':         'Fence & Deck Restoration',
    'multiple':           'Multiple Services',
    'other':              'Other / Not Sure',
  };
  const serviceLabel = serviceLabels[service] || service;

  try {
    // ── Owner notification ──────────────────────────
    await sendEmail(apiKey, {
      from:    FROM_EMAIL,
      to:      OWNER_EMAIL,
      subject: `New Quote Request — ${name} (${serviceLabel})`,
      html: `
        <h2 style="font-family:sans-serif;color:#1a1a2e">New Quote Request</h2>
        <table style="font-family:sans-serif;font-size:15px;border-collapse:collapse;width:100%;max-width:520px">
          <tr><td style="padding:8px 0;color:#555;width:130px"><strong>Name</strong></td><td style="padding:8px 0">${esc(name)}</td></tr>
          <tr><td style="padding:8px 0;color:#555"><strong>Phone</strong></td><td style="padding:8px 0"><a href="tel:${esc(phone)}">${esc(phone)}</a></td></tr>
          <tr><td style="padding:8px 0;color:#555"><strong>Email</strong></td><td style="padding:8px 0"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
          <tr><td style="padding:8px 0;color:#555"><strong>Service</strong></td><td style="padding:8px 0">${esc(serviceLabel)}</td></tr>
          ${address ? `<tr><td style="padding:8px 0;color:#555"><strong>Address</strong></td><td style="padding:8px 0">${esc(address)}</td></tr>` : ''}
          ${date    ? `<tr><td style="padding:8px 0;color:#555"><strong>Preferred Date</strong></td><td style="padding:8px 0">${esc(date)}</td></tr>` : ''}
          ${message ? `<tr><td style="padding:8px 0;color:#555;vertical-align:top"><strong>Notes</strong></td><td style="padding:8px 0">${esc(message)}</td></tr>` : ''}
        </table>
      `,
    });

    // ── Customer confirmation ───────────────────────
    await sendEmail(apiKey, {
      from:    FROM_EMAIL,
      to:      email,
      subject: `We received your quote request — WashPro SFV`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <h2 style="color:#2CC96B">Thanks, ${esc(name)}!</h2>
          <p style="font-size:15px;color:#333;line-height:1.65">
            We received your quote request for <strong>${esc(serviceLabel)}</strong>.
            Our team will review your details and reach out within a few hours to get you scheduled.
          </p>
          <p style="font-size:15px;color:#333;line-height:1.65">
            In the meantime, feel free to call or text us directly at
            <a href="tel:7472023622" style="color:#2CC96B">747-202-3622</a>.
          </p>
          <p style="font-size:13px;color:#999;margin-top:32px">
            WashPro SFV &nbsp;·&nbsp; San Fernando Valley, CA &nbsp;·&nbsp;
            <a href="mailto:info@washprosfv.com" style="color:#999">info@washprosfv.com</a>
          </p>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Failed to send email. Please call us at 747-202-3622.' });
  }
}

async function sendEmail(apiKey, { from, to, subject, html }) {
  const r = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Resend ${r.status}: ${body}`);
  }
  return r.json();
}

// Minimal HTML escaping to prevent XSS in email bodies
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
