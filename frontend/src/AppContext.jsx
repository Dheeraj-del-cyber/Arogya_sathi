import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [facilities, setFacilities] = useState([]);
  const [patients, setPatients] = useState([]);
  const [facilityId, setFacilityId] = useState(() => localStorage.getItem('arogya_facility') || '');
  const [patientId, setPatientId] = useState(() => localStorage.getItem('arogya_patient') || '');
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    Promise.all([api.facilities(), api.patients()])
      .then(([f, p]) => {
        setFacilities(f);
        setPatients(p);
        if (!facilityId && f.length) setFacilityId(f.find((x) => x.type === 'phc')?.id || f[0].id);
        if (!patientId && p.length) setPatientId(p[0].id);
      })
      .catch((e) => console.error('Failed to load base data', e))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (facilityId) localStorage.setItem('arogya_facility', facilityId); }, [facilityId]);
  useEffect(() => { if (patientId) localStorage.setItem('arogya_patient', patientId); }, [patientId]);

  const refreshPatients = async () => setPatients(await api.patients());
  const refreshFacilities = async () => setFacilities(await api.facilities());

  return (
    <AppContext.Provider value={{
      facilities, patients, facilityId, setFacilityId, patientId, setPatientId,
      loading, online, refreshPatients, refreshFacilities,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
