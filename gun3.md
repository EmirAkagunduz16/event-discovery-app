Branch: feat/event-detail-page

Ne yapacaksın:
pages/events/[id].vue sayfasını oluşturacaksın. Kullanıcı bir etkinlik kartına tıkladığında buraya gelecek, tek bir etkinliğin tüm detaylarını (etkinlik bilgisi, mekan, sanatçılar) görecek.

Genel akış:

1. Sayfa açılır, URL'den id parametresi okunur (örn. /events/G5vYZ4b0k1234)
2. useEvents() composable'ından getEventById(id) çağrılır
3. loading = true → skeleton gösterilir
4. Veri gelirse → sayfa dolu şekilde render edilir
5. 404 gelirse → "etkinlik bulunamadı" özel mesajı
6. Diğer hata → genel hata mesajı + tekrar dene

A) Sayfa route yapısı

- Dosya adı: pages/events/[id].vue → Nuxt otomatik olarak bunu
  /events/:id rotasına bağlar
- Sayfa mount olduğunda: useRoute().params.id ile id yakalanır
- onMounted (veya watch ile route.params.id değişince tekrar):
  getEventById(id) çağrılır

NOT: Kullanıcı bir detay sayfasındayken başka bir etkinliğin linkine
tıklarsa (örn. "benzer etkinlikler" gibi bir özellik olsaydı), Vue Router
component'i yeniden mount etmeyebilir, sadece params değişir. Bu yüzden
sadece onMounted değil, route.params.id'yi watch etmek daha güvenli.

B) Loading durumu (detaylı skeleton)

Gün 1'deki basit "skeleton kart grid'i" burada yeterli değil çünkü
detay sayfası daha karmaşık bir layout'a sahip. Skeleton şunları
taklit etmeli:

- Üstte: büyük dikdörtgen (görsel alanı yerine gri kutu)
- Altında: uzun bir çizgi (başlık yerine), birkaç kısa çizgi (tarih,
  şehir gibi meta bilgiler yerine)
- Ortada: paragraf şeklinde birkaç gri çizgi (açıklama yerine)
- Bir bölüm: mekan bilgisi placeholder'ı (küçük kutu + çizgiler)
- Bir bölüm: sanatçı listesi placeholder'ı (yan yana birkaç küçük
  yuvarlak/kare + isim çizgisi)

Amaç: Kullanıcı sayfanın genel şeklini önceden görsün, ansızın
içerik "zıplamasın" (layout shift olmasın).

C) Error durumu — İKİ farklı hata tipini ayırt et

1. NOT FOUND (404) durumu:
   - API'den "etkinlik bulunamadı" bilgisi geldiğinde (Gün 1'de
     server/api/events/[id].get.ts'te bu ayrımı zaten kurmuştuk)
   - Gösterilecek: Özel bir "bulunamadı" görünümü
     - İkon (örn. büyüteç veya soru işareti)
     - "Aradığınız etkinlik bulunamadı"
     - Açıklama: "Etkinlik kaldırılmış veya link hatalı olabilir"
     - Buton: "Etkinliklere Dön" (/events sayfasına yönlendirir)
   - Bu, genel hata sayfasından GÖRSEL OLARAK farklı olmalı
     (kullanıcı "sistem çöktü" ile "bu etkinlik yok" arasındaki
     farkı anlamalı)

2. GENEL HATA durumu (network, server 500, vb.):
   - "Bir şeyler ters gitti" mesajı
   - Buton: "Tekrar Dene" (aynı id ile getEventById tekrar çağrılır)
   - Buton: "Etkinliklere Dön" (alternatif olarak)

D) Etkinlik bilgileri bölümü — gösterilecek her alan

