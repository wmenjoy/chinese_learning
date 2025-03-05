import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import HanziWriter from 'hanzi-writer';

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

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #FFD54F;
  border-radius: 0.5rem;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: #FFC107;
    box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2);
  }
`;

const CharacterLearning: React.FC = () => {
  const [currentCharacter, setCurrentCharacter] = useState<string>('字');
  const [inputValue, setInputValue] = useState<string>('字');
  const writerRef = useRef<HanziWriter | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      if (writerRef.current) {
        writerRef.current = null;
      }
      containerRef.current.innerHTML = '';

      // 创建新的writer实例
      const writer = HanziWriter.create(containerRef.current, currentCharacter, {
        width: 300,
        height: 300,
        padding: 5,
        showOutline: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 500,
      });

      writerRef.current = writer;
    }

    // 清理函数
    return () => {
      if (writerRef.current) {
        writerRef.current = null;
      }
    };
  }, [currentCharacter]);

  const handleAnimate = () => {
    if (writerRef.current) {
      writerRef.current.animateCharacter();
    }
  };

  const handlePractice = () => {
    if (writerRef.current) {
      writerRef.current.quiz({
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

  return (
    <Container>
      <h1>汉字学习</h1>
      <Input
        type="text"
        placeholder="输入汉字..."
        onChange={handleCharacterChange}
        value={inputValue}
        autoComplete="off"
      />
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
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Button onClick={handleAnimate} disabled={!currentCharacter}>演示</Button>
          <Button onClick={handlePractice} disabled={!currentCharacter}>练习</Button>
          <Button onClick={handleReset}>重置</Button>
        </div>
      </WriterContainer>
    </Container>
  );
};

export default CharacterLearning; 