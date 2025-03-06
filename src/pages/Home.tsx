import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../styles/theme';
import {
  PageContainer,
  PageTitle,
  Grid,
  IconWrapper,
  Badge
} from '../components/common';

const StyledCard = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  &:active {
    transform: scale(0.98);
  }

  h2 {
    margin: ${theme.spacing.md} 0;
    color: ${theme.colors.text.primary};
  }

  p {
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing.md};
  }
`;

const FloatingIcon = styled(IconWrapper)`
  animation: ${theme.animations.float} infinite;
  font-size: 4rem;
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
`;

const GameCard = styled(Link)`
  background: #FFFBF5;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  text-decoration: none;
  color: #664022;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }

  h2 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  p {
    color: #666;
  }
`;

const Home: React.FC = () => {
  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PageTitle>汉字学习助手</PageTitle>
      </motion.div>
      <Grid>
        <StyledCard to="/character">
          <FloatingIcon>✍️</FloatingIcon>
          <h2>汉字学习</h2>
          <p>练习汉字书写，掌握笔顺规则</p>
          <Badge color="pink">互动练习</Badge>
        </StyledCard>

        <StyledCard to="/dictionary">
          <FloatingIcon>📚</FloatingIcon>
          <h2>汉字词典</h2>
          <p>查询汉字的读音、释义和字源</p>
          <Badge color="blue">智能查询</Badge>
        </StyledCard>

        <StyledCard to="/pinyin">
          <FloatingIcon>🔤</FloatingIcon>
          <h2>拼音转换</h2>
          <p>将汉字转换为拼音，支持多种声调格式</p>
          <Badge color="green">实用工具</Badge>
        </StyledCard>

        <StyledCard to="/chat">
          <FloatingIcon>💬</FloatingIcon>
          <h2>智能对话</h2>
          <p>与AI助手进行中文学习对话</p>
          <Badge color="purple">AI助手</Badge>
        </StyledCard>

        <StyledCard to="/game">
          <FloatingIcon>🎮</FloatingIcon>
          <h2>成语游戏</h2>
          <p>趣味成语填字游戏，提升成语掌握</p>
          <Badge color="yellow">趣味游戏</Badge>
        </StyledCard>
      </Grid>
      <GameGrid>
        <GameCard to="/idiom-puzzle">
          <h2>成语拼图</h2>
          <p>趣味横向成语拼图游戏</p>
          <Badge color="yellow">趣味游戏</Badge>
        </GameCard>
      </GameGrid>
    </PageContainer>
  );
};

export default Home; 