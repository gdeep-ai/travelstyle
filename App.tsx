import React, { useState, useEffect } from 'react';
import { StyleOption, PredictionResult, DateRange, AttireOption } from './types';
import { getStyleAdvice } from './services/geminiService';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';

interface PastInspiration {
  id: string;
  imageUrl: string;
  location: string;
  style: string;
  attire: string;
}

const App: React.FC = () => {
  const [who, setWho] = useState('');
  const [attire, setAttire] = useState<AttireOption>(AttireOption.WOMAN);
  const [where, setWhere] = useState('');
  const [vibe, setVibe] = useState('');
  const [tone, setTone] = useState(50);
  
  // Extra Context
  const [userContext, setUserContext] = useState('');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [localBlend, setLocalBlend] = useState(false);

  // Default date range
  const today = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<DateRange>({ start: today, end: today });
  
  const [style, setStyle] = useState<StyleOption>(StyleOption.CASUAL);
  
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pastInspirations, setPastInspirations] = useState<PastInspiration[]>([]);
  const [isLoadingInspirations, setIsLoadingInspirations] = useState(true);

  useEffect(() => {
    const fetchInspirations = async () => {
      try {
        const q = query(collection(db, 'inspirations'), orderBy('createdAt', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const inspirations: PastInspiration[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          inspirations.push({
            id: doc.id,
            imageUrl: data.imageUrl,
            location: data.location,
            style: data.style,
            attire: data.attire,
          });
        });
        
        // Shuffle the array to show random past inspirations
        for (let i = inspirations.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [inspirations[i], inspirations[j]] = [inspirations[j], inspirations[i]];
        }
        
        setPastInspirations(inspirations);
      } catch (err) {
        console.error("Error fetching past inspirations:", err);
      } finally {
        setIsLoadingInspirations(false);
      }
    };

    fetchInspirations();
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dateString = `${dateRange.start} to ${dateRange.end}`;
      const contextWithVibe = `Trip Vibe/Goal: ${vibe}. Additional Context: ${userContext}`;
      const data = await getStyleAdvice(who, attire, where, dateString, style, contextWithVibe, userImage, localBlend, tone);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to consult the fashion oracle. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setWho('');
    setWhere('');
    setUserContext('');
    setUserImage(null);
    setLocalBlend(false);
    const t = new Date().toISOString().split('T')[0];
    setDateRange({ start: t, end: t });
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-neutral-100 selection:bg-white selection:text-black">
      
      {/* Editorial Header Line */}
      <div className="border-b border-neutral-900 py-4 mb-12">
        <div className="container mx-auto px-6 flex justify-between items-center">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-neutral-400">Vol. 01</span>
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-neutral-400">Est. 2024</span>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 pb-20 flex flex-col items-center min-h-screen">
        
        {/* Header */}
        <header className="text-center mb-8">
             <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tighter mb-3">
               StyleTravel
             </h1>
             <div className="flex flex-col items-center gap-2">
               <a href="#editorial-vision" className="text-neutral-300 text-xs uppercase tracking-[0.2em] hover:text-white transition-colors">
                 Editorial Vision
               </a>
               <div className="flex gap-4 text-neutral-400 text-xs uppercase tracking-[0.2em] border-t border-b border-neutral-800 py-2 w-full max-w-lg justify-center">
                 <a href="#weather-travel" className="hover:text-white transition-colors">Weather/Travel</a>
                 <span>•</span>
                 <a href="#bespoke-styling" className="hover:text-white transition-colors">Bespoke Styling Curation</a>
               </div>
             </div>
        </header>

        {/* Dynamic Content */}
        <main className="w-full flex flex-col items-center justify-center flex-1">
          {error && (
            <div className="w-full max-w-xl border border-red-900/50 text-red-400 px-6 py-4 mb-8 text-center text-sm uppercase tracking-widest">
              {error}
            </div>
          )}

          {!result ? (
            <>
              <InputForm
                who={who}
                setWho={setWho}
                attire={attire}
                setAttire={setAttire}
                where={where}
                setWhere={setWhere}
                vibe={vibe}
                setVibe={setVibe}
                tone={tone}
                setTone={setTone}
                dateRange={dateRange}
                setDateRange={setDateRange}
                style={style}
                setStyle={setStyle}
                userContext={userContext}
                setUserContext={setUserContext}
                userImage={userImage}
                setUserImage={setUserImage}
                localBlend={localBlend}
                setLocalBlend={setLocalBlend}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
              
              {/* Past Inspiration Carousel Placeholder */}
              {!isLoading && (
                <div className="w-full max-w-4xl mx-auto mt-24 pb-12">
                  <div className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-4">
                    <h2 className="text-lg font-medium text-white tracking-wide uppercase">Past Inspiration</h2>
                    <span className="text-xs text-neutral-500 uppercase tracking-widest">Curated Archives</span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-8 snap-x scrollbar-hide">
                    {isLoadingInspirations ? (
                      [1, 2, 3, 4].map((i) => (
                        <div key={i} className="min-w-[280px] h-[360px] bg-neutral-900 border border-neutral-800 rounded-xl snap-center flex flex-col items-center justify-center text-neutral-600 animate-pulse">
                          <span className="text-xs uppercase tracking-widest">Loading Archive...</span>
                        </div>
                      ))
                    ) : pastInspirations.length > 0 ? (
                      pastInspirations.map((item) => (
                        <div key={item.id} className="min-w-[280px] w-[280px] h-[360px] bg-neutral-900 border border-neutral-800 rounded-xl snap-center relative overflow-hidden group">
                          <img src={item.imageUrl} alt={`${item.style} in ${item.location}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                            <span className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">{item.attire}</span>
                            <h3 className="text-white font-serif text-xl leading-tight mb-1">{item.location}</h3>
                            <span className="text-xs text-neutral-300 uppercase tracking-wider">{item.style}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="w-full text-center py-12 text-neutral-500 text-sm uppercase tracking-widest">
                        No archives found. Be the first to curate a collection.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <ResultDisplay 
              data={result} 
              selectedStyle={style} 
              attire={attire}
              onReset={handleReset} 
            />
          )}
        </main>
        
        <footer className="mt-32 text-neutral-500 text-xs uppercase tracking-[0.2em]">
          <p>© StyleTravel Digital</p>
        </footer>
      </div>
    </div>
  );
};

export default App;