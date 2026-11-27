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

Tüm içerik tek bir dosyada: **`src/data/catalog.json`**.

- **Yeni ürün:** ilgili kategorinin `urunler` listesine ekleyin. Görseli `public/images/` klasörüne koyun.
  ```json
  { "kod": "TUS-XXX-01", "ad": "ÜRÜN ADI", "gorsel": "images/dosya-adi.webp" }
  ```
- **Renk/model seçenekleri:** ürüne `"varyantlar": [{ "renk": "SİYAH", "gorsel": "images/..." }]` ekleyin. Ürünün seçeneklerini gösteren sayfa kendiliğinden oluşur.
- **Yeni eklenenler sayfası:** ürüne `"yeni": true` ekleyin.
- **Not (ör. paket adedi):** `"not": "12'Lİ PAKET"`
- **Yeni kategori:** `kategoriler` listesine `slug`, `ad`, `kapak` ve `urunler` alanlarıyla ekleyin. Kategori sayfası `/slug` adresinde oluşur.
- **İletişim bilgileri, çalışma saatleri, SEO metinleri:** `site` bölümünde.

## Yapı

```
src/data/catalog.json      tüm içerik
src/pages/                 sayfalar (anasayfa, ürünler, kategori/ürün, yeni eklenenler, iletişim)
src/components/            ürün ve kategori kartları
src/layouts/Base.astro     header, footer, SEO etiketleri, WhatsApp butonu
src/styles/global.css      tasarım
public/images/             ürün görselleri
docs/eski-site-analizi.md  eski sitenin analizi ve bulunan hatalar
```

Eski sitedeki sayfa adresleri (ör. `/rattan-sepetler`, `/metal-ufo-vazo`) korunuyor, böylece Google'daki linkler kırılmaz.
