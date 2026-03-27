import React, { useRef, useState } from 'react';
import { StyleOption, DateRange, AttireOption } from '../types';
import { MapPin, User, Calendar, Shirt, Camera, X, Info, Sparkles, Briefcase, Coffee, Compass, Gem, Navigation, ChevronDown, Dumbbell, Flame, Luggage, Martini, Glasses, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InputFormProps {
  who: string;
  setWho: (val: string) => void;
  attire: AttireOption;
  setAttire: (val: AttireOption) => void;
  where: string;
  setWhere: (val: string) => void;
  vibe: string;
  setVibe: (val: string) => void;
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
  "Busy Parent",
  "Low-Budget Backpacker",
  "Frugal Traveler",
  "Explorer",
  "Digital Nomad",
  "Luxury Vacationer",
  "Creative Professional",
  "Business Executive",
  "Student on a Budget",
  "Honeymooner",
  "Solo Adventurer",
  "Retiree Explorer"
];

const FormalIcon = () => (
  <div className="flex items-center gap-1">
    <Gem size={16} />
    <span className="text-neutral-400">/</span>
    <User size={16} />
  </div>
);

const STYLE_DETAILS = [
  { value: StyleOption.CASUAL, icon: Coffee, desc: "Relaxed, comfortable, everyday wear." },
  { value: StyleOption.SMART_CASUAL, icon: Glasses, desc: "Aviators & effortless cool." },
  { value: StyleOption.BUSINESS_CASUAL, icon: Shirt, desc: "Sports coat, open collar." },
  { value: StyleOption.BUSINESS_PRO, icon: UserCheck, desc: "Sharp tailoring & ties." },
  { value: StyleOption.FORMAL, icon: FormalIcon, desc: "Top Hat / Evening Gown." },
  { value: StyleOption.ATHLEISURE, icon: Dumbbell, desc: "Sporty, active, comfortable." },
  { value: StyleOption.TRENDY, icon: Flame, desc: "Fashion-forward, current, bold." },
  { value: StyleOption.NIGHT_OUT, icon: Martini, desc: "Cocktails & late nights." },
  { value: StyleOption.MINIMALIST, icon: Shirt, desc: "Clean lines, neutral colors, simple." },
];

const InputForm: React.FC<InputFormProps> = ({
  who,
  setWho,
  attire,
  setAttire,
  where,
  setWhere,
  vibe,
  setVibe,
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
  const [showPersonas, setShowPersonas] = useState(false);

  const filteredPersonas = PERSONAS.filter(p => p.toLowerCase().includes(who.toLowerCase()));

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
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* 1. Identity Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 shadow-xl rounded-xl"
      >
        <div className="flex items-center gap-3 mb-8 border-b border-neutral-800 pb-4">
          <User className="text-neutral-400" size={20} />
          <h2 className="text-lg font-medium text-white tracking-wide uppercase">1. Identity</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            className="md:col-span-2 relative"
            onMouseEnter={() => setShowPersonas(true)}
            onMouseLeave={() => setShowPersonas(false)}
          >
            <label className="block text-xs text-neutral-400 uppercase tracking-widest mb-2">Who are you?</label>
            <input
              type="text"
              value={who}
              onChange={(e) => setWho(e.target.value)}
              placeholder="e.g. Busy Parent, Explorer..."
              className={`w-full bg-transparent border-b border-neutral-700 pb-3 text-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-500 ${who ? 'text-white' : 'text-neutral-400'}`}
              disabled={isLoading}
            />
            <AnimatePresence>
              {showPersonas && filteredPersonas.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 mt-2 w-full bg-neutral-800 border border-neutral-700 rounded-lg shadow-2xl z-20 p-2 flex flex-wrap gap-2"
                >
                  {filteredPersonas.map(p => (
                    <button
                      key={p}
                      onClick={() => { setWho(p); setShowPersonas(false); }}
                      className="text-xs bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-700 px-3 py-2 rounded-md transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 uppercase tracking-widest mb-2">Attire</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(AttireOption).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setAttire(g as AttireOption)}
                  disabled={isLoading}
                  className={`flex-1 min-w-[80px] py-3 px-4 rounded-lg border text-sm transition-all ${
                    attire === g 
                      ? 'bg-neutral-800 border-white text-white shadow-lg shadow-white/5' 
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:bg-neutral-800/50'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Destination & Dates Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 shadow-xl rounded-xl"
      >
        <div className="flex items-center gap-3 mb-8 border-b border-neutral-800 pb-4">
          <MapPin className="text-neutral-400" size={20} />
          <h2 className="text-lg font-medium text-white tracking-wide uppercase">2. Destination & Dates</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <label className="block text-xs text-neutral-400 uppercase tracking-widest mb-2">Where to? <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              placeholder="City, Country or just Country..."
              className="w-full bg-transparent border-b border-neutral-700 text-white pb-3 text-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 uppercase tracking-widest mb-2">Travel Dates</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-full sm:flex-1">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full bg-neutral-800/50 border border-neutral-700 rounded-md text-white px-3 py-2 text-sm focus:outline-none focus:border-neutral-500 transition-all [color-scheme:dark]"
                  disabled={isLoading}
                />
              </div>
              <span className="text-neutral-400 text-sm hidden sm:block">to</span>
              <div className="w-full sm:flex-1">
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full bg-neutral-800/50 border border-neutral-700 rounded-md text-white px-3 py-2 text-sm focus:outline-none focus:border-neutral-500 transition-all [color-scheme:dark]"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Aesthetic & Vibe Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 shadow-xl rounded-xl"
      >
        <div className="flex items-center gap-3 mb-8 border-b border-neutral-800 pb-4">
          <Camera className="text-neutral-400" size={20} />
          <h2 className="text-lg font-medium text-white tracking-wide uppercase">3. Aesthetic & Vibe</h2>
        </div>

        <div className="space-y-10">
          <div>
            <label className="block text-xs text-neutral-400 uppercase tracking-widest mb-4">Select your primary aesthetic</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {STYLE_DETAILS.map((s) => {
                const Icon = s.icon;
                const isSelected = style === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    className={`relative p-4 rounded-lg border text-left transition-all flex flex-col gap-3 group hover:scale-105
                      ${isSelected 
                        ? 'bg-neutral-800 border-white text-white shadow-lg shadow-white/5' 
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:bg-neutral-800/50'
                      }`}
                  >
                    <Icon size={20} className={isSelected ? "text-white" : "text-neutral-400 group-hover:text-neutral-300"} />
                    <div>
                      <div className="font-medium text-sm mb-1">{s.value}</div>
                      <div className="text-[10px] text-neutral-400 leading-tight">{s.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 uppercase tracking-widest mb-2">Trip Goal / Vibe</label>
            <textarea
              value={vibe}
              onChange={(e) => {
                setVibe(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              placeholder="e.g. Relaxing beach getaway, intense business meetings, exploring ancient ruins..."
              className="w-full bg-neutral-800/30 border border-neutral-700 rounded-lg p-4 text-white focus:outline-none focus:border-neutral-500 min-h-[6rem] resize-y transition-colors text-sm overflow-hidden"
              disabled={isLoading}
            />
          </div>
        </div>
      </motion.div>

      {/* 4. Wardrobe Context Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 shadow-xl rounded-xl"
      >
        <div className="flex items-center gap-3 mb-8 border-b border-neutral-800 pb-4">
          <Shirt className="text-neutral-400" size={20} />
          <h2 className="text-lg font-medium text-white tracking-wide uppercase">4. Wardrobe Details</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <label className="block text-xs text-neutral-400 uppercase tracking-widest mb-2">Constraints & Favorites</label>
                <textarea
                    value={userContext}
                    onChange={(e) => setUserContext(e.target.value)}
                    placeholder="Describe specific items you want to pack, your favorites, or what you absolutely refuse to wear..."
                    className="w-full bg-neutral-800/30 border border-neutral-700 rounded-lg p-4 text-neutral-300 focus:outline-none focus:border-neutral-500 h-32 resize-none transition-colors text-sm"
                />
                <p className="mt-2 text-[10px] text-neutral-500 italic tracking-wider uppercase">
                  So a trip go by would be with no direction I'll assume you prefer going rando.
                </p>
            </div>
            
            <div className="flex flex-col">
                <label className="block text-xs text-neutral-400 uppercase tracking-widest mb-2">Inspiration Image</label>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
                
                <div className="flex-1 min-h-[128px]">
                  {userImage ? (
                      <div className="relative w-full h-full border border-neutral-700 bg-black group rounded-lg overflow-hidden">
                          <img src={userImage} alt="User upload" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                          <button 
                              onClick={() => {
                                  setUserImage(null);
                                  if (fileInputRef.current) fileInputRef.current.value = '';
                              }}
                              className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-red-900/80 transition-colors"
                          >
                              <X size={14} />
                          </button>
                      </div>
                  ) : (
                      <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-full border border-dashed border-neutral-700 rounded-lg flex flex-col items-center justify-center gap-3 text-neutral-400 hover:text-white hover:border-neutral-400 hover:bg-neutral-800/30 transition-all p-4"
                      >
                          <Camera size={24} />
                          <span className="text-xs uppercase tracking-widest text-center">Upload Item</span>
                      </button>
                  )}
                </div>
            </div>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pt-4"
      >
        <button
          onClick={onSubmit}
          disabled={!where || isLoading}
          className={`w-full py-5 rounded-xl font-bold text-sm uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center gap-3
            ${(!where || isLoading)
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-800'
              : 'bg-white text-black hover:bg-neutral-200 border border-white hover:shadow-white/10 hover:-translate-y-1'
            }
          `}
        >
          {isLoading ? (
            "Reading your vibe, crafting the inspiration..."
          ) : (
            <>
              <Luggage size={20} />
              Let's curate your packing list
            </>
          )}
        </button>
      </motion.div>

    </div>
  );
};

export default InputForm;
