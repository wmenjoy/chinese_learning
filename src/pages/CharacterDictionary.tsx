import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import HanziWriter from 'hanzi-writer';
import { queryOllama, CharacterExplanation, SUPPORTED_MODELS } from '../services/ollamaService';
import { OllamaModel } from '../types/models';

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

  &::before {
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    transform: translateY(-50%);
  }

  &::after {
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
    transform: translateX(-50%);
  }

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
      width: 424px;
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

const ExamplesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ExampleTag = styled.div`
  background: #E3F2FD;
  color: #1976D2;
  padding: 0.5rem;
  border-radius: 0.3rem;
  text-align: center;
  font-size: 0.9rem;
`;

const EtymologySection = styled.div`
  background: #F5F5F5;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
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

const ModelSelect = styled.select`
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

const CharacterDictionary: React.FC = () => {
  const [character, setCharacter] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [writer, setWriter] = useState<HanziWriter | null>(null);
  const [dictionaryData, setDictionaryData] = useState<CharacterExplanation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<OllamaModel>('llama3:latest');
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
        const data = await queryOllama(character, selectedModel);
        setDictionaryData(data);
      } catch (error) {
        console.error('Error fetching character data:', error);
        setDictionaryData(null);
        setError(error instanceof Error ? error.message : '获取汉字信息失败');
      }
      setLoading(false);
    };

    fetchData();
  }, [character, selectedModel]);

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

  const handleClear = () => {
    setInputValue('');
    setCharacter('');
    setDictionaryData(null);
    cleanupWriter();
  };

  return (
    <Container>
      <h1>汉字词典</h1>
      <InputContainer>
        <SearchInput
          type="text"
          placeholder="输入汉字..."
          onChange={handleSearch}
          value={inputValue}
          autoComplete="off"
        />
        <ClearButton 
          onClick={handleClear}
          disabled={!inputValue}
        >
          清空
        </ClearButton>
      </InputContainer>
      <ModelSelect
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value as OllamaModel)}
      >
        {Object.entries(SUPPORTED_MODELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </ModelSelect>
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
            <div style={{ textAlign: 'center' }}>
              <LoadingSpinner />
              <p style={{ marginTop: '1rem', color: '#757575' }}>正在获取汉字信息...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: '#ff4081', padding: '1rem' }}>
              <h3>出错了</h3>
              <p>{error}</p>
              <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: '#757575' }}>
                请确保：
                <br />1. Ollama 服务已启动
                <br />2. chinese-llama2 模型已安装
                <br />3. 网络连接正常
              </p>
            </div>
          ) : dictionaryData ? (
            <>
              <h2>汉字信息</h2>
              <div>
                <h3>拼音</h3>
                <p>{dictionaryData.pinyin}</p>
                <h3>释义</h3>
                {dictionaryData.meanings.map((meaning, index) => (
                  <div key={index}>
                    <p>{index + 1}. {meaning.definition}</p>
                    {meaning.examples.length > 0 && (
                      <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
                        {meaning.examples.map((example, exIndex) => (
                          <li key={exIndex}>{example}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                <h3>字源</h3>
                <EtymologySection>
                  <p>{dictionaryData.etymology}</p>
                </EtymologySection>
                <h3>常用词组</h3>
                <ExamplesGrid>
                  {dictionaryData.examples.map((example, index) => (
                    <ExampleTag key={index}>{example}</ExampleTag>
                  ))}
                </ExamplesGrid>
                {dictionaryData.components && (
                  <>
                    <h3>字形结构</h3>
                    <p>{dictionaryData.components}</p>
                  </>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#757575', padding: '2rem' }}>
              <p>请输入要查询的汉字</p>
              <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                支持查询：
                <br />- 拼音
                <br />- 字义
                <br />- 字源
                <br />- 常用词组
                <br />- 字形结构
              </p>
            </div>
          )}
        </CharacterInfo>
      </Grid>
    </Container>
  );
};

export default CharacterDictionary; 