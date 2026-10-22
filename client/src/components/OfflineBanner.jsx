import React from 'react';
import { useOfflineSync } from '../context/OfflineSyncContext';
import { useLanguage } from '../context/LanguageContext';
import { WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OfflineBanner() {
  const {
    isOnline,
    status,
    pendingCount,
    isSyncing,
    syncNow,
    lastSyncResult,
    isSimulatedOffline,
    toggleSimulateOffline,
  } = useOfflineSync();
  const { t } = useLanguage();

  return (
    <>
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="offline-banner">
          <WifiOff size={16} />
          <span>{t('offline_banner')}</span>
          {isSimulatedOffline && (
            <button
              onClick={toggleSimulateOffline}
              style={{
                marginLeft: '0.75rem',
                padding: '0.2rem 0.6rem',
                background: '#ffffff',
                border: '1px solid #f87171',
                borderRadius: '6px',
                color: '#b91c1c',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              {t('offline_mode_normal')}
            </button>
          )}
        </div>
      )}

      {/* Pending Sync Banner when online and items are queued */}
      {isOnline && pendingCount > 0 && (
        <div className="sync-banner">
          <AlertCircle size={16} color="#2563eb" />
          <span>{t('waiting_to_sync', { count: pendingCount })}</span>
          <button
            onClick={syncNow}
            disabled={isSyncing}
            style={{
              padding: '0.25rem 0.75rem',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? t('syncing') : t('sync_now')}</span>
          </button>
        </div>
      )}

      {/* Sync Success notification flash if recently completed */}
      {isOnline && pendingCount === 0 && lastSyncResult?.totalSynced > 0 && (
        <div
          style={{
            background: '#ecfdf5',
            borderBottom: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} color="#059669" />
          <span>{t('all_synced')}</span>
        </div>
      )}
    </>
  );
}
