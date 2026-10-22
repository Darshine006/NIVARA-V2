// Offline Storage Utility for NIVARA PWA
// Provides reliable persistent storage for cached medical data and pending synchronization queues

const STORAGE_KEYS = {
  OFFLINE_RECORDS: 'nivara_offline_records_queue',
  OFFLINE_PATIENTS: 'nivara_offline_patients_queue',
  CACHED_APPOINTMENTS: 'nivara_cached_appointments',
  CACHED_RECORDS: 'nivara_cached_records',
  CACHED_CENTERS: 'nivara_cached_centers',
  CACHED_ARTICLES: 'nivara_cached_articles',
  CACHED_REGIONS: 'nivara_cached_regions',
  ACTIVE_REGION: 'nivara_active_region',
};

export const offlineStorage = {
  // --- Queued Offline Consultations & Records ---
  saveOfflineRecord(record) {
    const queue = this.getPendingRecords();
    const tempId = `offline_rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newRecord = {
      ...record,
      clientTempId: tempId,
      isOfflineCreated: true,
      createdAt: new Date().toISOString(),
      consultationDate: record.consultationDate || new Date().toISOString(),
    };
    queue.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_RECORDS, JSON.stringify(queue));
    return newRecord;
  },

  getPendingRecords() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_RECORDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // --- Queued Offline Patient Registrations ---
  saveOfflinePatient(patient) {
    const queue = this.getPendingPatients();
    const tempId = `offline_pat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newPatient = {
      ...patient,
      clientTempId: tempId,
      isOfflineCreated: true,
      createdAt: new Date().toISOString(),
    };
    queue.push(newPatient);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_PATIENTS, JSON.stringify(queue));
    return newPatient;
  },

  getPendingPatients() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_PATIENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getPendingCount() {
    return this.getPendingRecords().length + this.getPendingPatients().length;
  },

  clearPendingQueue(syncedTempIds = []) {
    // If specific temp IDs given, remove only those; otherwise clear all
    if (!syncedTempIds || syncedTempIds.length === 0) {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_RECORDS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.OFFLINE_PATIENTS, JSON.stringify([]));
      return;
    }

    const currentRecords = this.getPendingRecords().filter(
      (r) => !syncedTempIds.includes(r.clientTempId)
    );
    const currentPatients = this.getPendingPatients().filter(
      (p) => !syncedTempIds.includes(p.clientTempId)
    );

    localStorage.setItem(STORAGE_KEYS.OFFLINE_RECORDS, JSON.stringify(currentRecords));
    localStorage.setItem(STORAGE_KEYS.OFFLINE_PATIENTS, JSON.stringify(currentPatients));
  },

  // --- Cache Read / Write for Offline Viewing ---
  setCachedData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage quota warning when caching:', e);
    }
  },

  getCachedData(key, fallback = []) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },

  // Specific Cache Helpers
  cacheAppointments(appointments) {
    this.setCachedData(STORAGE_KEYS.CACHED_APPOINTMENTS, appointments);
  },
  getCachedAppointments() {
    return this.getCachedData(STORAGE_KEYS.CACHED_APPOINTMENTS, []);
  },

  cacheCenters(centers) {
    this.setCachedData(STORAGE_KEYS.CACHED_CENTERS, centers);
  },
  getCachedCenters() {
    return this.getCachedData(STORAGE_KEYS.CACHED_CENTERS, []);
  },

  cacheArticles(articles) {
    this.setCachedData(STORAGE_KEYS.CACHED_ARTICLES, articles);
  },
  getCachedArticles() {
    return this.getCachedData(STORAGE_KEYS.CACHED_ARTICLES, []);
  },

  cacheRegions(regions) {
    this.setCachedData(STORAGE_KEYS.CACHED_REGIONS, regions);
  },
  getCachedRegions() {
    return this.getCachedData(STORAGE_KEYS.CACHED_REGIONS, []);
  },

  setActiveRegion(region) {
    this.setCachedData(STORAGE_KEYS.ACTIVE_REGION, region);
  },
  getActiveRegion() {
    return this.getCachedData(STORAGE_KEYS.ACTIVE_REGION, null);
  },
};
