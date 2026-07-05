# ✨ Gemmy AI Web

**Gemini & Imagen API scraper** — Chat AI dengan streaming + Generate Image, lengkap dengan auto token rotation bypass.

```
Base URL : https://play.google.com/store/apps/details?id=com.jetkite.gemmy
Author   : Fmc
```

## 🚀 Fitur

| Fitur | Deskripsi |
|-------|-----------|
| 💬 **Chat Streaming** | Real-time chat dengan Gemini AI via SSE |
| 🎨 **Generate Image** | Generate gambar via Imagen AI (Imagen 4.0) |
| 📎 **Upload Media** | Support gambar (jpg/png/webp) & dokumen |
| 🔄 **Auto Token Rotation** | Ganti token tiap 5 request biar anti limit |
| 🛡️ **Rate Limit Bypass** | Auto signup akun baru kena 429/quota |
| 📋 **Model Selector** | Pilih dari 5 model Gemini |
| 🔑 **Live Token Status** | Indicator token aktif di UI |

## 🤖 Available Models

- `gemini-2.5-flash-lite`
- `gemini-2.5-flash`
- `gemini-2.5-pro`
- `gemini-3.1-flash-lite`
- `gemini-3.1-pro-preview`

## 🛠️ Tech Stack

- **Backend:** Node.js + Express
- **Scraper:** Axios (Firebase Vertex AI API)
- **Frontend:** Vanilla HTML/CSS/JS (dark theme)
- **Auth:** Firebase Identity Toolkit (auto signup)

## 📦 Installation

```bash
git clone https://github.com/ajokowi/gemmy.git
cd gemmy
npm install
PORT=3000 node server.js
```

Buka **http://localhost:3000** di browser.

## 📁 Project Structure

```
gemmy/
├── gemmy.js           # Scraper module (chat, stream, image gen, bypass)
├── server.js          # Express backend API
├── package.json
├── .gitignore
└── public/
    └── index.html     # Frontend UI
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/models` | List available models |
| GET | `/api/token-status` | Current token status |
| POST | `/api/rotate-token` | Force rotate Firebase token |
| POST | `/api/chat` | Send chat message (non-streaming) |
| GET | `/api/chat/stream` | SSE streaming chat |
| POST | `/api/generate-image` | Generate AI image via Imagen |
| POST | `/api/chat-with-image` | Chat with image/document upload |

## 🔄 Auto Bypass System

```
Request ke-5 → auto signup token baru
Kena 429     → langsung signup baru + retry
Kena 401/403 → signup baru + retry (Imagen fix)
```

## 🐛 Known Issues & Fixes

- ✅ **Imagen Auth Error (fixed):** Firebase `idToken` dari signupNewUser adalah JWT Firebase Auth, bukan Google Cloud OAuth2. `generateImage()` sekarang pake request sendiri **tanpa** Authorization header — cukup API key (`x-goog-api-key`).

---

*Dibuat oleh Fmc — Gemmy AI Web*
