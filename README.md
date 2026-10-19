# Temiz Seri

Kilo kontrolü için bırakılan 4 alışkanlığı her gün işaretleyip "temiz seri"yi takip eden mobil öncelikli uygulama.

- **backend/**: Java 21 + Spring Boot 3.5 REST API (Spring Data JPA, dosya tabanlı H2)
- **frontend/**: React 19 + TypeScript + Tailwind CSS 4 (Vite)

## Çalıştırma

Gereksinimler: Java 21, Maven 3.9+, Node 20+.

```bash
# 1. API (http://localhost:8080)
cd backend
mvn spring-boot:run

# 2. Arayüz (http://localhost:5173), ayrı bir terminalde
cd frontend
npm install
npm run dev
```

Vite, `/api` isteklerini 8080'deki Spring Boot'a yönlendirir. Telefondan denemek için aynı ağdayken
`npm run dev` çıktısındaki "Network" adresini aç.

Testler: `cd backend && mvn test`

## API

| Metot | Yol | Açıklama |
|---|---|---|
| GET | `/api/summary?today=YYYY-MM-DD` | Bugünün alışkanlıkları, seri ve son 7 gün |
| PUT | `/api/days/{tarih}/habits/{id}?today=YYYY-MM-DD` | Gövde `{"done": true}` ile işaretler, `false` ile kaldırır. Güncel özeti döner |

`today` parametresi kullanıcının cihazındaki tarihtir; gönderilmezse `app.zone` (Europe/Istanbul) kullanılır.
Gelecek tarihler reddedilir. Geçmiş günler API'de zaten düzenlenebilir; arayüze eklemek sonraki adım.

## Seri kuralı

Dünden geriye doğru, 4 alışkanlığın hepsi yapılmış kesintisiz günler sayılır. Bugün de 4/4 ise seriye eklenir;
bugün eksikse gün henüz bitmediği için seri bozulmaz.

## Veri

- `habit`: 4 alışkanlık, ilk açılışta `HabitSeeder` ekler.
- `habit_check`: (gün, alışkanlık) başına bir satır. Satır varsa o gün yapılmıştır.

Veriler `backend/data/` altındaki H2 dosyasında kalıcıdır. PostgreSQL'e geçmek için `application.yml`'deki
datasource ayarlarını ve `pom.xml`'deki sürücüyü değiştirmek yeterli.

## İleride

- Geçmiş günleri düzenleme ekranı
- Kilo takibi
- Bildirim / hatırlatma
- Kullanıcı hesabı (şu an tek kullanıcılı)
