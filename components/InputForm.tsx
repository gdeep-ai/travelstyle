import React, { useRef } from 'react';
import { StyleOption, DateRange, GenderOption } from '../types';
import { MapPin, User, Calendar, ArrowRight, Shirt, Camera, X } from 'lucide-react';

interface InputFormProps {
  who: string;
  setWho: (val: string) => void;
  gender: GenderOption;
  setGender: (val: GenderOption) => void;
  where: string;
  setWhere: (val: string) => void;
  dateRange: DateRange;
  setDateRange: (val: DateRange) => void;
  style: StyleOption;
  setStyle: (val: StyleOption) => void;
  userContext: string;
  setUserContext: (val: string) => void;
  userImage: string | null;
  setUserImage: (val: string | null) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const PERSONAS = [
  "Creative Director",
  "Tech Founder",
  "Weekend Traveler",
  "Busy Parent"
];

const InputForm: React.FC<InputFormProps> = ({
  who,
  setWho,
  gender,
  setGender,
  where,
  setWhere,
  dateRange,
  setDateRange,
  style,
  setStyle,
  userContext,
  setUserContext,
  userImage,
  setUserImage,
  onSubmit,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-5xl border border-neutral-800 bg-neutral-900 shadow-2xl">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left Column: Inputs */}
        <div className="p-8 md:p-12 flex flex-col justify-center space-y-10 border-r border-neutral-800">
          
          {/* Who & Gender Input */}
          <div className="space-y-4">
             <div className="flex justify-between items-end">
                <label className="text-neutral-400 text-sm font-semibold uppercase tracking-widest flex items-center gap-2">
                    <User size={16} /> Identity
                </label>
             </div>
            
            <div className="flex gap-4 items-end">
                <div className="flex-1">
                    <input
                        type="text"
                        value={who}
                        onChange={(e) => setWho(e.target.value)}
                        placeholder="Describe yourself..."
                        className="w-full bg-transparent border-b border-neutral-700 text-white pb-3 text-2xl font-serif focus:outline-none focus:border-white transition-colors placeholder:text-neutral-700 placeholder:font-sans"
                        disabled={isLoading}
                    />
                </div>
                <div className="w-1/3 relative border-b border-neutral-700">
                     <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as GenderOption)}
                        className="w-full bg-transparent text-neutral-300 pb-3 text-sm appearance-none focus:outline-none cursor-pointer font-sans uppercase tracking-wider text-right"
                        disabled={isLoading}
                    >
                        {Object.values(GenderOption).map((g) => (
                            <option key={g} value={g} className="bg-neutral-900">{g}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {PERSONAS.map(p => (
                <button
                  key={p}
                  onClick={() => setWho(p)}
                  className="text-xs uppercase tracking-wider px-3 py-1 border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-500 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Where Input */}
          <div className="space-y-4">
            <label className="text-neutral-400 text-sm font-semibold uppercase tracking-widest flex items-center gap-2">
              <MapPin size={16} /> Destination
            </label>
            <input
              type="text"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              placeholder="City, Country..."
              className="w-full bg-transparent border-b border-neutral-700 text-white pb-3 text-2xl font-serif focus:outline-none focus:border-white transition-colors placeholder:text-neutral-700 placeholder:font-sans"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Right Column: Date, Style, Action */}
        <div className="p-8 md:p-12 bg-neutral-900 flex flex-col justify-center space-y-10">
          
          {/* Date Range Input */}
          <div className="space-y-4">
            <label className="text-neutral-400 text-sm font-semibold uppercase tracking-widest flex items-center gap-2">
              <Calendar size={16} /> Travel Dates
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <span className="text-xs text-neutral-600 block mb-1">FROM</span>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full bg-neutral-800/50 border border-neutral-800 text-white px-3 py-2 text-lg focus:outline-none focus:border-neutral-600 transition-all [color-scheme:dark]"
                  disabled={isLoading}
                />
              </div>
              <div className="w-4 h-[1px] bg-neutral-700 mt-5"></div>
              <div className="flex-1">
                <span className="text-xs text-neutral-600 block mb-1">TO</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full bg-neutral-800/50 border border-neutral-800 text-white px-3 py-2 text-lg focus:outline-none focus:border-neutral-600 transition-all [color-scheme:dark]"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Style Dropdown */}
          <div className="space-y-4">
            <label className="text-neutral-400 text-sm font-semibold uppercase tracking-widest">
              Aesthetic
            </label>
            <div className="relative border-b border-neutral-700">
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as StyleOption)}
                className="w-full bg-transparent text-white pb-3 text-xl appearance-none focus:outline-none cursor-pointer font-serif"
                disabled={isLoading}
              >
                {Object.values(StyleOption).map((opt) => (
                  <option key={opt} value={opt} className="bg-neutral-900">
                    {opt}
                  </option>
                ))}
              </select>
              <div className="absolute right-0 top-1/3 pointer-events-none text-neutral-500">
                 <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width: Wardrobe Context */}
      <div className="border-t border-neutral-800 p-8 md:p-12 bg-neutral-900/50">
        <label className="text-neutral-400 text-sm font-semibold uppercase tracking-widest flex items-center gap-2 mb-6">
            <Shirt size={16} /> Wardrobe & Packing List
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <textarea
                    value={userContext}
                    onChange={(e) => setUserContext(e.target.value)}
                    placeholder="Describe specific items you want to pack, your favorites, or what you absolutely refuse to wear (e.g. 'I love leather jackets', 'No sandals')..."
                    className="w-full bg-neutral-800/30 border border-neutral-800 p-4 text-neutral-300 focus:outline-none focus:border-neutral-600 h-32 resize-none transition-colors"
                />
            </div>
            
            <div className="flex flex-col justify-between">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
                
                {userImage ? (
                    <div className="relative w-full h-full min-h-[100px] border border-neutral-700 bg-black group">
                        <img src={userImage} alt="User upload" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        <button 
                            onClick={() => {
                                setUserImage(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="absolute top-2 right-2 bg-black/50 p-1 text-white hover:bg-red-900/80 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full border border-dashed border-neutral-700 flex flex-col items-center justify-center gap-2 text-neutral-500 hover:text-white hover:border-neutral-500 transition-all p-4"
                    >
                        <Camera size={24} />
                        <span className="text-xs uppercase tracking-widest text-center">Upload Inspiration or Item</span>
                    </button>
                )}
            </div>
        </div>
        
         {/* Submit Button */}
         <button
          onClick={onSubmit}
          disabled={!who || !where || !dateRange.start || isLoading}
          className={`w-full py-6 mt-8 font-bold text-sm uppercase tracking-[0.2em] transition-all
            ${(!who || !where || !dateRange.start || isLoading)
              ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed border border-neutral-800'
              : 'bg-white text-black hover:bg-neutral-200 border border-white'
            }
          `}
        >
          {isLoading ? "Curating..." : "Generate Editorial"}
        </button>
      </div>

    </div>
  );
};

export default InputForm;