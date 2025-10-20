'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/auth/AuthContext';
import type { ChatMessage, ChatSession } from '@/types/chat';

export default function ChatComponent() {
  const t = useTranslations('chat');
  const { logout } = useAuth();
  
  // Chat session management
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Current chat state
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current session
  const currentSession = chatSessions.find(session => session.id === currentSessionId);
  const messages = currentSession?.messages || [];

  // Create initial session if none exists
  useEffect(() => {
    if (chatSessions.length === 0) {
      createNewChat();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessage]);

  const createNewChat = () => {
    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: t('newChatTitle'),
      messages: [],
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    setShowSidebar(false);
  };

  const switchToSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setShowSidebar(false);
    // Update last active time
    setChatSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, lastActiveAt: new Date() }
          : session
      )
    );
  };

  const deleteSession = (sessionId: string) => {
    setChatSessions(prev => {
      const filtered = prev.filter(session => session.id !== sessionId);
      
      // If we're deleting the current session, switch to another one
      if (sessionId === currentSessionId) {
        if (filtered.length > 0) {
          setCurrentSessionId(filtered[0].id);
        } else {
          // Create a new session if no sessions remain
          const newSessionId = Date.now().toString();
          const newSession: ChatSession = {
            id: newSessionId,
            title: t('newChatTitle'),
            messages: [],
            createdAt: new Date(),
            lastActiveAt: new Date(),
          };
          setCurrentSessionId(newSessionId);
          return [newSession];
        }
      }
      
      return filtered;
    });
  };

  const updateSessionMessages = (sessionId: string, newMessages: ChatMessage[]) => {
    setChatSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              messages: newMessages,
              lastActiveAt: new Date(),
              // Update title to first message if it's still the default
              title: session.title === t('newChatTitle') && newMessages.length > 0 && newMessages[0].isUser
                ? newMessages[0].content.slice(0, 30) + (newMessages[0].content.length > 30 ? '...' : '')
                : session.title
            }
          : session
      )
    );
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || !currentSessionId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    updateSessionMessages(currentSessionId, newMessages);
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

                  const finalMessages = [...newMessages, aiMessage];
                  updateSessionMessages(currentSessionId, finalMessages);
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
      const errorMessages = [...newMessages, errorMessage];
      updateSessionMessages(currentSessionId, errorMessages);
      setCurrentStreamingMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (!currentSessionId) return;
    updateSessionMessages(currentSessionId, []);
    setCurrentStreamingMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
    logout();
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`${
        showSidebar ? 'w-80' : 'w-0'
      } bg-gray-50 border-r transition-all duration-300 overflow-hidden`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">{t('chatSessions')}</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
          
          <button
            onClick={createNewChat}
            className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('newChatButton')}
          </button>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {chatSessions.length === 0 ? (
              <p className="text-gray-500 text-sm">{t('noChatsYet')}</p>
            ) : (
              chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    session.id === currentSessionId
                      ? 'bg-blue-100 border-l-4 border-blue-500'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  <div
                    onClick={() => switchToSession(session.id)}
                    className="flex-1"
                  >
                    <h3 className="font-medium text-sm text-gray-800 truncate">
                      {session.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {session.messages.length} mensajes
                    </p>
                    <p className="text-xs text-gray-400">
                      {session.lastActiveAt.toLocaleDateString()}
                    </p>
                  </div>
                  {chatSessions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="mt-2 text-xs text-red-500 hover:text-red-700"
                    >
                      {t('deleteChatButton')}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b p-4 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800" data-testid="chat-title">
                {currentSession?.title || t('title')}
              </h1>
              {currentSession && (
                <p className="text-sm text-gray-500">
                  {currentSession.messages.length} mensajes
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={createNewChat}
              className="px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-md transition-colors"
            >
              {t('newChatButton')}
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              data-testid="clear-chat-button"
            >
              {t('clearButton')}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-md transition-colors"
            >
              {t('logoutButton')}
            </button>
          </div>
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
              className="flex-1 min-h-[60px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
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
    </div>
  );
}