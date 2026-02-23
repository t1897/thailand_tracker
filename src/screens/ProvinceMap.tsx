import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as d3Geo from 'd3-geo';
import { toPng } from 'html-to-image';

import { GoogleGenAI } from "@google/genai";

interface ProvinceMapProps {
  provinces: any[];
  selectedProvince: string | null;
  onSelectProvince: (province: string | null) => void;
  language: 'EN' | 'CN' | 'TH';
  onToggleLanguage: () => void;
  onAddPlace: (place: any) => void;
}

const translations = {
  EN: {
    searchPlaceholder: "Please enter place name...",
    progress: "Progress",
    share: "Share",
    visited: "Visited",
    notVisited: "Not visited yet",
    myJourney: "My Journey",
    provinces: "Provinces",
    complete: "Complete",
    country: "THAILAND",
    saveImage: "Save Image",
    confirmAdd: "Confirm to add this place?",
    placeName: "Place Name",
    location: "Location",
    description: "Description",
    cancel: "Cancel",
    confirm: "Confirm",
    searching: "Searching..."
  },
  TH: {
    searchPlaceholder: "กรุณากรอกชื่อสถานที่...",
    progress: "ความคืบหน้า",
    share: "แชร์",
    visited: "ไปมาแล้ว",
    notVisited: "ยังไม่เคยไป",
    myJourney: "การเดินทางของฉัน",
    provinces: "จังหวัด",
    complete: "เสร็จสิ้น",
    country: "ประเทศไทย",
    saveImage: "บันทึกรูปภาพ",
    confirmAdd: "ยืนยันการเพิ่มสถานที่นี้?",
    placeName: "ชื่อสถานที่",
    location: "ที่ตั้ง",
    description: "รายละเอียด",
    cancel: "ยกเลิก",
    confirm: "ยืนยัน",
    searching: "กำลังค้นหา..."
  },
  CN: {
    searchPlaceholder: "请输入地名...",
    progress: "进度",
    share: "分享",
    visited: "已访问",
    notVisited: "未访问",
    myJourney: "我的旅程",
    provinces: "府",
    complete: "完成",
    country: "泰国",
    saveImage: "保存图片",
    confirmAdd: "确认添加此地点？",
    placeName: "地点名称",
    location: "位置",
    description: "描述",
    cancel: "取消",
    confirm: "确认",
    searching: "搜索中..."
  }
};

