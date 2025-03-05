import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../styles/theme';
import {
  PageContainer,
  PageTitle,
  Grid,
  Card,
  IconWrapper,
  Badge
} from '../components/common';

const StyledCard = styled(Card)`
  text-decoration: none;
  color: ${theme.colors.text.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      to right,
      ${theme.colors.accent.pink},
      ${theme.colors.accent.purple}
    );
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover::before {
    transform: scaleX(1);
  }

  h2 {
    font-size: ${theme.typography.fontSize.xl};
    margin: ${theme.spacing.md} 0;
    font-family: ${theme.typography.fontFamily.decorative};
  }

  p {
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing.md};
    line-height: 1.6;
  }
`;

const FloatingIcon = styled(IconWrapper)`
  animation: ${theme.animations.float} infinite;
  font-size: 4rem;
`;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

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
        <StyledCard
          as={Link}
          to="/character"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <FloatingIcon>✍️</FloatingIcon>
          <h2>汉字学习</h2>
          <p>练习汉字书写，掌握笔顺规则</p>
          <Badge color="pink">互动练习</Badge>
        </StyledCard>

        <StyledCard
          as={Link}
          to="/dictionary"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <FloatingIcon>📚</FloatingIcon>
          <h2>汉字词典</h2>
          <p>查询汉字的读音、释义和字源</p>
          <Badge color="blue">智能查询</Badge>
        </StyledCard>

        <StyledCard
          as={Link}
          to="/pinyin"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <FloatingIcon>🔤</FloatingIcon>
          <h2>拼音转换</h2>
          <p>将汉字转换为拼音，支持多种声调格式</p>
          <Badge color="green">实用工具</Badge>
        </StyledCard>

        <StyledCard
          as={Link}
          to="/chat"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <FloatingIcon>💬</FloatingIcon>
          <h2>智能对话</h2>
          <p>与AI助手进行中文学习对话</p>
          <Badge color="purple">AI助手</Badge>
        </StyledCard>
      </Grid>
    </PageContainer>
  );
};

export default Home; 