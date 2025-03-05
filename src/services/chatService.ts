import axios from 'axios';
import { SupportedModel } from './ollamaService';

const OLLAMA_API_URL = 'http://192.168.50.41:11434/api';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'thinking';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  model: SupportedModel;
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
  model: SupportedModel = 'llama3:latest',
  context?: string,
  useThinkingMode: boolean = false
): Promise<string> => {
  try {
    console.log(`Sending message to Ollama API using model: ${model}...`);
    
    let prompt;
    if (useThinkingMode) {
      // 在思考模式下，使用结构化的提示词
      prompt = context 
        ? `Previous context:\n${context}\n\n${THINKING_PROMPT.replace('{question}', message)}`
        : THINKING_PROMPT.replace('{question}', message);
    } else {
      // 在普通模式下，使用简单的提示词
      prompt = context 
        ? `Previous context:\n${context}\n\nUser: ${message}`
        : message;
    }

    const response = await axios.post(`${OLLAMA_API_URL}/generate`, {
      model,
      prompt,
      stream: false
    }).catch(error => {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('无法连接到Ollama服务，请确保服务已启动');
      }
      if (error.response) {
        throw new Error(`Ollama API 错误: ${error.response.data.error || '未知错误'}`);
      }
      throw error;
    });

    return response.data.response;
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
}; 