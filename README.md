# Falvia Admin Panel

Modern ve kullanıcı dostu falcılık platformu yönetim paneli.

## 🚀 Ücretsiz Deployment Seçenekleri

### 1. Vercel (Önerilen)
```bash
# Vercel CLI kurulumu
npm i -g vercel

# Proje dizininde
vercel login
vercel --prod
```

### 2. Netlify
```bash
# Netlify CLI kurulumu
npm i -g netlify-cli

# Build ve deploy
npm run build
netlify deploy --prod --dir=build
```

### 3. GitHub Pages
```bash
# package.json'a ekle
"homepage": "https://kullaniciadi.github.io/repo-adi",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# Deploy
npm run deploy
```

### 4. Firebase Hosting
```bash
# Firebase CLI kurulumu
npm i -g firebase-tools

# Firebase projesi oluştur ve deploy
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 📋 Kurulum

```bash
npm install
npm start
```

## 🔧 Gereksinimler

- Node.js 14+
- Supabase hesabı (ücretsiz tier)
- Modern web tarayıcısı

## 🎨 Özellikler

- **Kullanıcı Yönetimi**: Kullanıcı listesi, düzenleme, istatistikler
- **Falcı Yönetimi**: Falcı ekleme, düzenleme, profil fotoğrafı
- **Hikaye Yönetimi**: 
  - Falcı hikayeleri oluşturma ve düzenleme
  - Resim ve video yükleme (50MB'a kadar)
  - 24 saat geçerlilik süresi
  - Görüntülenme istatistikleri
  - Tamamlanma oranları
  - Detaylı analitik raporlar
- **Fal Yönetimi**: Fal durumları, detay görüntüleme
- **Modern UI**: Responsive tasarım, koyu tema
- **Güvenlik**: Supabase authentication

## 🌐 Environment Variables

`.env` dosyası oluşturun:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 Kullanım

1. Supabase'de ücretsiz hesap oluşturun
2. Database schema'yı import edin
3. Environment variables'ları ayarlayın
4. Deploy edin

## 💰 Maliyet

- **Hosting**: Ücretsiz (Vercel/Netlify)
- **Database**: Ücretsiz (Supabase Free Tier)
- **Storage**: Ücretsiz (Supabase 1GB)
- **Domain**: Ücretsiz (Vercel/Netlify subdomain)

## 🔒 Güvenlik

- Supabase Row Level Security
- JWT token authentication
- Environment variables ile API key koruması

## 📞 Destek

Herhangi bir sorun için GitHub Issues kullanabilirsiniz.
