MOTION+ V4 — MAGIC LINK UI

Alur: Email -> Send Magic Link -> Inbox/Spam -> Paste Magic Link -> Verify.

Frontend demo ini tidak mengirim email dan tidak memverifikasi token pada layanan pihak ketiga. Sambungkan ke backend resmi yang Anda kontrol, misalnya POST /api/account/magic-link dan POST /api/account/verify. Simpan secret di server, gunakan token sekali pakai dan expiry, serta rate limiting.

Jangan gunakan endpoint atau teknik bypass untuk mengubah akun pihak lain.
