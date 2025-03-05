import React, { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { pinyin } from 'pinyin-pro'

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #FFFDF7 0%, #A5D6A7 10%);
  padding: 2rem;
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`

const Title = styled.h1`
  font-size: 2rem;
  color: #424242;
  text-align: center;
  margin-bottom: 2rem;
`

const Card = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`

const InputContainer = styled.div`
  position: relative;
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ClearButton = styled.button`
  background: #E0E0E0;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  align-self: flex-start;
  font-size: 1rem;
  color: #424242;
  cursor: pointer;
  transition: background 0.2s;
  height: 42px;

  &:hover {
    background: #BDBDBD;
  }

  &:disabled {
    background: #F5F5F5;
    cursor: not-allowed;
    color: #9E9E9E;
  }
`;

const TextArea = styled.textarea`
  flex: 1;
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 2px solid #FFD54F;
  border-radius: 0.5rem;
  font-size: 1.25rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #FFC107;
    box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2);
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`

const Option = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`

const Result = styled.div`
  margin-top: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
`

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
`

const Button = styled(motion.button)`
  background: #A5D6A7;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.8rem 2rem;
  font-size: 1.2rem;
  cursor: pointer;
  
  &:hover {
    background: #81C784;
  }

  &:disabled {
    background: #E0E0E0;
    cursor: not-allowed;
  }
`

const ExampleButton = styled(Button)`
  background: #81D4FA;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  
  &:hover {
    background: #4FC3F7;
  }
`

const ResultText = styled.div`
  margin-bottom: 0.5rem;
  
  .word {
    display: inline-block;
    text-align: center;
    margin: 0 0.2rem;
    
    .hanzi {
      font-size: 1.2rem;
      color: #424242;
      margin-bottom: 0.2rem;
    }
    
    .pinyin {
      font-size: 0.9rem;
      color: #FF4081;
    }
  }
`

const ResultArea = styled.div<{ $isEmpty: boolean }>`
  padding: 1rem;
  min-height: 100px;
  border: 1px solid ${props => props.$isEmpty ? '#E0E0E0' : '#A5D6A7'};
  border-radius: 0.5rem;
  margin-top: 1rem;
  background: ${props => props.$isEmpty ? '#F5F5F5' : 'white'};
`

interface PinyinResult {
  hanzi: string;
  pinyin: string;
}

const examples = [
  '你好，世界！',
  '学习汉语很有趣',
  '我爱中国',
  '春眠不觉晓，处处闻啼鸟'
]

const PinyinConverter: React.FC = () => {
  const [text, setText] = useState('')
  const [results, setResults] = useState<PinyinResult[][]>([])
  const [toneType, setToneType] = useState<'symbol' | 'num' | 'none'>('symbol')
  const [showSpaces, setShowSpaces] = useState(true)

  const convertToPinyin = (text: string) => {
    if (!text) return '';

    return text.split('').map(char => {
      if (/[\u4e00-\u9fa5]/.test(char)) {
        return pinyin(char, {
          toneType,
          type: 'string',
          nonZh: 'consecutive'
        });
      }
      return char;
    }).join(showSpaces ? ' ' : '');
  };

  const handleConvert = () => {
    if (!text.trim()) return;

    const sentences = text.split(/[,，。！？\n]/).filter(Boolean);
    const convertedResults: PinyinResult[][] = sentences.map((sentence: string) => {
      const chars = Array.from(sentence.trim());
      return chars.map((char: string) => ({
        hanzi: char,
        pinyin: pinyin(char, {
          toneType: toneType,
          type: 'string',
          nonZh: 'consecutive'
        })
      }));
    });

    setResults(convertedResults);
  };

  const handleExample = (example: string) => {
    setText(example);
    setTimeout(handleConvert, 0);
  };

  const handleClear = () => {
    setText('');
    setResults([]);
  };

  return (
    <PageContainer>
      <Container>
        <Title>拼音转换</Title>
        <Card>
          <h1>拼音转换</h1>
          <InputContainer>
            <TextArea
              placeholder="输入汉字..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <ClearButton 
              onClick={handleClear}
              disabled={!text}
            >
              清空
            </ClearButton>
          </InputContainer>
          <OptionsContainer>
            <Option>
              <input
                type="radio"
                name="toneType"
                checked={toneType === 'symbol'}
                onChange={() => setToneType('symbol')}
              />
              声调符号（ā）
            </Option>
            <Option>
              <input
                type="radio"
                name="toneType"
                checked={toneType === 'num'}
                onChange={() => setToneType('num')}
              />
              数字声调（a1）
            </Option>
            <Option>
              <input
                type="radio"
                name="toneType"
                checked={toneType === 'none'}
                onChange={() => setToneType('none')}
              />
              无声调（a）
            </Option>
            <Option>
              <input
                type="checkbox"
                checked={showSpaces}
                onChange={(e) => setShowSpaces(e.target.checked)}
              />
              显示空格
            </Option>
          </OptionsContainer>
          <ButtonGroup>
            <Button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConvert}
              disabled={!text.trim()}
            >
              转换为拼音
            </Button>
          </ButtonGroup>
          <div>
            <h3>示例：</h3>
            <ButtonGroup>
              {examples.map((example, index) => (
                <ExampleButton
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleExample(example)}
                >
                  {example}
                </ExampleButton>
              ))}
            </ButtonGroup>
          </div>
          {text && (
            <Result>
              <div>{convertToPinyin(text)}</div>
              <div style={{ marginTop: '1rem' }}>{text}</div>
            </Result>
          )}
          <h2>转换结果</h2>
          <ResultArea $isEmpty={results.length === 0}>
            {results.length > 0 ? (
              results.map((sentence: PinyinResult[], sIndex: number) => (
                <ResultText key={sIndex}>
                  {sentence.map((item: PinyinResult, cIndex: number) => (
                    <span className="word" key={`${sIndex}-${cIndex}`}>
                      <div className="hanzi">{item.hanzi}</div>
                      <div className="pinyin">{item.pinyin}</div>
                    </span>
                  ))}
                </ResultText>
              ))
            ) : (
              '转换结果将显示在这里...'
            )}
          </ResultArea>
        </Card>
      </Container>
    </PageContainer>
  )
}

export default PinyinConverter 