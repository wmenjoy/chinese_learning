import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import HanziWriter from 'hanzi-writer';
import { CharacterData } from '../types/character';
import { getCharacterData } from '../services/characterService';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
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
  margin-bottom: 0.5rem;
  transition: background 0.2s;

  &:hover {
    background: #FFC107;
  }
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #FFD54F;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EtymologySection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
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

const CharacterDictionary: React.FC = () => {
  const [character, setCharacter] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [writer, setWriter] = useState<HanziWriter | null>(null);
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const writerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCharacterData = async () => {
      if (!character) {
        setCharacterData(null);
        return;
      }
      setLoading(true);
      try {
        const data = await getCharacterData(character);
        setCharacterData(data);
      } catch (error) {
        console.error('Error fetching character data:', error);
      }
      setLoading(false);
    };

    fetchCharacterData();
  }, [character]);

  useEffect(() => {
    if (writerContainerRef.current) {
      // 清理旧的writer实例
      if (writer) {
        writer.setCharacter(character);
      } else if (character) {
        // 确保容器是空的
        writerContainerRef.current.innerHTML = '';
        
        // 创建新的writer实例
        const newWriter = HanziWriter.create(writerContainerRef.current, character, {
          width: 300,
          height: 300,
          padding: 5,
          showOutline: true,
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 500,
        });
        setWriter(newWriter);
      }
    }

    // 清理函数
    return () => {
      if (writerContainerRef.current) {
        writerContainerRef.current.innerHTML = '';
      }
    };
  }, [character, writer]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    
    // 清空输入框时重置状态
    if (!value) {
      setCharacter('');
      setCharacterData(null);
      if (writerContainerRef.current) {
        writerContainerRef.current.innerHTML = '';
      }
      setWriter(null);
      return;
    }
    
    // 只在输入单个汉字时更新
    if (value.length === 1 && /[\u4e00-\u9fa5]/.test(value)) {
      setCharacter(value);
    }
  };

  const handleAnimate = () => {
    if (writer) {
      writer.animateCharacter();
    }
  };

  const handlePractice = () => {
    if (writer) {
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
        onChange={handleSearch}
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
      <Grid>
        <CharacterDisplay>
          <GridBackground>
            <div className="diagonal"></div>
            <div 
              ref={writerContainerRef}
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
            <Button 
              onClick={handleAnimate}
              disabled={!character}
            >
              演示笔画
            </Button>
            <Button 
              onClick={handlePractice}
              disabled={!character}
            >
              练习
            </Button>
          </div>
        </CharacterDisplay>
        <CharacterInfo>
          {loading ? (
            <LoadingSpinner />
          ) : characterData ? (
            <>
              <h2>汉字信息</h2>
              <div>
                <h3>拼音</h3>
                <p>{characterData.pinyin}</p>
                <h3>部首</h3>
                <p>{characterData.radical}</p>
                <h3>笔画数</h3>
                <p>{characterData.strokeCount}</p>
                <h3>释义</h3>
                {characterData.meanings.map((meaning, index) => (
                  <p key={index}>{index + 1}. {meaning}</p>
                ))}
                <h3>常用词组</h3>
                <p>{characterData.commonWords.join('、')}</p>
                {characterData.etymology && (
                  <EtymologySection>
                    <h3>字源</h3>
                    <p>类型：{characterData.etymology.type}</p>
                    <p>{characterData.etymology.description}</p>
                    {characterData.etymology.image && (
                      <img 
                        src={characterData.etymology.image} 
                        alt={`${character}的字源图`}
                        style={{ maxWidth: '200px', marginTop: '1rem' }}
                      />
                    )}
                  </EtymologySection>
                )}
              </div>
            </>
          ) : (
            <p>{character ? '未找到汉字信息' : '请输入要查询的汉字'}</p>
          )}
        </CharacterInfo>
      </Grid>
    </Container>
  );
};

export default CharacterDictionary; 