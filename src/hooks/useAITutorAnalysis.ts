import { useState } from 'react';

interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  mistakes: string[];
  improvements: string[];
  relatedConcepts: string[];
}

export const useAITutorAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeDocument = async (file: File): Promise<AnalysisResult | null> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ai-tutor/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      return data.analysis;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyzeDocument, isAnalyzing, error };
};
