# DREAMAI - Chatbot
## Multi-provider AI Chatbot
Çoklu modellere erişim sağlayabileceğiniz, hafıza açısından avantajlı, sürdürülebilir AI chat. BYOK (kendi api'ını gir), premium hesap, kullandıkça harca modelleri içeren kullanım planlarına sahip

## API smoke test (local)

### Prerequisites

```bash
cd dreamai
pnpm install
pnpm --filter @dreamai/api dev
```

### Health check

```bash
curl.exe http://localhost:3001/healthz
```

Expected:

```json
{"status":"ok",...}
```

### Send a message

```cmd
curl.exe -X POST http://localhost:3001/v1/chat/messages ^
  -H "Content-Type: application/json" ^
  -d "{\"content\":\"hello tracer\"}"
```

Expected:

- HTTP 201 response
- `conversationId`
- `userMessageId`
- `assistantMessageId`

Copy the `assistantMessageId` from the response.

### Stream the assistant reply (SSE)

```cmd
curl.exe -N http://localhost:3001/v1/chat/stream/<assistantMessageId> ^
  -H "Accept: text/event-stream"
```

Expected:

- `meta`
- `token` (one or more chunks)
- `done`

The echoed assistant text should include:

```text
hello tracer
```

### PowerShell version

```powershell
$response = curl.exe -X POST "http://localhost:3001/v1/chat/messages" `
  -H "Content-Type: application/json" `
  -d '{"content":"hello tracer"}'

$response

# Copy assistantMessageId from the response and replace below:
curl.exe -N "http://localhost:3001/v1/chat/stream/<assistantMessageId>" `
  -H "Accept: text/event-stream"
```

### Authentication

Authentication is not enabled yet. Tracer currently uses a development fallback user.

JWT protection will be introduced in Phase 9 (T-091+).

---




## Docker (full stack)

Makinede yerel Node.js veya pnpm kurulu olmadan tüm Tracer stack'ini çalıştırın.

### Stack'i başlatma

```bash
cd dreamai
docker compose up --build
```

### Servisler

| Servis    | URL                                            |
| --------- | ---------------------------------------------- |
| Marketing | http://localhost:3000                          |
| Chat app  | http://localhost:5173                          |
| API       | http://localhost:3001/healthz                  |
| Postgres  | localhost:5432 (Faz 8+)                        |
| Redis     | localhost:6379 (ileride arka plan işleri için) |

### Tek bir Docker imajı oluşturma

```bash
docker build -f services/api/Dockerfile -t dreamai-api .
docker build -f apps/app/Dockerfile -t dreamai-app .
docker build -f apps/marketing/Dockerfile -t dreamai-marketing .
```

### Ortam değişkeni dosyaları

| Dosya          | Commit edilmeli mi? | Amaç                             |
| -------------- | ------------------- | -------------------------------- |
| `.env.example` | Evet                | Dokümante edilmiş şablon         |
| `.env.local`   | Hayır               | Yerel gizli bilgiler (gitignore) |
| `.env`         | Hayır               | Gizli bilgiler (gitignore)       |

Marketing uygulaması için:

```text
apps/marketing/.env.example
```

dosyasını

```text
apps/marketing/.env.local
```

olarak kopyalayın ve gerekiyorsa `NEXT_PUBLIC_APP_URL` değerini değiştirin.

---

