import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import HanziWriter from 'hanzi-writer';
import { CharacterExplanation } from '../services/ollamaService';
import { queryOpenRouter } from '../services/openRouterService';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const WriterContainer = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const GridBackground = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.3);

  &::before,
  &::after {
    content: '';
    position: absolute;
    background: rgba(0, 0, 0, 0.1);
  }

  // 水平线
  &::before {
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    transform: translateY(-50%);
  }

  // 垂直线
  &::after {
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
    transform: translateX(-50%);
  }

  // 对角线
  .diagonal {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    &::before,
    &::after {
      content: '';
      position: absolute;
      background: rgba(0, 0, 0, 0.1);
      width: 424px; // 300px * √2
      height: 1px;
      top: 50%;
      left: 50%;
    }

    &::before {
      transform: translate(-50%, -50%) rotate(45deg);
    }

    &::after {
      transform: translate(-50%, -50%) rotate(-45deg);
    }
  }
`;

const StrokeGridsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
`;

const Button = styled.button`
  background: #FFD54F;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  color: #424242;
  cursor: pointer;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  transition: background 0.2s;

  &:hover {
    background: #FFC107;
  }

  &:disabled {
    background: #E0E0E0;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ClearButton = styled.button`
  background: #E0E0E0;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: #424242;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #BDBDBD;
  }

  &:disabled {
    background: #F5F5F5;
    cursor: not-allowed;
    color: #9E9E9E;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #FFD54F;
  border-radius: 0.5rem;
  font-size: 1.25rem;
  
  &:focus {
    outline: none;
    border-color: #FFC107;
    box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2);
  }
