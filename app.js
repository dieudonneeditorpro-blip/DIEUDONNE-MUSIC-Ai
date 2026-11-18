/*
 DIEUDONNE MUSIC / EDITOR PRO
 1) Copy config.example.js to config.js and add your Supabase project URL + anon/publishable key.
 2) Run on a local web server or deploy to a static host. Do not put service_role keys in this file.
*/
let supabaseClient = null;
try {
  const cfg = await import('./config.js');
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_URL.includes('YOUR_')) {
    supabaseClient = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.info('Supabase not configured yet. Public demo mode is active.');
}

const $ = (id) => document.getElementById(id);
$('year').textContent = new Date().getFullYear();
$('menuToggle').addEventListener('click', () => $('nav').classList.toggle('open'));
$('nav').querySelectorAll('a').forEach(a => a.addEventListener('click', () => $('nav').classList.remove('open')));
const dialog = $('authDialog');
$('authOpen').addEventListener('click', () => dialog.showModal());
$('authClose').addEventListener('click', () => dialog.close());
let currentUser = null;
let isAdmin = false;
let mediaItems = [];

function toast(message) {
  $('toast').textContent = message;
  $('toast').classList.remove('hidden');
  setTimeout(() => $('toast').classList.add('hidden'), 3500);
}
function escapeHTML(s='') {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function mediaCard(item) {
  const isMusic = item.type === 'music';
  const cover = item.cover_url ? `<img class="cover" src="${escapeHTML(item.cover_url)}" alt="Igifuniko cya ${escapeHTML(item.title)}">` : `<div class="cover">${isMusic?'♫':'▶'}</div>`;
  const player = isMusic
    ? `<audio controls preload="none" src="${escapeHTML(item.file_url)}"></audio>`
    : `<video controls preload="metadata" playsinline src="${escapeHTML(item.file_url)}"></video>`;
  return `<article class="media-card">${cover}<div class="media-body"><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.artist || 'DIEUDONNE EDITOR PRO')}</p>${player}<div class="media-actions"><a class="mini-button" href="${escapeHTML(item.file_url)}" download>Kuramo</a></div></div></article>`;
}
function renderMedia() {
  const q = $('musicSearch').value.trim().toLowerCase();
  const music = mediaItems.filter(x => x.type === 'music' && `${x.title} ${x.artist||''}`.toLowerCase().includes(q));
  const videos = mediaItems.filter(x => x.type === 'video');
  $('musicGrid').innerHTML = music.map(mediaCard).join('');
  $('videoGrid').innerHTML = videos.map(mediaCard).join('');
  $('videoEmpty').classList.toggle('hidden', videos.length > 0);
  if (!music.length) $('musicGrid').innerHTML = '<p class="muted">Nta ndirimbo zihari cyangwa zijyanye n\'ibyo washakishije.</p>';
}
$('musicSearch').addEventListener('input', renderMedia);

async function loadMedia() {
  if (!supabaseClient) {
    $('musicStatus').textContent = 'Demo mode: nta ndirimbo zashyizweho. Huza Supabase, ukore tables na Storage, hanyuma umuyobozi azabashe gushyiraho indirimbo.';
    renderMedia(); return;
  }
  const { data, error } = await supabaseClient.from('media').select('*').eq('published', true).order('created_at', {ascending:false});
  if (error) { $('musicStatus').textContent = 'Ntibishobotse gufungura indirimbo. Reba setup ya Supabase: ' + error.message; return; }
  mediaItems = (data || []).map(x => ({...x, type:x.type || 'music'}));
  $('musicStatus').textContent = mediaItems.length ? 'Hitamo indirimbo cyangwa video wifuza.' : 'Nta ndirimbo zashyizweho kugeza ubu.';
  renderMedia();
}
async function refreshUser() {
  if (!supabaseClient) return;
  const { data } = await supabaseClient.auth.getSession();
  currentUser = data.session?.user || null;
  isAdmin = false;
  if (currentUser) {
    const { data: profile } = await supabaseClient.from('profiles').select('role').eq('id', currentUser.id).maybeSingle();
    isAdmin = profile?.role === 'admin';
  }
  $('admin').classList.toggle('hidden', !isAdmin);
  $('authOpen').textContent = currentUser ? 'Konti yanjye / Sohoka' : 'Injira / Iyandikishe';
  if (currentUser) $('authStatus').textContent = `Winjiye nka ${currentUser.email}.`;
}
async function authAction(mode) {
  if (!supabaseClient) { $('authStatus').textContent = 'Banza uhuze Supabase muri config.js kugira ngo konti zikore.'; return; }
  const email = $('authEmail').value.trim(), password = $('authPassword').value;
  $('authStatus').textContent = 'Tegereza...';
  let result;
  if (mode === 'signup') result = await supabaseClient.auth.signUp({email, password});
  else result = await supabaseClient.auth.signInWithPassword({email, password});
  if (result.error) { $('authStatus').textContent = result.error.message; return; }
  $('authStatus').textContent = mode === 'signup' ? 'Konti ishyizweho. Reba email niba usabwe kuyemeza.' : 'Winjiye neza.';
  await refreshUser();
  if (mode === 'login') { dialog.close(); toast('Winjiye neza.'); }
}
$('loginBtn').addEventListener('click', e => { e.preventDefault(); authAction('login'); });
$('signupBtn').addEventListener('click', () => authAction('signup'));
$('authOpen').addEventListener('contextmenu', async e => {
  if (!currentUser || !supabaseClient) return;
  e.preventDefault();
  await supabaseClient.auth.signOut(); currentUser = null; isAdmin = false; $('admin').classList.add('hidden'); $('authOpen').textContent = 'Injira / Iyandikishe'; toast('Wasohotse muri konti.');
});

$('uploadForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (!supabaseClient || !currentUser || !isAdmin) { $('uploadStatus').textContent = 'Gushyiraho bisaba kwinjira nka admin no guhuza Supabase.'; return; }
  const type = $('uploadType').value, file = $('uploadFile').files[0], cover = $('uploadCover').files[0];
  if (!file) return;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${currentUser.id}/${Date.now()}-${safeName}`;
  $('uploadStatus').textContent = 'Birimo koherezwa...';
  const { error: fileError } = await supabaseClient.storage.from('media').upload(filePath, file, {upsert:false});
  if (fileError) { $('uploadStatus').textContent = fileError.message; return; }
  const { data: fileUrlData } = supabaseClient.storage.from('media').getPublicUrl(filePath);
  let coverUrl = null;
  if (cover) {
    const coverPath = `${currentUser.id}/${Date.now()}-${cover.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
    const { error: coverError } = await supabaseClient.storage.from('covers').upload(coverPath, cover);
    if (!coverError) coverUrl = supabaseClient.storage.from('covers').getPublicUrl(coverPath).data.publicUrl;
  }
  const { error } = await supabaseClient.from('media').insert({
    title:$('uploadTitle').value.trim(), artist:$('uploadArtist').value.trim(),
    type, file_url:fileUrlData.publicUrl, cover_url:coverUrl, uploaded_by:currentUser.id, published:true
  });
  if (error) { $('uploadStatus').textContent = 'Fayili yagiye kuri Storage ariko metadata yanze: ' + error.message; return; }
  $('uploadStatus').textContent = 'Byashyizwe kuri website.';
  $('uploadForm').reset(); await loadMedia();
});

$('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('contactName').value.trim(), reply = $('contactReply').value.trim(), message = $('contactMessage').value.trim();
  const body = `Muraho DIEUDONNE EDITOR PRO,%0A%0AIzina: ${encodeURIComponent(name)}%0AEmail/Telefoni: ${encodeURIComponent(reply)}%0AUbutumwa: ${encodeURIComponent(message)}`;
  const wa = `https://wa.me/2507287947070?text=${body}`;
  window.open(wa, '_blank', 'noopener');
  $('contactStatus').textContent = 'Ubutumwa bwateguwe kuri WhatsApp. Kanda Send muri WhatsApp kugira ngo bwoherezwe.';
});
if (supabaseClient) {
  supabaseClient.auth.onAuthStateChange(() => { refreshUser(); });
  await refreshUser();
}
await loadMedia();
