# Temiz Seri

Kilo kontrolü için bırakılan 4 alışkanlığı her gün işaretleyip "temiz seri"yi takip eden mobil öncelikli uygulama.

- **mobile/**: Expo (React Native + TypeScript) mobil uygulama. Kurulum: [mobile/README.md](mobile/README.md)
- **backend/**: Java 21 + Spring Boot 3.5 REST API (Spring Data JPA, dosya tabanlı H2)
- **frontend/**: React 19 + TypeScript + Tailwind CSS 4 (Vite) web arayüzü

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
| GET | `/api/days?from=&to=` | Takvim için gün gün işaret sayıları (en fazla 400 gün) |
| GET | `/api/days/{tarih}` | Tek bir günün alışkanlıkları |
| GET | `/api/stats?today=` | Mevcut ve en uzun seri, toplam temiz gün, bu ayın oranı |
| GET | `/api/weights` | Kilo kayıtları (isteğe bağlı `from`, `to`) |
| PUT | `/api/weights/{tarih}` | Gövde `{"kg": 92.4}`. Aynı gün tekrar girilirse güncellenir |
| DELETE | `/api/weights/{tarih}` | Kaydı siler |
| GET/PUT | `/api/profile` | Hedef kilo ve boy `{"goalKg": 80, "heightCm": 178}` |

`today` parametresi kullanıcının cihazındaki tarihtir; gönderilmezse `app.zone` (Europe/Istanbul) kullanılır.
Gelecek tarihler reddedilir.

## Seri kuralı

Dünden geriye doğru, 4 alışkanlığın hepsi yapılmış kesintisiz günler sayılır. Bugün de 4/4 ise seriye eklenir;
bugün eksikse gün henüz bitmediği için seri bozulmaz.

## Veri

- `habit`: 4 alışkanlık, ilk açılışta `HabitSeeder` ekler.
- `habit_check`: (gün, alışkanlık) başına bir satır. Satır varsa o gün yapılmıştır.
- `weight_entry`: günde bir kilo kaydı.
- `profile`: hedef kilo ve boy (tek satır).

Veriler `backend/data/` altındaki H2 dosyasında kalıcıdır. PostgreSQL'e geçmek için `application.yml`'deki
datasource ayarlarını ve `pom.xml`'deki sürücüyü değiştirmek yeterli.

## İleride

- Kullanıcı hesabı ve giriş (şu an tek kullanıcılı)
- Sunucuyu buluta taşıma (PostgreSQL), böylece telefon bilgisayara bağlı kalmaz
- Çevrimdışı kullanım ve senkronizasyon
