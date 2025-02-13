import React from 'react';
import { X } from 'lucide-react';
import type { Reference, ImageFile, Report } from '../types/chat';

interface PreviewModalProps {
  item: Reference | ImageFile | Report;
  onClose: () => void;
}

export function PreviewModal({ item, onClose }: PreviewModalProps) {
  const isImage = 'path' in item && item.path.match(/\.(jpg|jpeg|png|gif)$/i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl rounded-lg bg-white dark:bg-gray-800 p-6 transition-colors duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="h-6 w-6" />
        </button>

        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{item.name}</h3>

        <div className="mt-4">
          {isImage ? (
            <img
              src={item.path}
              alt={item.name}
              className="max-h-[60vh] w-full object-contain"
            />
          ) : (
            <div className="h-[60vh] overflow-auto rounded border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-gray-600 dark:text-gray-400">Preview not available</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <a
            href={item.path}
            download={item.name}
            className="rounded bg-blue-600 dark:bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}