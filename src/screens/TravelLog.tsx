import React, { useState } from 'react';
import { motion } from 'motion/react';
import AddEntryModal from '../components/AddEntryModal';
import LoginModal from '../components/LoginModal';
import { supabase } from '../lib/supabaseClient';

interface TravelLogProps {
  onNavigate: (screen: string) => void;
  places: any[];
  provinces?: any[];
  onSelectProvince: (province: string) => void;
  language: 'EN' | 'CN' | 'TH';
  isLoggedIn: boolean;
  onLogin: () => void;
  onUpdatePlace?: (place: any) => void;
  onDeletePlace?: (placeId: string) => void;
}

const translations = {
  EN: {
    title: "My Profile",
    totalProgress: "Total Progress",
    complete: "Complete",
    keepExploring: "Keep exploring to unlock the full map!",
    recentHistory: "Recent History",
    viewAll: "View All",
    endOfLogs: "You've reached the end of your recent logs.",
    loadOlder: "Load older entries",
    signInTitle: "Sign in to view your journey",
    signInDesc: "Track your travels, sync across devices, and share your adventures with friends.",
    signInBtn: "Sign In",
    edit: "Edit",
    done: "Done",
    delete: "Delete"
  },
  TH: {
    title: "โปรไฟล์ของฉัน",
    totalProgress: "ความคืบหน้าทั้งหมด",
    complete: "เสร็จสิ้น",
    keepExploring: "สำรวจต่อไปเพื่อปลดล็อกแผนที่เต็ม!",
    recentHistory: "ประวัติล่าสุด",
    viewAll: "ดูทั้งหมด",
    endOfLogs: "คุณมาถึงจุดสิ้นสุดของบันทึกล่าสุดแล้ว",
    loadOlder: "โหลดรายการเก่า",
    signInTitle: "ลงชื่อเข้าใช้เพื่อดูการเดินทางของคุณ",
    signInDesc: "ติดตามการเดินทางของคุณ ซิงค์ข้ามอุปกรณ์ และแชร์การผจญภัยของคุณกับเพื่อนๆ",
    signInBtn: "ลงชื่อเข้าใช้",
    edit: "แก้ไข",
    done: "เสร็จสิ้น",
    delete: "ลบ"
  },
  CN: {
    title: "我的个人资料",
    totalProgress: "总进度",
    complete: "完成",
    keepExploring: "继续探索以解锁完整地图！",
    recentHistory: "最近记录",
    viewAll: "查看全部",
    endOfLogs: "您已到达最近记录的末尾。",
    loadOlder: "加载更多",
    signInTitle: "登录以查看您的旅程",
    signInDesc: "跟踪您的旅行，跨设备同步，并与朋友分享您的冒险经历。",
    signInBtn: "登录",
    edit: "编辑",
    done: "完成",
    delete: "删除"
  }
};

