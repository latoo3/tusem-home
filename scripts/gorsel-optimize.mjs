// Görsel küçültme: "astro build" bittikten sonra dist/images içindeki görselleri küçültür.
//
//   npm run build  ->  astro build && node scripts/gorsel-optimize.mjs
//
// public/images içindeki orijinallere DOKUNMAZ; sadece derleme çıktısını (dist/) değiştirir.
// Her görsel için:
//   dist/images/<ad>.<uzantı>   aynı ad ve uzantıyla, uzun kenar en fazla 1600 px (büyük görsel)
//   dist/images/k/<ad>.webp     ürün/kategori kartları için 600 px küçük görsel
//   dist/images/h/<ad>.webp     sadece anasayfa görselleri (site.json) için 1200 px hero görseli
// SVG ve GIF dosyalarına dokunulmaz. Adresler src/lib/catalog.ts içindeki
// img(), kucukImg() ve heroImg() fonksiyonlarıyla aynı kurala göre üretilir.

import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(KOK, 'dist');
const GORSELLER = path.join(DIST, 'images');
const KUCUK_KLASOR = 'k';
const HERO_KLASOR = 'h';

const BUYUK_KENAR = 1600;
const KUCUK_KENAR = 600;
const HERO_KENAR = 1200;
const ISLENEN = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const mb = (b) => (b / 1024 / 1024).toFixed(2) + ' MB';
const kb = (b) => (b / 1024).toFixed(0) + ' KB';

/** dist/images altındaki tüm dosyalar (k/ ve h/ çıktı klasörleri hariç). */
async function dosyalariBul(klasor, goreli = '') {
  const sonuc = [];
  for (const g of await readdir(klasor, { withFileTypes: true })) {
    const rel = goreli ? `${goreli}/${g.name}` : g.name;
    if (g.isDirectory()) {
      if (!goreli && (g.name === KUCUK_KLASOR || g.name === HERO_KLASOR)) continue;
      sonuc.push(...(await dosyalariBul(path.join(klasor, g.name), rel)));
    } else if (g.isFile()) {
      sonuc.push(rel);
    }
  }
  return sonuc;
}

async function klasorBoyutu(klasor) {
  let toplam = 0;
  let enBuyuk = { ad: '', boyut: 0 };
  for (const g of await readdir(klasor, { withFileTypes: true, recursive: true })) {
    if (!g.isFile()) continue;
    const tam = path.join(g.parentPath ?? g.path, g.name);
    const { size } = await stat(tam);
    toplam += size;
    if (size > enBuyuk.boyut) enBuyuk = { ad: path.relative(klasor, tam).replaceAll('\\', '/'), boyut: size };
  }
  return { toplam, enBuyuk };
}

/** Uzantıya göre sıkıştırma ayarı (aynı biçimde kalır). */
function bicimle(islem, uzanti) {
  if (uzanti === '.webp') return islem.webp({ quality: 80 });
  if (uzanti === '.png') return islem.png({ palette: true, compressionLevel: 9 });
  return islem.jpeg({ quality: 80, mozjpeg: true });
}

const kucult = (girdi, kenar) =>
  sharp(girdi, { failOn: 'none' })
    .rotate() // telefon fotoğraflarındaki EXIF yönünü uygula
    .resize({ width: kenar, height: kenar, fit: 'inside', withoutEnlargement: true });

const webpYolu = (rel, klasor) => path.join(GORSELLER, klasor, rel.replace(/\.[^./]+$/, '.webp'));

async function webpUret(girdi, rel, klasor, kenar, kalite) {
  const hedef = webpYolu(rel, klasor);
  await mkdir(path.dirname(hedef), { recursive: true });
  await writeFile(hedef, await kucult(girdi, kenar).webp({ quality: kalite }).toBuffer());
}

/** site.json'daki anasayfa görsellerinin dist/images'a göre yolları. */
async function heroGorselleri() {
  try {
    const site = JSON.parse(await readFile(path.join(KOK, 'src/data/site.json'), 'utf8'));
    return new Set(
      (site.anasayfa_gorselleri ?? [])
        .filter(Boolean)
        .map((p) => p.replace(/^\/+/, ''))
        .filter((p) => p.startsWith('images/'))
        .map((p) => p.slice('images/'.length)),
    );
  } catch {
    return new Set();
  }
}

