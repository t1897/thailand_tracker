/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback } from 'react';
import JourneyList from './screens/JourneyList';
import TravelLog from './screens/TravelLog';
import ProvinceMap from './screens/ProvinceMap';
import BottomNav from './components/BottomNav';
import { supabase } from './lib/supabaseClient';
import * as api from './lib/api';
import { provinces as defaultProvinces } from './data/mockData';
import type { Session, User } from '@supabase/supabase-js';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [language, setLanguage] = useState<'EN' | 'CN' | 'TH'>('EN');
  const [places, setPlaces] = useState<api.Place[]>([]);
  const [userProvinces, setUserProvinces] = useState<api.Province[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ----- Auth State -----
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ----- Fetch data when logged in -----
  const fetchData = useCallback(async () => {
    if (!session) return;
    try {
      const [placesData, provincesData] = await Promise.all([
        api.getPlaces(),
        api.getProvinces(),
      ]);
      setPlaces(placesData);

      // Bidirectional sync between places and provinces
      const placeLocations = new Set(
        placesData.map((p: any) => p.location?.toLowerCase())
      );
      const placeLocationIds = new Set(
        placesData.map((p: any) => p.location?.toLowerCase().replace(/\s+/g, '-'))
      );

      // 1. Reverse sync: unmark provinces that have no corresponding place
      const reconciledProvinces = await Promise.all(
        provincesData.map(async (prov: any) => {
          if (!prov.visited) return prov;
          const hasPlace = placeLocations.has(prov.name.toLowerCase()) ||
            placeLocationIds.has(prov.id);
          if (!hasPlace) {
            try { await api.toggleProvince(prov.id, prov.name, false); } catch (e) { }
            return { ...prov, visited: false };
          }
          return prov;
        })
      );

      // 2. Forward sync: create province entries for places that don't have one
      const existingProvinceIds = new Set(reconciledProvinces.map((p: any) => p.id));
      const existingProvinceNames = new Set(reconciledProvinces.filter((p: any) => p.visited).map((p: any) => p.name.toLowerCase()));

      // Get unique locations from places
      const uniqueLocations = new Map<string, string>();
      placesData.forEach((p: any) => {
        if (p.location) {
          const id = p.location.toLowerCase().replace(/\s+/g, '-');
          if (!uniqueLocations.has(id)) {
            uniqueLocations.set(id, p.location);
          }
        }
      });

      const newProvinces: any[] = [];
      for (const [locId, locName] of uniqueLocations) {
        const alreadyVisited = existingProvinceIds.has(locId) && existingProvinceNames.has(locName.toLowerCase());
        if (!alreadyVisited) {
          try { await api.toggleProvince(locId, locName, true); } catch (e) { }
          // Check if entry exists but is unvisited
          const existing = reconciledProvinces.find((p: any) => p.id === locId);
          if (existing) {
            existing.visited = true;
          } else {
            newProvinces.push({ id: locId, name: locName, visited: true });
          }
        }
      }

      setUserProvinces([...reconciledProvinces, ...newProvinces]);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ----- Merge user provinces with default provinces -----
  const mergedProvinces = [
    ...defaultProvinces.map(p => {
      const userProv = userProvinces.find(up => up.id === p.id || up.name.toLowerCase() === p.name.toLowerCase());
      return {
        ...p,
        // For logged-in users, default to false (user's DB data drives visited status)
        // For logged-out users, keep the mock defaults for demo purposes
        visited: userProv ? userProv.visited : (session ? false : p.visited),
      };
    }),
    ...userProvinces.filter(up => !defaultProvinces.some(p => p.id === up.id || p.name.toLowerCase() === up.name.toLowerCase()))
  ];

  const toggleLanguage = () => {
    setLanguage(prev => {
      if (prev === 'EN') return 'TH';
      if (prev === 'TH') return 'CN';
      return 'EN';
    });
  };

  const handleLogin = () => {
    // This is now handled by Supabase auth state change
  };

  const handleProvinceSelect = (province: string) => {
    setSelectedProvince(province);
    setActiveTab('home');
  };

  const handleAddPlace = async (newPlace: any) => {
    if (!session) {
      // If not logged in, just add locally
      setPlaces(prev => [{ ...newPlace, id: newPlace.id || Date.now().toString() }, ...prev]);

      if (newPlace.location) {
        const normalizedLocation = newPlace.location.toLowerCase().replace(/\s+/g, '-');
        const provinceId = normalizedLocation;
        const provinceName = newPlace.location;

        setUserProvinces(prev => {
          const exists = prev.find(up => up.id === provinceId || up.name.toLowerCase() === provinceName.toLowerCase());
          if (exists) {
            return prev.map(up => (up.id === exists.id ? { ...up, visited: true } : up));
          }
          return [...prev, { id: provinceId, name: provinceName, visited: true }];
        });
      }
      return;
    }
    try {
      const created = await api.createPlace({
        name: newPlace.name,
        location: newPlace.location,
        dateAdded: newPlace.dateAdded,
        image: newPlace.image || '',
        isMarked: newPlace.isMarked ?? true,
        category: newPlace.category,
        description: newPlace.description,
      });
      setPlaces(prev => [created, ...prev]);

      // Auto-mark the province as visited
      if (newPlace.location) {
        const normalizedLocation = newPlace.location.toLowerCase().replace(/\s+/g, '-');
        const matchedProvince = defaultProvinces.find(p =>
          p.name.toLowerCase() === newPlace.location.toLowerCase() ||
          p.id === normalizedLocation
        );
        // Use matched province data, or create from location name directly
        const provinceId = matchedProvince?.id || normalizedLocation;
        const provinceName = matchedProvince?.name || newPlace.location;

        try {
          await api.toggleProvince(provinceId, provinceName, true);
          // Update local state immediately
          setUserProvinces(prev => {
            const exists = prev.find(up => up.id === provinceId);
            if (exists) {
              return prev.map(up => up.id === provinceId ? { ...up, visited: true } : up);
            }
            return [...prev, { id: provinceId, name: provinceName, visited: true }];
          });
        } catch (err) {
          console.error('Failed to update province visited status:', err);
        }
      }
    } catch (err) {
      console.error('Failed to create place:', err);
      // Fallback: add locally
      setPlaces(prev => [{ ...newPlace, id: newPlace.id || Date.now().toString() }, ...prev]);
    }
  };

  const handleUpdatePlace = async (updatedPlace: any) => {
    if (!session) {
      setPlaces(prev => prev.map(p => p.id === updatedPlace.id ? updatedPlace : p));
      return;
    }
    try {
      const updated = await api.updatePlace(updatedPlace.id, updatedPlace);
      setPlaces(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch (err) {
      console.error('Failed to update place:', err);
      setPlaces(prev => prev.map(p => p.id === updatedPlace.id ? updatedPlace : p));
    }
  };

  const handleDeletePlace = async (placeId: string) => {
    // Find the place being deleted to know its province
    const deletedPlace = places.find(p => p.id === placeId);

    if (!session) {
      const updatedPlaces = places.filter(p => p.id !== placeId);
      setPlaces(updatedPlaces);

      if (deletedPlace?.location) {
        const provinceName = deletedPlace.location;
        const stillHasPlaces = updatedPlaces.some(p =>
          p.location?.toLowerCase() === provinceName.toLowerCase()
        );

        if (!stillHasPlaces) {
          setUserProvinces(prev =>
            prev.map(up => up.name.toLowerCase() === provinceName.toLowerCase() ? { ...up, visited: false } : up)
          );
        }
      }
      return;
    }
    try {
      await api.deletePlace(placeId);
      const updatedPlaces = places.filter(p => p.id !== placeId);
      setPlaces(updatedPlaces);

      // Check if this was the last place in that province
      if (deletedPlace?.location) {
        const normalizedLocation = deletedPlace.location.toLowerCase().replace(/\s+/g, '-');
        const matchedProvince = defaultProvinces.find(p =>
          p.name.toLowerCase() === deletedPlace.location.toLowerCase() ||
          p.id === normalizedLocation
        );
        const provinceId = matchedProvince?.id || normalizedLocation;
        const provinceName = matchedProvince?.name || deletedPlace.location;

        // Check if any remaining places are in this province
        const stillHasPlaces = updatedPlaces.some(p => {
          const loc = p.location?.toLowerCase().replace(/\s+/g, '-');
          return p.location?.toLowerCase() === provinceName.toLowerCase() ||
            loc === provinceId;
        });

        if (!stillHasPlaces) {
          try {
            await api.toggleProvince(provinceId, provinceName, false);
            setUserProvinces(prev =>
              prev.map(up => up.id === provinceId ? { ...up, visited: false } : up)
            );
          } catch (err) {
            console.error('Failed to update province after delete:', err);
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete place:', err);
    }
  };

  const isLoggedIn = !!user;

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <ProvinceMap
            provinces={mergedProvinces}
            selectedProvince={selectedProvince}
            onSelectProvince={setSelectedProvince}
            language={language}
            onToggleLanguage={toggleLanguage}
            onAddPlace={handleAddPlace}
          />
        );
      case 'profile':
        return (
          <TravelLog
            onNavigate={setActiveTab}
            places={places}
            provinces={mergedProvinces}
            onSelectProvince={handleProvinceSelect}
            language={language}
            isLoggedIn={isLoggedIn}
            onLogin={handleLogin}
            onUpdatePlace={handleUpdatePlace}
            onDeletePlace={handleDeletePlace}
          />
        );
      default:
        return (
          <ProvinceMap
            provinces={mergedProvinces}
            selectedProvince={selectedProvince}
            onSelectProvince={setSelectedProvince}
            language={language}
            onToggleLanguage={toggleLanguage}
            onAddPlace={handleAddPlace}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden flex flex-col">
      <div className="flex-1 overflow-hidden relative">
        {renderScreen()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
