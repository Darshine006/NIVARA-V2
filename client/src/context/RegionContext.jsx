import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { offlineStorage } from '../services/offlineStorage';
import { useLanguage } from './LanguageContext';

const RegionContext = createContext();

// Built-in regional fallbacks for immediate offline operation
const DEFAULT_REGIONS = [
  {
    name: 'Tamil Nadu',
    defaultLanguage: 'ta',
    supportedLanguages: ['ta', 'en'],
    services: [
      'General Consultation',
      'Maternal & Child Health',
      'Anemia & Nutrition Care',
      'Vaccination',
      'Diabetes & BP Clinic',
      'Tele-Specialist Consult',
      'Basic Diagnostic Tests',
      'Essential Medicine Dispensing',
    ],
    districts: ['Madurai', 'Dindigul', 'Thanjavur', 'Salem', 'Theni'],
    description: 'Tamil Nadu Rural Health Mission regional configuration with Tamil and English support.',
  },
  {
    name: 'Uttar Pradesh',
    defaultLanguage: 'hi',
    supportedLanguages: ['hi', 'en'],
    services: [
      'General Consultation',
      'Maternal Care & Safe Delivery',
      'Child Immunization',
      'Respiratory & Seasonal Fever',
      'Hypertension & Diabetes Screening',
      'Emergency First Aid',
      'Generic Pharmacy',
    ],
    districts: ['Varanasi', 'Gorakhpur', 'Mirzapur', 'Ayodhya', 'Basti'],
    description: 'Northern Plains deployment emphasizing Hindi localization and mobile health units.',
  },
  {
    name: 'Karnataka',
    defaultLanguage: 'kn',
    supportedLanguages: ['kn', 'en'],
    services: [
      'General Consultation',
      'Women Health & Antenatal',
      'Malnutrition Intervention',
      'Vaccination',
      'Cardiovascular Screening',
      'Tele-Health Hub',
    ],
    districts: ['Mysuru', 'Hassan', 'Mandya', 'Chamarajanagar'],
    description: 'Southern Deccan regional setup with bilingual regional priority.',
  },
];

export function RegionProvider({ children }) {
  const { setLanguage } = useLanguage();

  const [regions, setRegions] = useState(() => {
    const cached = offlineStorage.getCachedRegions();
    return cached && cached.length > 0 ? cached : DEFAULT_REGIONS;
  });

  const [activeRegion, setActiveRegion] = useState(() => {
    const saved = offlineStorage.getActiveRegion();
    return saved || DEFAULT_REGIONS[0];
  });

  const fetchRegions = useCallback(async () => {
    try {
      const res = await API.get('/regions');
      if (res.data?.data && res.data.data.length > 0) {
        setRegions(res.data.data);
        offlineStorage.cacheRegions(res.data.data);

        // Re-sync active region with fresh server data
        const currentName = activeRegion?.name || 'Tamil Nadu';
        const matched = res.data.data.find((r) => r.name === currentName);
        if (matched) {
          setActiveRegion(matched);
          offlineStorage.setActiveRegion(matched);
        }
      }
    } catch {
      // Offline fallback: keep cached/default regions
      console.log('[RegionContext] Running in offline regional configuration mode.');
    }
  }, [activeRegion?.name]);

  useEffect(() => {
    fetchRegions();
  }, []);

  const switchRegionByName = (regionName) => {
    const found = regions.find((r) => r.name.toLowerCase() === regionName.toLowerCase());
    if (found) {
      setActiveRegion(found);
      offlineStorage.setActiveRegion(found);

      // Auto-switch language to region's primary language if user hasn't explicitly set one
      if (found.defaultLanguage && (found.defaultLanguage === 'ta' || found.defaultLanguage === 'hi' || found.defaultLanguage === 'en')) {
        setLanguage(found.defaultLanguage);
      }
    }
  };

  return (
    <RegionContext.Provider
      value={{
        regions,
        activeRegion,
        switchRegionByName,
        fetchRegions,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}
