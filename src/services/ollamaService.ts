import axios from 'axios';
import { OllamaModel } from '../types/models';
import config from '../config/config';

// 支持的模型列表
export const SUPPORTED_MODELS: Record<OllamaModel, string> = {
  'deepseek-r1:7b': "DeepSeek r1 7B",
  'deepseek-r1:70b': 'DeepSeek r1 70B',
  'llama3:latest': 'LLaMA3 Latest'
} as const;

export type { OllamaModel };

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export interface CharacterExplanation {
  pinyin: string;
  meanings: {
    definition: string;
    examples: string[];
  }[];
  etymology: string;
  examples: string[];
  components: string;
}

const fixIncompleteJson = (jsonStr: string): string => {
  let str = jsonStr.trim();
  
  // 计算左右花括号的数量
  const leftBraces = (str.match(/\{/g) || []).length;
  const rightBraces = (str.match(/\}/g) || []).length;
  
  // 如果左花括号比右花括号多，添加缺少的右花括号
  if (leftBraces > rightBraces) {
    str = str + '}'.repeat(leftBraces - rightBraces);
  }
  
  // 确保JSON以花括号开始和结束
  if (!str.startsWith('{')) str = '{' + str;
  if (!str.endsWith('}')) str = str + '}';
  
  return str;
};

export const queryOllama = async (
  character: string, 
  model: OllamaModel = 'llama3:latest'
): Promise<CharacterExplanation> => {
  try {
    const prompt = `你是一个专业的汉字词典API。请以严格的JSON格式返回汉字"${character}"的信息。
要求：
1. 必须是合法的JSON格式
2. 不要包含任何其他文字说明
3. 字段要求如下：
{
  "pinyin": "字的拼音",
  "meanings": ["含义1", "含义2", ...],
  "etymology": "字源说明（如果没有考证清楚的字源，请填写：字源待考）",
  "examples": ["例词1", "例词2", ...],
  "components": "字的组件结构说明（如果是合体字）"
}

示例输出：
{
  "pinyin": "rén",
  "meanings": ["人，人类", "他人，别人"],
  "etymology": "甲骨文字形像人侧立之形，本义为人",
  "examples": ["人民", "人生", "人才"],
  "components": "独体字"
}`;

    const response = await axios.post(`${config.ollamaApiUrl}/generate`, {
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

    const result = response.data as OllamaResponse;
    
    try {
      // 尝试从响应中提取JSON
      const jsonMatch = result.response.match(/\{[\s\S]*?(?:\}[\s\}]*$|\}(?=\s*[\n\r]))/);
      if (jsonMatch) {
        // 修复并解析JSON
        const fixedJson = fixIncompleteJson(jsonMatch[0]);
        
        try {
          const parsedData = JSON.parse(fixedJson);
          // 验证返回的数据格式
          if (!parsedData.pinyin || 
              !Array.isArray(parsedData.meanings) || parsedData.meanings.length === 0 || 
              !Array.isArray(parsedData.examples) || parsedData.examples.length === 0) {
            throw new Error('返回的数据格式不完整');
          }
          
          // 确保etymology字段存在，如果为空则设置默认值
          if (!parsedData.etymology) {
            parsedData.etymology = '字源待考';
          }
          
          return {
            pinyin: parsedData.pinyin,
            meanings: parsedData.meanings,
            etymology: parsedData.etymology,
            examples: parsedData.examples,
            components: parsedData.components || '独体字'
          } as CharacterExplanation;
        } catch (jsonError) {
          console.error('JSON parse error:', jsonError);
          throw new Error('JSON解析失败');
        }
      }
      throw new Error('响应中未找到有效的JSON数据');
    } catch (parseError) {
      console.error('LLM Response:', result.response);
      console.error('Parse error:', parseError);
      
      // 尝试构建部分数据
      const fallbackData: CharacterExplanation = {
        pinyin: '获取失败',
        meanings: [{ definition: '无法解析释义', examples: [] }],
        etymology: '暂无字源信息',
        examples: [],
        components: '解析失败'
      };

      // 尝试从文本中提取一些信息
      const response = result.response;
      if (response.includes('pinyin:')) {
        const pinyinMatch = response.match(/pinyin:\s*["']?([^"'\n]+)["']?/);
        if (pinyinMatch) {
          fallbackData.pinyin = pinyinMatch[1].trim();
        }
      }

      if (response.includes('meanings:')) {
        const meaningsMatch = response.match(/meanings:\s*\[([\s\S]*?)\]/);
        if (meaningsMatch) {
          const meanings = meaningsMatch[1]
            .split(',')
            .map(m => m.trim().replace(/['"]/g, ''))
            .filter(m => m);
          if (meanings.length > 0) {
            fallbackData.meanings = meanings.map(m => ({ definition: m, examples: [] }));
          }
        }
      }

      return fallbackData;
    }
  } catch (error) {
    console.error('Error querying Ollama:', error);
    throw error;
  }
}; 