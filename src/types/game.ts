export interface IdiomMapItem {
    txt: string;
    type: number;
    ans?: {
      i: number;
      c: string;
      used: number;
    };
  }
  
  export interface AnswerMapItem {
    i: number;
    c: string;
    used: number;
    pos: string;
  }
  
  export interface IdiomMapData {
    s: string;
    a: Array<{
      i: number;
      c: string;
    }>;
  }