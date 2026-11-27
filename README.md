# Tusem Home

Tusem Home'un toptan ürün katalog sitesi (https://www.tusemhome.com). [Astro](https://astro.build) ile yapılmış statik bir site: satış ve ödeme yok, ürünler ürün kodu ve WhatsApp üzerinden soruluyor.

## Kurulum

Gerekenler: [Node.js](https://nodejs.org) 20 veya üstü.

```bash
npm install
npm run dev      # http://localhost:4321 adresinde canlı önizleme
npm run build    # yayına hazır site dist/ klasörüne çıkar
```

### Görseller (ilk kurulumda bir kez)

Ürün görselleri eski Hostinger sitesinden indirilir:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\gorselleri-indir.ps1
```

Görseller `public/images/` klasörüne iner. Sonra bunları commit edip GitHub'a gönderin.

## Ürün ekleme ve düzenleme

En kolay yol **admin paneli**: https://www.tusemhome.com/admin

GitHub hesabıyla giriş yapılır (hesabın bu repoda "collaborator" olması gerekir). Panelde kategori ve ürün eklenir, silinir, fotoğraf yüklenir; "Kaydet" denince değişiklik GitHub'a commit olur ve site 1-2 dakikada güncellenir. Yüklenen fotoğraflar otomatik olarak küçültülüp WebP'ye çevrilir.

> Panelden değişiklik yapıldıktan sonra bilgisayarda kodla çalışmadan önce mutlaka `git pull` yapın.

İçerik dosyaları (elle düzenlemek isterseniz):

- **`src/data/kategoriler/*.json`**: her kategori ayrı dosya. `sira` (küçük önce gösterilir), `slug` (sayfa adresi), `ad`, `kapak`, `urunler`.
  ```json
  { "kod": "TUS-XXX-01", "ad": "ÜRÜN ADI", "gorsel": "/images/dosya-adi.webp" }
  ```
- **Renk/model seçenekleri:** ürüne `"varyantlar": [{ "renk": "SİYAH", "gorsel": "/images/..." }]`. Ürünün seçeneklerini gösteren sayfa kendiliğinden oluşur.
- **Yeni eklenenler sayfası:** `"yeni": true`. **Not:** `"not": "12'Lİ PAKET"`
- **`src/data/site.json`**: iletişim bilgileri, çalışma saatleri, SEO metinleri.

### Admin paneli nasıl çalışıyor

- `public/admin/` : panel ([Sveltia CMS](https://sveltiacms.app), CDN'den yüklenir) ve ayarları (`config.yml`).
- `worker/index.js` : GitHub girişini yapan küçük Cloudflare Worker kodu (`/oauth/auth`, `/oauth/callback`). Diğer tüm adresler statik siteden sunulur.
- Cloudflare'de Worker'a iki secret tanımlı olmalı: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (GitHub > Settings > Developer settings > OAuth Apps, callback: `https://tusem-home.celalusta3418.workers.dev/oauth/callback`).

## Yapı

```
src/data/kategoriler/       her kategori ve ürünleri (bir dosya = bir kategori)
src/data/site.json          iletişim bilgileri, SEO metinleri
public/admin/               admin paneli (Sveltia CMS)
worker/index.js             admin paneli GitHub girişi
src/pages/                 sayfalar (anasayfa, ürünler, kategori/ürün, yeni eklenenler, iletişim)
src/components/            ürün ve kategori kartları
src/layouts/Base.astro     header, footer, SEO etiketleri, WhatsApp butonu
src/styles/global.css      tasarım
public/images/             ürün görselleri
docs/eski-site-analizi.md  eski sitenin analizi ve bulunan hatalar
```

Eski sitedeki sayfa adresleri (ör. `/rattan-sepetler`, `/metal-ufo-vazo`) korunuyor, böylece Google'daki linkler kırılmaz.
