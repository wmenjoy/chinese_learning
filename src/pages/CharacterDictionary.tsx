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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CharacterDisplay = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CharacterInfo = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h2 {
    color: #424242;
    margin-bottom: 1.5rem;
  }

  h3 {
    color: #757575;
    margin: 1rem 0 0.5rem;
    font-size: 1.1rem;
  }

  p {
    color: #616161;
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }
`;

const SearchInput = styled.input`
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

const Button = styled.button`
  background: #FFD54F;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  color: #424242;
  cursor: pointer;
  margin-right: 0.5rem;
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
  justify-content: center;
  margin-top: 1rem;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 2rem;
  height: 2rem;
  border: 3px solid #FFD54F;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  margin: 1rem auto;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
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

const WriterContainer = styled.div`
  position: relative;
  width: 300px;
  height: 300px;

  > div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

const CharacterDictionary: React.FC = () => {
  const [character, setCharacter] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [writer, setWriter] = useState<HanziWriter | null>(null);
  const [dictionaryData, setDictionaryData] = useState<CharacterExplanation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const writerContainerRef = useRef<HTMLDivElement>(null);

  // 清理writer实例的函数
  const cleanupWriter = () => {
    if (writerContainerRef.current) {
      writerContainerRef.current.innerHTML = '';
    }
    setWriter(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!character) {
        setDictionaryData(null);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await queryOpenRouter(character);
        setDictionaryData(data);
      } catch (error) {
        console.error('Error fetching character data:', error);
        setDictionaryData(null);
        setError(error instanceof Error ? error.message : '获取汉字信息失败');
      }
      setLoading(false);
    };

    fetchData();
  }, [character]);

  useEffect(() => {
    if (writerContainerRef.current && character) {
      // 清理旧的writer实例
      cleanupWriter();
      
      // 创建新的writer实例
      const newWriter = HanziWriter.create(writerContainerRef.current, character, {
        width: 300,
        height: 300,
        padding: 5,
        showOutline: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 500,
        strokeColor: STROKE_COLORS[0]
      });

      setWriter(newWriter);
    }

    return cleanupWriter;
  }, [character]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    
    // 清空输入框时重置状态
    if (!value) {
      setCharacter('');
      setDictionaryData(null);
      cleanupWriter();
      return;
    }
    
    // 只在输入单个汉字时更新
    if (value.length === 1 && /[\u4e00-\u9fa5]/.test(value)) {
      setCharacter(value);
    }
  };

  const handleAnimate = () => {
    if (writer && character) {
      writer.animateCharacter();
    }
  };

  const handlePractice = () => {
    if (writer && character) {
      writer.quiz({
        showOutline: true,
        onComplete: () => {
          console.log('Practice completed!');
        }
      });
    }
  };

  return (
    <Container>
      <h1>汉字词典</h1>
      <SearchInput
        type="text"
        placeholder="输入汉字..."
        value={inputValue}
        onChange={handleSearch}
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
      <Grid>
        <CharacterDisplay>
          <GridBackground>
            <div className="diagonal"></div>
            <WriterContainer ref={writerContainerRef} />
          </GridBackground>
          <ButtonGroup>
            <Button onClick={handleAnimate} disabled={!character}>
              演示
            </Button>
            <Button onClick={handlePractice} disabled={!character}>
              练习
            </Button>
          </ButtonGroup>
        </CharacterDisplay>
        <CharacterInfo>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div style={{ color: '#ff4081' }}>{error}</div>
          ) : dictionaryData ? (
            <>
              <h2>{character}</h2>
              <h3>拼音</h3>
              <p>{dictionaryData.pinyin}</p>
              <h3>释义</h3>
              {dictionaryData.meanings.map((meaning, index) => (
                <div key={index}>
                  <p><strong>{meaning.definition}</strong></p>
                  <ul>
                    {meaning.examples.map((example, i) => (
                      <li key={i}>{example}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <h3>字源</h3>
              <p>{dictionaryData.etymology}</p>
              <h3>常用词组</h3>
              <ul>
                {dictionaryData.examples.map((example, index) => (
                  <li key={index}>{example}</li>
                ))}
              </ul>
              <h3>字形结构</h3>
              <p>{dictionaryData.components}</p>
            </>
          ) : (
            <div>请输入要查询的汉字</div>
          )}
        </CharacterInfo>
      </Grid>
    </Container>
  );
};

export default CharacterDictionary; 