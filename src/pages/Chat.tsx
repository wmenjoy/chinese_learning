import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage, ChatMessage } from '../services/chatService';
import { SUPPORTED_MODELS, SupportedModel } from '../services/ollamaService';
import { theme } from '../styles/theme';
import {
  PageContainer,
  PageTitle,
  Button as BaseButton,
  TextArea,
  Select
} from '../components/common';

const ChatContainer = styled(PageContainer)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  padding: ${theme.spacing.md};
  
  @media (max-width: 428px) { /* iPhone Pro Max width */
    padding: ${theme.spacing.sm};
  }
`;

const ChatWindow = styled.div`
  flex: 1;
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.medium};
  margin-bottom: ${theme.spacing.xl};
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  min-height: 60vh;
  max-height: calc(100vh - 280px);
  position: relative;

  @media (max-width: 428px) {
    padding: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.md};
    min-height: calc(100vh - 280px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      to right,
      ${theme.colors.accent.blue},
      ${theme.colors.accent.purple}
    );
    border-radius: ${theme.borderRadius.small} ${theme.borderRadius.small} 0 0;
  }
`;

const MessageBubble = styled(motion.div)<{ isUser: boolean }>`
  max-width: 85%;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.large};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background: ${props => props.isUser ? theme.colors.primary : theme.colors.surface};
  color: ${props => props.isUser ? 'white' : theme.colors.text.primary};
  box-shadow: ${theme.shadows.small};
  position: relative;
  margin: ${theme.spacing.xs} 0;
  word-break: break-word;

  @media (max-width: 428px) {
    max-width: 90%;
    padding: ${theme.spacing.md};
    font-size: ${theme.typography.fontSize.sm};
  }

  &::before {
    content: '';
    position: absolute;
    bottom: -${theme.spacing.xs};
    ${props => props.isUser ? 'right' : 'left'}: ${theme.spacing.md};
    width: ${theme.spacing.md};
    height: ${theme.spacing.md};
    background: inherit;
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    transform: ${props => props.isUser ? 'rotate(45deg)' : 'rotate(-45deg)'};
  }
`;

const ControlPanel = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  flex-wrap: wrap;

  @media (max-width: 428px) {
    gap: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.md};
  }
`;

const ThinkingModeToggle = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  user-select: none;
  padding: ${theme.spacing.md};
  border: 2px solid ${theme.colors.primaryLight};
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.surface};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${theme.colors.primary};
  }

  input {
    width: 1.2rem;
    height: 1.2rem;
    cursor: pointer;
  }
`;

const InputContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: flex-start;
  position: sticky;
  bottom: 0;
  background: ${theme.colors.background};
  padding: ${theme.spacing.sm} 0;

  @media (max-width: 428px) {
    gap: ${theme.spacing.sm};
  }
`;

const SendButton = styled(BaseButton)`
  height: 100px;
  min-width: 80px;

  @media (max-width: 428px) {
    height: 80px;
    min-width: 60px;
    font-size: ${theme.typography.fontSize.sm};
  }
`;

const Timestamp = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.light};
  margin-top: ${theme.spacing.sm};
  display: block;
`;

const LoadingDots = styled.div`
  display: inline-block;
  
  &::after {
    content: '...';
    animation: dots 1.5s steps(4, end) infinite;
  }

  @keyframes dots {
    0%, 20% { content: '.'; }
    40% { content: '..'; }
    60% { content: '...'; }
    80%, 100% { content: ''; }
  }
`;

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
};

const ThinkingContent = styled.div`
  background: ${theme.colors.accent.purple}10;
  border-left: 4px solid ${theme.colors.accent.purple};
  padding: ${theme.spacing.md};
  margin: ${theme.spacing.sm} 0;
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  white-space: pre-wrap;

  @media (max-width: 428px) {
    font-size: ${theme.typography.fontSize.xs};
    padding: ${theme.spacing.sm};
  }
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

interface ExtendedChatMessage extends ChatMessage {
  thinking?: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState<SupportedModel>('deepseek-r1:70b');
  const [isLoading, setIsLoading] = useState(false);
  const [useThinkingMode, setUseThinkingMode] = useState(true);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ExtendedChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const recentMessages = messages.slice(-4);
      const context = recentMessages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      if (useThinkingMode) {
        const thinkingMessage: ExtendedChatMessage = {
          role: 'thinking',
          content: '让我思考一下这个问题...',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, thinkingMessage]);
      }

      const response = await sendChatMessage(
        userMessage.content, 
        selectedModel, 
        context,
        useThinkingMode
      );

      if (useThinkingMode) {
        setMessages(prev => prev.filter(msg => msg.role !== 'thinking'));
      }

      // Extract thinking content if present
      let messageContent = response;
      let thinkingContent = '';
      
      const thinkMatch = response.match(/<think>(.*?)<\/think>/s);
      if (thinkMatch) {
        thinkingContent = thinkMatch[1].trim();
        messageContent = response.replace(/<think>.*?<\/think>/s, '').trim();
      }

      const assistantMessage: ExtendedChatMessage = {
        role: 'assistant',
        content: messageContent,
        thinking: thinkingContent,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ExtendedChatMessage = {
        role: 'assistant',
        content: error instanceof Error ? error.message : '发生错误，请重试',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <ChatContainer>
      <PageTitle>智能对话</PageTitle>
      <ControlPanel>
        <Select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as SupportedModel)}
        >
          {Object.entries(SUPPORTED_MODELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <ThinkingModeToggle>
          <input
            type="checkbox"
            checked={useThinkingMode}
            onChange={(e) => setUseThinkingMode(e.target.checked)}
          />
          思考模式
        </ThinkingModeToggle>
      </ControlPanel>
      <ChatWindow ref={chatWindowRef}>
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              isUser={message.role === 'user'}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                background: message.role === 'thinking' ? `${theme.colors.accent.blue}20` : undefined,
                color: message.role === 'thinking' ? theme.colors.accent.blue : undefined
              }}
            >
              <MessageContent>
                {message.content}
                {message.thinking && (
                  <ThinkingContent>
                    思考过程：
                    {message.thinking}
                  </ThinkingContent>
                )}
                <Timestamp>{formatTimestamp(message.timestamp)}</Timestamp>
              </MessageContent>
            </MessageBubble>
          ))}
        </AnimatePresence>
        {isLoading && !messages.some(m => m.role === 'thinking') && (
          <MessageBubble
            isUser={false}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
          >
            思考中<LoadingDots />
          </MessageBubble>
        )}
      </ChatWindow>
      <InputContainer>
        <TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={useThinkingMode ? "使用思考模式提问..." : "输入消息..."}
          disabled={isLoading}
        />
        <SendButton
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          variant="primary"
        >
          发送
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat; 