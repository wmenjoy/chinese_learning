export type OllamaModel = 'deepseek-r1:70b' | 'llama3:latest' | 'deepseek-r1:7b';
export type OpenRouterModel = 
  | 'deepseek-chat-free'
  | 'deepseek-r1-free'
  | 'gemini-2-flash-lite-free';

export type SupportedModel = OllamaModel | OpenRouterModel;

export interface StreamCallbacks {
  onContent: (content: string) => void;
  onThinking?: (thinking: string) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
} 