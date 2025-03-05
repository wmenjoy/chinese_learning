import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  color: #424242;
  margin-bottom: 3rem;
  font-size: 2.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 1rem;
`;

const Card = styled(motion(Link))`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: #424242;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  h2 {
    margin: 1rem 0;
    color: #424242;
  }

  p {
    color: #757575;
    margin-bottom: 1rem;
  }

  &:hover {
    transform: translateY(-5px);
  }
`;

const Icon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const Home: React.FC = () => {
  return (
    <Container>
      <Title>汉字学习助手</Title>
      <Grid>
        <Card 
          to="/character"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon>✍️</Icon>
          <h2>汉字学习</h2>
          <p>练习汉字书写，掌握笔顺规则</p>
        </Card>

        <Card 
          to="/dictionary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon>📚</Icon>
          <h2>汉字词典</h2>
          <p>查询汉字的读音、释义和字源</p>
        </Card>

        <Card 
          to="/pinyin"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon>🔤</Icon>
          <h2>拼音转换</h2>
          <p>将汉字转换为拼音，支持多种声调格式</p>
        </Card>
      </Grid>
    </Container>
  );
};

export default Home; 