`;

// 添加颜色常量
const STROKE_COLORS = [
  '#E53935', // 红色
  '#43A047', // 绿色
  '#1E88E5', // 蓝色
  '#FB8C00', // 橙色
  '#8E24AA', // 紫色
  '#00ACC1', // 青色
  '#3949AB', // 靛蓝
  '#827717', // 橄榄
  '#6D4C41', // 棕色
  '#546E7A', // 蓝灰
];

const DictionarySection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 1.2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const DictionaryContent = styled.div`
  h3 {
    color: #2C3E50;
    margin: 1.5rem 0 1rem;
    font-size: 1.3rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    
    &:first-child {
      margin-top: 0;
    }

    &::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 1em;
      background: #FFD54F;
      margin-right: 0.8rem;
      border-radius: 2px;
    }
  }

  .pinyin {
    color: #FF4081;
    font-size: 1.4rem;
    margin: 0.5rem 0 1.5rem;
    padding: 0.5rem 1rem;
    background: #FFF8E1;
    border-radius: 0.5rem;
    display: inline-block;
  }

  .meanings {
    margin: 0;
    padding: 0;
    list-style: none;
    
    li {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #FAFAFA;
      border-radius: 0.8rem;
      transition: all 0.2s ease;

      &:hover {
        background: #F5F5F5;
        transform: translateX(4px);
      }

      .definition {
        font-weight: 500;
        color: #2C3E50;
        margin-bottom: 0.8rem;
        font-size: 1.1rem;
        border-left: 3px solid #4CAF50;
        padding-left: 1rem;
      }

      .meaning-examples {
        margin: 0.8rem 0 0 1rem;
        padding: 0;
        
        li {
          color: #546E7A;
          font-size: 1rem;
          margin: 0.5rem 0;
          padding: 0.6rem 1rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          list-style-type: none;
          position: relative;

          &::before {
            content: '例';
            color: #90A4AE;
            font-size: 0.8rem;
            position: absolute;
            left: -2rem;
            top: 50%;
            transform: translateY(-50%);
          }
        }
      }
    }
  }

  .etymology {
    background: #F3F4F6;
    padding: 1.2rem;
    border-radius: 0.8rem;
    color: #455A64;
    line-height: 1.6;
    position: relative;
    margin: 1rem 0;
    border-left: 4px solid #78909C;
  }

  .examples {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin: 1rem 0;
    
    span {
      background: #E3F2FD;
      padding: 0.5rem 1rem;
      border-radius: 0.6rem;
      color: #1976D2;
      font-size: 1rem;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      cursor: pointer;

      &:hover {
        background: #BBDEFB;
        border-color: #90CAF9;
        transform: translateY(-2px);
      }
    }
  }

  .components {
    margin-top: 1.5rem;
    padding: 1.2rem;
    border-top: 2px dashed #E0E0E0;
    color: #37474F;
    background: #FAFAFA;
    border-radius: 0.8rem;

    h3 {
      margin-top: 0;
    }

    p {
      line-height: 1.6;
      margin: 0.5rem 0 0;
    }
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #FFD54F;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const CharacterLearning: React.FC = () => {
  const [currentCharacter, setCurrentCharacter] = useState<string>('字');
  const [inputValue, setInputValue] = useState<string>('字');
  const [writers, setWriters] = useState<HanziWriter[]>([]);
  const [dictionaryData, setDictionaryData] = useState<CharacterExplanation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const strokeGridsContainerRef = useRef<HTMLDivElement>(null);

  // 清理函数
  const cleanupWriters = () => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    if (strokeGridsContainerRef.current) {
      strokeGridsContainerRef.current.innerHTML = '';
    }
    setWriters([]);
  };

  const handleCharacterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    
    // 当输入是单个汉字时更新显示
    if (value.length === 1 && /[\u4e00-\u9fa5]/.test(value)) {
      setCurrentCharacter(value);
    } else if (!value) {
      setCurrentCharacter('字');
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      // 清除现有内容
      cleanupWriters();

      // 创建新的writer实例 - 主要展示
      const mainWriter = HanziWriter.create(containerRef.current, currentCharacter, {
        width: 300,
        height: 300,
        padding: 5,
        showOutline: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 500,
      });

      setWriters([mainWriter]);
    }

    return cleanupWriters;
  }, [currentCharacter]);

  const handleAnimate = () => {
    if (writers[0]) {
      writers[0].animateCharacter();
    }
  };

  const handleComponentAnimation = async () => {
    if (!containerRef.current || !currentCharacter || !strokeGridsContainerRef.current) return;

    // 清除现有内容
    cleanupWriters();

    try {
      const charData = await HanziWriter.loadCharacterData(currentCharacter);
      
      // 根据汉字结构分析部件
      const strokes = charData.strokes;
      const components: string[][] = [];
      let currentComponent: string[] = [];
      
      // 获取整个字符的边界框
      const charBBox = getStrokeBoundingBox(strokes.join(' '));
      const charWidth = charBBox.maxX - charBBox.minX;
      const charHeight = charBBox.maxY - charBBox.minY;
      
      // 动态计算阈值，基于字符大小
      const threshold = Math.min(charWidth, charHeight) * 0.2;
      
      for (let i = 0; i < strokes.length; i++) {
        const currentStroke = strokes[i];
        
        if (i === 0) {
          currentComponent.push(currentStroke);
          continue;
        }
        
        const prevStroke = strokes[i - 1];
        const prevBBox = getStrokeBoundingBox(prevStroke);
        const currentBBox = getStrokeBoundingBox(currentStroke);
        
        // 使用改进的部件检测逻辑
        if (isNewComponent(prevBBox, currentBBox, threshold)) {
          if (currentComponent.length > 0) {
            components.push([...currentComponent]);
            currentComponent = [];
          }
        }
        
        currentComponent.push(currentStroke);
      }
      
      if (currentComponent.length > 0) {
        components.push(currentComponent);
      }

      // 创建主字符显示
      const mainWriter = HanziWriter.create(containerRef.current, currentCharacter, {
        width: 300,
        height: 300,
        padding: 5,
        showOutline: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 500,
        strokeColor: '#333', // 主显示区域使用黑色
      });
      setWriters([mainWriter]);

      // 创建所有部件的容器，但初始时隐藏
      const componentContainers = components.map((componentStrokes, index) => {
        const gridContainer = document.createElement('div');
        gridContainer.style.position = 'relative';
        gridContainer.style.width = '150px';
        gridContainer.style.height = '150px';
        gridContainer.style.border = '1px solid rgba(0, 0, 0, 0.3)';
        gridContainer.style.margin = '0.5rem';
        gridContainer.style.opacity = '0';
        gridContainer.style.transform = 'translateY(20px)';
        gridContainer.style.transition = 'all 0.3s ease';

        // 为当前部件选择一个颜色
        const componentColor = STROKE_COLORS[index % STROKE_COLORS.length];

        // 添加米字格线
        const gridLines = document.createElement('div');
        gridLines.style.position = 'absolute';
        gridLines.style.width = '100%';
        gridLines.style.height = '100%';
        gridLines.innerHTML = `
          <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: rgba(0, 0, 0, 0.1);"></div>
          <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: rgba(0, 0, 0, 0.1);"></div>
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
            <div style="position: absolute; top: 50%; left: 50%; width: 212.1px; height: 1px; background: rgba(0, 0, 0, 0.1); transform: translate(-50%, -50%) rotate(45deg);"></div>
            <div style="position: absolute; top: 50%; left: 50%; width: 212.1px; height: 1px; background: rgba(0, 0, 0, 0.1); transform: translate(-50%, -50%) rotate(-45deg);"></div>
          </div>
        `;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.zIndex = '1';

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const transformData = HanziWriter.getScalingTransform(150, 150);
        group.setAttributeNS(null, 'transform', transformData.transform);
        svg.appendChild(group);

        // 绘制部件的所有笔画，每个笔画使用渐变色
        componentStrokes.forEach((strokePath, strokeIndex) => {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttributeNS(null, 'd', strokePath);
          // 计算笔画颜色：从部件基色到深色的渐变
          const strokeColor = adjustColor(componentColor, -strokeIndex * 10);
          path.style.fill = strokeColor;
          group.appendChild(path);
        });

        gridContainer.appendChild(gridLines);
        gridContainer.appendChild(svg);

        // 更新标签颜色为部件颜色
        const label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.top = '-20px';
        label.style.left = '50%';
        label.style.transform = 'translateX(-50%)';
        label.style.fontSize = '14px';
        label.style.color = componentColor;
        label.style.fontWeight = 'bold';
        label.textContent = `部件 ${index + 1}`;
        gridContainer.appendChild(label);

        // 添加笔画数标签
        const strokeCountLabel = document.createElement('div');
        strokeCountLabel.style.position = 'absolute';
        strokeCountLabel.style.bottom = '-20px';
        strokeCountLabel.style.left = '50%';
        strokeCountLabel.style.transform = 'translateX(-50%)';
        strokeCountLabel.style.fontSize = '12px';
        strokeCountLabel.style.color = componentColor;
        strokeCountLabel.textContent = `${componentStrokes.length}笔`;
        gridContainer.appendChild(strokeCountLabel);

        return gridContainer;
      });

      // 将所有部件容器添加到DOM
      componentContainers.forEach(container => {
        strokeGridsContainerRef.current?.appendChild(container);
      });

      // 动画展示主字符
      await mainWriter.animateCharacter();

      // 依次显示每个部件
      for (let i = 0; i < componentContainers.length; i++) {
        const container = componentContainers[i];
        await new Promise(resolve => {
          container.style.opacity = '1';
          container.style.transform = 'translateY(0)';
          setTimeout(resolve, 300); // 等待动画完成
        });
      }

    } catch (error) {
      console.error('Error loading character data:', error);
    }
  };

  // 辅助函数：获取笔画的边界框
  const getStrokeBoundingBox = (strokePath: string) => {
    // 解析SVG路径数据以获取边界框
    const numbers = strokePath.match(/-?\d+\.?\d*/g)?.map(Number) || [];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    for (let i = 0; i < numbers.length; i += 2) {
      const x = numbers[i];
      const y = numbers[i + 1];
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    
    return { minX, minY, maxX, maxY };
  };

  // 辅助函数：判断是否是新部件
  const isNewComponent = (
    prevBBox: ReturnType<typeof getStrokeBoundingBox>, 
    currentBBox: ReturnType<typeof getStrokeBoundingBox>,
    threshold: number
  ) => {
    const horizontalGap = Math.min(
      Math.abs(currentBBox.minX - prevBBox.maxX),
      Math.abs(currentBBox.maxX - prevBBox.minX)
    );
    
    const verticalGap = Math.min(
      Math.abs(currentBBox.minY - prevBBox.maxY),
      Math.abs(currentBBox.maxY - prevBBox.minY)
    );
    
    // 检查重叠
    const horizontalOverlap = !(currentBBox.maxX < prevBBox.minX || currentBBox.minX > prevBBox.maxX);
    const verticalOverlap = !(currentBBox.maxY < prevBBox.minY || currentBBox.minY > prevBBox.maxY);
    
    // 如果没有重叠且间距超过阈值，认为是新部件
    return (!horizontalOverlap || !verticalOverlap) && (horizontalGap > threshold || verticalGap > threshold);
  };

  // 辅助函数：调整颜色明度
  const adjustColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  };

  const handleStrokeByStroke = async () => {
    if (!containerRef.current || !currentCharacter || !strokeGridsContainerRef.current) return;

    // 清除笔画网格容器的内容，但保留主writer实例
    if (strokeGridsContainerRef.current) {
      strokeGridsContainerRef.current.innerHTML = '';
    }

    try {
      const charData = await HanziWriter.loadCharacterData(currentCharacter);
      const strokeCount = charData.strokes.length;

      // 确保主writer实例存在
      if (!writers[0]) {
        const mainWriter = HanziWriter.create(containerRef.current, currentCharacter, {
          width: 300,
          height: 300,
          padding: 5,
          showOutline: true,
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 500,
        });
        setWriters([mainWriter]);
      }

      // 为每个阶段创建一个网格
      for (let i = 0; i < strokeCount; i++) {
        // 创建网格容器
        const gridContainer = document.createElement('div');
        gridContainer.style.position = 'relative';
        gridContainer.style.width = '100px';
        gridContainer.style.height = '100px';
        gridContainer.style.border = '1px solid rgba(0, 0, 0, 0.3)';
        gridContainer.style.margin = '0.5rem';

        // 创建SVG容器
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.zIndex = '1';

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const transformData = HanziWriter.getScalingTransform(100, 100);
        group.setAttributeNS(null, 'transform', transformData.transform);
        svg.appendChild(group);

        // 绘制到当前笔画为止的所有笔画，使用不同颜色
        for (let j = 0; j <= i; j++) {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttributeNS(null, 'd', charData.strokes[j]);
          path.style.fill = STROKE_COLORS[j % STROKE_COLORS.length];
          group.appendChild(path);
        }

        gridContainer.appendChild(svg);

        // 添加笔画序号标签
        const strokeLabel = document.createElement('div');
        strokeLabel.style.position = 'absolute';
        strokeLabel.style.top = '-20px';
        strokeLabel.style.left = '50%';
        strokeLabel.style.transform = 'translateX(-50%)';
        strokeLabel.style.fontSize = '12px';
        strokeLabel.style.color = STROKE_COLORS[i % STROKE_COLORS.length];
        strokeLabel.style.fontWeight = 'bold';
        strokeLabel.textContent = `第 ${i + 1} 笔`;
        gridContainer.appendChild(strokeLabel);

        strokeGridsContainerRef.current.appendChild(gridContainer);
      }
    } catch (error) {
      console.error('Error loading character data:', error);
    }
  };

  const handlePractice = () => {
    if (writers[0]) {
      writers[0].quiz({
        showOutline: true,
        onComplete: () => {
          console.log('Practice completed!');
        }
      });
    }
  };

  const handleReset = () => {
    setInputValue('字');
    setCurrentCharacter('字');
  };

  const handleClear = () => {
    setInputValue('');
    setCurrentCharacter('字');
  };

  const fetchDictionaryData = async (char: string) => {
    setIsLoading(true);
    try {
      const data = await queryOpenRouter(char);
      setDictionaryData(data);
    } catch (error) {
      console.error('Error fetching dictionary data:', error);
      setDictionaryData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentCharacter) {
      fetchDictionaryData(currentCharacter);
    }
  }, [currentCharacter]);

  return (
    <Container>
      <h1>汉字学习</h1>
      <InputContainer>
        <Input
          type="text"
          placeholder="输入汉字..."
          onChange={handleCharacterChange}
          value={inputValue}
          autoComplete="off"
        />
        <ClearButton 
          onClick={handleClear}
          disabled={!inputValue || inputValue === '字'}
        >
          清空
        </ClearButton>
      </InputContainer>
      {inputValue.length > 1 && (
        <div style={{ color: '#ff4081', marginBottom: '1rem', fontSize: '0.9rem' }}>
          请输入单个汉字
        </div>
      )}
      {!/[\u4e00-\u9fa5]/.test(inputValue) && inputValue && (
        <div style={{ color: '#ff4081', marginBottom: '1rem', fontSize: '0.9rem' }}>
          请输入汉字
        </div>
      )}
      <WriterContainer>
        <GridBackground>
          <div className="diagonal"></div>
          <div 
            ref={containerRef}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1
            }}
          ></div>
        </GridBackground>
        <ButtonGroup>
          <Button onClick={handleAnimate} disabled={!currentCharacter}>
            整体演示
          </Button>
          <Button onClick={handleComponentAnimation} disabled={!currentCharacter}>
            部件演示
          </Button>
          <Button onClick={handleStrokeByStroke} disabled={!currentCharacter}>
            分步演示
          </Button>
          <Button onClick={handlePractice} disabled={!currentCharacter}>
            练习
          </Button>
          <Button onClick={handleReset}>
            重置
          </Button>
        </ButtonGroup>
        <StrokeGridsContainer ref={strokeGridsContainerRef} />
      </WriterContainer>
      <DictionarySection>
        <h2>词典释义</h2>
        {isLoading ? (
          <div style={{ textAlign: 'center' }}>
            <LoadingSpinner />
          </div>
        ) : dictionaryData ? (
          <DictionaryContent>
            <div className="pinyin">{dictionaryData.pinyin}</div>
            <h3>释义</h3>
            <ul className="meanings">
              {dictionaryData.meanings.map((meaning, index) => (
                <li key={index}>
                  <div className="definition">{meaning.definition}</div>
                  {meaning.examples.length > 0 && (
                    <ul className="meaning-examples">
                      {meaning.examples.map((example, exIndex) => (
                        <li key={exIndex}>{example}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <h3>字源</h3>
            <div className="etymology">{dictionaryData.etymology}</div>
            <h3>常用词组</h3>
            <div className="examples">
              {dictionaryData.examples.map((example, index) => (
                <span key={index}>{example}</span>
              ))}
            </div>
            {dictionaryData.components && (
              <div className="components">
                <h3>字形结构</h3>
                <p>{dictionaryData.components}</p>
              </div>
            )}
          </DictionaryContent>
        ) : (
          <div style={{ textAlign: 'center', color: '#757575' }}>
            无法获取词典数据
          </div>
        )}
      </DictionarySection>
    </Container>
  );
};

export default CharacterLearning; 