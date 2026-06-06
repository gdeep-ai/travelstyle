import React, { useState, useEffect } from 'react';
import { PredictionResult, StyleOption, SingleOutfit } from '../types';
import { generateOutfitImage } from '../services/geminiService';
import { ExternalLink, RefreshCw, ChevronDown, ChevronUp, Search, Shirt, Glasses, Briefcase, Watch, Footprints, CheckCircle2, Luggage, Minus, ArrowDown, Layers, ArrowRight, Sparkles, Camera } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, ensureAnonymousAuth } from '../firebase';

interface ResultDisplayProps {
  data: PredictionResult;
  selectedStyle: StyleOption;
  attire: string;
  onReset: () => void;
  vibeApproved: boolean;
  setVibeApproved: (approved: boolean) => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, selectedStyle, attire, onReset, vibeApproved, setVibeApproved }) => {
  const [activeTab, setActiveTab] = useState<'daytime' | 'dinnerAndCocktails' | 'travel' | 'packingList' | 'schedule'>('daytime');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [activePaletteColor, setActivePaletteColor] = useState<string | null>(null);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [unlockedTabs, setUnlockedTabs] = useState<Set<string>>(new Set(['daytime']));

  // Tab Order for Carousel
  const tabs: ('daytime' | 'dinnerAndCocktails' | 'travel' | 'packingList' | 'schedule')[] = ['daytime', 'dinnerAndCocktails', 'travel', 'packingList', 'schedule'];
  const activeIndex = tabs.indexOf(activeTab);

  // Get current active outfit data
  const activeOutfit: SingleOutfit | undefined = activeTab !== 'packingList' ? data.outfits[activeTab as keyof typeof data.outfits] : undefined;

  // Generate Master Packing List
  const generatePackingList = () => {
    const categories: Record<string, string[]> = {
      Tops: [],
      Bottoms: [],
      Shoes: [],
      Accessories: [],
      Other: []
    };
    
    const allItems = new Set<string>();
    (Object.values(data.outfits) as SingleOutfit[]).forEach(outfit => {
      outfit.items.forEach(item => allItems.add(item.toLowerCase()));
    });
    
    Array.from(allItems).forEach(item => {
      const lower = item.toLowerCase();
      if (lower.includes('shirt') || lower.includes('top') || lower.includes('tee') || lower.includes('sweater') || lower.includes('jacket') || lower.includes('coat') || lower.includes('blazer') || lower.includes('polo')) {
        categories.Tops.push(item);
      } else if (lower.includes('pant') || lower.includes('jean') || lower.includes('trouser') || lower.includes('short') || lower.includes('skirt') || lower.includes('dress') || lower.includes('chino')) {
        categories.Bottoms.push(item);
      } else if (lower.includes('shoe') || lower.includes('boot') || lower.includes('sneaker') || lower.includes('loafer') || lower.includes('heel') || lower.includes('oxford')) {
        categories.Shoes.push(item);
      } else if (lower.includes('glass') || lower.includes('shade') || lower.includes('sunglass') || lower.includes('watch') || lower.includes('bracelet') || lower.includes('ring') || lower.includes('necklace') || lower.includes('belt') || lower.includes('bag') || lower.includes('tote') || lower.includes('purse') || lower.includes('backpack') || lower.includes('wallet') || lower.includes('luggage') || lower.includes('suitcase') || lower.includes('duffel')) {
        categories.Accessories.push(item);
      } else {
        categories.Other.push(item);
      }
    });

    return categories;
  };

  const handleColorClick = (color: string) => {
    setActivePaletteColor(color);
  };

  // Auto-generate image when active tab or active color changes
  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      if (!activeOutfit || activeTab === 'packingList') return;
      if (!unlockedTabs.has(activeTab)) return;
      
      // Use cached image if no specific color is selected
      if (!activePaletteColor && generatedImages[activeTab]) {
        setImageUrl(generatedImages[activeTab]);
        setImageError(null);
        return;
      }

      setLoadingImage(true);
      const outfitSummary = `${activeOutfit.headline}. ${activeOutfit.items.join(', ')}`;
      // Pass the active color focus if selected
      const result = await generateOutfitImage(outfitSummary, selectedStyle, activePaletteColor || undefined);
      
      if (isMounted) {
        setImageUrl(result.url);
        setImageError(result.error);
        if (result.url && !activePaletteColor) {
          setGeneratedImages(prev => ({ ...prev, [activeTab]: result.url! }));
          
          // Save to Firebase for inspiration carousel
          try {
            const compressImage = async (base64Str: string): Promise<string> => {
              return new Promise((resolve) => {
                const img = new Image();
                img.src = base64Str;
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const MAX_WIDTH = 400; // Resize to a thumbnail-friendly width
                  const scaleSize = MAX_WIDTH / img.width;
                  canvas.width = MAX_WIDTH;
                  canvas.height = img.height * scaleSize;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.6));
                  } else {
                    resolve(base64Str);
                  }
                };
                img.onerror = () => resolve(base64Str);
              });
            };
            
            const compressedUrl = await compressImage(result.url);
            const creatorUid = await ensureAnonymousAuth();
            
            await addDoc(collection(db, 'inspirations'), {
              imageUrl: compressedUrl,
              location: data.weather.location,
              season: data.weather.season || 'Unknown',
              style: selectedStyle,
              attire: attire,
              creatorUid,
              createdAt: serverTimestamp()
            });
          } catch (e) {
            console.error("Error saving inspiration to Firebase:", e);
          }
        }
        setLoadingImage(false);
      }
    };

    fetchImage();

    return () => { isMounted = false; };
  }, [activeTab, activeOutfit, selectedStyle, activePaletteColor, unlockedTabs]);

  const getSearchUrl = (item: string) => {
    const words = item.replace(/[^\w\s-]/g, '').split(' ').filter(w => w.length > 0);
    let searchTerms = [];
    
    if (words.length > 2) {
      // Just take the last two words (usually the noun, e.g. "duffel bag", "chino pants")
      searchTerms = [words[words.length - 2], words[words.length - 1]];
    } else {
      searchTerms = words;
    }
    
    let query = searchTerms.join(' ');
    const lower = query.toLowerCase();
    
    const isAccessory = lower.includes('bag') || lower.includes('duffel') || lower.includes('luggage') || lower.includes('watch') || lower.includes('belt') || lower.includes('glasses') || lower.includes('sunglasses') || lower.includes('backpack');
    
    if (!isAccessory) {
        if (attire === 'Menswear') query += ' men';
        if (attire === 'Womenswear') query += ' women';
        if (attire === 'Gender Neutral') query += ' androgynous';
    }
    
    return `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
  };

  const getItemIcon = (item: string) => {
    const lower = item.toLowerCase();
    if (lower.includes('bag') || lower.includes('luggage') || lower.includes('suitcase') || lower.includes('duffel')) return <Luggage size={18} className="text-neutral-400" />;
    if (lower.includes('belt')) return <Minus size={18} className="text-neutral-400" />;
    if (lower.includes('shirt') || lower.includes('top') || lower.includes('tee') || lower.includes('sweater') || lower.includes('jacket') || lower.includes('coat') || lower.includes('blazer') || lower.includes('polo')) return <Shirt size={18} className="text-neutral-400" />;
    if (lower.includes('pant') || lower.includes('jean') || lower.includes('trouser') || lower.includes('short') || lower.includes('skirt') || lower.includes('dress') || lower.includes('chino')) return <Layers size={18} className="text-neutral-400" />;
    if (lower.includes('shoe') || lower.includes('boot') || lower.includes('sneaker') || lower.includes('loafer') || lower.includes('heel') || lower.includes('oxford')) return <Footprints size={18} className="text-neutral-400" />;
    if (lower.includes('glass') || lower.includes('shade') || lower.includes('sunglass')) return <Glasses size={18} className="text-neutral-400" />;
    if (lower.includes('watch') || lower.includes('bracelet') || lower.includes('ring') || lower.includes('necklace')) return <Watch size={18} className="text-neutral-400" />;
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
        
        {/* Scroll Prompt */}
        <div className="flex justify-center mb-16 animate-bounce">
          <a href="#bespoke-styling" className="flex flex-col items-center text-neutral-500 hover:text-white transition-colors">
            <span className="text-xs uppercase tracking-widest mb-2 font-bold">Discover Your Outfits</span>
            <ArrowDown size={20} />
          </a>
        </div>
      </div>

      {/* Main Content: Split Layout */}
      <div id="bespoke-styling" className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-16 scroll-mt-12">
        
        {/* Left: Outfit Details (Editorial Style) */}
        <div className="space-y-8 relative">
          
              {/* Tab Navigation */}
          <div className="flex flex-col border-b border-neutral-800 pb-6 mb-8 gap-4">
            <span className="text-neutral-400 text-base uppercase tracking-[0.2em] font-bold hidden sm:block">The Edit</span>
            <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full justify-start">
                <button 
                  onClick={() => setActiveTab('daytime')} 
                  className={`text-xs md:text-sm uppercase tracking-widest transition-all px-4 py-2 rounded-full ${activeTab === 'daytime' ? 'bg-white text-black font-bold' : 'border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-400'}`}
                >
                    Daytime
                </button>
                <button 
                  onClick={() => vibeApproved && setActiveTab('dinnerAndCocktails')} 
                  disabled={!vibeApproved}
                  className={`text-xs md:text-sm uppercase tracking-widest transition-all px-4 py-2 rounded-full ${activeTab === 'dinnerAndCocktails' ? 'bg-white text-black font-bold' : vibeApproved ? 'border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-400' : 'border border-transparent text-neutral-500 opacity-30 cursor-not-allowed'}`}
                >
                    Dinner & Cocktails
                </button>
                <button 
                  onClick={() => vibeApproved && setActiveTab('travel')} 
                  disabled={!vibeApproved}
                  className={`text-xs md:text-sm uppercase tracking-widest transition-all px-4 py-2 rounded-full ${activeTab === 'travel' ? 'bg-white text-black font-bold' : vibeApproved ? 'border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-400' : 'border border-transparent text-neutral-500 opacity-30 cursor-not-allowed'}`}
                >
                    Travel
                </button>
                <button 
                  onClick={() => vibeApproved && setActiveTab('packingList')} 
                  disabled={!vibeApproved}
                  className={`text-xs md:text-sm uppercase tracking-widest transition-all px-4 py-2 rounded-full ml-auto ${activeTab === 'packingList' ? 'bg-white text-black font-bold' : vibeApproved ? 'border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-400' : 'border border-transparent text-neutral-500 opacity-30 cursor-not-allowed'}`}
                >
                    The Works
                </button>
                <button 
                  onClick={() => vibeApproved && setActiveTab('schedule')} 
                  disabled={!vibeApproved}
                  className={`text-xs md:text-sm uppercase tracking-widest transition-all px-4 py-2 rounded-full ${activeTab === 'schedule' ? 'bg-white text-black font-bold' : vibeApproved ? 'border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-400' : 'border border-transparent text-neutral-500 opacity-30 cursor-not-allowed'}`}
                >
                    Schedule
                </button>
            </div>
          </div>

          {vibeApproved && (
            <div className="mb-8 p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg flex items-start gap-3 animate-fade-in text-neutral-300">
              <Sparkles className="text-white shrink-0 mt-0.5" size={18} />
              <p className="text-sm leading-relaxed">
                <strong className="text-white font-medium">Your full itinerary is unlocked!</strong><br/>
                Continue clicking through the times of day (e.g., <em>Dinner Party</em>) to explore and visualize the rest of your looks.
              </p>
            </div>
          )}

          <div className="animate-fade-in">
             {activeTab === 'schedule' ? (
               <div>
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-4xl md:text-5xl font-sans font-medium text-white leading-tight break-words">
                     Outfit Schedule
                   </h2>
                   <button 
                     onClick={() => window.print()}
                     className="text-xs uppercase tracking-widest border border-neutral-700 px-4 py-2 rounded hover:bg-neutral-800 transition-colors text-white"
                   >
                     Print Schedule
                   </button>
                 </div>
                 <p className="text-neutral-300 mb-10 text-lg leading-relaxed max-w-xl">
                   Your day-by-day guide to mixing and matching your packed items.
                 </p>
                 <div className="space-y-8">
                    {/* Example schedule, since we don't have actual days from the API yet, we'll just map the outfits to generic days */}
                    {['Day 1', 'Day 2', 'Day 3'].map((day, idx) => (
                      <div key={idx} className="border border-neutral-800 rounded-lg p-6 bg-neutral-900/50">
                        <h3 className="text-white text-xl font-serif mb-4">{day}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-xs text-neutral-400 uppercase tracking-widest mb-2">Daytime</h4>
                            <p className="text-sm text-neutral-200">{idx === 0 ? data.outfits.travel.headline : data.outfits.daytime.headline}</p>
                            <p className="text-xs text-neutral-500 mt-1">{idx === 0 ? data.outfits.travel.items.slice(0, 3).join(', ') : data.outfits.daytime.items.slice(0, 3).join(', ')}</p>
                          </div>
                          <div>
                            <h4 className="text-xs text-neutral-400 uppercase tracking-widest mb-2">Evening</h4>
                            <p className="text-sm text-neutral-200">{data.outfits.dinnerAndCocktails.headline}</p>
                            <p className="text-xs text-neutral-500 mt-1">{data.outfits.dinnerAndCocktails.items.slice(0, 3).join(', ')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
             ) : activeTab === 'packingList' ? (
               <div>
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-4xl md:text-5xl font-sans font-medium text-white leading-tight break-words">
                     The Works
                   </h2>
                   <button 
                     onClick={() => window.print()}
                     className="text-xs uppercase tracking-widest border border-neutral-700 px-4 py-2 rounded hover:bg-neutral-800 transition-colors text-white"
                   >
                     Print List
                   </button>
                 </div>
                 <p className="text-neutral-300 mb-10 text-lg leading-relaxed max-w-xl">
                   A consolidated checklist of every item recommended across all your outfit scenarios.
                 </p>
                 <div className="space-y-8">
                    {Object.entries(generatePackingList()).map(([category, items]) => {
                      if (items.length === 0) return null;
                      return (
                        <div key={category}>
                          <h3 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-4 border-b border-neutral-800 pb-2">{category}</h3>
                          <ul className="space-y-2">
                            {items.map((item, idx) => (
                              <li key={idx} className="group">
                                <label className="flex items-center gap-4 border-b border-neutral-800/50 py-3 hover:border-white transition-colors cursor-pointer">
                                  <input type="checkbox" className="w-5 h-5 rounded border-neutral-700 bg-neutral-900 text-white focus:ring-0 focus:ring-offset-0 cursor-pointer" />
                                  <div className="flex items-center gap-3 flex-1">
                                    {getItemIcon(item)}
                                    <span className="text-sm md:text-base font-sans text-neutral-200 group-hover:text-white transition-colors capitalize">{item}</span>
                                  </div>
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                    
                    {/* Basics */}
                    <div>
                      <h3 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-4 border-b border-neutral-800 pb-2">Basics</h3>
                      <ul className="space-y-2">
                        {['Socks (Days + 2 pairs)', 'Underwear (Days + 2 pairs)'].map((item, idx) => (
                          <li key={idx} className="group">
                            <label className="flex items-center gap-4 border-b border-neutral-800/50 py-3 hover:border-white transition-colors cursor-pointer">
                              <input type="checkbox" className="w-5 h-5 rounded border-neutral-700 bg-neutral-900 text-white focus:ring-0 focus:ring-offset-0 cursor-pointer" />
                              <div className="flex items-center gap-3 flex-1">
                                <CheckCircle2 size={18} className="text-neutral-400" />
                                <span className="text-sm md:text-base font-sans text-neutral-200 group-hover:text-white transition-colors capitalize">{item}</span>
                              </div>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                 </div>
               </div>
             ) : activeOutfit ? (
               <>
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
                                <span className="text-xs uppercase tracking-wider text-neutral-400">Show me (inspiration/mix and match)</span>
                                <Search size={14} className="text-neutral-300" />
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                 </div>

                 {activeOutfit.colorPalette && (
                   <div className="mt-8 space-y-6">
                      <p className="text-neutral-400 text-sm italic mb-4">Click a color or dual-tone to regenerate the outfit image with a specific color focus.</p>
                      {/* Row 1: Solid Focus */}
                      <div className="flex flex-col sm:flex-row sm:items-center items-start gap-3">
                        <span className="text-xs text-neutral-400 uppercase tracking-widest min-w-[100px]">Solid Focus</span>
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
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-neutral-300 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-wide">
                                  Focus {color}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Row 2: Dual-tone (Split) */}
                      {activeOutfit.colorPalette.length >= 2 && (
                        <div className="flex flex-col sm:flex-row sm:items-center items-start gap-3">
                          <span className="text-xs text-neutral-400 uppercase tracking-widest min-w-[100px]">Dual-tone</span>
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
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-neutral-300 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-wide">
                                      {color} / {nextColor}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Brand DNA */}
                      {activeOutfit.brandDNA && activeOutfit.brandDNA.length > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-center items-start gap-3 pt-4 border-t border-neutral-800/50">
                          <span className="text-xs text-neutral-400 uppercase tracking-widest min-w-[100px]">Brand DNA</span>
                          <div className="flex flex-wrap gap-2">
                            {activeOutfit.brandDNA.map((brand, idx) => (
                              <span key={idx} className="text-xs text-neutral-300 bg-neutral-800/50 px-3 py-1 rounded-full border border-neutral-700">
                                {brand}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Vibe Check / Next Outfit Button */}
                      <div className="mt-12 border-t border-neutral-800 pt-8">
                        {!vibeApproved && activeTab === 'daytime' ? (
                          <div className="p-6 border border-neutral-700 bg-neutral-900/50 rounded-lg text-center animate-fade-in-up">
                            <h3 className="text-xl font-serif text-white mb-2">Does this match your vibe?</h3>
                            <p className="text-neutral-400 text-sm mb-6">Approve this aesthetic to unlock your full packing list and daily schedule.</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                              <button 
                                onClick={() => setVibeApproved(true)} 
                                className="px-6 py-3 bg-white text-black text-xs uppercase tracking-widest font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                              >
                                <Sparkles size={14} />
                                Yes, Unlock Itinerary
                              </button>
                              <button 
                                onClick={onReset} 
                                className="px-6 py-3 border border-neutral-700 text-white text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                              >
                                <RefreshCw size={14} />
                                No, Start Over
                              </button>
                            </div>
                          </div>
                        ) : vibeApproved && activeTab !== 'schedule' ? (
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                const tabs = ['daytime', 'dinnerAndCocktails', 'travel', 'packingList', 'schedule'];
                                const currentIndex = tabs.indexOf(activeTab);
                                if (currentIndex < tabs.length - 1) {
                                  setActiveTab(tabs[currentIndex + 1] as any);
                                  // Scroll to top of the section smoothly
                                  document.getElementById('bespoke-styling')?.scrollIntoView({ behavior: 'smooth' });
                                }
                              }}
                              className="flex items-center gap-2 text-sm uppercase tracking-widest border border-neutral-700 px-6 py-3 rounded hover:bg-neutral-800 transition-colors text-white group"
                            >
                              Next: {
                                (() => {
                                  const tabs = ['daytime', 'dinnerAndCocktails', 'travel', 'packingList', 'schedule'];
                                  const names = {
                                    daytime: 'Daytime',
                                    dinnerAndCocktails: 'Dinner & Cocktails',
                                    travel: 'Travel',
                                    packingList: 'The Works',
                                    schedule: 'Schedule'
                                  };
                                  const currentIndex = tabs.indexOf(activeTab);
                                  return names[tabs[currentIndex + 1] as keyof typeof names];
                                })()
                              }
                              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                   </div>
                 )}
               </>
             ) : null}
          </div>
        </div>

        {/* Right: Visuals */}
        <div id="editorial-vision" className="mt-12 lg:mt-0 scroll-mt-12">
           <div className="sticky top-12 max-h-[calc(100vh-3rem)] overflow-y-auto pb-12 pr-2 no-scrollbar">
              <div className="aspect-[3/4] bg-neutral-900 border border-neutral-800 relative overflow-hidden flex items-center justify-center mb-6">
                {activeTab === 'packingList' || activeTab === 'schedule' ? (
                  <div className="flex flex-col h-full w-full bg-neutral-900 border border-neutral-800 overflow-hidden">
                    <div className="p-8 text-center border-b border-neutral-800">
                      <CheckCircle2 size={32} className="text-neutral-500 mb-4 mx-auto" />
                      <h3 className="text-xl font-serif text-white mb-2">{activeTab === 'packingList' ? 'Ready to Pack' : 'Outfit Schedule'}</h3>
                      <p className="text-neutral-400 text-sm">{activeTab === 'packingList' ? 'Review your consolidated list and check off items as you pack them.' : 'Your day-by-day visual guide.'}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4">
                      {Object.entries(generatedImages).map(([tab, url]) => {
                        if (tab === 'packingList' || tab === 'schedule') return null;
                        return (
                          <div key={tab} className="aspect-[3/4] relative rounded overflow-hidden border border-neutral-800">
                            <img src={url} alt={`${tab} outfit`} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                               <span className="text-white text-[10px] uppercase tracking-widest">{tab}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : loadingImage ? (
                  <div className="flex flex-col items-center gap-4 text-neutral-400">
                    <div className="w-12 h-12 border-2 border-neutral-800 border-t-white rounded-full animate-spin"></div>
                    <p className="text-xs uppercase tracking-widest animate-pulse">Rendering Concept...</p>
                    {activePaletteColor && (
                        <p className="text-xs uppercase tracking-widest text-neutral-400">Focusing on {activePaletteColor}</p>
                    )}
                  </div>
                ) : !unlockedTabs.has(activeTab) ? (
                  <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                    <Camera className="text-neutral-600 mb-6" size={48} />
                    <h3 className="text-white font-serif text-2xl mb-3">Visualize This Look</h3>
                    <p className="text-neutral-400 text-sm mb-8 max-w-xs leading-relaxed">Generate a high-fashion editorial image of this specific outfit.</p>
                    <button 
                      onClick={() => setUnlockedTabs(prev => new Set(prev).add(activeTab))}
                      className="px-8 py-4 bg-white text-black text-xs uppercase tracking-widest font-bold hover:bg-neutral-200 transition-colors"
                    >
                      Generate Image
                    </button>
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
                  <div className="text-neutral-500 flex flex-col items-center gap-3 text-center px-6">
                     <RefreshCw size={32} className="opacity-50" />
                     <p className="text-sm uppercase tracking-widest">Image Unavailable</p>
                     {imageError && (
                       <p className="text-xs text-red-400/80 mt-2">{imageError}</p>
                     )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                 <button 
                    onClick={onReset}
                    className="flex-1 py-4 border border-white text-white hover:bg-white hover:text-black transition-colors uppercase text-xs font-bold tracking-[0.2em]"
                >
                    Need new drip? (Start over)
                </button>
              </div>

              {/* Inspiration Searches */}
              <div className="mt-8 pt-4 border-t border-neutral-800">
                  <h4 className="text-xs text-neutral-400 uppercase tracking-widest mb-3">Social Inspiration</h4>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <a 
                          href={`https://www.instagram.com/explore/tags/${data.weather.location.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}style/`}
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-neutral-300 uppercase tracking-wider hover:text-white transition-colors"
                      >
                          <ExternalLink size={10} />
                          #{data.weather.location.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}style
                      </a>
                      <a 
                          href={`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(`${selectedStyle} ${attire} outfit ${data.weather.location}`)}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-neutral-300 uppercase tracking-wider hover:text-white transition-colors"
                      >
                          <ExternalLink size={10} />
                          Pinterest: {selectedStyle} in {data.weather.location}
                      </a>
                  </div>
              </div>

              {/* Grounding Sources */}
              {data.groundingUrls.length > 0 && (
                <div className="mt-6 pt-4 border-t border-neutral-800">
                    <h4 className="text-xs text-neutral-400 uppercase tracking-widest mb-3">Read more about the vibe</h4>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {data.groundingUrls.map((url, i) => (
                        <a 
                            key={i} 
                            href={url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-neutral-400 uppercase tracking-wider hover:text-neutral-200 transition-colors"
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