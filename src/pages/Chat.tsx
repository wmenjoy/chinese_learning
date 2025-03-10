import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Markdown } from '../components/markdown';
import { sendChatMessage, ChatMessage } from '../services/chatService';
import { SUPPORTED_MODELS } from '../services/ollamaService';
import { OPENROUTER_MODELS } from '../services/openRouterService';
import { theme } from '../styles/theme';
import {
  PageContainer,
  PageTitle,
  Button as BaseButton,
  TextArea,
  Select
} from '../components/common';

const isIOS = () => {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
};

const ChatContainer = styled(PageContainer)`
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #fff6e5, #fff9f9);
  min-height: 100vh;
  padding: ${theme.spacing.md};
  gap: ${theme.spacing.xl};

  @media (max-width: 428px) {
    padding: ${theme.spacing.xs};
    gap: ${theme.spacing.md};
  }
`;

const PageContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};

  @media (max-width: 428px) {
    gap: ${theme.spacing.md};
  }
`;

const ChatWindow = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  box-shadow: 0 8px 32px rgba(255, 188, 66, 0.1);
  margin-bottom: ${theme.spacing.xl};
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  border: 1px solid rgba(255, 188, 66, 0.2);
  min-height: 60vh;

  @media (max-width: 428px) {
    padding: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.sm};
    border-radius: ${theme.borderRadius.medium};
    gap: ${theme.spacing.sm};
    min-height: 70vh;
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
      #FFB23E,
      #FFD93D
    );
    border-radius: ${theme.borderRadius.small} ${theme.borderRadius.small} 0 0;
  }

  scrollbar-width: thin;
  scrollbar-color: rgba(255, 188, 66, 0.3) transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 188, 66, 0.3);
    border-radius: 20px;
    border: 2px solid transparent;
  }
`;

const MessageBubble = styled(motion.div)<{ isUser: boolean }>`
  max-width: 85%;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.large};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background: ${props => props.isUser ? '#FFB23E' : '#FFFFFF'};
  color: ${props => props.isUser ? '#FFFFFF' : theme.colors.text.primary};
  box-shadow: ${props => props.isUser ? 
    '0 4px 12px rgba(255, 178, 62, 0.2)' : 
    '0 4px 12px rgba(0, 0, 0, 0.05)'};
  position: relative;
  margin: ${theme.spacing.xs} 0;
  word-break: break-word;
  border: ${props => props.isUser ? 'none' : '1px solid rgba(255, 188, 66, 0.1)'};

  @media (max-width: 428px) {
    max-width: 92%;
    padding: ${theme.spacing.md} ${theme.spacing.md};
    font-size: 0.95em;
    border-radius: ${theme.borderRadius.medium};
    margin: ${theme.spacing.xs} 0;
  }

  &::before {
    content: '';
    position: absolute;
    bottom: -8px;
    ${props => props.isUser ? 'right' : 'left'}: 24px;
    width: 16px;
    height: 16px;
    background: inherit;
    border: inherit;
    border-right: ${props => props.isUser ? 'none' : '1px solid rgba(255, 188, 66, 0.1)'};
    border-bottom: ${props => props.isUser ? 'none' : '1px solid rgba(255, 188, 66, 0.1)'};
    transform: ${props => props.isUser ? 
      'rotate(45deg) translate(-8px, 0)' : 
      'rotate(45deg) translate(8px, 0)'};
  }
`;

const InputSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  border-top: 1px solid rgba(255, 188, 66, 0.2);
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin: 0 -${theme.spacing.xl};

  @media (max-width: 428px) {
    padding: ${theme.spacing.sm};
    margin: 0 -${theme.spacing.xs};
    gap: ${theme.spacing.sm};
    border-top: 2px solid rgba(255, 188, 66, 0.2);
  }
`;

const ControlsRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: center;

  @media (max-width: 428px) {
    gap: ${theme.spacing.sm};
    flex-wrap: wrap;
  }
`;

