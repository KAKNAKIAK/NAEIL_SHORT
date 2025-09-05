import React, { useState, useCallback } from 'react';
import type { StructuredStory, StoryCuts } from './types';
import { generateSynopses, generateStory, analyzeAndStructureStory, generateStoryCuts } from './services/geminiService';
import Header from './components/Header';
import InputForm from './components/InputForm';
import OutputDisplay from './components/OutputDisplay';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [synopses, setSynopses] = useState<string[] | null>(null);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [structuredStory, setStructuredStory] = useState<StructuredStory | null>(null);
  const [storyCuts, setStoryCuts] = useState<StoryCuts>({});
  
  const [isGeneratingSynopses, setIsGeneratingSynopses] = useState<boolean>(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState<boolean>(false);
  const [isStructuring, setIsStructuring] = useState<boolean>(false);
  const [isGeneratingCuts, setIsGeneratingCuts] = useState<keyof StructuredStory | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSynopses = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
      setError('스토리 아이디어를 입력해주세요.');
      return;
    }

    setIsGeneratingSynopses(true);
    setError(null);
    setSynopses(null);
    setGeneratedStory(null);
    setStructuredStory(null);
    setStoryCuts({});

    try {
      const result = await generateSynopses(prompt);
      setSynopses(result);
    } catch (err) {
      console.error(err);
      setError('시놉시스 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsGeneratingSynopses(false);
    }
  }, []);

  const handleGenerateStory = useCallback(async (synopsis: string) => {
    if (!synopsis.trim()) {
      setError('선택된 시놉시스 내용이 비어있습니다.');
      return;
    }

    setIsGeneratingStory(true);
    setError(null);
    setGeneratedStory(null);
    setStructuredStory(null);
    setStoryCuts({});
    
    try {
      const newStory = await generateStory(synopsis);
      setGeneratedStory(newStory);
    } catch (err) {
      console.error(err);
      setError('스토리 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsGeneratingStory(false);
    }
  }, []);

  const handleConfirmAndStructure = useCallback(async (story: string) => {
    setIsStructuring(true);
    setError(null);
    try {
      const result = await analyzeAndStructureStory(story);
      setStructuredStory(result);
    } catch (err) {
      console.error(err);
      setError('스토리 구조 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsStructuring(false);
    }
  }, []);

  const handleGenerateCuts = useCallback(async (sectionTitle: keyof StructuredStory, sectionContent: string, fullStory: string) => {
    if (storyCuts[sectionTitle]) return; // Don't re-fetch if already present

    setIsGeneratingCuts(sectionTitle);
    setError(null);
    try {
      const cuts = await generateStoryCuts(sectionTitle, sectionContent, fullStory);
      setStoryCuts(prev => ({ ...prev, [sectionTitle]: cuts }));
    } catch (err) {
      console.error(err);
      setError(`'${sectionTitle}' 컷 생성 중 오류가 발생했습니다.`);
    } finally {
      setIsGeneratingCuts(null);
    }
  }, [storyCuts]);


  const isLoading = isGeneratingSynopses || isGeneratingStory;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <div className="absolute inset-0 -z-10 h-full w-full bg-gray-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-lg text-gray-400 mb-8 leading-relaxed">
            내일투어 동물 쇼츠 스타 펭귄 '내일이'의 다음 여행지는 어디일까요?<br/>주제만 던져주시면 유쾌한 여행 이야기를 3가지 스타일로 생성해드립니다.
          </p>
          
          <InputForm onSubmit={handleGenerateSynopses} isLoading={isLoading} />
          
          {error && (
            <div className="mt-6 bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          <div className="mt-8">
            {isGeneratingSynopses && <Loader message="AI가 '내일이'의 새로운 모험을 구상하고 있습니다..." />}
            {isGeneratingStory && <Loader message="선택된 시놉시스로 '내일이'의 스토리를 만들고 있습니다..." />}

            {(synopses || generatedStory) && !isLoading && (
              <OutputDisplay
                synopses={synopses}
                generatedStory={generatedStory}
                onSelectSynopsis={handleGenerateStory}
                isGeneratingStory={isGeneratingStory}
                onConfirmStory={handleConfirmAndStructure}
                isStructuring={isStructuring}
                structuredStory={structuredStory}
                onGenerateCuts={handleGenerateCuts}
                storyCuts={storyCuts}
                isGeneratingCuts={isGeneratingCuts}
              />
            )}
          </div>
        </div>
      </main>
       <footer className="text-center py-6 text-gray-500 text-sm">
          <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;