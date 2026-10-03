# MOTION+ V4 — Magic Link

Versi ini sudah dilengkapi backend Vercel untuk mengirim dan memverifikasi Magic Link menggunakan Resend.

## Struktur

```text
index.html
script.js
style.css
api/
  account/
    magic-link.js
    verify.js
vercel.json
.env.example
```

## Setup Vercel

1. Upload semua file/folder ini ke repository GitHub.
2. Import repository tersebut ke Vercel.
3. Framework Preset: **Other**.
4. Build Command: **kosong**.
5. Output Directory: **.**.
6. Root Directory: folder yang langsung berisi `index.html`.

## Setup Resend

Buat akun Resend dan siapkan API key. Untuk production, gunakan alamat pengirim dari domain yang sudah diverifikasi di Resend.

Di Vercel: **Project → Settings → Environment Variables**, tambahkan:

- `RESEND_API_KEY`
- `EMAIL_FROM` — contoh: `Motion+ <noreply@domainanda.com>`
- `MAGIC_LINK_SECRET` — string acak panjang, minimal 32 karakter
- `APP_URL` — URL production Vercel, misalnya `https://nama-project.vercel.app`

Setelah menambahkan variable, lakukan **Redeploy**.

## Cara kerja

- `POST /api/account/magic-link` membuat token bertanda tangan dan mengirim email melalui Resend.
- `GET /api/account/verify?token=...` memvalidasi token ketika link pada email diklik.
- `POST /api/account/verify` memvalidasi token ketika URL ditempel ke halaman frontend.
- Token berlaku 15 menit.

Catatan: versi ini menggunakan token signed/stateless. Untuk aplikasi production dengan kebutuhan keamanan lebih tinggi, tambahkan database/Redis agar token benar-benar single-use dan dapat dicabut setelah dipakai.