async function main() {
  try {
    await stat(GORSELLER);
  } catch {
    console.log('[gorsel-optimize] dist/images bulunamadı, atlanıyor.');
    return;
  }

  const once = await klasorBoyutu(GORSELLER);
  const dosyalar = (await dosyalariBul(GORSELLER)).filter((f) => ISLENEN.has(path.extname(f).toLowerCase()));
  const herolar = await heroGorselleri();
  const uyarilar = [];

  // Aynı adlı farklı uzantılı dosyalar (x.png ve x.webp) aynı küçük görsele düşer.
  const kucukAdlari = new Map();
  for (const f of dosyalar) {
    const k = f.replace(/\.[^./]+$/, '').toLowerCase();
    if (kucukAdlari.has(k)) uyarilar.push(`Aynı adlı iki görsel var, küçük görselleri çakışıyor: ${kucukAdlari.get(k)} / ${f}`);
    else kucukAdlari.set(k, f);
  }

  let kuculen = 0;
  let sira = 0;
  const isle = async (rel) => {
    const tam = path.join(GORSELLER, rel);
    const uzanti = path.extname(rel).toLowerCase();
    const orijinal = await readFile(tam);
    try {
      const yeni = await bicimle(kucult(orijinal, BUYUK_KENAR), uzanti).toBuffer();
      if (yeni.length < orijinal.length) {
        await writeFile(tam, yeni);
        kuculen++;
      }
      await webpUret(orijinal, rel, KUCUK_KLASOR, KUCUK_KENAR, 78);
      if (herolar.has(rel)) await webpUret(orijinal, rel, HERO_KLASOR, HERO_KENAR, 80);
    } catch (e) {
      // Bozuk/yarım dosya: sayfada kırık görsel olmasın diye küçük/hero adresine orijinali kopyala.
      const hedefler = [webpYolu(rel, KUCUK_KLASOR), ...(herolar.has(rel) ? [webpYolu(rel, HERO_KLASOR)] : [])];
      for (const h of hedefler) {
        await mkdir(path.dirname(h), { recursive: true });
        await writeFile(h, orijinal);
      }
      uyarilar.push(`Görsel okunamadı (dosya bozuk/yarım olabilir), orijinali kullanıldı: ${rel} (${e.message})`);
    }
  };
  const isci = async () => {
    while (sira < dosyalar.length) await isle(dosyalar[sira++]);
  };
  await Promise.all(Array.from({ length: 4 }, isci));

  // Sayfalarda kullanılan küçük/hero görsel adresleri gerçekten üretildi mi?
  const eksikler = new Set();
  for (const g of await readdir(DIST, { withFileTypes: true, recursive: true })) {
    if (!g.isFile() || !g.name.endsWith('.html')) continue;
    const html = await readFile(path.join(g.parentPath ?? g.path, g.name), 'utf8');
    for (const [, adres] of html.matchAll(/["'](\/images\/(?:k|h)\/[^"']+)["']/g)) {
      let yol = adres.replaceAll('&amp;', '&');
      try { yol = decodeURI(yol); } catch {}
      try { await stat(path.join(DIST, yol)); } catch { eksikler.add(yol); }
    }
  }
  for (const e of eksikler) uyarilar.push(`Sayfada kullanılan görsel bulunamadı (JSON'daki görsel adı yanlış olabilir): ${e}`);

  const sonra = await klasorBoyutu(GORSELLER);
  console.log(`\n[gorsel-optimize] ${dosyalar.length} görsel işlendi, ${kuculen} tanesi küçültüldü, ${herolar.size} hero görseli.`);
  console.log(`[gorsel-optimize] dist/images önce: ${mb(once.toplam)}  ->  sonra: ${mb(sonra.toplam)} (küçük ve hero görseller dahil)`);
  console.log(`[gorsel-optimize] En büyük dosya: ${sonra.enBuyuk.ad} (${kb(sonra.enBuyuk.boyut)})`);
  for (const u of uyarilar) console.warn(`[gorsel-optimize] UYARI: ${u}`);
}

await main();
