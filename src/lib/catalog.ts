import data from '../data/catalog.json';

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
export type Kategori = { slug: string; ad: string; kapak: string | null; urunler: Urun[] };

export const site = data.site;
export const kategoriler = data.kategoriler as Kategori[];

/** catalog.json'daki "images/..." yolunu sitedeki adrese çevirir. */
export const img = (p: string | null | undefined) => (p ? '/' + p : '/placeholder.svg');

/** Varyantı olan ürünlerin kendi sayfası (eski sitedeki adresler korunur). */
export const urunSayfasi = (u: Urun) =>
  u.varyantlar?.length ? u.sayfa ?? u.kod.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined;

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
