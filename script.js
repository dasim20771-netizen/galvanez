const $ = s => document.querySelector(s);
let plan = 'free';

document.querySelectorAll('.plans button').forEach(b => b.onclick = () => {
  document.querySelectorAll('.plans button').forEach(x => x.classList.remove('selected'));
  b.classList.add('selected');
  plan = b.dataset.plan;
});

function note(t) {
  const n = $('#notice');
  n.textContent = t;
  n.className = 'notice show';
}

$('#send').onclick = async () => {
  const e = $('#email').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    note('Masukkan email yang valid.');
    return;
  }

  const btn = $('#send');
  btn.disabled = true;
  btn.style.opacity = '.65';
  note('Mengirim Magic Link...');

  try {
    const response = await fetch('/api/account/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: e, plan })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Gagal mengirim Magic Link.');

    $('#emailStep').classList.add('hidden');
    $('#linkStep').classList.remove('hidden');
    $('#label').textContent = 'STEP 02';
    $('#title').textContent = 'Paste your Magic Link';
    $('#count').textContent = '2/3';
    $('#bar').style.width = '66%';
    note('Magic Link sudah dikirim. Cek Inbox atau Spam/Junk.');
  } catch (err) {
    note(err.message || 'Gagal mengirim Magic Link.');
  } finally {
    btn.disabled = false;
    btn.style.opacity = '';
  }
};

$('#back').onclick = () => location.reload();

$('#verify').onclick = async () => {
  const l = $('#magic').value.trim();
  if (!/^https?:\/\//i.test(l)) {
    note('Tempel URL Magic Link yang valid.');
    return;
  }

  let token;
  try {
    const url = new URL(l);
    token = url.searchParams.get('token');
  } catch {
    note('URL Magic Link tidak valid.');
    return;
  }

  if (!token) {
    note('Token Magic Link tidak ditemukan.');
    return;
  }

  const btn = $('#verify');
  btn.disabled = true;
  btn.style.opacity = '.65';
  note('Memverifikasi Magic Link...');

  try {
    const response = await fetch('/api/account/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.error || 'Magic Link tidak valid atau sudah kedaluwarsa.');

    $('#linkStep').classList.add('hidden');
    $('#doneStep').classList.remove('hidden');
    $('#label').textContent = 'STEP 03';
    $('#title').textContent = 'Verified';
    $('#count').textContent = '3/3';
    $('#bar').style.width = '100%';
    note(`Email ${data.email} berhasil diverifikasi.`);
  } catch (err) {
    note(err.message || 'Verifikasi gagal.');
  } finally {
    btn.disabled = false;
    btn.style.opacity = '';
  }
};
