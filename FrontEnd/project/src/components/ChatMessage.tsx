import React, { useState } from 'react';
import { 
  FileIcon, FileTextIcon, ChevronDown, ChevronUp, ExternalLink, 
  Info, ThumbsUp, ThumbsDown 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage as ChatMessageType } from '../types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
  onReferenceClick: (reference: any) => void;
}

export function ChatMessage({ message, onReferenceClick }: ChatMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLossExpanded, setIsLossExpanded] = useState(false);
  
  // State to track likes/dislikes for each image
  const [imageReactions, setImageReactions] = useState<Record<string, 'like' | 'dislike' | null>>({});

  const isBot = message.type === 'bot';
  const hasAttachments = isBot && (message.references?.length || message.images?.length || message.report);
  const hasLossInformation = isBot && message.loss_information;

  const handleImageReaction = (imagePath: string, reaction: 'like' | 'dislike') => {
    setImageReactions((prev) => ({
      ...prev,
      [imagePath]: prev[imagePath] === reaction ? null : reaction, // Toggle state
    }));
  };

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-8 group animate-slideIn`}>
      <div
        className={`relative max-w-[80%] rounded-2xl p-6 ${
          isBot
            ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg hover:shadow-xl transition-all duration-200'
            : 'bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400 text-white ml-auto shadow-blue-500/20 hover:shadow-blue-500/30 shadow-lg hover:shadow-xl transition-all duration-200'
        }`}
      >
        {/* Message Content with Markdown */}
        <div className={`mb-3 ${isBot ? 'prose prose-sm dark:prose-invert' : ''} max-w-none`}>
          {isBot ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          ) : (
            <p className="text-[15px] leading-relaxed">{message.content}</p>
          )}
        </div>

        {/* Expandable Laws Information Section */}
        {hasLossInformation && (
          <div className={`mt-3 ${!isLossExpanded ? 'max-h-12 overflow-hidden' : ''}`}>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setIsLossExpanded(!isLossExpanded)}
                className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 w-full group/loss p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
              >
                <Info className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate flex-1 text-left">
                  {isLossExpanded ? 'Hide Legal Info' : 'View Legal Info'}
                </span>
                {isLossExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isLossExpanded && (
                <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.loss_information}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Images Grid with Like/Dislike Buttons */}
        {isBot && message.images && message.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {message.images.map((img) => (
              <div
                key={img.path}
                className="relative group/image rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={img.path}
                    alt={img.name}
                    className="w-full h-32 object-cover cursor-pointer transition-all duration-300 hover:scale-105"
                    onClick={() => onReferenceClick(img)}
                  />
                </div>

                {/* Overlay with Like/Dislike Buttons */}
                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/30 transition-all duration-200 flex flex-col justify-end p-2 opacity-0 group-hover/image:opacity-100">
                  <div className="flex justify-center space-x-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
                    <button
                      onClick={() => handleImageReaction(img.path, 'like')}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        imageReactions[img.path] === 'like' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleImageReaction(img.path, 'dislike')}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        imageReactions[img.path] === 'dislike' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <ThumbsDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Attachments Section */}
        {hasAttachments && (
          <div className={`mt-4 ${!isExpanded ? 'max-h-12 overflow-hidden' : ''}`}>
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              {message.references?.map((ref) => (
                <button
                  key={ref.path}
                  onClick={() => onReferenceClick(ref)}
                  className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-3 w-full group/ref p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                >
                  <FileIcon className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="truncate flex-1 text-left">{ref.name}</span>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover/ref:opacity-100 transition-all duration-200 transform scale-90 group-hover/ref:scale-100" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expand Attachments Button */}
        {hasAttachments && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 hover:transform hover:scale-110"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
          </button>
        )}
      </div>
    </div>
  );
}