declare module 'hanzi-writer' {
  interface HanziWriterOptions {
    width?: number;
    height?: number;
    padding?: number;
    showOutline?: boolean;
    strokeAnimationSpeed?: number;
    delayBetweenStrokes?: number;
    strokeColor?: string;
    radicalColor?: string;
  }

  interface QuizOptions {
    showOutline?: boolean;
    onComplete?: () => void;
  }

  interface CharacterData {
    strokes: string[];
  }

  interface ScalingTransform {
    transform: string;
    scale: number;
  }

  class HanziWriter {
    static create(element: HTMLElement, character: string, options?: HanziWriterOptions): HanziWriter;
    static loadCharacterData(character: string): Promise<CharacterData>;
    static getScalingTransform(width: number, height: number): ScalingTransform;
    
    constructor(element: HTMLElement, character: string, options?: HanziWriterOptions);
    
    animateCharacter(): void;
    animateStroke(strokeNum: number): Promise<void>;
    showCharacter(): void;
    hideCharacter(): void;
    setCharacter(character: string): void;
    showStroke(strokeNum: number): void;
    quiz(options: QuizOptions): void;
    destroy(): void;
  }

  export default HanziWriter;
} 