import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PageContainer, PageTitle } from '../components/common';

const GameContainer = styled.div`
  padding: 2rem;
  text-align: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 60px);
  gap: 8px;
  margin: 2rem auto;
  justify-content: center;
`;

const Cell = styled.input`
  width: 60px;
  height: 60px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 24px;
  text-align: center;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #6366f1;
  }

  &.correct {
    background: #e6ffe6;
    border-color: #4CAF50;
  }

  &.incorrect {
    background: #ffe6e6;
    border-color: #f44336;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 4px;
  border: none;
  background: #6366f1;
  color: white;
  cursor: pointer;
  margin: 10px;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const ScoreDisplay = styled.div`
  font-size: 18px;
  margin: 1rem 0;
  color: #666;
`;

const HintText = styled.div`
  margin: 1rem 0;
  color: #666;
  font-size: 16px;
`;

const Message = styled.div<{ type: 'success' | 'error' | 'info' }>`
  margin: 1rem 0;
  padding: 10px;
  border-radius: 4px;
  font-size: 16px;
  color: white;
  background-color: ${props => 
    props.type === 'success' ? '#4CAF50' : 
    props.type === 'error' ? '#f44336' : 
    '#2196F3'};
`;

// 扩展成语数据
const IDIOMS = [
  { idiom: '一举两得', hint: '一个行动得到两个好处', explanation: '形容一个行动能得到两种好处。' },
  { idiom: '守株待兔', hint: '比喻死守狭隘经验，不知变通', explanation: '比喻死守狭隘经验，不知变通。出自寓言故事，讲述农夫等待撞树的兔子。' },
  { idiom: '画蛇添足', hint: '比喻做多余的事情，反而不好', explanation: '比喻做事超出需要，反而不好。源自楚国的一个寓言故事。' },
  { idiom: '四面楚歌', hint: '形容被包围、孤立无援的处境', explanation: '比喻四面受敌、孤立无援的困境。源自历史故事楚汉相争。' },
  { idiom: '望梅止渴', hint: '望着梅子解渴', explanation: '比喻愿望无法实现，用空想安慰自己。源自三国时期曹操行军的故事。' },
  // 可以继续添加更多成语
];

const ChineseIdiomGame: React.FC = () => {
  const [currentIdiom, setCurrentIdiom] = useState<string>('');
  const [userInput, setUserInput] = useState<string[]>([]);
  const [hint, setHint] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' }>({ text: '', type: 'info' });
  const [explanation, setExplanation] = useState<string>('');

  const initializeGame = () => {
    const randomIdiom = IDIOMS[Math.floor(Math.random() * IDIOMS.length)];
    setCurrentIdiom(randomIdiom.idiom);
    setHint(randomIdiom.hint);
    setExplanation(randomIdiom.explanation);
    setUserInput(new Array(4).fill(''));
    setMessage({ text: '', type: 'info' });
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newInput = [...userInput];
    newInput[index] = value;
    setUserInput(newInput);
  };

  const handleCompositionEnd = (index: number) => {
    // 如果不是最后一个格子，自动跳转到下一个
    if (index < 3) {
      const nextInput = document.querySelector(
        `input[data-index="${index + 1}"]`
      ) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const checkAnswer = () => {
    const userAnswer = userInput.join('');
    if (userAnswer.length !== 4) {
      setMessage({ text: '请填写完整的成语', type: 'error' });
      return;
    }

    if (userAnswer === currentIdiom) {
      setScore(score + 10);
      setMessage({ 
        text: `正确！${explanation}`, 
        type: 'success' 
      });
      setTimeout(() => {
        initializeGame();
      }, 3000);
    } else {
      // 找出正确和错误的字
      const correctChars = userInput.filter((char, index) => char === currentIdiom[index]).length;
      setMessage({ 
        text: `还不对哦，已经对了${correctChars}个字，再试试看！`, 
        type: 'error' 
      });
    }
  };

  return (
    <PageContainer>
      <PageTitle>成语填字游戏</PageTitle>
      <GameContainer>
        <ScoreDisplay>得分: {score}</ScoreDisplay>
        <HintText>提示: {hint}</HintText>
        {message.text && <Message type={message.type}>{message.text}</Message>}
        <Grid>
          {userInput.map((char, index) => (
            <Cell
              key={index}
              data-index={index}
              value={char}
              onChange={(e) => handleInputChange(index, e)}
              onCompositionEnd={() => handleCompositionEnd(index)}
              maxLength={1}
            />
          ))}
        </Grid>
        <Button onClick={checkAnswer}>检查答案</Button>
        <Button onClick={initializeGame}>换一个</Button>
      </GameContainer>
    </PageContainer>
  );
};

export default ChineseIdiomGame; 