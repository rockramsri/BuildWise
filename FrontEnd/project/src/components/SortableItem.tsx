import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SortableItemProps {
  id: string;
  section: {
    type: 'text' | 'image';
    content: string;
    imageUrl?: string;
  };
  onRephrase: () => void;
  format: 'original' | 'formatted';
}

export function SortableItem({ id, section, onRephrase, format }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const containerClasses = format === 'original'
    ? "group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 hover:shadow-md transition-shadow"
    : "group relative mb-4";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={containerClasses}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>

      <div className="ml-8">
        {section.type === 'image' ? (
          <div className="relative aspect-video">
            <img
              src={section.imageUrl}
              alt={section.content}
              className="w-full h-full object-cover rounded"
            />
          </div>
        ) : (
          <div className={`prose prose-sm dark:prose-invert max-w-none ${
            format === 'formatted' ? 'prose-headings:mt-6 prose-p:my-4' : ''
          }`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {section.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {section.type === 'text' && (
        <button
          onClick={onRephrase}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-all"
          title="Rephrase with AI"
        >
          <Wand2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </button>
      )}
    </div>
  );
}