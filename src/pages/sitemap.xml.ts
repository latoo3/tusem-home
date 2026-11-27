import type { APIRoute } from 'astro';
import { kategoriler, urunSayfasi } from '../lib/catalog';

export const GET: APIRoute = ({ site }) => {
  const yollar = [
    '', 'urunler', 'yenieklenenler', 'tusemhomeiletisim',
    ...kategoriler.map((k) => k.slug),
    ...kategoriler.flatMap((k) => k.urunler.map(urunSayfasi).filter(Boolean) as string[]),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${yollar.map((y) => `  <url><loc>${new URL('/' + y, site).href}</loc></url>`).join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
