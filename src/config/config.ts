export interface Config {
  openrouterApiKey: string;
  defaultModel: string;
  ollamaApiUrl: string;
}

const config: Config = {
  openrouterApiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  defaultModel: 'deepseek/deepseek-chat:free',
  ollamaApiUrl: import.meta.env.VITE_OLLAMA_API_URL || 'http://192.168.227.25:11434/api'
};

export default config; 