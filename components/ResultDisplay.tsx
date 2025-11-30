import React, { useState, useEffect } from 'react';
import { PredictionResult, StyleOption, SingleOutfit } from '../types';
import { generateOutfitImage } from '../services/geminiService';
import { ExternalLink, RefreshCw, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Instagram } from 'lucide-react';

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
  const [activePaletteColor, setActivePaletteColor] = useState<string | null>(null);

  // Tab Order for Carousel
  const tabs: ('day' | 'evening' | 'dinner')[] = ['day', 'evening', 'dinner'];
  const activeIndex = tabs.indexOf(activeTab);

  // Get current active outfit data
  const activeOutfit: SingleOutfit = data.outfits[activeTab];

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex]);
    setActivePaletteColor(null); // Reset color focus on tab change
  };

  const handlePrev = () => {
    const prevIndex = (activeIndex - 1 + tabs.length) % tabs.length;
    setActiveTab(tabs[prevIndex]);
    setActivePaletteColor(null); // Reset color focus on tab change
  };

  const handleColorClick = (color: string) => {
    setActivePaletteColor(color);
  };

  // Auto-generate image when active tab or active color changes
  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      setLoadingImage(true);
      const outfitSummary = `${activeOutfit.headline}. ${activeOutfit.items.join(', ')}`;
      // Pass the active color focus if selected
      const url = await generateOutfitImage(outfitSummary, selectedStyle, activePaletteColor || undefined);
      
      if (isMounted) {
        setImageUrl(url);
        setLoadingImage(false);
      }
    };

    fetchImage();

    return () => { isMounted = false; };
  }, [activeTab, activeOutfit, selectedStyle, activePaletteColor]);

  // Helper to get Instagram Hashtag URL
  const getInstagramUrl = (item: string) => {
    // Remove spaces and special chars to make a hashtag
    const tag = item.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return `https://www.instagram.com/explore/tags/${tag}/`;
  };

  return (
    <div className="w-full max-w-7xl animate-fade-in-up pb-20">
      
      {/* Top Section: Forecast */}
      <div className="border-b border-neutral-800 pb-12 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
                <span className="text-neutral-500 uppercase tracking-[0.3em] text-xs font-bold mb-2 block">Location</span>
                <h2 className="text-6xl md:text-8xl font-serif text-white mb-4 leading-none">{data.weather.location}</h2>
                <div className="text-3xl font-light text-neutral-300">{data.weather.temperature}</div>
                <div className="text-xl text-neutral-500 italic mt-1 font-serif">{data.weather.condition}</div>
            </div>
            <div className="pt-2 md:pt-8 md:pl-12 md:border-l border-neutral-800">
                <p className="text-lg leading-relaxed text-neutral-300 font-serif">
                   {data.weather.description}
                </p>
                
                {/* Collapsible Seasonal Analysis */}
                {data.weather.seasonalContext && (
                  <div className="mt-6 pt-6 border-t border-neutral-800">
                    <button 
                      onClick={() => setShowContext(!showContext)}
                      className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
                    >
                      {showContext ? 'Hide Analysis' : 'Read Historical Analysis'}
                      {showContext ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    
                    {showContext && (
                      <div className="mt-4 text-neutral-400 text-sm leading-relaxed whitespace-pre-line border-l-2 border-neutral-800 pl-4">
                        {data.weather.seasonalContext}
                      </div>
                    )}
                  </div>
                )}
            </div>
        </div>
      </div>


      {/* Main Content: Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-16">
        
        {/* Left: Outfit Details (Editorial Style) */}
        <div className="lg:col-span-7 space-y-8 relative">
          
          {/* Carousel Navigation */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-8">
            <span className="text-neutral-500 text-xs uppercase tracking-[0.2em] font-bold">The Edit</span>
            <div className="flex items-center gap-6">
                <button onClick={handlePrev} className="text-white hover:text-neutral-400 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <span className="text-sm font-serif italic text-neutral-400 w-24 text-center">
                    {activeTab === 'day' ? 'I. Day' : activeTab === 'evening' ? 'II. Evening' : 'III. Dinner'}
                </span>
                <button onClick={handleNext} className="text-white hover:text-neutral-400 transition-colors">
                    <ChevronRight size={24} />
                </button>
            </div>
          </div>

          <div className="animate-fade-in">
             <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
               {activeOutfit.headline}
             </h2>

             <p className="text-neutral-400 mb-10 text-lg leading-relaxed max-w-xl">
               {activeOutfit.description}
             </p>

             <div className="space-y-6">
                <h3 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-6">Key Components</h3>
                <ul className="space-y-4">
                  {activeOutfit.items.map((item, idx) => (
                    <li key={idx} className="group">
                      <a 
                        href={getInstagramUrl(item)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between border-b border-neutral-800 py-3 hover:border-white transition-colors cursor-pointer"
                      >
                        <span className="text-xl md:text-2xl font-serif text-neutral-300 group-hover:text-white transition-colors capitalize">{item}</span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <span className="text-[10px] uppercase tracking-wider text-neutral-500">View on IG</span>
                            <Instagram size={18} className="text-neutral-400" />
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
             </div>

             {activeOutfit.colorPalette && (
               <div className="mt-12 flex items-center gap-4">
                  <span className="text-xs text-neutral-500 uppercase tracking-widest">Palette</span>
                  <div className="h-[1px] bg-neutral-800 flex-1"></div>
                  <div className="flex gap-2">
                    {activeOutfit.colorPalette.map((color, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1 group relative">
                        <button 
                          onClick={() => handleColorClick(color)}
                          className={`w-8 h-8 rounded-full border border-neutral-700 transition-all transform hover:scale-110 ${activePaletteColor === color ? 'ring-2 ring-white scale-110' : ''}`}
                          style={{ backgroundColor: color }}
                          title={`Generate image focusing on ${color}`}
                        ></button>
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-neutral-300 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-wide">
                            Focus {color}
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
             )}
          </div>
        </div>

        {/* Right: Visuals */}
        <div className="lg:col-span-5 mt-12 lg:mt-0">
           <div className="sticky top-12">
              <div className="aspect-[3/4] bg-neutral-900 border border-neutral-800 relative overflow-hidden flex items-center justify-center mb-6">
                {loadingImage ? (
                  <div className="flex flex-col items-center gap-4 text-neutral-500">
                    <div className="w-12 h-12 border-2 border-neutral-800 border-t-white rounded-full animate-spin"></div>
                    <p className="text-xs uppercase tracking-widest animate-pulse">Rendering Concept...</p>
                    {activePaletteColor && (
                        <p className="text-[10px] uppercase tracking-widest text-neutral-600">Focusing on {activePaletteColor}</p>
                    )}
                  </div>
                ) : imageUrl ? (
                  <div className="relative w-full h-full group">
                    <img 
                      src={imageUrl} 
                      alt="AI generated outfit suggestion" 
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                ) : (
                  <div className="text-neutral-600 flex flex-col items-center gap-3">
                     <RefreshCw size={32} className="opacity-50" />
                     <p className="text-sm uppercase tracking-widest">Image Unavailable</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                 <button 
                    onClick={onReset}
                    className="flex-1 py-4 border border-white text-white hover:bg-white hover:text-black transition-colors uppercase text-xs font-bold tracking-[0.2em]"
                >
                    New Search
                </button>
              </div>

              {/* Grounding Sources */}
              {data.groundingUrls.length > 0 && (
                <div className="mt-8 pt-4 border-t border-neutral-800">
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {data.groundingUrls.map((url, i) => (
                        <a 
                            key={i} 
                            href={url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[10px] text-neutral-600 uppercase tracking-wider hover:text-neutral-400"
                        >
                            <ExternalLink size={10} />
                            Source {i + 1}
                        </a>
                        ))}
                    </div>
                </div>
                )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ResultDisplay;