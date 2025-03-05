export interface Config {
  openrouterApiKey: string;
  defaultModel: string;
}

const config: Config = {
  openrouterApiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  defaultModel: 'deepseek/deepseek-chat:free'
};

export default config; 