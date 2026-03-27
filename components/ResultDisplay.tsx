import React, { useState, useEffect } from 'react';
import { PredictionResult, StyleOption, SingleOutfit } from '../types';
import { generateOutfitImage } from '../services/geminiService';
import { ExternalLink, RefreshCw, ChevronDown, ChevronUp, Search, Shirt, Glasses, Briefcase, Watch, Footprints, CheckCircle2 } from 'lucide-react';

interface ResultDisplayProps {
  data: PredictionResult;
  selectedStyle: StyleOption;
  attire: string;
  onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, selectedStyle, attire, onReset }) => {
  const [activeTab, setActiveTab] = useState<'day' | 'evening' | 'dinner' | 'nightOut'>('day');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [activePaletteColor, setActivePaletteColor] = useState<string | null>(null);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');

  // Tab Order for Carousel
  const tabs: ('day' | 'evening' | 'dinner' | 'nightOut')[] = ['day', 'evening', 'dinner', 'nightOut'];
  const activeIndex = tabs.indexOf(activeTab);

  // Get current active outfit data
  const activeOutfit: SingleOutfit = data.outfits[activeTab];

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

  // Helper to get Pinterest Search URL
  const getSearchUrl = (item: string) => {
    const query = `${item} ${attire} ${selectedStyle} style outfit ${data.weather.location}`;
    return `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
  };

  const getItemIcon = (item: string) => {
    const lower = item.toLowerCase();
    if (lower.includes('shirt') || lower.includes('top') || lower.includes('tee') || lower.includes('sweater') || lower.includes('jacket') || lower.includes('coat') || lower.includes('blazer') || lower.includes('polo')) return <Shirt size={18} className="text-neutral-400" />;
    if (lower.includes('pant') || lower.includes('jean') || lower.includes('trouser') || lower.includes('short') || lower.includes('skirt') || lower.includes('dress') || lower.includes('chino')) return <Footprints size={18} className="text-neutral-400" />;
    if (lower.includes('shoe') || lower.includes('boot') || lower.includes('sneaker') || lower.includes('loafer') || lower.includes('heel') || lower.includes('oxford')) return <Footprints size={18} className="text-neutral-400" />;
    if (lower.includes('glass') || lower.includes('shade') || lower.includes('sunglass')) return <Glasses size={18} className="text-neutral-400" />;
    if (lower.includes('bag') || lower.includes('tote') || lower.includes('purse') || lower.includes('backpack') || lower.includes('wallet')) return <Briefcase size={18} className="text-neutral-400" />;
    if (lower.includes('watch') || lower.includes('bracelet') || lower.includes('ring') || lower.includes('necklace') || lower.includes('belt')) return <Watch size={18} className="text-neutral-400" />;
    return <CheckCircle2 size={18} className="text-neutral-400" />;
  };

  const temp = data.weather.temperature;
  const isObj = typeof temp === 'object' && temp !== null;
  const tempDisplay = isObj 
    ? (tempUnit === 'C' ? `${(temp as any).celsius}°C` : `${(temp as any).fahrenheit}°F`) + ((temp as any).note ? ` (${(temp as any).note})` : '')
    : temp;

  return (
    <div className="w-full max-w-7xl animate-fade-in-up pb-20">
      
      {/* Top Section: Forecast */}
      <div id="weather-travel" className="border-b border-neutral-800 pb-12 mb-12 scroll-mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
                <span className="text-neutral-400 uppercase tracking-[0.3em] text-xs font-bold mb-2 block">Location</span>
                <h2 className="text-5xl md:text-7xl font-serif text-white mb-4 leading-tight break-words hyphens-auto">{data.weather.location}</h2>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-light text-neutral-300">{tempDisplay as string}</div>
                  {isObj && (
                    <button 
                      onClick={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
                      className="text-xs uppercase tracking-widest border border-neutral-700 px-2 py-1 rounded hover:bg-neutral-800 transition-colors"
                    >
                      °{tempUnit === 'C' ? 'F' : 'C'}
                    </button>
                  )}
                </div>
                <div className="text-xl text-neutral-400 italic mt-1 font-sans">{data.weather.condition}</div>
            </div>
            <div className="pt-2 md:pt-8 md:pl-12 md:border-l border-neutral-800">
                <p className="text-lg leading-relaxed text-neutral-300 font-sans whitespace-pre-line">
                   {data.weather.description}
                </p>
                
                {/* Collapsible Seasonal Analysis */}
                {data.weather.seasonalContext && (
                  <div className="mt-6 pt-6 border-t border-neutral-800">
                    <button 
                      onClick={() => setShowContext(!showContext)}
                      className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors bg-neutral-900/50 px-4 py-2 rounded-md border border-neutral-800"
                    >
                      {showContext ? 'Hide Details' : 'Will I need an umbrella? / Sunglasses? (weather)'}
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
      <div id="bespoke-styling" className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-16 scroll-mt-12">
        
        {/* Left: Outfit Details (Editorial Style) */}
        <div className="space-y-8 relative">
          
          {/* Tab Navigation */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-8">
            <span className="text-neutral-400 text-xs uppercase tracking-[0.2em] font-bold hidden sm:block">The Edit</span>
            <div className="flex items-center gap-4 md:gap-8 w-full sm:w-auto justify-between sm:justify-end">
                <button 
                  onClick={() => setActiveTab('day')} 
                  className={`text-xs md:text-sm uppercase tracking-widest transition-colors pb-1 border-b-2 ${activeTab === 'day' ? 'border-white text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}
                >
                    Morning
                </button>
                <button 
                  onClick={() => setActiveTab('evening')} 
                  className={`text-xs md:text-sm uppercase tracking-widest transition-colors pb-1 border-b-2 ${activeTab === 'evening' ? 'border-white text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}
                >
                    Afternoon
                </button>
                <button 
                  onClick={() => setActiveTab('dinner')} 
                  className={`text-xs md:text-sm uppercase tracking-widest transition-colors pb-1 border-b-2 ${activeTab === 'dinner' ? 'border-white text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}
                >
                    Dinner Party
                </button>
                {data.outfits.nightOut && (
                  <button 
                    onClick={() => setActiveTab('nightOut')} 
                    className={`text-xs md:text-sm uppercase tracking-widest transition-colors pb-1 border-b-2 ${activeTab === 'nightOut' ? 'border-white text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}
                  >
                      Night Out
                  </button>
                )}
            </div>
          </div>

          <div className="animate-fade-in">
             <h2 className="text-4xl md:text-5xl font-sans font-medium text-white mb-6 leading-tight break-words">
               {activeOutfit.headline}
             </h2>

             <p className="text-neutral-300 mb-10 text-lg leading-relaxed max-w-xl">
               {activeOutfit.description}
             </p>

             <div className="space-y-6">
                <h3 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-4">Key Components</h3>
                <ul className="space-y-2">
                  {activeOutfit.items.map((item, idx) => (
                    <li key={idx} className="group">
                      <a 
                        href={getSearchUrl(item)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between border-b border-neutral-800 py-2 hover:border-white transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {getItemIcon(item)}
                          <span className="text-lg md:text-xl font-sans text-neutral-200 group-hover:text-white transition-colors capitalize">{item}</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <span className="text-[10px] uppercase tracking-wider text-neutral-400">Show me (inspiration/mix and match)</span>
                            <Search size={14} className="text-neutral-300" />
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
             </div>

             {activeOutfit.colorPalette && (
               <div className="mt-8 space-y-6">
                  {/* Row 1: Solid Focus */}
                  <div className="flex flex-col sm:flex-row sm:items-center items-start gap-3">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest min-w-[100px]">Solid Focus</span>
                    <div className="flex flex-wrap gap-2">
                      {activeOutfit.colorPalette.map((color, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1 group relative">
                          <button 
                            onClick={() => handleColorClick(color)}
                            className={`w-8 h-8 rounded-full border border-neutral-700 transition-all transform hover:scale-110 ${activePaletteColor === color ? 'ring-2 ring-white scale-110' : ''}`}
                            style={{ backgroundColor: color }}
                            title={`Focus on ${color}`}
                          ></button>
                          {/* Tooltip */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-neutral-300 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-wide">
                              Focus {color}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Row 2: Dual-tone (Split) */}
                  {activeOutfit.colorPalette.length >= 2 && (
                    <div className="flex flex-col sm:flex-row sm:items-center items-start gap-3">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-widest min-w-[100px]">Dual-tone</span>
                      <div className="flex flex-wrap gap-2">
                        {activeOutfit.colorPalette.map((color, idx) => {
                          const nextColor = activeOutfit.colorPalette[(idx + 1) % activeOutfit.colorPalette.length];
                          const dualColor = `${color}/${nextColor}`;
                          return (
                            <div key={idx} className="flex flex-col items-center gap-1 group relative">
                              <button 
                                onClick={() => handleColorClick(dualColor)}
                                className={`w-8 h-8 rounded-full border border-neutral-700 transition-all transform hover:scale-110 overflow-hidden ${activePaletteColor === dualColor ? 'ring-2 ring-white scale-110' : ''}`}
                                title={`Focus on ${color} with ${nextColor} accents`}
                              >
                                <div className="flex h-full w-full">
                                  <div className="h-full w-1/2" style={{ backgroundColor: color }}></div>
                                  <div className="h-full w-1/2" style={{ backgroundColor: nextColor }}></div>
                                </div>
                              </button>
                              {/* Tooltip */}
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-neutral-300 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-wide">
                                  {color} / {nextColor}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
               </div>
             )}
          </div>
        </div>

        {/* Right: Visuals */}
        <div id="editorial-vision" className="mt-12 lg:mt-0 scroll-mt-12">
           <div className="sticky top-12 max-h-[calc(100vh-3rem)] overflow-y-auto pb-12 pr-2 no-scrollbar">
              <div className="aspect-[3/4] bg-neutral-900 border border-neutral-800 relative overflow-hidden flex items-center justify-center mb-6">
                {loadingImage ? (
                  <div className="flex flex-col items-center gap-4 text-neutral-400">
                    <div className="w-12 h-12 border-2 border-neutral-800 border-t-white rounded-full animate-spin"></div>
                    <p className="text-xs uppercase tracking-widest animate-pulse">Rendering Concept...</p>
                    {activePaletteColor && (
                        <p className="text-[10px] uppercase tracking-widest text-neutral-500">Focusing on {activePaletteColor}</p>
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
                  <div className="text-neutral-500 flex flex-col items-center gap-3">
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
                    Let's rethink the vibe (start over)
                </button>
              </div>

              {/* Inspiration Searches */}
              <div className="mt-8 pt-4 border-t border-neutral-800">
                  <h4 className="text-[10px] text-neutral-400 uppercase tracking-widest mb-3">Social Inspiration</h4>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <a 
                          href={`https://www.instagram.com/explore/tags/${data.weather.location.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}style/`}
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[10px] text-neutral-300 uppercase tracking-wider hover:text-white transition-colors"
                      >
                          <ExternalLink size={10} />
                          #{data.weather.location.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}style
                      </a>
                      <a 
                          href={`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(`${selectedStyle} ${attire} outfit ${data.weather.location}`)}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[10px] text-neutral-300 uppercase tracking-wider hover:text-white transition-colors"
                      >
                          <ExternalLink size={10} />
                          Pinterest: {selectedStyle} in {data.weather.location}
                      </a>
                  </div>
              </div>

              {/* Grounding Sources */}
              {data.groundingUrls.length > 0 && (
                <div className="mt-6 pt-4 border-t border-neutral-800">
                    <h4 className="text-[10px] text-neutral-400 uppercase tracking-widest mb-3">Read more about the vibe</h4>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {data.groundingUrls.map((url, i) => (
                        <a 
                            key={i} 
                            href={url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[10px] text-neutral-500 uppercase tracking-wider hover:text-neutral-300 transition-colors"
                        >
                            <ExternalLink size={10} />
                            {(() => {
                              try { return new URL(url).hostname.replace('www.', ''); }
                              catch { return `Reference Article ${i + 1}`; }
                            })()}
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