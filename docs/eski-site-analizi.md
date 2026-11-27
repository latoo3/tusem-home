# Tusem Home: mevcut site analizi

Kaynak: https://www.tusemhome.com, 27 Kasım 2026'da tarandı. Site, Hostinger Website Builder ile yapılmış (altyapı Astro + Vue). Kod dışarı aktarılamıyor ama tüm içerik sayfaların içindeki verilerden eksiksiz çıkarıldı.

## Bu klasördeki dosyalar

| Dosya | Ne işe yarar |
|---|---|
| `catalog.json` | Sitenin tüm içeriği: firma bilgileri, SEO metinleri, 14 kategori, 55 ürün, 38 renk/model varyantı. Yeni site doğrudan bu dosyadan beslenecek. |
| `gorsel-listesi.txt` | Orijinal kalitedeki 103 görselin adresi. |
| `gorselleri-indir.ps1` | Görselleri bilgisayarına `images/` klasörüne indiren Windows betiği. |

## Site yapısı

- **Menü:** Anasayfa, Ürünler, Yeni Eklenenler, İletişim
- **Anasayfa:** tanıtım metni, 3 görsel, "KATALOG" ve "YENİ EKLENENLER" butonları
- **Ürünler:** 12 kategori kartı (görsel + başlık), her biri kendi sayfasına gidiyor
- **Kategori sayfaları:** ürün görseli + ürün kodu + ürün adı. Bazı ürünlerin renk seçenekleri ayrı bir sayfada.
- **İletişim:** iletişim formu, adres, çalışma saatleri, harita
- **Alt bilgi (her sayfada):** adres, 2 telefon/WhatsApp, 2 e-posta, Instagram, harita
- **Tasarım:** beyaz header, gri-mavi footer (rgb 184,192,204), fontlar Roboto + Martel Sans

## Eski sitede bulduğum sorunlar (yenisinde düzeltilebilir)

1. **Görseli olmayan ürün:** Mum Modelleri'ndeki TUS-AF-01 "Fitilli Mum 12 cm" ürününün görseli yok.
2. **Muhtemel kod hatası:** Metal Vazo'da "Metal İkili Darbuka Vazo" TUS-M-1525 yazıyor ama görselin adı tus-m-1527. TUS-M-1525 zaten Metal UFO Vazo'nun kodu.
3. **Rüzgargülü kodları ters olabilir:** TUS-TSM-08 yazan ürünün görseli tus-tsm-09, TUS-TSM-09 yazanınki ise tus-tsm-08.
4. **Islak Lale:** "Yeşil" yazan görselin dosya adı "mavi". Bu sayfaya sitede hiçbir yerden link yok.
5. **Ürünler sayfasında görünmeyen kategoriler:** Mum Modelleri ve Lamba Modelleri sayfaları var ama kataloğa link verilmemiş.
6. **Boş sayfalar:** "Servis Modelleri" ve "Yeni Eklenenler" sayfalarının içi boş.
7. **Gereksiz sepet ikonu:** Satış olmadığı halde header'da alışveriş sepeti ikonu görünüyor.
8. **Telif yılı:** Footer'da "© 2025" yazıyor.

`catalog.json` içinde emin olmadığım yerleri `_uyari` alanıyla işaretledim. Kodlar şimdilik eski sitede yazdığı gibi duruyor: 2. ve 3. maddeleri sen kontrol edip söylersen düzeltirim.

## Yeni sitede karşılığı gereken şeyler

- **İletişim formu:** Hostinger formu taşınamaz. Yerine bir WhatsApp butonu (ürün koduyla hazır mesaj) ve istersen ücretsiz bir form servisi (ör. Formspree) koyabiliriz.
- **Eski adresler:** Google'daki eski sayfa adreslerini korumak için yeni sitede aynı adresleri (ör. `/rattan-sepetler`) kullanacağız.
