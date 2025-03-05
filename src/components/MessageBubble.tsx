import styled from 'styled-components';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  isUser: boolean;
  thinking?: string;
  children: React.ReactNode;
}

const StyledMessageBubble = styled(motion.div)<MessageBubbleProps>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  margin: 8px;
  max-width: 80%;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.thinking ? '#FFB23E20' : props.isUser ? '#007AFF' : '#1C1C1E'};
  color: ${props => props.thinking ? '#FFB23E' : '#FFFFFF'};
  padding: 12px 16px;
  border-radius: 16px;
  word-wrap: break-word;
  white-space: pre-wrap;
`;

export const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ isUser, thinking, children }) => {
  return (
    <StyledMessageBubble
      isUser={isUser}
      thinking={thinking}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </StyledMessageBubble>
  );
};

export default MessageBubble; 