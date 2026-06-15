# DreamAI

Çoklu AI sağlayıcılarına tek arayüzden erişim hedefleyen chat platformu. Bu repo; marketing sitesi, chat uygulaması ve Fastify API'den oluşan bir monorepo iskeleti içerir.

## MVP Durumu (`mvp-scaffold-v1`)

**Tracer Bullet #1** tamamlandı.

Bu sürümde çalışan özellikler:

* Echo chat (gerçek AI modeli yok, API kullanıcı mesajını geri yansıtır)
* Supabase Auth (e-posta + şifre ile kayıt ve giriş)
* Postgres kalıcılığı (`conversations` ve `messages` tabloları)
* RLS ile kullanıcı izolasyonu
* Next.js marketing sitesi
* Vite + React chat uygulaması
* SSE streaming desteği

Sonraki fazlarda OpenAI ve diğer sağlayıcılar eklenecektir.

## Monorepo Yapısı

| Workspace            | Paket                | Açıklama                   |
| -------------------- | -------------------- | -------------------------- |
| `apps/marketing`     | `@dreamai/marketing` | Landing page, SEO          |
| `apps/app`           | `@dreamai/app`       | Chat UI ve Auth            |
| `services/api`       | `@dreamai/api`       | Fastify API, Echo Provider |
| `packages/contracts` | `@dreamai/contracts` | Ortak Zod şemaları         |

## Gereksinimler

* Node.js 24.16+
* pnpm 11.3+
* Docker Desktop
* Supabase CLI

## Hızlı Kurulum (Yerel Geliştirme)

### 1. Bağımlılıkları yükle

```powershell
cd c:\Users\tahaa\Desktop\DreamAI\dreamai
pnpm install
```

### 2. Supabase Local'i Başlat

```powershell
pnpm exec supabase start
pnpm exec supabase status
```

`supabase status` çıktısından aşağıdaki bilgileri not alın:

* API URL
* Publishable / Anon Key

Örnek:

```text
http://127.0.0.1:54321
sb_publishable_xxxxxxxxx
```

### 3. Ortam Dosyalarını Oluştur

`.env` dosyalarını asla commit etmeyin.

#### API

```powershell
Copy-Item services\api\.env.example services\api\.env
```

`services/api/.env`

```env
NODE_ENV=development
HOST=0.0.0.0
PORT=3001
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=<SUPABASE_ANON_KEY>
```

#### Chat App

```powershell
Copy-Item apps\app\.env.example apps\app\.env
```

`apps/app/.env`

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<SUPABASE_ANON_KEY>
```

#### Marketing (İsteğe Bağlı)

```powershell
Copy-Item apps\marketing\.env.example apps\marketing\.env.local
```

Varsayılan olarak:

```env
NEXT_PUBLIC_APP_URL=http://localhost:5173
```

genellikle yeterlidir.

> Not: `SUPABASE_URL` ve `VITE_SUPABASE_URL` için `127.0.0.1` kullanın.

### 4. Geliştirme Sunucularını Başlat

```powershell
pnpm dev
```

Turbo aşağıdaki servisleri paralel çalıştırır:

* Marketing → :3000
* App → :5173
* API → :3001

Ortam değişkenlerini değiştirdikten sonra ilgili servisi yeniden başlatın.

## URL'ler (Local)

| Servis          | URL                           |
| --------------- | ----------------------------- |
| Marketing       | http://localhost:3000         |
| Chat App        | http://localhost:5173         |
| API Health      | http://localhost:3001/healthz |
| Supabase Studio | http://127.0.0.1:54323        |
| Supabase API    | http://127.0.0.1:54321        |

## İlk Kullanım

1. http://localhost:5173 adresine gidin.
2. Sign Up ile hesap oluşturun.
3. Chat ekranında mesaj gönderin.
4. Echo cevabının geldiğini doğrulayın.

Veritabanını kontrol etmek için:

```powershell
pnpm exec supabase db shell -- -c "SELECT role, left(content, 50) AS content FROM public.messages ORDER BY created_at DESC LIMIT 5;"
```

## API Smoke Test (PowerShell)

JWT gereklidir.

### Health Check

```powershell
curl.exe -s "http://localhost:3001/healthz"
```

Beklenen çıktı:

```json
{"status":"ok"}
```

### Access Token Al

```powershell
$anonKey = "BURAYA_ANON_KEY"

