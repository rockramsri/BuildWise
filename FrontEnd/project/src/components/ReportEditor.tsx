import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  FileText, 
  Download, 
  Wand2, 
  X, 
  Image as ImageIcon,
  Database,
  Clock,
  Settings2
} from 'lucide-react';
import { SortableItem } from './SortableItem';
import type { ChatMessage, ImageFile } from '../types/chat';
import html2pdf from 'html2pdf.js';

interface ReportEditorProps {
  selectedMessages: ChatMessage[];
  onClose: () => void;
}

interface ReportSection {
  id: string;
  type: 'text' | 'image';
  content: string;
  imageUrl?: string;
}

interface PdfOptions {
  format: 'original' | 'formatted';
  includeHeading: boolean;
}

export function ReportEditor({ selectedMessages, onClose }: ReportEditorProps) {
  const [title, setTitle] = useState('Untitled Report');
  const [logo, setLogo] = useState<string>('');
  const [pdfOptions, setPdfOptions] = useState<PdfOptions>({
    format: 'original',
    includeHeading: true,
  });
  const [sections, setSections] = useState<ReportSection[]>(() => {
    return selectedMessages.flatMap((msg) => {
      const sections: ReportSection[] = [];
      
      if (msg.content) {
        sections.push({
          id: `text-${msg.id}`,
          type: 'text',
          content: msg.content,
        });
      }
      
      msg.images?.forEach((img, index) => {
        sections.push({
          id: `image-${msg.id}-${index}`,
          type: 'image',
          content: img.name,
          imageUrl: img.path,
        });
      });
      
      return sections;
    });
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRephrase = async (index: number) => {
    console.log('Rephrasing section:', sections[index]);
  };

  // const attachPDF = async (usageType: 'permanent' | 'session') => {
  //   try {
  //     const pdfBlob = await generatePDF(true);
  //     if (!pdfBlob) return;

  //     const base64Data = await new Promise((resolve) => {
  //       const reader = new FileReader();
  //       reader.onloadend = () => resolve(reader.result);
  //       reader.readAsDataURL(pdfBlob);
  //     });

  //     const response = await fetch('/api/attachment/upload', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         attachment: base64Data,
  //         usage_type: usageType,
  //         modification: false,
  //       }),
  //     });

  //     const data = await response.json();
  //     if (data.status === 'success') {
  //       console.log('Attachment uploaded successfully:', data.attachment_id);
  //     }
  //   } catch (error) {
  //     console.error('Error attaching PDF:', error);
  //   }
  // };

 const generatePDF = async (returnBlob = false): Promise<Blob | void> => {
  const element = document.getElementById('report-content');
  if (!element) return;

  console.log("Starting PDF generation...");

  // Ensure all images are loaded before rendering
  const images = element.querySelectorAll("img");

  await Promise.all([...images].map(async (img) => {
    if (img.src.startsWith("data:image")) return; // Already base64

    try {
      const response = await fetch(img.src);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      await new Promise(resolve => reader.onloadend = () => {
        img.src = reader.result as string;
        resolve(true);
      });
    } catch (error) {
      console.error("Failed to load image:", img.src, error);
    }
  }));

  console.log("All images preloaded, generating PDF...");

  // PDF options
  const opt = {
    margin: 1,
    filename: `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true }, // Enable cross-origin support
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    pagebreak: { mode: 'avoid-all' }
  };

  try {
    if (returnBlob) {
      return await html2pdf().set(opt).from(element).output('blob');
    } else {
      await html2pdf().set(opt).from(element).save();
      console.log("PDF successfully generated and saved!");
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl h-[90vh] rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold bg-transparent border-none focus:outline-none text-gray-800 dark:text-gray-200"
              placeholder="Enter report title..."
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-4">
          <div className="flex items-center space-x-4">
            {/* Logo Upload */}
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <div className="w-10 h-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                  {logo ? (
                    <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">Logo</span>
            </div>

            {/* PDF Options */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeHeading}
                  onChange={(e) => setPdfOptions(prev => ({
                    ...prev,
                    includeHeading: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">Include Heading</span>
              </label>

              <select
                value={pdfOptions.format}
                onChange={(e) => setPdfOptions(prev => ({
                  ...prev,
                  format: e.target.value as 'original' | 'formatted'
                }))}
                className="text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                <option value="original">Original Format</option>
                <option value="formatted">Clean Format</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="ml-auto flex items-center space-x-2">
            {/* <button
              onClick={() => attachPDF('permanent')}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              title="Attach to Database (Permanent)"
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              onClick={() => attachPDF('session')}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              title="Attach to Session (Temporary)"
            >
              <Clock className="w-4 h-4" />
            </button> */}
            <button
              onClick={() => generatePDF()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" id="report-content">
          {logo && (
            <div className="mb-6">
              <img src={logo} alt="Report Logo" className="h-12 object-contain" />
            </div>
          )}

          {pdfOptions.includeHeading && (
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              {title}
            </h1>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section, index) => (
                <SortableItem
                  key={section.id}
                  id={section.id}
                  section={section}
                  onRephrase={() => handleRephrase(index)}
                  format={pdfOptions.format}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}  