// Tusem Home Cloudflare Worker
//
// Sitenin kendisi statik dosyalardır (dist/). Bu küçük kod sadece admin panelinin
// (/admin) "GitHub ile giriş yap" adımını yönetir:
//   /oauth/auth      -> kullanıcıyı GitHub giriş sayfasına yollar
//   /oauth/callback  -> GitHub'dan dönen kodu erişim anahtarına çevirip panele iletir
// Diğer tüm adresler normal site dosyalarından sunulur.
//
// Cloudflare'de bu Worker'a iki "Secret" eklenmelidir (GitHub OAuth App'ten):
//   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET

const COOKIE = 'tusem-oauth-state';

// Giriş anahtarı sadece bu adreslerde açılan admin paneline verilir.
const IZINLI_ADRESLER = [
  'https://tusemhome.com',
  'https://www.tusemhome.com',
  'https://tusem-home.celalusta3418.workers.dev',
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/oauth/auth') return girisBaslat(url, env);
    if (url.pathname === '/oauth/callback') return girisBitir(request, url, env);

    return env.ASSETS.fetch(request);
  },
};

function girisBaslat(url, env) {
  if (url.searchParams.get('provider') !== 'github') {
    return sonuc('error', { message: 'Sadece GitHub ile giriş destekleniyor.' });
  }
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return sonuc('error', {
      message: 'Giriş ayarları eksik: Cloudflare\'de GITHUB_CLIENT_ID ve GITHUB_CLIENT_SECRET tanımlanmalı.',
    });
  }

  const state = crypto.randomUUID();
  const github = new URL('https://github.com/login/oauth/authorize');
  github.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  github.searchParams.set('scope', url.searchParams.get('scope') || 'repo,user');
  github.searchParams.set('state', state);
  github.searchParams.set('redirect_uri', `${url.origin}/oauth/callback`);

  return new Response(null, {
    status: 302,
    headers: {
      Location: github.toString(),
      'Set-Cookie': `${COOKIE}=${state}; Path=/oauth; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

async function girisBitir(request, url, env) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cerez = (request.headers.get('Cookie') || '')
    .split(';')
    .map((c) => c.trim().split('='))
    .find(([k]) => k === COOKIE)?.[1];

  if (!code || !state || state !== cerez) {
    return sonuc('error', { message: 'Giriş isteği doğrulanamadı. Lütfen tekrar deneyin.' });
  }

  let veri;
  try {
    const yanit = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${url.origin}/oauth/callback`,
      }),
    });
    veri = await yanit.json();
  } catch {
    return sonuc('error', { message: 'GitHub\'a ulaşılamadı. Lütfen tekrar deneyin.' });
  }

  if (!veri.access_token) {
    return sonuc('error', { message: veri.error_description || 'GitHub girişi başarısız oldu.' });
  }
  return sonuc('success', { provider: 'github', token: veri.access_token });
}

// Giriş penceresi, sonucu kendisini açan admin paneline Decap/Sveltia CMS'in
// beklediği mesaj biçimiyle iletir ve kapanır.
function sonuc(durum, icerik) {
  const mesaj = JSON.stringify(`authorization:github:${durum}:${JSON.stringify(icerik)}`);
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Giriş</title></head>
<body style="font-family:sans-serif;padding:2em">
<p>${durum === 'success' ? 'Giriş yapıldı, bu pencere kapanıyor…' : 'Hata: ' + kacis(icerik.message)}</p>
<script>
  (function () {
    var mesaj = ${mesaj.replace(/</g, '\\u003c')};
    var izinli = ${JSON.stringify(IZINLI_ADRESLER)};
    window.addEventListener('message', function (e) {
      if (e.data === 'authorizing:github' && window.opener && izinli.indexOf(e.origin) !== -1) {
        window.opener.postMessage(mesaj, e.origin);
        ${durum === 'success' ? 'setTimeout(function () { window.close(); }, 500);' : ''}
      }
    });
    if (window.opener) window.opener.postMessage('authorizing:github', '*');
  })();
</script></body></html>`;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function kacis(s) {
  return String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
