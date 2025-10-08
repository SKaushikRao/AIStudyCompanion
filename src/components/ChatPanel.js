import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Groq from 'groq-sdk';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px;
  min-height: 500px;
  gap: 20px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  min-height: 350px;
  max-height: 400px;
`;

const Message = styled.div`
  margin: 10px 0;
  padding: 15px;
  border-radius: 15px;
  max-width: 80%;
  word-wrap: break-word;
  animation: slideIn 0.3s ease-out;
  position: relative;
  
  ${props => props.isUser ? `
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    margin-left: auto;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: white;
    margin-right: auto;
    border: 1px solid rgba(255, 255, 255, 0.2);
  `}
  
  &:hover {
    transform: translateY(-2px);
    transition: all 0.3s ease;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const TTSButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  color: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 15px 20px;
  border: none;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const SendButton = styled.button`
  padding: 15px 25px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const DoubtModeIndicator = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 30px 50px;
  border-radius: 20px;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
  animation: pulse 2s infinite;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  
  @keyframes pulse {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1);
      box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
    }
    50% {
      transform: translate(-50%, -50%) scale(1.05);
      box-shadow: 0 15px 40px rgba(255, 107, 107, 0.6);
    }
  }
`;

const MicrophoneIcon = styled.div`
  font-size: 24px;
  margin-bottom: 10px;
  animation: bounce 1s infinite;
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

const ChatPanel = ({ messages, setMessages, isDoubtMode, setIsDoubtMode, onDoubtModeTranscript, onTopicChange }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const groq = new Groq({
    apiKey: process.env.REACT_APP_GROQ_API_KEY || '',
    dangerouslyAllowBrowser: true
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle doubt mode transcript
  useEffect(() => {
    if (onDoubtModeTranscript) {
      const userMessage = { text: onDoubtModeTranscript, isUser: true, timestamp: new Date() };
      setMessages(prev => [...prev, userMessage]);
      // Auto-send to AI
      sendDoubtMessage(onDoubtModeTranscript);
    }
  }, [onDoubtModeTranscript]);

  const sendDoubtMessage = async (transcript) => {
    if (!transcript.trim() || isLoading) return;

    setIsLoading(true);

    try {
      console.log('Sending doubt message:', transcript);
      
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an AI study companion. Help students understand concepts, answer questions, and provide educational guidance. Be encouraging and supportive."
          },
          {
            role: "user",
            content: transcript
          }
        ],
        model: "llama-3.1-8b-instant",
        stream: true,
        temperature: 0.7,
        max_tokens: 1000
      });

      let assistantMessage = { text: '', isUser: false, timestamp: new Date() };
      setMessages(prev => [...prev, assistantMessage]);

      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              text: newMessages[newMessages.length - 1].text + content
            };
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error('Error sending doubt message:', error);
      console.error('Error details:', error.message, error.status, error.code);
      setMessages(prev => [...prev, { 
        text: `Sorry, I encountered an error: ${error.message}. Please try again.`, 
        isUser: false, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { text: inputMessage, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Sending message:', currentMessage);
      
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an AI study companion. Help students understand concepts, answer questions, and provide educational guidance. Be encouraging and supportive."
          },
          ...messages.map(msg => ({
            role: msg.isUser ? "user" : "assistant",
            content: msg.text
          })),
          {
            role: "user",
            content: currentMessage
          }
        ],
        model: "llama-3.1-8b-instant",
        stream: true,
        temperature: 0.7,
        max_tokens: 1000
      });

      let assistantMessage = { text: '', isUser: false, timestamp: new Date() };
      setMessages(prev => [...prev, assistantMessage]);

      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              text: newMessages[newMessages.length - 1].text + content
            };
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.message, error.status, error.code);
      setMessages(prev => [...prev, { 
        text: `Sorry, I encountered an error: ${error.message}. Please try again.`, 
        isUser: false, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.length === 0 && (
          <Message isUser={false}>
            👋 Hi! I'm your AI study companion. Ask me anything about your studies, and I'll help you understand concepts better!
          </Message>
        )}
        {messages.map((message, index) => (
          <Message key={index} isUser={message.isUser}>
            {message.text}
            {!message.isUser && (
              <TTSButton 
                onClick={() => {
                  if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(message.text);
                    utterance.rate = 0.9;
                    utterance.pitch = 1;
                    speechSynthesis.speak(utterance);
                  }
                }}
                title="Read aloud"
              >
                🔊
              </TTSButton>
            )}
          </Message>
        ))}
        {isLoading && (
          <Message isUser={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                border: '2px solid rgba(255,255,255,0.3)', 
                borderTop: '2px solid white', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }} />
              Thinking...
            </div>
          </Message>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <MessageInput
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about your studies..."
          disabled={isLoading}
        />
        <SendButton onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
          Send
        </SendButton>
      </InputContainer>

      {isDoubtMode && (
        <DoubtModeIndicator>
          <MicrophoneIcon>🎤</MicrophoneIcon>
          Doubt Mode Active
          <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
            Speak your question...
          </div>
        </DoubtModeIndicator>
      )}
    </ChatContainer>
  );
};

export default ChatPanel;
