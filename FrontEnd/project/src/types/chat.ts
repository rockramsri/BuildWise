export interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
  references?: Reference[];
  images?: ImageFile[];
  report?: Report;
  selected?: boolean;
}

export interface Reference {
  name: string;
  path: string;
}

export interface ImageFile {
  name: string;
  path: string;
}

export interface Report {
  name: string;
  path: string;
}

export interface ChatResponse {
  message: string;
  references?: Reference[];
  images?: ImageFile[];
  report?: Report;
}

export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    query: string;
  };
}