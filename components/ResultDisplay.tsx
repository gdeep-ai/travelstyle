import React, { useState, useEffect } from 'react';
import { PredictionResult, StyleOption, SingleOutfit } from '../types';
import { generateOutfitImage } from '../services/geminiService';
import { CloudSun, Sparkles, ExternalLink, RefreshCw, ChevronDown, ChevronUp, Sun, Moon, Wine, Search } from 'lucide-react';

interface ResultDisplayProps {
  data: PredictionResult;
  selectedStyle: StyleOption;
  onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, selectedStyle, onReset }) => {
  const [activeTab, setActiveTab] = useState<'day' | 'evening' | 'dinner'>('day');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [showContext, setShowContext] = useState(false);

  // Get current active outfit data
  const activeOutfit: SingleOutfit = data.outfits[activeTab];

  // Auto-generate image when active tab changes
  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      setLoadingImage(true);
      const outfitSummary = `${activeOutfit.headline}. ${activeOutfit.items.join(', ')}`;
      const url = await generateOutfitImage(outfitSummary, selectedStyle);
      
      if (isMounted) {
        setImageUrl(url);
        setLoadingImage(false);
      }
    };

    fetchImage();

    return () => { isMounted = false; };
  }, [activeTab, activeOutfit, selectedStyle]);

  // Helper to get Google Image Search URL
  const getSearchUrl = (query: string) => {
    const searchTerm = encodeURIComponent(`${query} ${selectedStyle} fashion`);
    return `https://www.google.com/search?q=${searchTerm}&tbm=isch`;
  };

  return (
    <div className="w-full max-w-7xl animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Details (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Weather Card */}
          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-slate-400 text-lg font-semibold uppercase tracking-wider">Forecast</h2>
                <h3 className="text-4xl font-bold text-white mt-2 leading-tight">{data.weather.location}</h3>
              </div>
              <CloudSun className="text-blue-400" size={48} />
            </div>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="text-6xl font-light text-white">{data.weather.temperature}</div>
              <div className="px-4 py-2 bg-slate-700/50 rounded-full text-blue-200 text-base font-medium">
                {data.weather.condition}
              </div>
            </div>
            
            <p className="text-slate-300 text-xl leading-relaxed">
              {data.weather.description}
            </p>

            {/* Collapsible Seasonal Analysis Section */}
            {data.weather.seasonalContext && (
              <div className="mt-8 border-t border-slate-700/50 pt-4">
                <button 
                  onClick={() => setShowContext(!showContext)}
                  className="w-full flex items-center justify-between text-emerald-400 hover:text-emerald-300 transition-colors group"
                >
                  <span className="text-lg font-semibold uppercase tracking-wider flex items-center gap-2">
                     Historical Context
                  </span>
                  {showContext ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
                
                {showContext && (
                  <div className="mt-4 bg-slate-900/40 p-6 rounded-xl animate-fade-in">
                    <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-line">
                      {data.weather.seasonalContext}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Outfit Selection Tabs (Cards) */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'day', label: 'Daytime', icon: Sun },
              { id: 'evening', label: 'Evening', icon: Moon },
              { id: 'dinner', label: 'Dinner', icon: Wine }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-[1.02]'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <tab.icon size={24} />
                <span className="font-semibold text-lg">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Active Outfit Card */}
          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-[2rem] p-8 shadow-xl relative overflow-hidden min-h-[400px]">
             
             <div className="relative z-10">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold text-3xl">
                    {activeOutfit.headline}
                  </h2>
                  <Sparkles className="text-purple-400" size={28} />
               </div>

               <p className="text-slate-200 mb-8 italic leading-relaxed text-xl border-l-4 border-purple-500/50 pl-4">
                 "{activeOutfit.description}"
               </p>

               <div className="space-y-6">
                  <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest">Key Pieces (Click to Find)</h3>
                  <ul className="grid grid-cols-1 gap-4">
                    {activeOutfit.items.map((item, idx) => (
                      <li key={idx}>
                        <a 
                          href={getSearchUrl(item)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between group bg-slate-900/40 hover:bg-indigo-900/20 p-4 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="min-w-[8px] h-[8px] rounded-full bg-pink-500 group-hover:shadow-[0_0_10px_rgba(236,72,153,0.7)] transition-shadow"></div>
                            <span className="text-slate-200 text-xl group-hover:text-indigo-200">{item}</span>
                          </div>
                          <Search size={20} className="text-slate-600 group-hover:text-indigo-400" />
                        </a>
                      </li>
                    ))}
                  </ul>
               </div>

               {activeOutfit.colorPalette && (
                 <div className="mt-8">
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">Palette</h3>
                    <div className="flex gap-3">
                      {activeOutfit.colorPalette.map((color, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1 group cursor-help">
                          <div 
                            className="w-12 h-12 rounded-full border border-slate-600 shadow-md ring-2 ring-transparent hover:ring-white/50 transition-all"
                            style={{ backgroundColor: color.includes('#') || ['black','white','red','blue','green'].some(c => color.toLowerCase().includes(c)) ? color : '#334155' }}
                            title={color}
                          ></div>
                        </div>
                      ))}
                    </div>
                 </div>
               )}
             </div>
          </div>

          {/* Grounding Sources */}
          {data.groundingUrls.length > 0 && (
            <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-800">
              <h4 className="text-sm text-slate-500 uppercase font-bold mb-3">Weather Sources</h4>
              <div className="flex flex-wrap gap-3">
                {data.groundingUrls.map((url, i) => (
                  <a 
                    key={i} 
                    href={url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 hover:underline bg-blue-900/20 px-3 py-1.5 rounded-lg"
                  >
                    <ExternalLink size={12} />
                    Source {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Visuals (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-8 sticky top-8 h-fit">
          <div className="flex-1 bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-[2rem] p-3 shadow-xl flex items-center justify-center min-h-[600px] relative">
            {loadingImage ? (
              <div className="flex flex-col items-center gap-6 text-slate-400">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-slate-600 border-t-purple-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={28} className="text-purple-500 animate-pulse" />
                  </div>
                </div>
                <p className="text-lg font-medium animate-pulse">Visualizing {activeTab} vibe...</p>
              </div>
            ) : imageUrl ? (
              <div className="relative w-full h-full rounded-3xl overflow-hidden group">
                <img 
                  src={imageUrl} 
                  alt="AI generated outfit suggestion" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-lg font-medium">AI Visualization of {activeOutfit.headline}</p>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 flex flex-col items-center gap-3">
                 <RefreshCw size={48} className="opacity-50" />
                 <p className="text-xl">Could not generate visual.</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={onReset}
            className="w-full py-5 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold text-xl transition-all shadow-lg active:scale-95"
          >
            Start Over
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResultDisplay;