import React, { useState } from 'react';
import { StyleOption, PredictionResult, DateRange, GenderOption } from './types';
import { getStyleAdvice } from './services/geminiService';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';

const App: React.FC = () => {
  const [who, setWho] = useState('');
  const [gender, setGender] = useState<GenderOption>(GenderOption.FEMALE);
  const [where, setWhere] = useState('');
  
  // Extra Context
  const [userContext, setUserContext] = useState('');
  const [userImage, setUserImage] = useState<string | null>(null);

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
      const data = await getStyleAdvice(who, gender, where, dateString, style, userContext, userImage);
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
    const t = new Date().toISOString().split('T')[0];
    setDateRange({ start: t, end: t });
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-neutral-100 selection:bg-white selection:text-black">
      
      {/* Editorial Header Line */}
      <div className="border-b border-neutral-900 py-4 mb-12">
        <div className="container mx-auto px-6 flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-500">Vol. 01</span>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-500">Est. 2024</span>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 pb-20 flex flex-col items-center min-h-screen">
        
        {/* Header */}
        <header className="text-center mb-20">
             <h1 className="text-6xl md:text-9xl font-serif text-white tracking-tighter mb-6">
               VogueCast
             </h1>
          <p className="text-neutral-400 text-sm md:text-base uppercase tracking-[0.2em] max-w-xl mx-auto border-t border-b border-neutral-800 py-4">
            Curated Forecasts • Bespoke Styling • Editorial Vision
          </p>
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
              gender={gender}
              setGender={setGender}
              where={where}
              setWhere={setWhere}
              dateRange={dateRange}
              setDateRange={setDateRange}
              style={style}
              setStyle={setStyle}
              userContext={userContext}
              setUserContext={setUserContext}
              userImage={userImage}
              setUserImage={setUserImage}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          ) : (
            <ResultDisplay 
              data={result} 
              selectedStyle={style} 
              onReset={handleReset} 
            />
          )}
        </main>
        
        <footer className="mt-32 text-neutral-700 text-xs uppercase tracking-[0.2em]">
          <p>© VogueCast Digital • Powered by Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;