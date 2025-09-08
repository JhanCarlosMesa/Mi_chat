// Types for n8n integration
export interface ChatRequest {
  chatInput: string;
  topK?: number;
  temperature?: number;
}

export interface ChatResponse {
  output: string;
  sources?: string[];
  usage?: {
    tokens?: number;
    cost?: number;
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sources?: string[];
  usage?: {
    tokens?: number;
    cost?: number;
  };
}

// Types for chat session management
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActiveAt: Date;
}