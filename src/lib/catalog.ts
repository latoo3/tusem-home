import siteData from '../data/site.json';

// İçerik admin panelinden (/admin) düzenlenir:
//   src/data/site.json              iletişim bilgileri, SEO metinleri
//   src/data/kategoriler/*.json     her kategori ayrı dosya, içinde ürünleri

export type Varyant = { renk: string; gorsel: string | null };
export type Urun = {
  kod: string;
  ad: string;
  gorsel: string | null;
  not?: string;
  sayfa?: string;
  yeni?: boolean;
  varyantlar?: Varyant[];
};
export type Kategori = { slug: string; ad: string; kapak: string | null; sira?: number; urunler: Urun[] };

export const site = siteData;

/** "TUS-ÇİÇEK 01" -> "tus-cicek-01" */
const adresYap = (s: string) =>
  s
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşü]/g, (h) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[h]!)
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const temizNo = (n: string) => n.replace(/[^0-9]/g, '');
export const whatsappNo = temizNo(site.telefon_whatsapp[0]);
export const whatsappLink = (mesaj: string) =>
  `https://wa.me/${whatsappNo}?text=${encodeURIComponent(mesaj)}`;

/** "LED IŞIK MODELLERİ" -> "Led Işık Modelleri" (Türkçe harflere uygun). */
export const baslikYap = (s: string) =>
  s
    .toLocaleLowerCase('tr-TR')
    .split(/(\s+|\(|,)/)
    .map((w) => (w.length ? w[0].toLocaleUpperCase('tr-TR') + w.slice(1) : w))
    .join('');

const kategoriDosyalari = import.meta.glob<Kategori>('../data/kategoriler/*.json', {
  eager: true,
  import: 'default',
});
/** Kategoriler "sira" numarasına göre (küçük önce) sıralanır. */
export const kategoriler: Kategori[] = Object.values(kategoriDosyalari)
  .map((k) => ({ ...k, slug: k.slug?.trim() || adresYap(k.ad), urunler: k.urunler ?? [] }))
  .sort((a, b) => (a.sira ?? 9999) - (b.sira ?? 9999) || a.ad.localeCompare(b.ad, 'tr'));

/** Görsel yolunu ("images/x.webp" veya "/images/x.webp") sitedeki adrese çevirir. */
export const img = (p: string | null | undefined) =>
  p ? '/' + p.replace(/^\/+/, '') : '/placeholder.svg';

/**
 * Derlemede scripts/gorsel-optimize.mjs'in ürettiği küçültülmüş sürümün adresi:
 * "/images/x.png" -> "/images/<klasor>/x.webp". SVG/GIF ve /images dışındaki görseller
 * olduğu gibi kalır. "npm run dev" sırasında küçük görseller üretilmediği için orijinali döner.
 */
const kucukSurum = (klasor: string) => (p: string | null | undefined) => {
  const yol = img(p);
  if (import.meta.env.DEV || !/^\/images\/.+\.(png|jpe?g|webp)$/i.test(yol)) return yol;
  return yol.replace(/^\/images\//, `/images/${klasor}/`).replace(/\.[^./]+$/, '.webp');
};

/** Kart görseli (uzun kenar 600 px, webp): "/images/x.png" -> "/images/k/x.webp" */
export const kucukImg = kucukSurum('k');

/** Anasayfa hero görseli (uzun kenar 1200 px, webp): "/images/x.png" -> "/images/h/x.webp" */
export const heroImg = kucukSurum('h');

/** Varyantı olan ürünlerin kendi sayfası (eski sitedeki adresler korunur). */
export const urunSayfasi = (u: Urun) =>
  u.varyantlar?.length ? u.sayfa?.trim() || adresYap(u.kod) : undefined;
