import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { LoadingIndicator } from './components/LoadingIndicator';
import { PreviewModal } from './components/PreviewModal';
import { ReportEditor } from './components/ReportEditor';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { FileText } from 'lucide-react';
import { sendMessage } from './services/api';
import type { ChatMessage as ChatMessageType } from './types/chat';

const TIMEOUT_DURATION = 300000; // 5 minutes in milliseconds

const SAMPLE_RESPONSE = {
  message: "I apologize for the delay. Here's a sample response with some example references and images:",
  references: [
    { name: "Sample Document.pdf", path: "https://example.com/sample.pdf" },
    { name: "Reference Guide.pdf", path: "https://example.com/guide.pdf" }
  ],
  images: [
    { name: "Sample Image 1", path: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba" },
    { name: "Sample Image 2", path: "https://imgur.com/sI0ZRkJ" }
  ],
  report: {
    name: "Analysis Report.pdf",
    path: "https://example.com/report.pdf"
  },
  laws_information: "This is sample legal information generated for the response."
};

function AppContent() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [showReportEditor, setShowReportEditor] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (message: string, files?: File[]) => {
    if (!message.trim() && (!files || files.length === 0)) return;

    const newUserMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: message,
      type: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), TIMEOUT_DURATION);
      });

      const response = await Promise.race([
        sendMessage(message),
        timeoutPromise
      ]);

      const botMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        type: 'bot',
        timestamp: new Date(),
        references: response.references,
        images: response.images,
        report: response.report,
        loss_information: response.laws_information, // 🔹 Ensure loss information is stored
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error or timeout:', error);
      
      const botMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: SAMPLE_RESPONSE.message,
        type: 'bot',
        timestamp: new Date(),
        references: SAMPLE_RESPONSE.references,
        images: SAMPLE_RESPONSE.images,
        report: SAMPLE_RESPONSE.report,
        loss_information: SAMPLE_RESPONSE.laws_information, // 🔹 Fallback loss information
      };

      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    console.log('Voice input not implemented');
  };

  const toggleMessageSelection = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, selected: !msg.selected } : msg
    ));
  };

  const selectedMessages = messages.filter(msg => msg.selected);

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <ThemeToggle />
      
      {/* Generate Report Button */}
      {selectedMessages.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => setShowReportEditor(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Report ({selectedMessages.length})</span>
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl">
          {messages.map((message) => (
            <div
              key={message.id}
              className="relative group"
              onClick={() => toggleMessageSelection(message.id)}
            >
              <div className={`absolute -left-8 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-colors cursor-pointer ${
                message.selected
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300 dark:border-gray-600 opacity-0 group-hover:opacity-100'
              }`} />
              <ChatMessage
                message={message}
                onReferenceClick={setPreviewItem}
              />
            </div>
          ))}
          {isLoading && <LoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl p-4">
        <ChatInput
          onSend={handleSend}
          onVoiceInput={handleVoiceInput}
          isLoading={isLoading}
        />
      </div>

      {previewItem && (
        <PreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}

      {showReportEditor && (
        <ReportEditor
          selectedMessages={selectedMessages}
          onClose={() => {
            setShowReportEditor(false);
            setMessages(prev => prev.map(msg => ({ ...msg, selected: false })));
          }}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;