$authBody = '{"email":"test@example.com","password":"test1234"}'

$auth = curl.exe -s -X POST "http://127.0.0.1:54321/auth/v1/token?grant_type=password" `
  -H "apikey: $anonKey" `
  -H "Content-Type: application/json" `
  -d $authBody | ConvertFrom-Json

$token = $auth.access_token

$token
```

### Mesaj Gönder

```powershell
curl.exe -s -X POST "http://localhost:3001/v1/chat/messages" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d "{\"content\":\"hello tracer\"}"
```

Beklenen:

* HTTP 201
* conversationId
* userMessageId
* assistantMessageId

### SSE Stream

```powershell
curl.exe -N "http://localhost:3001/v1/chat/stream/BURAYA_ASSISTANT_MESSAGE_ID" `
  -H "Accept: text/event-stream" `
  -H "Authorization: Bearer $token"
```

Beklenen sıra:

```text
meta
token
token
...
done
```

## Dev Fallback Modu

Supabase ortam değişkenleri olmadan API geliştirme kullanıcısıyla çalışabilir.

API'yi çalıştır:

```powershell
pnpm --filter @dreamai/api dev
```

Token olmadan mesaj gönder:

```powershell
curl.exe -s -X POST "http://localhost:3001/v1/chat/messages" `
  -H "Content-Type: application/json" `
  -d "{\"content\":\"fallback\"}"
```

Bu modda veriler bellekte tutulur, Postgres'e yazılmaz.

## Kalite Kontrolleri

Tüm kontroller:

```powershell
pnpm ci
```

Ayrı ayrı:

```powershell
pnpm typecheck
pnpm test
```

## Docker (Tam Stack)

### Çalıştırma

```bash
docker compose up --build
```

### Servisler

| Servis    | URL                           |
| --------- | ----------------------------- |
| Marketing | http://localhost:3000         |
| Chat App  | http://localhost:5173         |
| API       | http://localhost:3001/healthz |
| Postgres  | localhost:5432                |
| Redis     | localhost:6379                |

> Uyarı: Docker Compose şu an Supabase Auth içermez.

### Tek İmaj Derleme

```bash
docker build -f services/api/Dockerfile -t dreamai-api .
docker build -f apps/app/Dockerfile -t dreamai-app .
docker build -f apps/marketing/Dockerfile -t dreamai-marketing .
```

## Ortam Dosyaları Özeti

| Dosya                       | Commit? | Amaç                     |
| --------------------------- | ------- | ------------------------ |
| services/api/.env.example   | Evet    | API şablonu              |
| services/api/.env           | Hayır   | API secret'ları          |
| apps/app/.env.example       | Evet    | Vite şablonu             |
| apps/app/.env               | Hayır   | Supabase client ayarları |
| apps/marketing/.env.example | Evet    | Marketing şablonu        |
| apps/marketing/.env.local   | Hayır   | Yerel marketing ayarları |
| .env.example                | Evet    | Genel dokümantasyon      |

> Provider API anahtarları yalnızca `services/api/.env` içinde tutulmalıdır.

## Sık Karşılaşılan Sorunlar

| Belirti                  | Olası Sebep       | Çözüm                    |
| ------------------------ | ----------------- | ------------------------ |
| POST 401                 | Token eksik       | Bearer token gönder      |
| App açılmıyor            | .env eksik        | .env.example'dan kopyala |
| DB boş                   | Fallback modu     | Supabase env ayarla      |
| Env değişti ama etki yok | Restart yapılmadı | Servisi yeniden başlat   |

## Lisans ve Katkı

Private proje.

Detaylı mimari ve agent kuralları için:

* `AGENTS.md`
* `docs/`