export default function TravelLog({ onNavigate, places, provinces = [], onSelectProvince, language, isLoggedIn, onLogin, onUpdatePlace, onDeletePlace }: TravelLogProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlace, setEditingPlace] = useState<any>(null);
  const t = translations[language];

  // Compute province stats dynamically
  const totalProvinces = 77;
  const visitedCount = provinces.filter((p: any) => p.visited).length;
  const percentage = totalProvinces > 0 ? Math.round((visitedCount / totalProvinces) * 100) : 0;

  // Filter recent places for the timeline
  const recentPlaces = places.slice(0, 20); // Show more for profile

  const handleLoginSuccess = () => {
    onLogin();
    setShowLoginModal(false);
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleItemClick = (place: any) => {
    if (isEditing) {
      setEditingPlace(place);
      setShowAddModal(true);
    } else {
      onSelectProvince(place.location);
    }
  };

  const handleSaveEdit = (updatedPlace: any) => {
    if (onUpdatePlace) {
      onUpdatePlace(updatedPlace);
    }
    setShowAddModal(false);
    setEditingPlace(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, placeId: string) => {
    e.stopPropagation();
    if (onDeletePlace && window.confirm('Are you sure you want to delete this entry?')) {
      onDeletePlace(placeId);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 bg-background-light dark:bg-background-dark text-center">
        <div className="w-24 h-24 bg-surface-dark rounded-full flex items-center justify-center mb-6 shadow-lg">
          <span className="material-symbols-outlined text-5xl text-slate-400">lock</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.signInTitle}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
          {t.signInDesc}
        </p>
        <button
          onClick={() => setShowLoginModal(true)}
          className="px-8 py-3 bg-primary text-primary-content rounded-xl font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          {t.signInBtn}
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
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50">
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between px-4 py-3">
          <button
            onClick={async () => { await supabase.auth.signOut(); }}
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">logout</span>
          </button>
          <h1 className="text-lg font-bold tracking-tight">{t.title}</h1>
          <button
            onClick={handleEditClick}
            className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${isEditing
              ? 'bg-primary text-primary-content'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
          >
            {isEditing ? t.done : t.edit}
          </button>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 pb-32 pt-4 overflow-y-auto no-scrollbar">
        <div className="max-w-3xl mx-auto w-full px-4 flex flex-col gap-6">
          {/* Progress Summary Card */}
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-dark rounded-xl p-6 shadow-lg border border-slate-800 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-9xl text-primary transform rotate-12 translate-x-4 -translate-y-4">map</span>
            </div>
            <div className="relative z-10">
              <div className="flex flex-wrap justify-between items-start sm:items-end gap-3 mb-2">
                <div className="min-w-fit">
                  <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">{t.totalProgress}</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-white">{visitedCount}</h2>
                    <span className="text-2xl sm:text-3xl text-slate-500 font-bold">/ {totalProvinces}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 mt-2 sm:mt-0">
                  <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/20 border border-primary/20 text-primary text-sm sm:text-base font-bold whitespace-nowrap shadow-sm">
                    {percentage}% {t.complete}
                  </div>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 mt-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="bg-primary h-3 rounded-full"
                ></motion.div>
              </div>
              <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span>
                {t.keepExploring}
              </p>
            </div>
          </motion.section>

          {/* Timeline Section */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-xl font-bold">{t.recentHistory}</h3>
              <button className="text-primary text-sm font-medium hover:underline">{t.viewAll}</button>
            </div>
            <div className="relative pl-4 space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">

              {recentPlaces.map((place, index) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start group"
                >
                  <div className="absolute left-0 h-full w-0.5 bg-slate-800 group-last:bg-transparent"></div>
                  <div className={`absolute -left-[5px] mt-1.5 h-3 w-3 rounded-full border-2 ${index === 0 ? 'border-primary' : 'border-slate-600'} bg-background-dark shadow`}></div>
                  <div className="ml-6 w-full">
                    <span className="text-xs font-medium text-slate-400 block mb-1">{place.dateAdded}</span>
                    <div
                      className={`bg-surface-dark border border-slate-800 rounded-2xl p-4 shadow-sm transition-all cursor-pointer relative ${isEditing ? 'hover:border-primary/50' : 'hover:border-primary/50'
                        }`}
                      onClick={() => handleItemClick(place)}
                    >
                      {isEditing && (
                        <button
                          onClick={(e) => handleDeleteClick(e, place.id)}
                          className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      )}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white mb-1">{place.name}</h4>
                          <p className="text-slate-400 text-sm line-clamp-2">{place.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                              <span className="material-symbols-outlined text-sm">location_on</span>
                              {place.location}
                            </span>
                            {place.category && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                                {place.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-800">
                          <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

            </div>
            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm mb-4">{t.endOfLogs}</p>
              <button className="px-6 py-3 rounded-full bg-slate-800 text-white font-bold text-sm border border-slate-700 hover:bg-slate-700 transition-colors">{t.loadOlder}</button>
            </div>
          </section>
        </div>
      </main>

      <AddEntryModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingPlace(null);
        }}
        initialData={editingPlace}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
