import React from 'react';
import { StyleOption } from '../types';
import { MapPin, User, Shirt, Calendar } from 'lucide-react';

interface InputFormProps {
  who: string;
  setWho: (val: string) => void;
  where: string;
  setWhere: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  style: StyleOption;
  setStyle: (val: StyleOption) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({
  who,
  setWho,
  where,
  setWhere,
  date,
  setDate,
  style,
  setStyle,
  onSubmit,
  isLoading,
}) => {
  return (
    <div className="w-full max-w-xl bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-3xl p-10 shadow-2xl">
      <div className="space-y-8">
        
        {/* Who Input */}
        <div className="space-y-3">
          <label className="text-slate-300 text-lg font-medium flex items-center gap-3">
            <User size={24} className="text-indigo-400" />
            Who are you?
          </label>
          <input
            type="text"
            value={who}
            onChange={(e) => setWho(e.target.value)}
            placeholder="e.g. 30s guy, working mom, college student..."
            className="w-full bg-slate-900/80 border border-slate-700 text-slate-100 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
            disabled={isLoading}
          />
        </div>

        {/* Where Input */}
        <div className="space-y-3">
          <label className="text-slate-300 text-lg font-medium flex items-center gap-3">
            <MapPin size={24} className="text-indigo-400" />
            Where are you going?
          </label>
          <input
            type="text"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="e.g. Office in NYC, London..."
            className="w-full bg-slate-900/80 border border-slate-700 text-slate-100 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
            disabled={isLoading}
          />
        </div>

        {/* When Input */}
        <div className="space-y-3">
          <label className="text-slate-300 text-lg font-medium flex items-center gap-3">
            <Calendar size={24} className="text-indigo-400" />
            When is it?
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 text-slate-100 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all [color-scheme:dark]"
            disabled={isLoading}
          />
        </div>

        {/* Style Dropdown */}
        <div className="space-y-3">
          <label className="text-slate-300 text-lg font-medium flex items-center gap-3">
            <Shirt size={24} className="text-indigo-400" />
            What's your vibe?
          </label>
          <div className="relative">
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as StyleOption)}
              className="w-full bg-slate-900/80 border border-slate-700 text-slate-100 rounded-2xl px-6 py-4 text-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              disabled={isLoading}
            >
              {Object.values(StyleOption).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <svg width="20" height="20" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          disabled={!who || !where || !date || isLoading}
          className={`w-full py-5 rounded-2xl font-bold text-xl tracking-wide transition-all transform active:scale-[0.98] shadow-lg mt-4
            ${(!who || !where || !date || isLoading)
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:shadow-indigo-500/25 hover:brightness-110'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Weather & Style...
            </span>
          ) : (
            "Get My Look"
          )}
        </button>
      </div>
    </div>
  );
};

export default InputForm;