const StyledSelect = styled(Select)`
  flex: 1;
  max-width: 200px;
  height: 32px;
  border: 1px solid rgba(255, 188, 66, 0.2);
  border-radius: ${theme.borderRadius.medium};
  padding: 0 ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  color: #666;
  background: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover, &:focus {
    border-color: #FFB23E;
    box-shadow: 0 0 0 2px rgba(255, 188, 66, 0.1);
  }

  @media (max-width: 428px) {
    max-width: none;
    flex: 1 1 100%;
    order: 2;
    height: 36px;
    font-size: ${theme.typography.fontSize.md};
  }

  option {
    padding: ${theme.spacing.sm};
  }
`;

const ThinkingModeButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid rgba(255, 188, 66, 0.2);
  border-radius: ${theme.borderRadius.medium};
  background: ${props => props.$active ? '#FFF9E6' : '#FFFFFF'};
  color: #666;
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  @media (max-width: 428px) {
    order: 1;
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    font-size: ${theme.typography.fontSize.md};
    flex: 0 0 auto;
  }

  &:hover {
    border-color: #FFB23E;
    background: #FFF9E6;
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${props => props.$active ? '#FFB23E' : '#666'};

    @media (max-width: 428px) {
      width: 20px;
      height: 20px;
    }
  }
`;

const InputContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  align-items: flex-end;
  background: #FFFFFF;
  border: 2px solid rgba(255, 188, 66, 0.2);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.sm};
  transition: all 0.2s ease;

  @media (max-width: 428px) {
    padding: ${theme.spacing.xs};
    border-radius: ${theme.borderRadius.medium};
  }

  &:focus-within {
    border-color: #FFB23E;
    box-shadow: 0 0 0 3px rgba(255, 188, 66, 0.1);
  }
`;

const StyledTextArea = styled(TextArea)`
  flex: 1;
  min-height: 24px;
  max-height: 200px;
  padding: ${theme.spacing.sm};
  border: none;
  background: transparent;
  font-size: ${theme.typography.fontSize.md};
  line-height: 1.5;
  resize: none;

  @media (max-width: 428px) {
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    font-size: 16px;
    min-height: 40px;
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    background: transparent;
    cursor: not-allowed;
  }

  &::placeholder {
    color: rgba(102, 102, 102, 0.6);
  }
`;

const SendButton = styled(BaseButton)<{ $variant?: 'primary' }>`
  height: 40px;
  min-width: 40px;
  padding: 0;
  border-radius: ${theme.borderRadius.medium};
  background: #FFB23E;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: none;

  @media (max-width: 428px) {
    height: 44px;
    min-width: 44px;
    border-radius: ${theme.borderRadius.small};
  }

  &:hover:not(:disabled) {
    background: #FF9F0A;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 188, 66, 0.3);
  }

  &:disabled {
    background: rgba(255, 188, 66, 0.3);
    cursor: not-allowed;
  }

  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;

    @media (max-width: 428px) {
      width: 24px;
      height: 24px;
    }
  }

  &:hover svg {
    transform: rotate(-12deg);
  }
`;

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22 2L11 13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ThinkingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2v-2zm1.61-9.96c-2.06-.3-3.88.97-4.43 2.79-.18.58.26 1.17.87 1.17h.2c.41 0 .74-.29.88-.67.32-.89 1.27-1.5 2.3-1.28.95.2 1.65 1.13 1.57 2.1-.1 1.34-1.62 1.63-2.45 2.88 0 .01-.01.01-.01.02-.01.02-.02.03-.03.05-.09.15-.18.32-.25.5-.01.03-.03.05-.04.08-.01.02-.01.04-.02.07-.12.34-.2.75-.2 1.25h2c0-.42.11-.77.28-1.07.02-.03.03-.06.05-.09.08-.14.18-.27.28-.39.01-.01.02-.03.03-.04.1-.12.21-.23.33-.34.96-.91 2.26-1.65 1.99-3.56-.24-1.74-1.61-3.21-3.35-3.47z"
      fill="currentColor"
    />
  </svg>
);

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
  background: rgba(255, 188, 66, 0.05);
  border-left: 4px solid #FFB23E;
  padding: ${theme.spacing.md};
  margin: ${theme.spacing.sm} 0;
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography.fontSize.sm};
  color: #666;
  white-space: pre-wrap;

  pre {
    background: none;
    padding: 0;
    margin: 0;
    border: none;
  }

  code {
    background: none;
    padding: 0;
    color: inherit;
  }

  @media (max-width: 428px) {
    font-size: ${theme.typography.fontSize.xs};
    padding: ${theme.spacing.sm};
  }
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  
  ${isIOS() && `
    white-space: pre-wrap;
    word-break: break-word;
  `}
