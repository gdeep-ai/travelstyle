import React, { useState } from 'react';
import { StyleOption, PredictionResult, DateRange, AttireOption } from './types';
import { getStyleAdvice } from './services/geminiService';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';

const App: React.FC = () => {
  const [who, setWho] = useState('');
  const [attire, setAttire] = useState<AttireOption>(AttireOption.WOMAN);
  const [where, setWhere] = useState('');
  const [vibe, setVibe] = useState('');
  
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

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dateString = `${dateRange.start} to ${dateRange.end}`;
      const contextWithVibe = `Trip Vibe/Goal: ${vibe}. Additional Context: ${userContext}`;
      const data = await getStyleAdvice(who, attire, where, dateString, style, contextWithVibe, userImage, localBlend);
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
            <InputForm
              who={who}
              setWho={setWho}
              attire={attire}
              setAttire={setAttire}
              where={where}
              setWhere={setWhere}
              vibe={vibe}
              setVibe={setVibe}
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