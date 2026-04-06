# OpenClaude Chat

AI chatbot web app built with **React 19**, **Tailwind CSS v4**, and **shadcn/ui** components. Connects to any OpenAI-compatible API (default: OpenRouter).

## Features

- Chat UI with dark/light mode
- Auto-retry on rate limit (15s delay, up to 3 attempts)
- Responsive layout — sidebar on desktop, compact header on mobile
- Powered by OpenRouter free models

## Tech Stack

| Layer       | Stack                                      |
| ----------- | ------------------------------------------ |
| Framework   | React 19 + Vite 8                          |
| Language    | TypeScript                                 |
| Styling     | Tailwind CSS v4 + shadcn/ui                |
| Icons       | Lucide React                               |
| API         | OpenRouter (OpenAI-compatible)             |

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo-url>
cd openclaude-website
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
VITE_OPENAI_BASE_URL=https://openrouter.ai/api/v1
VITE_OPENAI_API_KEY=your-openrouter-api-key
VITE_OPENAI_MODEL=qwen/qwen3.6-plus:free
```

| Variable               | Description                                   |
| ---------------------- | --------------------------------------------- |
| `VITE_OPENAI_BASE_URL` | API base URL (default: OpenRouter)            |
| `VITE_OPENAI_API_KEY`  | Your API key                                  |
| `VITE_OPENAI_MODEL`    | Model ID — see [OpenRouter models](https://openrouter.ai/models) |

### 3. Run

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Build for Production

```bash
npm run build
npm run preview
```

## Using a Different API Provider

You can point the app at any OpenAI-compatible API by changing `VITE_OPENAI_BASE_URL`. Examples:

```env
# OpenAI
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
VITE_OPENAI_MODEL=gpt-4o-mini

# Ollama (local)
VITE_OPENAI_BASE_URL=http://localhost:11434/v1
VITE_OPENAI_MODEL=llama3
```

## Notes

- The API key is embedded in the client bundle. For production use, proxy requests through a backend server.
- Free models on OpenRouter have daily rate limits. The app auto-retries on 429 errors (15s delay, max 3 attempts).
