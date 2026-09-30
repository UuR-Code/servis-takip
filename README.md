# ServisPlan - Minimalist Mobil Servis & Vardiya Takip Sistemi

WhatsApp servis grubundaki karmaşık mesajları ortadan kaldıran; şoförün ve personellerin tek ekranda kimin hangi saatte alınacağını ve kimin eve bırakılacağını gördüğü ultra minimal, mobil uyumlu servis takip uygulaması.

---

## 🌟 Temel Özellikler

1. **Tek Ekranda Toplama ve Dağıtım:**
   - 🟢 **Toplama (Evden Alma / İşe Geliş):** Personel adı ve yanındaki saat rozeti (Örn: `Uğur • 06:00`).
   - 🟡 **Dağıtım (İşten Eve Bırakma):** Bırakılacak personeller listesi.
2. **Otomatik 1 Saat Kuralı (Akıllı Vardiya Filtresi):**
   - Vardiya saatinden 1 saat geçtikten sonra önceki vardiya otomatik gizlenir ve sıradaki vardiya aktif olur:
     - 00:00 - 08:00 arası -> **07:00 Vardiyası**
     - 08:01 - 16:00 arası -> **15:00 Vardiyası**
     - 16:01 - 23:59 arası -> **23:00 Vardiyası**
   - İstenirse üstteki sekmelerden diğer vardiyalara veya yarına manuel olarak bakılabilir.
3. **Toplama İçin Kolay Saat Seçimi:**
   - Personel ismine dokunulduğunda o vardiyaya uygun saat butonları açılır (Örn: 05:45, 06:00, 06:15, 06:30, 06:45 veya serbest saat girişi).
   - Saat seçildiği an listeye eklenir.
4. **Dağıtım İçin Tek Dokunuşla Ekleme:**
   - İsme dokunulduğu an doğrudan Dağıtım listesine eklenir.
5. **Önceden Tanımlı Personel Havuzu:**
   - "Personeller" butonundan yeni çalışma arkadaşları eklenebilir veya silinebilir.
6. **WhatsApp Formatında Kopyalama:**
   - "WhatsApp Listesi Kopyala" butonuyla o günün listesi emojili ve düzenli bir metin olarak panoya kopyalanır.
7. **Merkezi Veritabanı & Canlı Senkronizasyon:**
   - SQLite ve JSON veritabanı ile veriler kalıcı saklanır.
   - Herkes telefonundan bağlandığında liste arka planda otomatik güncellenir.

---

## 🚀 Çalıştırma Talimatları

### 1. Yerel Olarak Başlatma
Terminal veya PowerShell'de:
```bash
npm start
```
Sunucu `http://localhost:3000` adresinde çalışmaya başlar.

### 2. Aynı Wi-Fi / Ağdaki Telefonlardan Bağlanma
1. Bilgisayarınızın yerel IP adresini öğrenin (PowerShell'de `ipconfig` yazın, örn: `192.168.1.45`).
2. Şoför ve çalışma arkadaşlarınız telefonlarının tarayıcısından şu adresi açabilir:
   ```
   http://192.168.1.45:3000
   ```

### 3. İnternet Üzerinden (Her Yerden) Ücretsiz Kullanma
Mobil veriyle dışarıdan bağlanmak için:
- **Seçenek A (Cloudflare Tunnel - 1 Dakika):**
  `npx untun tunnel http://localhost:3000` veya Cloudflare Tunnel çalıştırarak anında ücretsiz bir `https://...trycloudflare.com` bağlantısı alabilirsiniz.
- **Seçenek B (Render.com / Railway / Glitch):**
  Bu klasörü GitHub'a atıp Render veya Railway'e bağlayarak 7/24 ücretsiz bir web adresine (`https://servis-takip.onrender.com`) dönüştürebilirsiniz.
