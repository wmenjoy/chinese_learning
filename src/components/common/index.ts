import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { motion } from 'framer-motion';

export const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
  min-height: 100vh;
  animation: ${theme.animations.fadeIn};
`;

export const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize.title};
  color: ${theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${theme.spacing.xxl};
  font-family: ${theme.typography.fontFamily.decorative};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -${theme.spacing.md};
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: linear-gradient(
      to right,
      ${theme.colors.accent.pink},
      ${theme.colors.accent.purple}
    );
    border-radius: ${theme.borderRadius.small};
  }
`;

export const Card = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.medium};
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.hover};
  }
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'accent' }>`
  background: ${props => 
    props.variant === 'secondary' ? theme.colors.secondary :
    props.variant === 'accent' ? theme.colors.accent.purple :
    theme.colors.primary
  };
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  font-size: ${theme.typography.fontSize.md};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.medium};
    filter: brightness(1.1);
  }

  &:disabled {
    background: ${theme.colors.text.light};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 2px solid ${theme.colors.primaryLight};
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography.fontSize.md};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryLight}40;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 2px solid ${theme.colors.primaryLight};
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography.fontSize.md};
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryLight}40;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 2px solid ${theme.colors.primaryLight};
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography.fontSize.md};
  cursor: pointer;
  background: white;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryLight}40;
  }
`;

export const Grid = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 'auto-fit'}, minmax(280px, 1fr));
  gap: ${theme.spacing.xl};
  padding: ${theme.spacing.md};
`;

export const Badge = styled.span<{ color?: keyof typeof theme.colors.accent }>`
  background: ${props => theme.colors.accent[props.color || 'blue']}20;
  color: ${props => theme.colors.accent[props.color || 'blue']};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: 600;
`;

export const IconWrapper = styled.div`
  font-size: ${theme.typography.fontSize.xxl};
  margin-bottom: ${theme.spacing.md};
  animation: ${theme.animations.bounce};
`;

export const Divider = styled.hr`
  border: none;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent,
    ${theme.colors.primaryLight},
    transparent
  );
  margin: ${theme.spacing.xl} 0;
`; 