1. Görsel galerisi:
   - event.images dizisindeki TÜM görseller gösterilir (sadece ilki değil)
   - Eğer 1 görsel varsa: tek büyük görsel
   - Eğer birden fazla varsa: ana görsel + altında küçük thumbnail'ler
     (tıklanınca ana görsel değişir) VEYA basit bir yatay kaydırmalı galeri
   - Hiç görsel yoksa: placeholder görsel gösterilir (Gün 1'deki
     EventCard'daki placeholder ile tutarlı olsun)

2. Başlık: event.name (büyük, kalın font)

3. Durum bilgisi (varsa):
   - event.dates.status.code alanına bakılır
   - "onsale" → yeşil badge "Biletler Satışta"
   - "offsale" → gri badge "Satış Kapandı"
   - "cancelled" → kırmızı badge "İptal Edildi"
   - "postponed" → sarı badge "Ertelendi"
   - Bu alan yoksa hiçbir badge gösterilme

4. Tarih + saat:
   - event.dates.start.localDate ve localTime birleştirilip
     okunabilir formatta gösterilir (örn. "25 Aralık 2024, Çarşamba, 19:30")
   - event.dates.end varsa: "Bitiş: ..." şeklinde ek satır

5. Açıklama (event.description varsa):
   - Paragraf halinde gösterilir
   - Yoksa bu bölüm tamamen gizlenir (boş kutu bırakılmaz)

6. Fiyat aralığı (event.priceRanges varsa):
   - "150 TL - 450 TL" gibi min-max gösterilir
   - Birden fazla priceRange objesi varsa (örn. standard + VIP ayrı ayrı),
     hepsi listelenir
   - Yoksa bu bölüm gizlenir

7. Bilet satın alma linki:
   - event.url alanı kullanılır
   - "Bilet Satın Al" butonu, tıklanınca YENİ SEKMEDE Ticketmaster'ın
     kendi sayfası açılır (target="_blank")

8. pleaseNote (varsa):
   - Küçük bir uyarı kutusu içinde gösterilir (örn. "18 yaş sınırı var" gibi
     notlar burada gelir)

E) Mekan bilgisi bölümü

event._embedded.venues dizisinden bilgi çekilir (genelde 1 mekan olur
ama teorik olarak birden fazla olabilir, hepsi gösterilir):

- Mekan adı (başlık gibi, biraz daha küçük font)
- Adres: address.line1 + varsa line2
- Şehir, eyalet/bölge, ülke: city.name, state.name, country.name birleştirilir
  (örn. "İstanbul, Türkiye")
- Mekan görseli (venue.images varsa) — küçük bir thumbnail
- Koordinat varsa (location.latitude, location.longitude):
  - Basit yaklaşım: "Haritada Gör" linki, Google Maps'e
    şu formatta yönlendirir: google.com/maps?q={latitude},{longitude}
  - Gelişmiş yaklaşım (opsiyonel, zorunlu değil): gömülü harita iframe'i
  - Bu proje kapsamında basit link yeterli, harita gömme opsiyonel

_embedded.venues hiç yoksa: "Mekan bilgisi mevcut değil" şeklinde
kısa bir not, bölüm tamamen boş bırakılmaz ama abartılı bir hata da
gösterilmez.

F) Sanatçı/katılımcı bilgisi bölümü

event._embedded.attractions dizisinden bilgi çekilir:

- Dizi BOŞSA veya hiç yoksa: bu bölüm SAYFADA HİÇ GÖRÜNMEZ
  (başlık dahil tamamen gizlenir — "Sanatçılar" diye bir başlık koyup
  altını boş bırakmak kötü UX)

- Dizi doluysa:
  - "Sanatçılar" veya "Katılımcılar" başlığı
  - Her attraction için bir kart/satır:
    - Görsel (attraction.images varsa, yoksa placeholder)
    - İsim (attraction.name)
    - Kategori (attraction.classifications varsa, örn. "Rock")
  - Birden fazla sanatçı varsa: yan yana grid veya liste halinde
  - Attraction'a tıklanınca şimdilik bir işlev gerekmiyor (opsiyonel:
    attraction.url varsa Ticketmaster'ın sanatçı sayfasına link verilebilir)

G) Favori butonu

- Sayfanın üst kısmında (görsel veya başlık yanında) kalp ikonlu buton
- Bu buton Gün 4'te kurulacak favorites store'a bağlanacak
  (bu branch'te buton yerinde durabilir ama işlevi Gün 4'te tam çalışacak,
  ya da bu branch'i Gün 4'ten sonra tamamlarsın — sıralama sana kalmış,
  ikisi de kabul edilir)
- ÖNEMLİ: Bu buton hem liste sayfasındaki EventCard'da hem burada AYNI
  store'u kullanacağı için, biri favoriye eklenince diğeri de anında
  güncellenecek (Pinia'nın reaktivitesi sayesinde otomatik olur, ekstra
  bir şey yapmana gerek yok — store'dan doğru şekilde okuduğun sürece)

Bu branch'ı teslim etmeden kontrol listesi:

/events/[gerçek-bir-id] açılınca etkinlik detayları görünüyor
/events/gecersiz-id-12345 açılınca "bulunamadı" mesajı görünüyor (genel hatadan farklı görünümde)
Network'ü kapatıp sayfayı yenileyince genel hata + "tekrar dene" görünüyor
Görsel galerisi birden fazla görseli gösteriyor (varsa)
Sanatçı bilgisi olmayan bir etkinlikte o bölüm hiç görünmüyor
Mekan bilgisi doğru gösteriliyor
Bilet linki yeni sekmede açılıyor
Loading sırasında detaylı skeleton görünüyor (basit spinner değil)
Mobilde bölümler alt alta düzgün sıralanıyor
