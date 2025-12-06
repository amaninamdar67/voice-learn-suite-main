import React from 'react';
import { Zap } from 'lucide-react';

interface DocumentCardProps {
  title: string;
  description: string;
  documentUrl: string;
  documentName: string;
  onAIClick: () => void;
}

export const DocumentCardWithAI: React.FC<DocumentCardProps> = ({
  title,
  description,
  documentUrl,
  documentName,
  onAIClick
}) => {
  return (
    <div className="relative bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
      <div className="absolute top-3 right-3">
        <button
          onClick={onAIClick}
          className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:shadow-lg transition transform hover:scale-110"
          title="Analyze with AI"
        >
          <Zap size={18} />
        </button>
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mb-2 pr-12">{title}</h3>
      <p className="text-slate-600 text-sm mb-4">{description}</p>

      <div className="flex items-center justify-between">
        <a
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {documentName}
        </a>
      </div>
    </div>
  );
};
