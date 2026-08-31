# Etkinlik Keşif Uygulaması

Nuxt 4, Nuxt UI ve Ticketmaster API kullanılarak geliştirilmiş bir etkinlik keşif uygulaması.

## Kurulum

1.  Repoyu clone et:

```bash
      git clone https://github.com/EmirAkagunduz16/event-discovery-app.git
      cd etkinlik-kesif-uygulamasi
```

2.  Paketleri yükle:

```bash
      pnpm install
```

3.  `.env.example`'ı `.env`'ye kopyala:

```bash
      cp .env.example .env
```

4.  `.env` dosyasını düzenle ve Ticketmaster API key'ini ekle:
    - https://developer.ticketmaster.com/ adresinden key al
    - `.env` dosyasında `TICKETMASTER_API_KEY` yerine koy

5.  Dev sunucusunu başlat:

```bash
      pnpm run dev
```

      Tarayıcı `http://localhost:3000` adresinde açılacak.

## Teknolojiler

- Nuxt 4
- Nuxt UI
- Pinia
- TypeScript
- Ticketmaster Discovery API v2
