'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { ChatMessage } from '@/types/chat';

export default function ChatComponent() {
  const t = useTranslations('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessage]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setCurrentStreamingMessage('');

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: userMessage.content,
          topK: 5,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new Error(data.error);
              }

              if (data.chunk) {
                accumulatedContent += data.chunk;
                setCurrentStreamingMessage(accumulatedContent);

                // If this is the last chunk, create the final message
                if (data.isLast) {
                  const aiMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    content: accumulatedContent,
                    isUser: false,
                    timestamp: new Date(),
                    sources: data.sources,
                    usage: data.usage,
                  };

                  setMessages(prev => [...prev, aiMessage]);
                  setCurrentStreamingMessage('');
                }
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: t('error'),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setCurrentStreamingMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setCurrentStreamingMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="border-b p-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800" data-testid="chat-title">
          {t('title')}
        </h1>
        <button
          onClick={handleClear}
          className="mt-2 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          data-testid="clear-chat-button"
        >
          {t('clearButton')}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            data-testid={message.isUser ? 'user-message' : 'ai-message'}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.isUser
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <div className="text-xs font-semibold mb-1">{t('sources')}</div>
                  <ul className="text-xs space-y-1">
                    {message.sources.map((source, index) => (
                      <li key={index} className="truncate">• {source}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Usage */}
              {message.usage && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <div className="text-xs">
                    {t('usage')}: {message.usage.tokens && `${message.usage.tokens} ${t('tokens')}`}
                    {message.usage.cost && `, ${t('cost')}: ${message.usage.cost}`}
                  </div>
                </div>
              )}
              
              <div className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {/* Streaming message */}
        {currentStreamingMessage && (
          <div className="flex justify-start" data-testid="streaming-message">
            <div className="max-w-[70%] rounded-lg p-3 bg-gray-100 text-gray-800">
              <div className="whitespace-pre-wrap">{currentStreamingMessage}</div>
              <div className="text-xs mt-1 opacity-70">
                {t('loading')}
              </div>
            </div>
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && !currentStreamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-lg p-3 bg-gray-100 text-gray-800">
              <div className="animate-pulse">{t('loading')}</div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-gray-50">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('inputPlaceholder')}
            className="flex-1 min-h-[60px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            data-testid="chat-input"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            data-testid="send-button"
          >
            {t('sendButton')}
          </button>
        </div>
      </div>
    </div>
  );
}