export default function ProvinceMap({ provinces, selectedProvince, onSelectProvince, language, onToggleLanguage, onAddPlace }: ProvinceMapProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [widgetPos, setWidgetPos] = useState({ x: 0, y: 0 });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const handleSaveImage = async () => {
    if (!shareCardRef.current) return;
    setIsSaving(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `thailand-journey-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to save image:', err);
      alert('Failed to save image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const t = translations[language];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Identify the place from this query: "${searchQuery}". 
      Return a JSON object with the following fields:
      - name: The name of the place (in ${language === 'TH' ? 'Thai' : language === 'CN' ? 'Chinese' : 'English'})
      - location: The province name in Thailand where it is located (e.g. "Phuket", "Chiang Mai")
      - description: A short description (max 1 sentence)
      - lat: Latitude
      - lng: Longitude
      
      If the place is not found or not in Thailand, return null.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text);
      if (result) {
        setSearchResult(result);
        setShowConfirmModal(true);
      } else {
        alert("Place not found or not in Thailand.");
      }
    } catch (error: any) {
      console.error("Search failed:", error);
      if (error?.message?.includes('429') || error?.message?.toLowerCase().includes('quota')) {
        alert("API rate limit exceeded. Please wait a moment and try again.");
      } else {
        alert("Search failed. Please try again.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const confirmAddPlace = () => {
    if (searchResult) {
      const newPlace = {
        id: Date.now().toString(),
        name: searchResult.name,
        location: searchResult.location,
        dateAdded: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        image: `https://maps.googleapis.com/maps/api/staticmap?center=${searchResult.lat},${searchResult.lng}&zoom=13&size=600x300&maptype=roadmap&markers=color:red%7C${searchResult.lat},${searchResult.lng}&key=${process.env.GEMINI_API_KEY}`, // Using static map as placeholder or unsplash if possible. For now static map or generic image.
        // Actually, let's use a generic image or try to get one. For simplicity, random unsplash.
        // image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2639&auto=format&fit=crop',
        isMarked: true,
        description: searchResult.description
      };

      // Better image logic: use a specific keyword search if possible, but for now random travel image
      newPlace.image = `https://source.unsplash.com/800x600/?${encodeURIComponent(searchResult.name + ' thailand')}`;

      onAddPlace(newPlace);
      setShowConfirmModal(false);
      setSearchResult(null);
      setSearchQuery('');

      // Auto select the province
      onSelectProvince(searchResult.location);
    }
  };

  // Load widget position
  useEffect(() => {
    const saved = localStorage.getItem('widgetPos');
    if (saved) {
      try {
        setWidgetPos(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch Thailand GeoJSON
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/apisit/thailand.json/master/thailand.json')
      .then(response => response.json())
      .then(data => {
        setGeoData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load map data", err);
        setLoading(false);
      });
  }, []);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 8));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5));

  // Create map projection
  const { pathGenerator, features } = useMemo(() => {
    if (!geoData) return { pathGenerator: null, features: [] };

    // Fit Thailand into the view
    const projection = d3Geo.geoMercator()
      .center([100.5, 13.7]) // Approx center of Thailand
      .scale(2200) // Adjust scale to fit
      .translate([200, 320]); // Center in the SVG (400x650)

    const pathGenerator = d3Geo.geoPath().projection(projection);
    const features = geoData.features;

    return { pathGenerator, features };
  }, [geoData]);

  const handleProvinceClick = (feature: any) => {
    const name = feature.properties.name || feature.properties.NAME_1;
    onSelectProvince(name);

    // Auto zoom and center
    if (pathGenerator) {
      const centroid = pathGenerator.centroid(feature);
      const [cx, cy] = centroid;
      const targetScale = 2.5;
      // SVG center is 200, 325. We want to move (cx, cy) to center.
      // The offset needed is (Center - Point) * Scale
      const dx = (200 - cx) * targetScale;
      const dy = (325 - cy) * targetScale;

      setScale(targetScale);
      setPosition({ x: dx, y: dy });
    }
  };

  // Helper to check if a province is visited based on props data
  // Uses flexible matching to handle GeoJSON name differences (e.g. "Bangkok Metropolis" vs "Bangkok")
  const isVisited = useCallback((geoJsonName: string) => {
    const normalizedGeo = geoJsonName.toLowerCase().replace(/\s+/g, '-');
    const geoLower = geoJsonName.toLowerCase();

    return provinces.some((p: any) => {
      if (!p.visited) return false;
      const pLower = p.name.toLowerCase();
      const pNorm = p.id.toLowerCase();
      // Exact name match
      if (pLower === geoLower) return true;
      // ID match (e.g. "chiang-mai")
      if (pNorm === normalizedGeo) return true;
      // Substring match: "Bangkok" in "Bangkok Metropolis" or vice versa
      if (geoLower.startsWith(pLower) || pLower.startsWith(geoLower)) return true;
      // Normalized substring: "chon-buri" matches "chonburi" 
      const geoNoSpace = geoLower.replace(/\s+/g, '');
      const pNoSpace = pLower.replace(/\s+/g, '');
      if (geoNoSpace === pNoSpace || pNorm.replace(/-/g, '') === geoNoSpace) return true;
      return false;
    });
  }, [provinces]);

  // Compute province stats dynamically
  const totalProvinces = 77;
  const visitedCount = useMemo(() => {
    if (!geoData) return 0;
    return geoData.features.filter((f: any) => {
      const name = f.properties.name || f.properties.NAME_1;
      const normalizedGeo = name.toLowerCase().replace(/\s+/g, '-');
      const geoLower = name.toLowerCase();

      return provinces.some((p: any) => {
        if (!p.visited) return false;
        const pLower = p.name.toLowerCase();
        const pNorm = p.id.toLowerCase();
        if (pLower === geoLower) return true;
        if (pNorm === normalizedGeo) return true;
        if (geoLower.startsWith(pLower) || pLower.startsWith(geoLower)) return true;
        const geoNoSpace = geoLower.replace(/\s+/g, '');
        const pNoSpace = pLower.replace(/\s+/g, '');
        if (geoNoSpace === pNoSpace || pNorm.replace(/-/g, '') === geoNoSpace) return true;
        return false;
      });
    }).length;
  }, [geoData, provinces]);
  const percentage = totalProvinces > 0 ? Math.round((visitedCount / totalProvinces) * 100) : 0;

  // Filter features based on search
  const filteredFeatures = useMemo(() => {
    if (!searchQuery) return [];
    return features.filter((f: any) => {
      const name = f.properties.name || f.properties.NAME_1;
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, features]);

  return (
    <div className="flex flex-col h-full relative bg-background-dark overflow-hidden">
      {/* Header Overlay */}
      <header className="absolute top-0 left-0 right-0 z-20 px-4 pt-12 pb-4 bg-gradient-to-b from-background-dark via-background-dark/80 to-transparent pointer-events-none">
        <div className="flex items-center justify-between gap-4 pointer-events-auto">
          <div className="flex-1 h-12 bg-surface-dark/90 backdrop-blur-md rounded-full border border-surface-highlight flex items-center px-4 shadow-lg focus-within:ring-2 focus-within:ring-primary/50 transition-shadow">
            <span className="material-symbols-outlined text-slate-400">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-400 w-full ml-2 text-sm font-medium focus:outline-none"
              placeholder={isSearching ? t.searching : t.searchPlaceholder}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              disabled={isSearching}
            />
            {isSearching && (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ml-2"></div>
            )}
          </div>
          <button
            onClick={onToggleLanguage}
            className="h-12 w-12 rounded-full bg-surface-dark/90 backdrop-blur-md border border-surface-highlight flex items-center justify-center text-slate-300 font-bold shadow-lg hover:bg-surface-highlight transition-colors"
          >
            {language}
          </button>
        </div>
      </header>

      {/* Map Area */}
      <main className="flex-1 relative w-full h-full flex items-center justify-center overflow-hidden" onClick={() => onSelectProvince(null)}>
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Loading map...</p>
          </div>
        ) : (
          <motion.div
            drag
            dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
            animate={{ scale: scale, x: position.x, y: position.y }}
            onDragEnd={(_, info) => {
              setPosition(prev => ({
                x: prev.x + info.offset.x,
                y: prev.y + info.offset.y
              }));
            }}
            className="w-full h-full max-w-lg p-4 flex items-center justify-center pt-20 pb-32 cursor-grab active:cursor-grabbing"
          >
            <svg className="w-full h-full drop-shadow-2xl filter" viewBox="0 0 400 650" style={{ overflow: 'visible' }}>
              <g>
                {features.map((feature: any, i: number) => {
                  const name = feature.properties.name || feature.properties.NAME_1;
                  const visited = isVisited(name);
                  const isSearched = searchQuery && name.toLowerCase().includes(searchQuery.toLowerCase());
                  const isSelected = selectedProvince === name;

                  return (
                    <path
                      key={i}
                      d={pathGenerator?.(feature) || ''}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProvinceClick(feature);
                      }}
                      className={`transition-all duration-300 cursor-pointer stroke-background-dark stroke-[0.5px] hover:fill-surface-highlight hover:stroke-white/20 ${visited
                        ? 'fill-primary drop-shadow-[0_0_2px_rgba(19,236,91,0.3)] hover:fill-[#10c94d]'
                        : 'fill-[#1c271f]'
                        } ${isSearched ? 'fill-yellow-500 animate-pulse' : ''} ${isSelected ? 'stroke-white stroke-[2px]' : ''}`}
                    />
                  );
                })}
              </g>
            </svg>
          </motion.div>
        )}

        {/* Province Popover */}
        <AnimatePresence>
          {selectedProvince && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute z-30 bg-surface-dark/95 backdrop-blur-md border border-surface-highlight px-4 py-2 rounded-xl shadow-2xl pointer-events-none"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
              <h3 className="text-white font-bold text-lg">{selectedProvince}</h3>
              <p className="text-xs text-slate-400">{isVisited(selectedProvince) ? t.visited : t.notVisited}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Controls */}
        <div className="absolute right-4 bottom-32 flex flex-col gap-2 z-10">
          <button onClick={handleZoomIn} className="h-10 w-10 bg-surface-dark border border-surface-highlight rounded-full text-slate-300 flex items-center justify-center shadow-lg hover:bg-surface-highlight hover:text-white transition-colors">
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
          <button onClick={handleZoomOut} className="h-10 w-10 bg-surface-dark border border-surface-highlight rounded-full text-slate-300 flex items-center justify-center shadow-lg hover:bg-surface-highlight hover:text-white transition-colors">
            <span className="material-symbols-outlined text-xl">remove</span>
          </button>
          <button onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }} className="h-10 w-10 bg-surface-dark border border-surface-highlight rounded-full text-primary flex items-center justify-center shadow-lg hover:bg-surface-highlight transition-colors mt-2">
            <span className="material-symbols-outlined text-xl">my_location</span>
          </button>
        </div>

        {/* Draggable Progress Widget */}
        <motion.div
          drag
          dragMomentum={false}
          animate={{ x: widgetPos.x, y: widgetPos.y }}
          onDragEnd={(_, info) => {
            const newPos = { x: widgetPos.x + info.offset.x, y: widgetPos.y + info.offset.y };
            setWidgetPos(newPos);
            localStorage.setItem('widgetPos', JSON.stringify(newPos));
          }}
          className="absolute left-4 top-28 z-10 cursor-move"
          style={{ touchAction: 'none' }}
        >
          <div className="bg-surface-dark/90 backdrop-blur-md border border-surface-highlight rounded-2xl p-4 shadow-xl flex flex-col gap-3 min-w-[140px]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t.progress}</span>
              <span className="text-xs text-primary font-bold">{percentage}%</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-white leading-none">{visitedCount}</span>
              <span className="text-sm text-slate-400 font-medium mb-0.5">/ {totalProvinces}</span>
            </div>
            <div className="h-1.5 w-full bg-surface-highlight rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(19,236,91,0.5)]" style={{ width: `${percentage}%` }}></div>
            </div>
          </div>
        </motion.div>

        {/* Share Button */}
        <button
          onClick={() => setShowShareModal(true)}
          className="absolute right-4 top-28 bg-surface-dark/90 backdrop-blur-md border border-surface-highlight rounded-2xl px-4 py-3 shadow-xl flex flex-col items-center justify-center gap-1 hover:bg-surface-highlight transition-all hover:scale-105 active:scale-95 group z-10"
        >
          <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">ios_share</span>
          <span className="text-[0.625rem] font-bold text-slate-300 uppercase tracking-wide group-hover:text-white">{t.share}</span>
        </button>
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            key="share-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-dark border border-surface-highlight rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative"
            >
              <button
                className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 text-white transition-colors"
                onClick={() => setShowShareModal(false)}
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
              <div className="p-6 flex flex-col items-center text-center space-y-6">
                <h3 className="text-xl font-bold text-white">Share Your Journey</h3>

                {/* Share Card Preview - 9:16 Aspect Ratio */}
                <div ref={shareCardRef} style={{ background: 'linear-gradient(to bottom right, #1c271f, #102216)' }} className="w-full aspect-[9/16] rounded-xl relative overflow-hidden group flex flex-col shadow-2xl border border-white/5">
                  {/* Header Content - Country & Flag - Top Right */}
                  <div className="absolute top-6 right-6 z-10 flex flex-col items-end text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-white tracking-tight">{t.country}</h2>
                      <span className="text-2xl">🇹🇭</span>
                    </div>
                    <div className="h-0.5 w-8 bg-white/20 mb-2"></div>

                    <p className="text-[0.5rem] font-bold text-primary mb-0.5 uppercase tracking-widest">{t.myJourney}</p>
                    <div className="flex items-baseline gap-1 justify-end">
                      <h4 className="text-xl font-extrabold text-white">{visitedCount}</h4>
                      <span className="text-[0.5rem] text-slate-400 font-medium">/ {totalProvinces} {t.provinces}</span>
                    </div>
                  </div>

                  {/* Map - Shifted Left */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg className="w-[110%] h-[110%] drop-shadow-2xl filter" viewBox="0 0 400 650" style={{ overflow: 'visible' }}>
                      <g transform="scale(0.9) translate(-40, 40)">
                        {features.map((feature: any, i: number) => {
                          const name = feature.properties.name || feature.properties.NAME_1;
                          const visited = isVisited(name);
                          return (
                            <path
                              key={i}
                              d={pathGenerator?.(feature) || ''}
                              style={{
                                fill: visited ? '#13ec5b' : '#2a3a30',
                                stroke: '#102216',
                                strokeWidth: '1px',
                                filter: visited ? 'drop-shadow(0px 0px 8px rgba(19,236,91,0.5))' : 'none'
                              }}
                            />
                          );
                        })}
                      </g>
                    </svg>
                  </div>

                  {/* Footer - Percentage Bottom Right */}
                  <div className="absolute bottom-6 right-6 z-10">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/20 text-primary text-[0.625rem] font-bold shadow-lg">
                      {percentage}% {t.complete}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 w-full pt-2">
                  <button className="flex flex-col items-center gap-2 group">
                    <div className="h-12 w-12 rounded-full bg-[#E1306C] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">photo_camera</span>
                    </div>
                    <span className="text-xs text-slate-300">Instagram</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 group">
                    <div className="h-12 w-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">public</span>
                    </div>
                    <span className="text-xs text-slate-300">Facebook</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 group">
                    <div className="h-12 w-12 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">chat_bubble</span>
                    </div>
                    <span className="text-xs text-slate-300">Twitter</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 group">
                    <div className="h-12 w-12 rounded-full bg-[#06C755] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">forum</span>
                    </div>
                    <span className="text-xs text-slate-300">LINE</span>
                  </button>
                </div>

                <button
                  onClick={handleSaveImage}
                  disabled={isSaving}
                  className="w-full py-3 bg-surface-highlight hover:bg-surface-highlight/80 rounded-xl text-sm font-semibold text-white transition-colors border border-white/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span className="material-symbols-outlined text-lg">download</span>
                  )}
                  {isSaving ? "Saving..." : t.saveImage}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && searchResult && (
          <motion.div
            key="confirm-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-dark border border-surface-highlight rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">{t.confirmAdd}</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider">{t.placeName}</label>
                  <p className="text-white font-medium text-lg">{searchResult.name}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider">{t.location}</label>
                  <p className="text-white font-medium">{searchResult.location}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider">{t.description}</label>
                  <p className="text-slate-300 text-sm">{searchResult.description}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 bg-surface-dark border border-slate-600 rounded-xl text-sm font-semibold text-slate-300 hover:bg-surface-highlight transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={confirmAddPlace}
                  className="flex-1 py-3 bg-primary text-primary-content rounded-xl text-sm font-bold shadow-lg hover:bg-primary/90 transition-colors"
                >
                  {t.confirm}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
