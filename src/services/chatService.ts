import { OpenRouterModel, streamOpenRouterChat } from './openRouterService';
import config from '../config/config';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'thinking';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  model: string;
}

export interface StreamCallbacks {
  onContent: (content: string) => void;
  onThinking?: (thinking: string) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
}

const THINKING_PROMPT = `你现在是一个专业的中文教学助手，在回答问题时，请按照以下步骤思考：

1. 理解问题：
   - 分析用户的具体需求
   - 确定问题的关键点

2. 知识梳理：
   - 列出相关的知识点
   - 确定知识点之间的关联

3. 答案组织：
   - 按照逻辑顺序组织内容
   - 使用例子来解释复杂概念
   - 提供实践建议

请用这种结构化的方式回答下面的问题：

{question}`;

export const sendChatMessage = async (
  message: string,
  model: string,
  context?: string,
  useThinkingMode: boolean = false,
  callbacks?: StreamCallbacks
): Promise<string> => {
  try {
    // Check if it's an OpenRouter model
    if (model.includes('-free')) {
      return new Promise((resolve, reject) => {
        let finalResponse = '';
        
        streamOpenRouterChat(
          message,
          model as OpenRouterModel,
          context,
          useThinkingMode,
          {
            onContent: (content) => {
              finalResponse += content;
              callbacks?.onContent(content);
            },
            onThinking: (thinking) => {
              if (thinking) {
                callbacks?.onThinking?.(thinking);
              }
            },
            onComplete: () => {
              callbacks?.onComplete();
              resolve(finalResponse);
            },
            onError: (error) => {
              console.error('OpenRouter stream error:', error);
              callbacks?.onError(error);
              reject(error);
            }
          }
        );
      });
    }
    
    // Check if Ollama API is available
    try {
      const healthCheck = await fetch(`${config.ollamaApiUrl}/version`);
      if (!healthCheck.ok) {
        throw new Error('Ollama API is not available');
      }
    } catch (error) {
      console.error('Ollama API health check failed:', error);
      throw new Error('Ollama API is not accessible. Please make sure the Ollama server is running and accessible at ' + config.ollamaApiUrl);
    }

    let prompt;
    if (useThinkingMode) {
      prompt = context 
        ? `Previous context:\n${context}\n\n${THINKING_PROMPT.replace('{question}', message)}`
        : THINKING_PROMPT.replace('{question}', message);
    } else {
      prompt = context 
        ? `Previous context:\n${context}\n\nUser: ${message}`
        : message;
    }

    const response = await fetch(`${config.ollamaApiUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: true
      }),
    });

    if (!response.ok) {
      console.error('Ollama API error:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`Ollama API error: ${response.statusText}. Please make sure the model "${model}" is installed.`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      console.error('Ollama response body is not readable');
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let accumulatedContent = '';
    let isThinking = false;
    let thinkingContent = '';
    let chunkCount = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
    
          break;
        }

        chunkCount++;
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        while (true) {
          const lineEnd = buffer.indexOf('\n');
          if (lineEnd === -1) break;

          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);

          if (line) {
            try {
              const parsed = JSON.parse(line);
              const content = parsed.response;
              
              if (content) {
                accumulatedContent += content;

                if (useThinkingMode) {
                  if (content.includes('```thinking')) {
                    isThinking = true;
                    thinkingContent = '';
                  } else if (content.includes('```')) {
                    isThinking = false;
                    callbacks?.onThinking?.(thinkingContent);
                  } else if (isThinking) {
                    thinkingContent += content;
                    callbacks?.onThinking?.(thinkingContent);
                  } else {
                    callbacks?.onContent(content);
                  }
                } else {
                  callbacks?.onContent(content);
                }
              }

              if (parsed.done) {
                callbacks?.onComplete();
                return accumulatedContent;
              }
            } catch (e) {
              console.error('Error parsing Ollama JSON:', {
                error: e,
                line
              });
            }
          }
        }
      }
    } catch (streamError) {
      console.error('Error in Ollama stream processing:', {
        error: streamError,
        chunkCount,
        bufferSize: buffer.length
      });
      throw streamError;
    } finally {
      reader.cancel();
      callbacks?.onComplete();
    }

    return accumulatedContent;
  } catch (error) {
    console.error('Fatal error in chat:', {
      error,
      model,
      messageLength: message.length
    });
    callbacks?.onError(error instanceof Error ? error : new Error('Unknown error'));
    throw error;
  }
}; 