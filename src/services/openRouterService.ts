import config from '../config/config';
import { OpenRouterModel, StreamCallbacks } from '../types/models';
import { CharacterExplanation } from './ollamaService';

export type { OpenRouterModel };

// 验证模型名称的函数
// function isValidModelName(model: string): boolean {
//   return /^[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+(?::[a-zA-Z0-9-]+)?$/.test(model);
// }

// 安全的模型名称映射
export const OPENROUTER_MODELS: Record<OpenRouterModel, string> = {
  'deepseek-chat-free': 'DeepSeek Chat',
  'deepseek-r1-free': 'DeepSeek R1',
  'gemini-2-flash-lite-free': 'Gemini 2.0 Flash Lite'
} as const;

// 模型名称到 API 标识符的映射
const MODEL_API_IDENTIFIERS: Record<string, string> = {
  'deepseek-chat-free': 'deepseek/deepseek-chat:free',
  'deepseek-r1-free': 'deepseek/deepseek-r1:free',
  'gemini-2-flash-lite-free': 'google/gemini-2.0-flash-lite-preview-02-05:free'
};

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 5000
};

// 延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 指数退避重试
async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  retryCount: number = 0
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retryCount >= RETRY_CONFIG.maxRetries) {
      throw error;
    }

    const delayTime = Math.min(
      RETRY_CONFIG.initialDelay * Math.pow(2, retryCount),
      RETRY_CONFIG.maxDelay
    );

    await delay(delayTime);
    
    return retryWithExponentialBackoff(operation, retryCount + 1);
  }
}

export async function streamOpenRouterChat(
  message: string,
  modelKey: OpenRouterModel,
  context: string = '',
  useThinkingMode: boolean = false,
  callbacks: StreamCallbacks
) {

  // 获取实际的模型标识符
  const modelIdentifier = MODEL_API_IDENTIFIERS[modelKey];
  if (!modelIdentifier) {
    throw new Error(`Invalid model key: ${modelKey}`);
  }

  // if (!isValidModelName(modelIdentifier)) {
  //   throw new Error(`Invalid model identifier format: ${modelIdentifier}`);
  // }

  if (!config.openrouterApiKey) {
    console.error('OpenRouter API key is missing');
    throw new Error('OpenRouter API key is not configured');
  }

  const systemPrompt = useThinkingMode
    ? "You are a Chinese language learning assistant. When answering questions, first analyze the question and organize your thoughts in a ```thinking block, then provide your response. Always write your thinking process in Chinese."
    : "You are a Chinese language learning assistant. Provide clear and helpful responses to help users learn Chinese.";

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(context ? context.split('\n').map(line => {
      const [role, content] = line.split(': ');
      return { role: role.toLowerCase(), content };
    }) : []),
    { role: 'user', content: message }
  ];


  try {
    
    const makeRequest = async () => {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openrouterApiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Chinese Learning Assistant',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelIdentifier,
          messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 1000
        }),
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

      return response;
    };

    const response = await retryWithExponentialBackoff(makeRequest);


    const reader = response.body?.getReader();
    if (!reader) {
      console.error('Response body is not readable');
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

          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (!parsed.choices?.[0]?.delta?.content) {
                continue;
              }

              const content = parsed.choices[0].delta.content;
              
              if (content) {
                accumulatedContent += content;

                if (useThinkingMode) {
                  if (content.includes('<think>')) {
                    isThinking = true;
                    thinkingContent = '';
                  } else if (content.includes('</think>')) {
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
            } catch (error) {
              console.error('Error parsing JSON:', {
                error,
                line,
                data: line.slice(6)
              });
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

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function queryOpenRouter(character: string): Promise<CharacterExplanation> {
  const prompt = `请分析汉字"${character}"，并按以下JSON格式返回信息：
{
  "pinyin": "拼音（带声调）",
  "meanings": [
    {
      "definition": "含义1",
      "examples": ["例句1（要包含汉字和拼音）", "例句2（要包含汉字和拼音）"]
    },
    {
      "definition": "含义2",
      "examples": ["例句1（要包含汉字和拼音）", "例句2（要包含汉字和拼音）"]
    }
  ],
  "etymology": "字源简介",
  "examples": ["常用词组1", "常用词组2"],
  "components": "字形结构分析"
}
只返回JSON格式的数据，不要有其他文字。不要使用markdown格式。每个例句都要包含汉字和拼音。`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.openrouterApiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Chinese Learning Assistant',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-r1:free',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data from OpenRouter');
  }

  const data = await response.json();
  try {
    const content = data.choices[0].message.content;
    // Clean the response by removing markdown code blocks and any extra whitespace
    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('Error parsing response:', error);
    throw new Error('Invalid response format from OpenRouter');
  }
} 