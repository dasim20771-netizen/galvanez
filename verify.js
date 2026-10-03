import crypto from 'node:crypto';

function verifyToken(token) {
  const secret = process.env.MAGIC_LINK_SECRET;
  if (!secret) throw new Error('MAGIC_LINK_SECRET is not configured');
  const parts = String(token || '').split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (!data.email || !data.exp || Date.now() > data.exp) return null;
  return data;
}

function page(title, message, ok = true) {
  const icon = ok ? '✓' : '×';
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#080a0f;color:#fff;font-family:Arial,sans-serif}.card{width:min(520px,calc(100% - 40px));padding:36px;border:1px solid #252936;border-radius:20px;background:#11141b;text-align:center;box-sizing:border-box}.icon{font-size:48px;margin-bottom:12px}.muted{color:#a8afbd}</style></head><body><main class="card"><div class="icon">${icon}</div><h1>${title}</h1><p class="muted">${message}</p></main></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).send('Method not allowed');
  try {
    const token = req.method === 'GET' ? req.query?.token : req.body?.token;
    const data = verifyToken(token);
    if (!data) return res.status(400).send(page('Link tidak valid', 'Magic Link sudah kedaluwarsa atau tidak valid.', false));

    if (req.method === 'POST') return res.status(200).json({ ok: true, email: data.email, plan: data.plan });
    return res.status(200).send(page('Verification complete', `Email ${data.email} berhasil diverifikasi. Plan: ${data.plan}.`));
  } catch (error) {
    console.error(error);
    return res.status(500).send(page('Server error', 'Server belum dikonfigurasi dengan benar.', false));
  }
}
