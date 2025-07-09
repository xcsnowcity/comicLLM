'use client';

import { useState } from 'react';

interface ComicText {
  sequence: number;
  type: string;
  character?: string;
  original_text: string;
  chinese_translation: string;
  explanations: Array<{
    phrase: string;
    meaning: string;
    context: string;
  }>;
}

interface TextDisplayProps {
  texts: ComicText[];
  pageNumber: number;
}

export default function TextDisplay({ texts, pageNumber }: TextDisplayProps) {
  const [expandedExplanations, setExpandedExplanations] = useState<Set<number>>(new Set());

  const toggleExplanation = (sequence: number) => {
    const newExpanded = new Set(expandedExplanations);
    if (newExpanded.has(sequence)) {
      newExpanded.delete(sequence);
    } else {
      newExpanded.add(sequence);
    }
    setExpandedExplanations(newExpanded);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'speech_bubble':
        return '💬';
      case 'thought_bubble':
        return '💭';
      case 'narration':
        return '📖';
      case 'sound_effect':
        return '💥';
      case 'sign_text':
        return '📋';
      default:
        return '💬';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'speech_bubble':
        return 'bg-blue-100 border-blue-300';
      case 'thought_bubble':
        return 'bg-purple-100 border-purple-300';
      case 'narration':
        return 'bg-green-100 border-green-300';
      case 'sound_effect':
        return 'bg-red-100 border-red-300';
      case 'sign_text':
        return 'bg-yellow-100 border-yellow-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  if (texts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl text-gray-400 dark:text-gray-500 mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No text found</h3>
        <p className="text-gray-600 dark:text-gray-300">
          The LLM didn't detect any text in this comic page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Page {pageNumber} - Extracted Text
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {texts.length} text element{texts.length !== 1 ? 's' : ''} found in reading order
        </p>
      </div>

      <div className="space-y-4">
        {texts.map((text) => (
          <div
            key={text.sequence}
            className={`border-2 rounded-lg p-4 ${getTypeColor(text.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <span className="text-2xl">{getTypeIcon(text.type)}</span>
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                    #{text.sequence}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {text.type.replace('_', ' ')}
                  </span>
                  {text.character && (
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                      {text.character}
                    </span>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Original English:</h4>
                    <p className="text-gray-900 bg-white p-2 rounded">
                      {text.original_text}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Chinese Translation:</h4>
                    <p className="text-gray-900 bg-white p-2 rounded">
                      {text.chinese_translation}
                    </p>
                  </div>
                </div>
                
                {text.explanations.length > 0 && (
                  <div>
                    <button
                      onClick={() => toggleExplanation(text.sequence)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-2"
                    >
                      {expandedExplanations.has(text.sequence) ? '▼' : '▶'} 
                      {' '}Explanations ({text.explanations.length})
                    </button>
                    
                    {expandedExplanations.has(text.sequence) && (
                      <div className="bg-white p-3 rounded space-y-2">
                        {text.explanations.map((explanation, idx) => (
                          <div key={idx} className="border-l-4 border-blue-300 pl-3">
                            <div className="font-medium text-gray-700">
                              "{explanation.phrase}"
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Meaning:</span> {explanation.meaning}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Context:</span> {explanation.context}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}