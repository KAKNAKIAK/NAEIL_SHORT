import React, { useState, useEffect } from 'react';
import type { StructuredStory, StoryCuts } from '../types';
import Loader from './Loader';
import { ExpandIcon } from './icons/ExpandIcon';
import { XIcon } from './icons/XIcon';

interface OutputDisplayProps {
  synopses: string[] | null;
  generatedStory: string | null;
  onSelectSynopsis: (synopsis: string) => void;
  isGeneratingStory: boolean;
  structuredStory: StructuredStory | null;
  onConfirmStory: (story: string) => void;
  isStructuring: boolean;
  storyCuts: StoryCuts;
  isGeneratingCuts: keyof StructuredStory | null;
  onGenerateCuts: (sectionTitle: keyof StructuredStory, sectionContent: string, fullStory: string) => void;
}

const OutputCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg overflow-hidden">
        <div className="p-5 bg-gray-800 border-b border-gray-700">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-400">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const StructureCard: React.FC<{ 
    title: string; 
    sectionKey: keyof StructuredStory;
    content: string;
    cuts: string[] | undefined;
    onGenerateCuts: () => void;
    isGenerating: boolean;
}> = ({ title, content, cuts, onGenerateCuts, isGenerating }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleViewCuts = () => {
        if (!cuts) {
            onGenerateCuts();
        }
        setIsFlipped(true);
    };

    useEffect(() => {
        if (isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isExpanded]);

    const cardFaces = (isModal: boolean) => (
        <div className={`scene-card ${isFlipped ? 'is-flipped' : ''}`}>
            {/* Card Front */}
            <div className="scene-card-face p-4 flex flex-col bg-gray-800 rounded-lg">
                <h4 className={`font-semibold text-blue-300 mb-2 shrink-0 ${isModal ? 'text-xl' : 'text-lg'}`}>{title}</h4>
                <div className="flex-grow min-h-0 overflow-y-auto pr-2">
                    <p className={`whitespace-pre-wrap ${isModal ? 'text-gray-300 leading-relaxed' : 'text-gray-400'}`}>{content}</p>
                </div>
                <button 
                    onClick={handleViewCuts} 
                    disabled={isGenerating}
                    className="mt-4 w-full text-sm font-semibold py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-wait shrink-0"
                >
                    {isGenerating ? '분석 중...' : '컷별로 보기'}
                </button>
            </div>
            {/* Card Back */}
            <div className="scene-card-face scene-card-back p-4 bg-gray-800 rounded-lg flex flex-col">
                <h4 className={`font-semibold text-teal-300 mb-2 shrink-0 ${isModal ? 'text-xl' : 'text-lg'}`}>{title} - 컷 분할</h4>
                <div className="flex-grow overflow-y-auto pr-2 min-h-0">
                    {isGenerating && !cuts && (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            AI가 컷을 나누고 있습니다...
                        </div>
                    )}
                    {cuts && (
                        <ul className={`list-decimal list-inside space-y-2 ${isModal ? 'text-gray-200' : 'text-gray-300 text-sm'}`}>
                            {cuts.map((cut, index) => <li key={index}>{cut}</li>)}
                        </ul>
                    )}
                </div>
                <button 
                    onClick={() => setIsFlipped(false)}
                    className="mt-4 w-full text-sm font-semibold py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors shrink-0"
                >
                    뒤로가기
                </button>
            </div>
        </div>
    );

    return (
        <>
            <div className="relative scene-card-container bg-gray-800 border border-gray-700 rounded-lg min-h-[250px]">
                <button
                    onClick={() => setIsExpanded(true)}
                    className="absolute top-2 right-2 z-10 p-1 text-gray-400 hover:text-white transition-colors"
                    aria-label="확대해서 보기"
                >
                    <ExpandIcon className="w-5 h-5" />
                </button>
                {cardFaces(false)}
            </div>

            {isExpanded && (
                <div 
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setIsExpanded(false)}
                >
                    <div 
                        className="relative w-full max-w-3xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="scene-card-container h-[80vh] bg-gray-800 border border-gray-700 rounded-lg">
                            {cardFaces(true)}
                        </div>
                         <button 
                            onClick={() => setIsExpanded(false)}
                            className="absolute -top-4 -right-4 z-50 p-2 bg-gray-700 rounded-full text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="닫기"
                        >
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

const SynopsisSelection: React.FC<{
    synopses: string[];
    onSelect: (synopsis: string) => void;
    isLoading: boolean;
}> = ({ synopses, onSelect, isLoading }) => {
    const [editedSynopses, setEditedSynopses] = useState(synopses);

    useEffect(() => {
        setEditedSynopses(synopses);
    }, [synopses]);

    const handleEdit = (index: number, value: string) => {
        const newSynopses = [...editedSynopses];
        newSynopses[index] = value;
        setEditedSynopses(newSynopses);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-gray-200">3가지 시놉시스 제안</h2>
            {editedSynopses.map((synopsis, index) => (
                <OutputCard key={index} title={`시놉시스 #${index + 1}`}>
                    <div className="space-y-4">
                        <textarea
                            value={synopsis}
                            onChange={(e) => handleEdit(index, e.target.value)}
                            placeholder="시놉시스를 수정하고 스토리를 생성할 수 있습니다."
                            className="w-full h-40 p-4 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200 resize-y placeholder-gray-500 text-gray-300 leading-relaxed"
                            disabled={isLoading}
                            aria-label={`Editable synopsis ${index + 1}`}
                        />
                        <button
                            onClick={() => onSelect(synopsis)}
                            disabled={isLoading}
                            className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                        >
                           {isLoading ? '생성 중...' : '이 시놉시스로 스토리 생성'}
                        </button>
                    </div>
                </OutputCard>
            ))}
        </div>
    );
};

const StoryDisplay: React.FC<{
    story: string;
    structuredStory: StructuredStory | null;
    onConfirm: (story: string) => void;
    isStructuring: boolean;
    storyCuts: StoryCuts;
    isGeneratingCuts: keyof StructuredStory | null;
    onGenerateCuts: (sectionTitle: keyof StructuredStory, sectionContent: string, fullStory: string) => void;
}> = ({ story, structuredStory, onConfirm, isStructuring, storyCuts, isGeneratingCuts, onGenerateCuts }) => {
    const formattedStory = story.split('\n').map((paragraph, index) => (
        <p key={index} className="mb-4 last:mb-0">
            {paragraph}
        </p>
    ));
    
    return (
        <div className="animate-fade-in">
            <OutputCard title="생성된 스토리">
                <div className="space-y-6">
                    <div className="text-gray-300 leading-relaxed space-y-4">
                        {formattedStory}
                    </div>

                    {!structuredStory && (
                        <button
                            onClick={() => onConfirm(story)}
                            disabled={isStructuring}
                            className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                        >
                            {isStructuring ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    분석 중...
                                </>
                            ) : (
                                '스토리 구조 분석하기'
                            )}
                        </button>
                    )}

                    {structuredStory && (
                        <div className="mt-6 border-t border-gray-700 pt-6">
                            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-400 mb-4">스토리 구조 분석 (기승전결)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <StructureCard 
                                    title="기 (도입)" 
                                    sectionKey="introduction"
                                    content={structuredStory.introduction}
                                    cuts={storyCuts.introduction}
                                    isGenerating={isGeneratingCuts === 'introduction'}
                                    onGenerateCuts={() => onGenerateCuts('introduction', structuredStory.introduction, story)}
                                />
                                <StructureCard 
                                    title="승 (전개)" 
                                    sectionKey="development"
                                    content={structuredStory.development} 
                                    cuts={storyCuts.development}
                                    isGenerating={isGeneratingCuts === 'development'}
                                    onGenerateCuts={() => onGenerateCuts('development', structuredStory.development, story)}
                                />
                                <StructureCard 
                                    title="전 (위기/절정)" 
                                    sectionKey="turn"
                                    content={structuredStory.turn} 
                                    cuts={storyCuts.turn}
                                    isGenerating={isGeneratingCuts === 'turn'}
                                    onGenerateCuts={() => onGenerateCuts('turn', structuredStory.turn, story)}
                                />
                                <StructureCard 
                                    title="결 (결말)" 
                                    sectionKey="conclusion"
                                    content={structuredStory.conclusion} 
                                    cuts={storyCuts.conclusion}
                                    isGenerating={isGeneratingCuts === 'conclusion'}
                                    onGenerateCuts={() => onGenerateCuts('conclusion', structuredStory.conclusion, story)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </OutputCard>
        </div>
    );
};


const OutputDisplay: React.FC<OutputDisplayProps> = ({ 
  synopses,
  generatedStory,
  onSelectSynopsis,
  isGeneratingStory,
  structuredStory,
  onConfirmStory,
  isStructuring,
  storyCuts,
  isGeneratingCuts,
  onGenerateCuts
}) => {
  if (generatedStory) {
    return (
        <StoryDisplay 
            story={generatedStory}
            structuredStory={structuredStory}
            onConfirm={onConfirmStory}
            isStructuring={isStructuring}
            storyCuts={storyCuts}
            isGeneratingCuts={isGeneratingCuts}
            onGenerateCuts={onGenerateCuts}
        />
    )
  }
  
  if (synopses) {
    return (
        <SynopsisSelection 
            synopses={synopses}
            onSelect={onSelectSynopsis}
            isLoading={isGeneratingStory}
        />
    )
  }

  return null;
};

export default OutputDisplay;