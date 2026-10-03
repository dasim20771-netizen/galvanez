import crypto from 'node:crypto';

function sign(value) {
  const secret = process.env.MAGIC_LINK_SECRET;
  if (!secret) throw new Error('MAGIC_LINK_SECRET is not configured');
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function makeToken(email, plan) {
  const payload = Buffer.from(JSON.stringify({
    email,
    plan,
    exp: Date.now() + 15 * 60 * 1000,
    nonce: crypto.randomBytes(12).toString('hex')
  })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, plan = 'free' } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email tidak valid.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const selectedPlan = plan === 'premium' ? 'premium' : 'free';
    const token = makeToken(normalizedEmail, selectedPlan);

    const baseUrl = process.env.APP_URL || `https://${req.headers.host}`;
    const magicLink = `${baseUrl}/api/account/verify?token=${encodeURIComponent(token)}`;
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      return res.status(500).json({
        error: 'Email service belum dikonfigurasi. Tambahkan RESEND_API_KEY dan EMAIL_FROM di Vercel.'
      });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [normalizedEmail],
        subject: 'Your Motion+ Magic Link',
        html: `<!doctype html><html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><h2>Verify your Motion+ account</h2><p>Click the button below to verify <b>${normalizedEmail.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</b>.</p><p><a href="${magicLink}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:8px">Verify my email</a></p><p>This link expires in 15 minutes.</p><p>If you did not request this, you can ignore this email.</p></body></html>`
      })
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('Resend error:', details);
      return res.status(502).json({ error: 'Gagal mengirim email. Periksa konfigurasi Resend dan domain pengirim.' });
    }

    return res.status(200).json({ ok: true, message: 'Magic Link berhasil dikirim.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
}
