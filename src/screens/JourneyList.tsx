import React, { useState } from 'react';
import { motion } from 'motion/react';
import AddEntryModal from '../components/AddEntryModal';
import LoginModal from '../components/LoginModal';

interface JourneyListProps {
  onNavigate: (screen: string) => void;
  places: any[];
  isLoggedIn: boolean;
  onLogin: () => void;
}

export default function JourneyList({ onNavigate, places, isLoggedIn, onLogin }: JourneyListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLoginSuccess = () => {
    onLogin();
    setShowLoginModal(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 bg-background-light dark:bg-background-dark text-center">
        <div className="w-24 h-24 bg-surface-dark rounded-full flex items-center justify-center mb-6 shadow-lg">
          <span className="material-symbols-outlined text-5xl text-slate-400">lock</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sign in to view your journey</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
          Track your travels, sync across devices, and share your adventures with friends.
        </p>
        <button 
          onClick={() => setShowLoginModal(true)}
          className="px-8 py-3 bg-primary text-primary-content rounded-xl font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          Sign In
        </button>

        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
          onLogin={handleLoginSuccess} 
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Sticky Header */}
      <header className="flex-shrink-0 px-4 pt-12 pb-2 bg-background-light dark:bg-background-dark z-20">
        <div className="flex items-center justify-between mb-6">
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight">My Journey</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-content hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <span className="material-symbols-outlined text-2xl">add</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full mb-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">search</span>
          </div>
          <input
            className="block w-full pl-11 pr-4 py-3.5 bg-white dark:bg-surface-dark border-none rounded-full text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow shadow-sm text-slate-900 dark:text-white"
            placeholder="Search provinces or places..."
            type="text"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <button className="flex-shrink-0 px-5 py-2 rounded-full bg-primary text-primary-content font-bold text-sm shadow-[0_0_15px_rgba(19,236,91,0.3)] transition-transform active:scale-95">
            All
          </button>
          <button className="flex-shrink-0 px-5 py-2 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            By Date
          </button>
          <button className="flex-shrink-0 px-5 py-2 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            Bangkok
          </button>
          <button className="flex-shrink-0 px-5 py-2 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            Northern
          </button>
          <button className="flex-shrink-0 px-5 py-2 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            Southern
          </button>
        </div>
      </header>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-32 space-y-3">
        {places.map((place, index) => (
          <motion.div
            key={place.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative flex items-center p-3 bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-transparent dark:border-white/5 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div
              className="h-16 w-16 flex-shrink-0 rounded-xl bg-cover bg-center overflow-hidden mr-4 shadow-inner"
              style={{ backgroundImage: `url('${place.image}')` }}
            ></div>
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex justify-between items-start mb-0.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{place.name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
                  {place.location}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span> Added {place.dateAdded}
              </p>
              {place.isMarked && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(19,236,91,0.6)]"></div>
                  <span className="text-[10px] text-primary font-medium">Marked on map</span>
                </div>
              )}
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </div>
          </motion.div>
        ))}
        
        {/* Month Separator Example */}
        <div className="flex items-center gap-4 py-2">
          <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">July 2022</span>
          <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
        </div>

         {/* Extra Item for demo */}
         <div className="group relative flex items-center p-3 bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-transparent dark:border-white/5 active:scale-[0.99] transition-all">
          <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-cover bg-center overflow-hidden mr-4 shadow-inner" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1595246140625-573b715d1128?q=80&w=2536&auto=format&fit=crop')" }}></div>
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex justify-between items-start mb-0.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">Pattaya Beach</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full">Chon Buri</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span> Added 20 Jul 2022
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(19,236,91,0.6)]"></div>
              <span className="text-[10px] text-primary font-medium">Marked on map</span>
            </div>
          </div>
        </div>
      </div>

      <AddEntryModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