`;

const MarkdownContent = styled.div`
  font-size: ${theme.typography.fontSize.md};
  line-height: 1.6;
  overflow-wrap: break-word;

  @media (max-width: 428px) {
    font-size: ${theme.typography.fontSize.sm};
    line-height: 1.5;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 1em 0 0.5em;
    color: #333;
    font-weight: 600;

    @media (max-width: 428px) {
      margin: 0.75em 0 0.4em;
    }
  }

  p {
    margin: 0.5em 0;
    color: #444;
  }

  code {
    background: rgba(255, 188, 66, 0.1);
    padding: 0.2em 0.4em;
    border-radius: ${theme.borderRadius.small};
    font-family: ${theme.typography.fontFamily.main};
    font-size: 0.9em;
    color: #FF9F0A;
  }

  pre {
    background: #FFF9E6;
    padding: 1em;
    border-radius: ${theme.borderRadius.medium};
    overflow-x: auto;
    margin: 1em 0;
    border: 1px solid rgba(255, 188, 66, 0.2);

    @media (max-width: 428px) {
      padding: 0.75em;
      margin: 0.75em 0;
      font-size: 0.9em;
    }

    code {
      background: none;
      padding: 0;
      color: #666;
    }
  }

  ul, ol {
    margin: 0.5em 0;
    padding-left: 1.5em;
    color: #444;
  }

  li {
    margin: 0.3em 0;
  }

  blockquote {
    margin: 1em 0;
    padding-left: 1em;
    border-left: 4px solid #FFB23E;
    color: #666;
    background: rgba(255, 188, 66, 0.05);
    border-radius: 0 ${theme.borderRadius.medium} ${theme.borderRadius.medium} 0;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    background: #FFFFFF;
  }

  th, td {
    border: 1px solid rgba(255, 188, 66, 0.2);
    padding: 0.5em;
    text-align: left;
  }

  th {
    background: #FFF9E6;
    color: #666;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: ${theme.borderRadius.medium};
    border: 1px solid rgba(255, 188, 66, 0.2);

    @media (max-width: 428px) {
      border-radius: ${theme.borderRadius.small};
    }
  }

  a {
    color: #FF9F0A;
    text-decoration: none;
    transition: all 0.2s ease;

    &:hover {
      color: #FFB23E;
      text-decoration: underline;
    }
  }

  hr {
    border: none;
    border-top: 2px dashed rgba(255, 188, 66, 0.3);
    margin: 1em 0;
  }
