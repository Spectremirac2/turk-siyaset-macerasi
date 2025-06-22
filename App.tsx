
import React, { useState, useEffect, useCallback } from 'react';
import { PlayerStats, Scene, Choice, GroundingChunk } from './types';
import { scenes, INITIAL_PLAYER_STATS, API_KEY_ERROR_MESSAGE } from './constants/gameData';
import { generateNarrative, generateImage, generateGroundedText } from './services/geminiService';
import StatsDisplay from './components/StatsDisplay';
import ChoiceButton from './components/ChoiceButton';
import LoadingSpinner from './components/LoadingSpinner';
import { ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

const App: React.FC = () => {
  const [currentSceneId, setCurrentSceneId] = useState<string>('welcome');
  const [playerStats, setPlayerStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [narrativeText, setNarrativeText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChoiceText, setLastChoiceText] = useState<string | undefined>(undefined);
  const [apiKeyAvailable, setApiKeyAvailable] = useState<boolean>(true);

  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<string | null>(null);
  const [searchGroundingChunks, setSearchGroundingChunks] = useState<GroundingChunk[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);


  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyAvailable(false);
      setError(API_KEY_ERROR_MESSAGE);
      setIsLoading(false);
    }
  }, []);

  const loadScene = useCallback(async (sceneId: string, choiceText?: string) => {
    if (!apiKeyAvailable) return;

    setIsLoading(true);
    setError(null);
    const scene = scenes[sceneId];
    if (!scene) {
      setError(`Sahne bulunamadı: ${sceneId}`);
      setIsLoading(false);
      return;
    }

    try {
      const narrative = await generateNarrative(scene.id, scene.storyPromptSeed, playerStats, choiceText);
      setNarrativeText(narrative);

      if (scene.imgPrompt) {
        setCurrentImage(null); // Clear previous image while new one loads
        const imageUrl = await generateImage(scene.imgPrompt);
        setCurrentImage(imageUrl);
      } else {
        setCurrentImage(null);
      }
    } catch (e: any) {
      setError(`Sahne yüklenirken hata: ${e.message}`);
      setNarrativeText(scene.storyPromptSeed); // Fallback to seed text
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerStats, apiKeyAvailable]); // playerStats is a dependency because narrative might change based on it

  useEffect(() => {
    loadScene(currentSceneId, lastChoiceText);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSceneId]); // Only run when currentSceneId changes. loadScene itself depends on playerStats.

  const handleChoice = (choice: Choice) => {
    const scene = scenes[currentSceneId];
    if (scene.isGameOver || scene.isGameStart) { // Reset if game over or starting fresh
       setPlayerStats(INITIAL_PLAYER_STATS);
       setCurrentSceneId(choice.next);
       setLastChoiceText(undefined);
       setNarrativeText(''); // Clear narrative for new game
       setCurrentImage(null); // Clear image for new game
       return;
    }

    // Parse effects and update stats
    const newStats = { ...playerStats };
    if (choice.effects) {
      choice.effects.split(',').forEach(effect => {
        const match = effect.match(/([a-zA-ZĞÜŞİÖÇğüşıöç]+)([+-])(\d+)/);
        if (match) {
          const key = match[1] as keyof PlayerStats;
          const operator = match[2];
          const value = parseInt(match[3], 10);
          if (Object.prototype.hasOwnProperty.call(newStats, key)) {
             newStats[key] = (operator === '+') ? newStats[key] + value : newStats[key] - value;
             newStats[key] = Math.max(0, Math.min(100, newStats[key])); // Clamp between 0-100
          }
        }
      });
    }
    setPlayerStats(newStats);
    setLastChoiceText(choice.text);
    
    // Check for game over conditions based on new stats
    if (newStats.etik < 20 && newStats.moral < 30) { 
        setCurrentSceneId('gameOver_hapis');
        return;
    }
    if (newStats.etik < 10) {
        setCurrentSceneId('gameOver_etikDusuk');
        return;
    }

    setCurrentSceneId(choice.next);
  };
  
  const handleRestart = () => {
    setPlayerStats(INITIAL_PLAYER_STATS);
    setCurrentSceneId('welcome');
    setLastChoiceText(undefined);
    setError(null);
    setCurrentImage(null);
    setNarrativeText('');
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults(null);
    setSearchGroundingChunks([]);
  }

  const currentSceneData = scenes[currentSceneId];

  const handleSearch = async () => {
    if (!searchQuery.trim() || !apiKeyAvailable) return;
    setIsSearching(true);
    setSearchResults(null);
    setSearchGroundingChunks([]);
    try {
      const { text, groundingMetadata } = await generateGroundedText(searchQuery);
      setSearchResults(text);
      if (groundingMetadata?.groundingChunks) {
        setSearchGroundingChunks(groundingMetadata.groundingChunks);
      }
    } catch (e: any) {
      setSearchResults(`Arama sırasında hata: ${e.message}`);
    } finally {
      setIsSearching(false);
    }
  };


  if (!apiKeyAvailable && error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-900 text-white">
        <h1 className="text-3xl font-bold mb-4 text-red-300">Kritik Hata</h1>
        <p className="text-xl text-center">{error}</p>
        <p className="mt-6 text-md bg-red-800 p-3 rounded-md">Lütfen API anahtarınızın doğru şekilde ayarlandığından emin olun ve sayfayı yenileyin.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-gray-100 selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-3xl bg-gray-800 shadow-2xl rounded-xl overflow-hidden my-4">
        <header className="p-5 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 flex justify-between items-center relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-400 flex-grow">Türk Siyaset Macerası</h1>
          {currentSceneData && !currentSceneData.isGameStart && (
            <button 
              onClick={handleRestart}
              className="absolute top-1/2 -translate-y-1/2 right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-colors"
              title="Oyunu Yeniden Başlat"
            >
              <ArrowPathIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}
           {currentSceneData && !currentSceneData.isGameStart && !currentSceneData.isGameOver && (
            <button 
              onClick={() => setShowSearch(prev => !prev)}
              className="absolute top-1/2 -translate-y-1/2 left-4 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg transition-colors"
              title="Google ile Ara"
            >
              <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}
        </header>

        {currentSceneData && !currentSceneData.isGameStart && !currentSceneData.isGameOver && (
          <StatsDisplay stats={playerStats} />
        )}

        {isLoading && !narrativeText && !currentImage ? ( // Show full page loader only on initial load or full scene change
          <div className="p-10 flex flex-col items-center justify-center min-h-[400px]">
            <LoadingSpinner />
            <p className="mt-4 text-gray-400">Sahne yükleniyor...</p>
          </div>
        ) : (
          <main className="p-4 sm:p-6">
            {error && <p className="text-red-300 bg-red-700/50 p-3 rounded-md mb-4 text-center border border-red-500">{error}</p>}
            
            {showSearch && (
              <div className="mb-6 p-4 bg-gray-700/70 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3 text-blue-300">Google ile Araştır</h3>
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isSearching && handleSearch()}
                    placeholder="Güncel bir olay veya bilgi ara..."
                    className="flex-grow p-2.5 rounded bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[80px]">
                    {isSearching ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : "Ara"}
                  </button>
                </div>
                {isSearching && !searchResults && <p className="text-sm text-gray-400">Aranıyor...</p>}
                {searchResults && (
                  <div className="mt-3 p-3 bg-gray-800/80 rounded max-h-60 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{searchResults}</p>
                    {searchGroundingChunks.length > 0 && (
                       <div className="mt-3 pt-2 border-t border-gray-700">
                          <h4 className="text-xs font-semibold text-gray-400 mb-1">Kaynaklar:</h4>
                          <ul className="list-disc list-inside text-xs space-y-1">
                            {searchGroundingChunks.map((chunk, idx) => (
                              <li key={idx}><a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline hover:text-blue-300">{chunk.web.title || chunk.web.uri}</a></li>
                            ))}
                          </ul>
                       </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="relative mb-6 w-full h-56 sm:h-64 md:h-80 rounded-lg overflow-hidden shadow-xl bg-gray-700">
              {isLoading && !currentImage && <div className="absolute inset-0 flex items-center justify-center"><LoadingSpinner/></div>}
              {currentImage ? (
                <img src={currentImage} alt={currentSceneData?.title || 'Sahne resmi'} className="w-full h-full object-cover transition-opacity duration-500 ease-in-out" />
              ) : (
                 !isLoading && <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-500">Resim yükleniyor veya mevcut değil...</div>
              )}
            </div>
            
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-blue-300">{currentSceneData?.title}</h2>
            
            <div className="prose prose-sm sm:prose-base prose-invert max-w-none mb-6 min-h-[100px] bg-gray-700/80 p-4 rounded-lg shadow backdrop-blur-sm">
              {isLoading && !narrativeText ? <LoadingSpinner/> : <p className="whitespace-pre-wrap">{narrativeText || "Hikaye yükleniyor..."}</p>}
            </div>
            
            {currentSceneData && currentSceneData.choices && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {currentSceneData.choices.map((choice, index) => (
                  <ChoiceButton
                    key={index}
                    text={choice.text}
                    onClick={() => handleChoice(choice)}
                    disabled={isLoading}
                  />
                ))}
              </div>
            )}
             {currentSceneData && currentSceneData.isGameOver && (
                <div className="mt-6 text-center p-4 bg-yellow-700/30 rounded-lg border border-yellow-600">
                    <p className="text-xl font-semibold text-yellow-300">Oyun Bitti.</p>
                    <p className="text-yellow-400 mt-1">{narrativeText}</p>
                </div>
            )}
          </main>
        )}
      </div>
       <footer className="text-center py-4">
        <p className="text-xs text-gray-500">Türk Siyaset Macerası &copy; {new Date().getFullYear()}. Tüm hakları saklıdır (değildir).</p>
      </footer>
    </div>
  );
};

export default App;
