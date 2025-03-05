import { CharacterData } from '../types/character';

// 使用汉字笔画数据API
const fetchStrokeData = async (character: string) => {
  try {
    const response = await fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${character}.json`);
    if (!response.ok) throw new Error('Stroke data not found');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stroke data:', error);
    return null;
  }
};

// 使用汉典API获取汉字信息
const fetchCharacterInfo = async (character: string) => {
  try {
    // 这里使用示例数据，实际项目中应该使用真实的汉字API
    const pinyinData = await import('pinyin-pro');
    const pinyin = pinyinData.pinyin(character, { toneType: 'symbol', type: 'array' })[0];
    
    return {
      pinyin,
      radical: await getRadical(character),
      strokeCount: await getStrokeCount(character),
      meanings: await getMeanings(character),
      commonWords: await getCommonWords(character),
      etymology: await getEtymology(character),
    };
  } catch (error) {
    console.error('Error fetching character info:', error);
    return null;
  }
};

// 获取部首信息
const getRadical = async (character: string) => {
  // 这里应该调用实际的部首API
  // 暂时返回模拟数据
  const radicals: { [key: string]: string } = {
    '字': '子',
    '我': '戈',
    '好': '女',
    // 可以添加更多常用字的部首
  };
  return radicals[character] || '未知';
};

// 获取笔画数
const getStrokeCount = async (character: string) => {
  const strokeData = await fetchStrokeData(character);
  return strokeData ? strokeData.strokes.length : 0;
};

// 获取释义
const getMeanings = async (character: string) => {
  // 这里应该调用实际的汉字释义API
  // 暂时返回模拟数据
  const meanings: { [key: string]: string[] } = {
    '字': ['文字、字体', '字母'],
    '我': ['第一人称代词', '自己'],
    '好': ['良好的', '喜欢'],
    // 可以添加更多常用字的释义
  };
  return meanings[character] || ['暂无释义'];
};

// 获取常用词组
const getCommonWords = async (character: string) => {
  // 这里应该调用实际的词组API
  // 暂时返回模拟数据
  const words: { [key: string]: string[] } = {
    '字': ['汉字', '字体', '字典'],
    '我': ['我们', '我的', '自我'],
    '好': ['好人', '很好', '友好'],
    // 可以添加更多常用字的词组
  };
  return words[character] || [];
};

// 获取字源信息
const getEtymology = async (character: string) => {
  // 这里应该调用实际的字源API
  // 暂时返回模拟数据
  const etymology: { [key: string]: { type: string; description: string } } = {
    '字': {
      type: '会意',
      description: '上部为"宀"，表示房子；下部为"子"，表示孩子。本义为孩子在房子里学习写字。',
    },
    '我': {
      type: '象形',
      description: '古代兵器"戈"的形状，引申为"自我"。',
    },
    '好': {
      type: '会意',
      description: '由"女"和"子"组成，象征母子之情，引申为美好。',
    },
    // 可以添加更多常用字的字源信息
  };
  return etymology[character] || null;
};

export const getCharacterData = async (character: string): Promise<CharacterData | null> => {
  try {
    const strokeData = await fetchStrokeData(character);
    if (!strokeData) return null;

    const info = await fetchCharacterInfo(character);
    if (!info) return null;

    return {
      character,
      pinyin: info.pinyin,
      radical: info.radical,
      strokeCount: info.strokeCount,
      meanings: info.meanings,
      commonWords: info.commonWords,
      etymology: info.etymology,
    };
  } catch (error) {
    console.error('Error getting character data:', error);
    return null;
  }
};

export const searchCharacters = async (query: string): Promise<CharacterData[]> => {
  if (!query) return [];
  
  try {
    const character = query[0];
    const data = await getCharacterData(character);
    return data ? [data] : [];
  } catch (error) {
    console.error('Error searching characters:', error);
    return [];
  }
}; 