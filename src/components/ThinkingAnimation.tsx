import React from 'react';
import styled, { keyframes } from 'styled-components';

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Dot = styled.div`
  width: 6px;
  height: 6px;
  background-color: #FFB23E;
  border-radius: 50%;
  animation: ${bounce} 1.4s infinite ease-in-out both;

  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }
  &:nth-child(3) { animation-delay: 0s; }
`;

const Text = styled.span`
  color: #FFB23E;
  margin-right: 8px;
`;

export const ThinkingAnimation: React.FC = () => {
  return (
    <Container>
      <Text>思考中</Text>
      <Dot />
      <Dot />
      <Dot />
    </Container>
  );
};

export default ThinkingAnimation; 