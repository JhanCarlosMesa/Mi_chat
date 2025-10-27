'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/auth/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { ChatMessage, ChatSession } from '@/types/chat';

export default function ChatComponent() {
  const t = useTranslations('chat');
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Chat session management
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Current chat state
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{filename: string, originalName: string}>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    setUploadedFiles([]);
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
    
    // Load uploaded files for this session
    const session = chatSessions.find(s => s.id === sessionId);
    if (session?.uploadedFiles) {
      setUploadedFiles(session.uploadedFiles.map(f => ({
        filename: f.filename,
        originalName: f.originalName
      })));
    } else {
      setUploadedFiles([]);
    }
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

  const updateSessionMessages = (sessionId: string, newMessages: ChatMessage[], newUploadedFiles?: Array<{filename: string, originalName: string}>) => {
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
                : session.title,
              // Update uploaded files if provided
              ...(newUploadedFiles ? { uploadedFiles: newUploadedFiles.map(f => ({
                filename: f.filename,
                originalName: f.originalName,
                uploadTime: new Date()
              })) } : {})
            }
          : session
      )
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !currentSessionId) return;

    const file = files[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', currentSessionId);

      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload file');
      }

      // Add the uploaded file to the session
      const newUploadedFiles = [
        ...uploadedFiles,
        {
          filename: result.filename,
          originalName: result.originalName
        }
      ];
      
      setUploadedFiles(newUploadedFiles);
      updateSessionMessages(currentSessionId, messages, newUploadedFiles);

      // Show success message in chat in Spanish
      const successMessage: ChatMessage = {
        id: Date.now().toString(),
        content: result.message,
        isUser: false,
        timestamp: new Date(),
      };

      const newMessages = [...messages, successMessage];
      updateSessionMessages(currentSessionId, newMessages);

    } catch (error) {
      console.error('File upload error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isUser: false,
        timestamp: new Date(),
      };
      
      const errorMessages = [...messages, errorMessage];
      updateSessionMessages(currentSessionId, errorMessages);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSend = async () => {
    if ((!inputValue.trim() && uploadedFiles.length === 0) || isLoading || !currentSessionId) return;

    // Check if the input is "hola" (case insensitive)
    if (inputValue.trim().toLowerCase() === 'hola') {
      // Create automatic response for "hola"
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: inputValue.trim(),
        isUser: true,
        timestamp: new Date(),
      };

      const autoResponseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `¡Hola! Veo que estás listo para empezar.

Estoy aquí para ayudarte a estudiar la lección de Escuela Sabática. Para que podamos avanzar, por favor, dime qué te gustaría revisar hoy.

Por ejemplo, puedes preguntar:

*   **"¿Cuál es el tema de la lección del día?"**

*   **"¿Qué pasajes bíblicos se sugieren para hoy?"**

*   **"Necesito ayuda para preparar un sermón corto sobre la lección de esta semana."**

¡Espero tu pregunta!`,
        isUser: false,
        timestamp: new Date(),
      };

      const newMessages = [...messages, userMessage, autoResponseMessage];
      updateSessionMessages(currentSessionId, newMessages);
      setInputValue('');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
      // If we have uploaded files, we might want to reference them
      ...(uploadedFiles.length > 0 ? { fileName: uploadedFiles[uploadedFiles.length - 1]?.filename } : {})
    };

    const newMessages = [...messages, userMessage];
    updateSessionMessages(currentSessionId, newMessages);
    setInputValue('');
    setIsLoading(true);
    setCurrentStreamingMessage('');

    try {
      const requestBody: any = {
        chatInput: userMessage.content,
        topK: 5,
        temperature: 0.7,
        sessionId: currentSessionId
      };

      // If we have uploaded files, include the most recent one in the request
      if (uploadedFiles.length > 0) {
        requestBody.fileName = uploadedFiles[uploadedFiles.length - 1].filename;
      }

      console.log('Sending chat request:', requestBody);

      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Received chat response:', response.status, response.statusText);

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
    setUploadedFiles([]);
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
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Sidebar */}
      <div className={`${
        showSidebar ? 'w-80' : 'w-0'
      } ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-r transition-all duration-300 overflow-hidden`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('chatSessions')}</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
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
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('noChatsYet')}</p>
            ) : (
              chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    session.id === currentSessionId
                      ? 'bg-blue-100 border-l-4 border-blue-500 dark:bg-blue-900 dark:border-blue-400'
                      : 'bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600'
                  }`}
                >
                  <div
                    onClick={() => switchToSession(session.id)}
                    className="flex-1"
                  >
                    <h3 className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                      {session.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {session.messages.length} mensajes
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {session.lastActiveAt.toLocaleDateString()}
                    </p>
                  </div>
                  {chatSessions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="mt-2 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
        <div className={`border-b p-4 flex justify-between items-center ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200" data-testid="chat-title">
                {currentSession?.title || t('title')}
              </h1>
              {currentSession && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentSession.messages.length} mensajes
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                // Moon icon for dark mode
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                // Sun icon for light mode
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            <button
              onClick={createNewChat}
              className="px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-md transition-colors"
            >
              {t('newChatButton')}
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
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

        {/* Uploaded Files Section */}
        {uploadedFiles.length > 0 && (
          <div className={`border-b p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Archivos subidos:</h3>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="bg-white px-3 py-1 rounded-full text-xs flex items-center dark:bg-gray-700">
                  <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  {file.originalName}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`} data-testid="chat-messages">
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
                    : `${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className={`mt-2 pt-2 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
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
                  <div className={`mt-2 pt-2 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
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
              <div className={`max-w-[70%] rounded-lg p-3 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
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
              <div className={`max-w-[70%] rounded-lg p-3 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <div className="animate-pulse">{t('loading')}</div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`border-t p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          {/* File Upload Button */}
          <div className="mb-2 flex items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx"
              className="hidden"
              disabled={isUploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`flex items-center text-sm px-3 py-1 rounded ${
                isUploading 
                  ? 'bg-gray-300 cursor-not-allowed dark:bg-gray-600' 
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
              }`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              {isUploading ? 'Subiendo...' : 'Subir archivo'}
            </button>
            {isUploading && (
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Subiendo...</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('inputPlaceholder')}
              className="flex-1 min-h-[60px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              disabled={isLoading}
              data-testid="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || (!inputValue.trim() && uploadedFiles.length === 0)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors dark:disabled:bg-gray-600"
              data-testid="send-button"
            >
              {t('sendButton')}
            </button>
          </div>
          
          {uploadedFiles.length > 0 && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Puedes hacer preguntas sobre el documento "{uploadedFiles[uploadedFiles.length - 1].originalName}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}