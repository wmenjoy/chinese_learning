declare module 'hanzi-writer' {
  interface HanziWriterOptions {
    width?: number;
    height?: number;
    padding?: number;
    showOutline?: boolean;
    strokeAnimationSpeed?: number;
    delayBetweenStrokes?: number;
    radicalColor?: string;
    strokeColor?: string;
    outlineColor?: string;
    highlightColor?: string;
  }

  interface QuizOptions {
    showOutline?: boolean;
    onComplete?: () => void;
  }

  export default class HanziWriter {
    constructor(element: HTMLElement | string, character: string, options?: HanziWriterOptions);
    
    static create(element: HTMLElement | string, character: string, options?: HanziWriterOptions): HanziWriter;
    
    quiz(options?: QuizOptions): void;
    hideCharacter(): void;
    showCharacter(): void;
    animateCharacter(): void;
    setCharacter(character: string): void;
  }
} 