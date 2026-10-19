# Temiz Seri · Mobil

Expo SDK 57 (React Native + TypeScript) uygulaması. SDK, App Store/Play Store'daki Expo Go'nun desteklediği sürümde tutulmalı; Expo Go yeni SDK'ya geçmeden yükseltme. Veriler `../backend` içindeki Spring Boot API'sinde tutulur.

## Ekranlar

- **Bugün:** 4 alışkanlığı işaretleme, seri, günlük ilerleme halkası, son 7 gün, son kilo
- **Takvim:** aylık görünüm, mevcut/en uzun seri, toplam temiz gün, aylık oran. Bir güne dokununca o gün düzenlenir.
- **Kilo:** kilo girişi (geçmiş günler dahil), grafik ve hedef çizgisi, hedefe kalan, VKİ, geçmiş listesi
- **Ayarlar:** günlük hatırlatma bildirimi, hedef kilo ve boy, sunucu adresi

## Çalıştırma (Windows PowerShell)

Telefonuna **Expo Go** uygulamasını kur. Telefon ve bilgisayar aynı Wi-Fi ağında olmalı.

1. Backend'i başlat (bir terminalde):

   ```powershell
   cd backend
   mvn spring-boot:run
   ```

2. Mobil uygulamayı başlat (ikinci bir terminalde):

   ```powershell
   cd mobile
   npm install
   npx expo start
   ```

3. Terminalde çıkan QR kodu Expo Go ile (iPhone'da Kamera ile) okut.

Uygulama, Expo'nun çalıştığı bilgisayarın IP adresini bulup `http://<IP>:8080` adresine bağlanır.
Bağlanamazsa:

- Windows Güvenlik Duvarı Java için izin sorduysa **Özel ağlar**a izin ver.
- Ayarlar sekmesinden sunucu adresini elle gir (`ipconfig` çıktısındaki IPv4 adresi, ör. `http://192.168.1.34:8080`).

Tarayıcıda denemek için: `npx expo start --web`

## Kontroller

```powershell
npx tsc --noEmit
npx expo lint
```

## Notlar

- Hatırlatma, telefonda yerel bildirim olarak kurulur; internet veya sunucu gerektirmez.
- Uygulama ikonları şimdilik Expo'nun varsayılanları. Mağazaya çıkmadan önce değiştirilmeli.
- Mağaza için derleme: `npx eas-cli@latest build` (Expo hesabı gerekir).
