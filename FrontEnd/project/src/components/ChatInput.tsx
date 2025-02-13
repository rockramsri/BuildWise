import React, { useState, useRef } from 'react';
import { Send, Mic, Paperclip, Database, Hourglass, X, Loader } from 'lucide-react';
import { sendFile } from '../services/api'; // Ensure API function is imported

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  onVoiceInput?: () => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, onVoiceInput, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showIcons, setShowIcons] = useState(false);
  const [selectedType, setSelectedType] = useState<'database' | 'timeout-session' | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; isUploading: boolean }[]>([]);

  const handleAttachClick = () => {
    setShowIcons(!showIcons);
  };

  const handleFileSelection = (type: 'database' | 'timeout-session') => {
    setSelectedType(type);
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Open file picker
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0 && selectedType) {
      const newFiles = Array.from(event.target.files).map((file) => ({
        file,
        isUploading: true, // Mark file as uploading initially
      }));

      // Store files in UI with loading state
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);

      // Upload each file
      for (const newFile of newFiles) {
        try {
          console.log(`Uploading file (${newFile.file.name}) as ${selectedType}...`);
          await sendFile(newFile.file, selectedType);

          // Mark file as uploaded
          setSelectedFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.file.name === newFile.file.name ? { ...f, isUploading: false } : f
            )
          );

          console.log(`Upload successful: ${newFile.file.name}`);
        } catch (error) {
          console.error(`Upload failed: ${newFile.file.name}`, error);
        }
      }

      // Reset input (DO NOT reset selectedFiles)
      setSelectedType(null);
      event.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || selectedFiles.length > 0) {
      onSend(message, selectedFiles.map((f) => f.file));
      setMessage(''); // Clear message input but keep files in UI
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 transition-colors duration-200"
    >
      <div className="flex flex-col">
        {/* File Attachments Preview (Show loading for uploads) */}
        {selectedFiles.length > 0 && (
          <div className="mb-2 flex space-x-2 overflow-x-auto">
            {selectedFiles.map(({ file, isUploading }, index) => (
              <div key={index} className="relative p-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center space-x-2">
                {isUploading ? (
                  <Loader className="animate-spin w-5 h-5 text-gray-500" />
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-300">{file.name}</span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={isUploading} // Prevent removing while uploading
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center space-x-4 relative">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileChange} // Only store files, don't send yet
          />

          {/* Attachment Button */}
          <button
            type="button"
            onClick={handleAttachClick}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Floating Icons for Database & Timeout Session */}
          {showIcons && (
            <div className="absolute bottom-12 left-0 bg-white shadow-lg rounded-lg p-2 flex space-x-3">
              <button onClick={() => handleFileSelection("database")} className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                <Database size={20} />
              </button>
              <button onClick={() => handleFileSelection("timeout-session")} className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                <Hourglass size={20} />
              </button>
            </div>
          )}

          {/* Message Input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors duration-200"
            disabled={isLoading}
          />

          {/* Voice Input */}
          {onVoiceInput && (
            <button
              type="button"
              onClick={onVoiceInput}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </form>
  );
}