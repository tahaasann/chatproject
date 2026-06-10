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


```