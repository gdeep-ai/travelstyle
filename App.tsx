import React, { useState } from 'react';
import { StyleOption, PredictionResult } from './types';
import { getStyleAdvice } from './services/geminiService';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import { Wind } from 'lucide-react';

const App: React.FC = () => {
  const [who, setWho] = useState('');
  const [where, setWhere] = useState('');
  // Default to today's date formatted as YYYY-MM-DD
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [style, setStyle] = useState<StyleOption>(StyleOption.CASUAL);
  
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getStyleAdvice(who, where, date, style);
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
    setDate(new Date().toISOString().split('T')[0]);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] relative overflow-x-hidden selection:bg-purple-500/30">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-16 flex flex-col items-center min-h-screen">
        
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
             <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                <Wind className="text-white" size={32} />
             </div>
             <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
               VogueCast
             </h1>
          </div>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto leading-relaxed font-light">
            Smart weather predictions tailored to your actual closet. 
            Tell us who you are, where you're headed, and when.
          </p>
        </header>

        {/* Dynamic Content */}
        <main className="w-full flex flex-col items-center justify-center flex-1">
          {error && (
            <div className="w-full max-w-xl bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-4 rounded-2xl mb-8 text-center text-lg">
              {error}
            </div>
          )}

          {!result ? (
            <InputForm
              who={who}
              setWho={setWho}
              where={where}
              setWhere={setWhere}
              date={date}
              setDate={setDate}
              style={style}
              setStyle={setStyle}
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
        
        <footer className="mt-16 text-slate-500 text-base">
          <p>© {new Date().getFullYear()} VogueCast • Powered by Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;