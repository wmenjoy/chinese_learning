export interface CharacterData {
  character: string;
  pinyin: string;
  radical: string;
  strokeCount: number;
  meanings: string[];
  commonWords: string[];
  etymology?: {
    type: string;
    description: string;
    image?: string;
  };
}

export interface StrokeData {
  character: string;
  strokes: string[];
  medians: number[][][];
} 