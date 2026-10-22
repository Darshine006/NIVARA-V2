import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { offlineStorage } from '../services/offlineStorage';
import { syncService } from '../services/syncService';
import { useAuth } from './AuthContext';

const OfflineSyncContext = createContext();

export function OfflineSyncProvider({ children }) {
  const { isOnline, status, connectionType, isSimulatedOffline, toggleSimulateOffline } =
    useNetworkStatus();
  const { isAuthenticated, isWorker, isAdmin } = useAuth();

  const [pendingCount, setPendingCount] = useState(() => offlineStorage.getPendingCount());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  // Refresh pending count
  const refreshPendingCount = useCallback(() => {
    setPendingCount(offlineStorage.getPendingCount());
  }, []);

  // Trigger sync
  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    const currentPending = offlineStorage.getPendingCount();
    if (currentPending === 0) {
      setLastSyncResult({ success: true, message: 'All records synchronized', count: 0 });
      return;
    }

    setIsSyncing(true);
    try {
      const res = await syncService.triggerSync();
      setLastSyncResult(res);
      refreshPendingCount();
      return res;
    } catch (err) {
      console.warn('Sync attempt failed:', err.message);
      setLastSyncResult({ success: false, message: err.message || 'Sync failed' });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, refreshPendingCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && (isWorker || isAdmin)) {
      const count = offlineStorage.getPendingCount();
      if (count > 0) {
        console.log('[Auto-Sync] Connection restored. Triggering sync for', count, 'pending items...');
        syncNow();
      }
    }
  }, [isOnline, isWorker, isAdmin, syncNow]);

  // Periodic check of local storage queue
  useEffect(() => {
    const interval = setInterval(refreshPendingCount, 4000);
    return () => clearInterval(interval);
  }, [refreshPendingCount]);

  return (
    <OfflineSyncContext.Provider
      value={{
        isOnline,
        status, // 'online' | 'poor' | 'offline'
        connectionType,
        isSimulatedOffline,
        toggleSimulateOffline,
        pendingCount,
        isSyncing,
        lastSyncResult,
        syncNow,
        refreshPendingCount,
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
}

export function useOfflineSync() {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error('useOfflineSync must be used within an OfflineSyncProvider');
  }
  return context;
}
