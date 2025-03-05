import config from '../config/config';
import { OpenRouterModel, StreamCallbacks } from '../types/models';

export type { OpenRouterModel };

// 验证模型名称的函数
function isValidModelName(model: string): boolean {
  return /^[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+(?::[a-zA-Z0-9-]+)?$/.test(model);
}

// 安全的模型名称映射
export const OPENROUTER_MODELS: Record<OpenRouterModel, string> = {
  'deepseek-chat-free': 'DeepSeek Chat',
  'deepseek-r1-free': 'DeepSeek R1',
  'gemini-2-flash-lite': 'Gemini 2.0 Flash Lite'
} as const;

// 模型名称到 API 标识符的映射
const MODEL_API_IDENTIFIERS: Record<string, string> = {
  'deepseek-chat-free': 'deepseek/deepseek-chat:free',
  'deepseek-r1-free': 'deepseek/deepseek-r1:free',
  'gemini-2-flash-lite': 'google/gemini-2.0-flash-lite-preview-02-05:free'
};

export async function streamOpenRouterChat(
  message: string,
  modelKey: OpenRouterModel,
  context: string = '',
  useThinkingMode: boolean = false,
  callbacks: StreamCallbacks
) {
  console.log('Starting OpenRouter chat stream:', {
    modelKey,
    useThinkingMode,
    contextLength: context?.length || 0,
    messageLength: message.length
  });

  // 获取实际的模型标识符
  const modelIdentifier = MODEL_API_IDENTIFIERS[modelKey];
  if (!modelIdentifier) {
    throw new Error(`Invalid model key: ${modelKey}`);
  }

  if (!isValidModelName(modelIdentifier)) {
    throw new Error(`Invalid model identifier format: ${modelIdentifier}`);
  }

  if (!config.openrouterApiKey) {
    console.error('OpenRouter API key is missing');
    throw new Error('OpenRouter API key is not configured');
  }

  const systemPrompt = useThinkingMode
    ? "You are a Chinese language learning assistant. When answering questions, first analyze the question and organize your thoughts in a <think> tag, then provide your response. Always write your thinking process in Chinese."
    : "You are a Chinese language learning assistant. Provide clear and helpful responses to help users learn Chinese.";

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(context ? context.split('\n').map(line => {
      const [role, content] = line.split(': ');
      return { role: role.toLowerCase(), content };
    }) : []),
    { role: 'user', content: message }
  ];

  console.log('Prepared messages for OpenRouter:', {
    messageCount: messages.length,
    systemPromptLength: systemPrompt.length,
    finalMessageContent: messages[messages.length - 1].content,
    modelIdentifier
  });

  try {
    console.log('Sending request to OpenRouter API...');
    const response = await fetch('https://api.openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Chinese Learning Assistant',
        'Accept': 'text/event-stream',
        'OR-Organization': window.location.origin
      },
      body: JSON.stringify({
        model: modelIdentifier,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
        transforms: ["middle"],
        route: "fallback",
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      }),
    });

    console.log('OpenRouter API request details:', {
      url: 'https://api.openrouter.ai/api/v1/chat/completions',
      headers: {
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Chinese Learning Assistant',
        'OR-Organization': window.location.origin
      },
      body: {
        model: modelIdentifier,
        messageCount: messages.length,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000
      }
    });

    console.log('OpenRouter API response status:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`OpenRouter API error: ${response.statusText}${errorData.error ? ` - ${errorData.error}` : ''}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      console.error('Response body is not readable');
      throw new Error('Response body is not readable');
    }

    console.log('Starting to read stream from OpenRouter...');
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
          console.log('Stream completed:', {
            totalChunks: chunkCount,
            finalContentLength: accumulatedContent.length
          });
          break;
        }

        chunkCount++;
        const chunk = decoder.decode(value, { stream: true });
        console.log(`Processing chunk #${chunkCount}:`, {
          chunkSize: chunk.length,
          bufferSize: buffer.length,
          chunk: chunk
        });
        buffer += chunk;

        while (true) {
          const lineEnd = buffer.indexOf('\n');
          if (lineEnd === -1) break;

          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);

          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              console.log('Received [DONE] signal');
              break;
            }

            try {
              console.log('Parsing JSON data:', { data });
              const parsed = JSON.parse(data);
              console.log('Parsed JSON:', parsed);
              
              if (!parsed.choices?.[0]?.delta?.content) {
                console.log('No content in delta, skipping');
                continue;
              }

              const content = parsed.choices[0].delta.content;
              
              if (content) {
                accumulatedContent += content;
                console.log('Received content:', {
                  content,
                  contentLength: content.length,
                  isThinking,
                  totalLength: accumulatedContent.length
                });

                if (useThinkingMode) {
                  if (content.includes('<think>')) {
                    console.log('Entering thinking mode');
                    isThinking = true;
                    thinkingContent = '';
                  } else if (content.includes('</think>')) {
                    console.log('Exiting thinking mode:', {
                      thinkingContentLength: thinkingContent.length,
                      thinkingContent
                    });
                    isThinking = false;
                    callbacks.onThinking?.(thinkingContent);
                  } else if (isThinking) {
                    thinkingContent += content;
                    callbacks.onThinking?.(thinkingContent);
                  } else {
                    callbacks.onContent(content);
                  }
                } else {
                  callbacks.onContent(content);
                }
              }
            } catch (error: unknown) {
              if (error instanceof Error) {
                console.error('Error parsing JSON:', {
                  error: error.toString(),
                  name: error.name,
                  message: error.message,
                  stack: error.stack,
                  line,
                  data: line.slice(6)
                });
              } else {
                console.error('Unknown error parsing JSON:', {
                  error,
                  line,
                  data: line.slice(6)
                });
              }
              continue;
            }
          }
        }
      }
    } catch (streamError) {
      console.error('Error in stream processing:', {
        error: streamError,
        chunkCount,
        bufferSize: buffer.length
      });
      throw streamError;
    } finally {
      console.log('Cleaning up stream reader');
      reader.cancel();
      callbacks.onComplete();
    }

    return accumulatedContent;
  } catch (error) {
    console.error('Fatal error in OpenRouter chat:', {
      error,
      modelKey,
      messageCount: messages.length
    });
    callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
    throw error;
  }
} 