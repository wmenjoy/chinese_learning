/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENROUTER_API_KEY: string
  readonly VITE_OLLAMA_API_URL: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 