`;

interface ExtendedChatMessage extends ChatMessage {
  thinking?: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('deepseek-chat-free');
  const [isLoading, setIsLoading] = useState(false);
  const [useThinkingMode, setUseThinkingMode] = useState(true);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [isIOSPlatform] = useState(() => isIOS());

  useEffect(() => {
    
    return () => {
    };
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatWindowRef.current) {
        try {
          chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        } catch (error) {
          console.error('Error scrolling to bottom:', error);
        }
      }
    };

    // 在消息更新时滚动到底部
    scrollToBottom();

    // 在键盘弹出/收起时也滚动到底部
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(scrollToBottom, 100);
      }
    };

    const handleResize = () => {
      scrollToBottom();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;


    try {
      // 在发送消息时立即滚动到底部
      if (chatWindowRef.current) {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
      }

      const userMessage: ExtendedChatMessage = {
        role: 'user',
        content: inputValue.trim(),
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setIsLoading(true);

      const recentMessages = messages.slice(-4);
      const context = recentMessages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const assistantMessage: ExtendedChatMessage = {
        role: 'assistant',
        content: '',
        thinking: useThinkingMode ? '' : undefined,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

      let currentThinking = '';
      let currentContent = '';

      await sendChatMessage(
        userMessage.content,
        selectedModel,
        context,
        useThinkingMode,
        {
          onContent: (content: string) => {
            currentContent += content;
            setMessages(prev => {
              const updated = [...prev];
              const lastMessage = updated[updated.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                lastMessage.content = currentContent;
              }
              return updated;
            });
          },
          onThinking: (thinking: string) => {
            if (useThinkingMode) {
              currentThinking = thinking;
              setMessages(prev => {
                const updated = [...prev];
                const lastMessage = updated[updated.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  lastMessage.thinking = currentThinking;
                }
                return updated;
              });
            }
          },
          onError: (error: Error) => {
            console.error('Error in chat stream:', error);
            throw error;
          },
          onComplete: () => {
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage = error instanceof Error ? 
        `${error.name}: ${error.message}\nStack: ${error.stack}` : 
        '未知错误';
      
      console.error('Detailed error:', errorMessage);
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '抱歉，发生错误：' + errorMessage,
          timestamp: Date.now()
        }
      ]);
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
      <PageContent>
        <PageTitle>智能对话</PageTitle>
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
                  background: message.role === 'thinking' ? '#FFB23E20' : undefined,
                  color: message.role === 'thinking' ? '#FFB23E' : undefined
                }}
              >
                <MessageContent>
                  <MarkdownContent>
                    {(() => {
                      try {
                        if (isIOSPlatform) {
                          // On iOS, render plain text with line breaks
                          return <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>;
                        }
                        return <Markdown content={message.content} />;
                      } catch (error) {
                        console.error('Markdown rendering error:', error);
                        return <div>{message.content}</div>;
                      }
                    })()}
                  </MarkdownContent>
                  {message.thinking && (
                    <ThinkingContent>
                      思考过程：
                      {(() => {
                        try {
                          if (isIOSPlatform) {
                            // On iOS, render plain text with line breaks
                            return <div style={{ whiteSpace: 'pre-wrap' }}>{message.thinking}</div>;
                          }
                          return <Markdown content={message.thinking} />;
                        } catch (error) {
                          console.error('Thinking markdown rendering error:', error);
                          return <div>{message.thinking}</div>;
                        }
                      })()}
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
        <InputSection>
          <ControlsRow>
            <StyledSelect
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <optgroup label="OpenRouter Models">
                {Object.entries(OPENROUTER_MODELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Local Models">
                {Object.entries(SUPPORTED_MODELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </optgroup>
            </StyledSelect>
            <ThinkingModeButton
              $active={useThinkingMode}
              onClick={() => setUseThinkingMode(!useThinkingMode)}
              title={useThinkingMode ? "关闭思考模式" : "开启思考模式"}
            >
              <ThinkingIcon />
              思考模式
            </ThinkingModeButton>
          </ControlsRow>
          <InputContainer>
            <StyledTextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={useThinkingMode ? "使用思考模式提问..." : "输入消息..."}
              disabled={isLoading}
              rows={1}
            />
            <SendButton
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              $variant="primary"
              title="发送消息"
            >
              <SendIcon />
            </SendButton>
          </InputContainer>
        </InputSection>
      </PageContent>
    </ChatContainer>
  );
};

export default Chat; 