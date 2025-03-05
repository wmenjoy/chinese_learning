import { OpenRouterModel, streamOpenRouterChat } from './openRouterService';

const OLLAMA_API_URL = 'http://192.168.50.41:11434/api';

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
    console.log('sendChatMessage called:', {
      model,
      messageLength: message.length,
      contextLength: context?.length || 0,
      useThinkingMode
    });
    
    // Check if it's an OpenRouter model
    if (model.includes('-free')) {
      console.log('Using OpenRouter model:', model);
      return new Promise((resolve, reject) => {
        let finalResponse = '';
        
        streamOpenRouterChat(
          message,
          model as OpenRouterModel,
          context,
          useThinkingMode,
          {
            onContent: (content) => {
              console.log('OpenRouter content received:', {
                contentLength: content.length,
                totalLength: finalResponse.length
              });
              finalResponse += content;
              callbacks?.onContent(content);
            },
            onThinking: (thinking) => {
              if (thinking) {
                console.log('OpenRouter thinking received:', {
                  thinkingLength: thinking.length
                });
                callbacks?.onThinking?.(thinking);
              }
            },
            onComplete: () => {
              console.log('OpenRouter stream completed:', {
                finalResponseLength: finalResponse.length
              });
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
      console.log('Checking Ollama API availability...');
      const healthCheck = await fetch(`${OLLAMA_API_URL}/version`);
      if (!healthCheck.ok) {
        throw new Error('Ollama API is not available');
      }
      console.log('Ollama API is available');
    } catch (error) {
      console.error('Ollama API health check failed:', error);
      throw new Error('Ollama API is not accessible. Please make sure the Ollama server is running and accessible at ' + OLLAMA_API_URL);
    }

    console.log('Using Ollama model:', model);
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

    console.log('Sending request to Ollama:', {
      model,
      promptLength: prompt.length
    });

    const response = await fetch(`${OLLAMA_API_URL}/generate`, {
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

    console.log('Ollama response status:', {
      status: response.status,
      statusText: response.statusText
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

    console.log('Starting to read Ollama stream...');
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
          console.log('Ollama stream completed:', {
            totalChunks: chunkCount,
            finalContentLength: accumulatedContent.length
          });
          break;
        }

        chunkCount++;
        const chunk = decoder.decode(value, { stream: true });
        console.log(`Processing Ollama chunk #${chunkCount}:`, {
          chunkSize: chunk.length,
          bufferSize: buffer.length
        });
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
                console.log('Received Ollama content:', {
                  contentLength: content.length,
                  isThinking,
                  totalLength: accumulatedContent.length
                });

                if (useThinkingMode) {
                  if (content.includes('<think>')) {
                    console.log('Entering Ollama thinking mode');
                    isThinking = true;
                    thinkingContent = '';
                  } else if (content.includes('</think>')) {
                    console.log('Exiting Ollama thinking mode:', {
                      thinkingContentLength: thinkingContent.length
                    });
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
                console.log('Ollama response completed');
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
      console.log('Cleaning up Ollama stream reader');
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