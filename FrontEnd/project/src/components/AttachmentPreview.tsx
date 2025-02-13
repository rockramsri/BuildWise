// import React from 'react';
// import { FileText, X, ExternalLink, Database, Clock } from 'lucide-react';

// interface AttachmentPreviewProps {
//   attachmentId: string;
//   name: string;
//   type: 'permanent' | 'session';
//   onView: () => void;
//   onRemove: () => void;
// }

// export function AttachmentPreview({
//   attachmentId,
//   name,
//   type,
//   onView,
//   onRemove
// }: AttachmentPreviewProps) {
//   return (
//     <div className="group relative inline-flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow">
//       {type === 'permanent' ? (
//         <Database className="w-4 h-4 text-blue-500" />
//       ) : (
//         <Clock className="w-4 h-4 text-green-500" />
//       )}
      
//       <span className="text-sm text-gray-600 dark:text-gray-300 max-w-[150px] truncate">
//         {name}
//       </span>

//       <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
//         <button
//           onClick={onView}
//           className="p-1 hover:bg-white/20 rounded-full transition-colors"
//           title="View"
//         >
//           <ExternalLink className="w-4 h-4 text-white" />
//         </button>
//         <button
//           onClick={onRemove}
//           className="p-1 hover:bg-white/20 rounded-full transition-colors"
//           title="Remove"
//         >
//           <X className="w-4 h-4 text-white" />
//         </button>
//       </div>
//     </div>
//   );
// }