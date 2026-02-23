import React from 'react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  // We'll use a unified navigation bar that works for all screens
  // Based on the "Map" screen nav which seems most comprehensive
  
  const navItems = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-surface-dark/95 backdrop-blur-lg border-t border-surface-highlight pt-2 pb-6 px-6 z-30">
      <div className="flex justify-between items-center max-w-sm mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center gap-1 group w-16"
            >
              <div 
                className={`h-10 w-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive ? 'bg-primary/20' : 'bg-transparent group-hover:bg-surface-highlight'
                }`}
              >
                <span 
                  className={`material-symbols-outlined transition-transform ${
                    isActive 
                      ? 'text-primary scale-110 font-variation-settings-filled' 
                      : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-110'
                  }`}
                >
                  {item.icon}
                </span>
              </div>
              <span 
                className={`text-[0.625rem] font-medium transition-colors ${
                  isActive ? 'text-primary font-bold' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
