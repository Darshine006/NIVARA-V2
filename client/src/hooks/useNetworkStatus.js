import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(() => {
    return localStorage.getItem('nivara_simulated_offline') === 'true';
  });

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const [connectionType, setConnectionType] = useState('4g');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check Network Information API if supported
    if (typeof navigator !== 'undefined' && navigator.connection) {
      const conn = navigator.connection;
      const updateConn = () => {
        setConnectionType(conn.effectiveType || '4g');
      };
      updateConn();
      conn.addEventListener('change', updateConn);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        conn.removeEventListener('change', updateConn);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSimulateOffline = () => {
    const nextState = !isSimulatedOffline;
    setIsSimulatedOffline(nextState);
    localStorage.setItem('nivara_simulated_offline', nextState ? 'true' : 'false');
  };

  // If simulation is enabled, treat system as offline
  const effectiveOnline = isSimulatedOffline ? false : isOnline;

  // Determine status: 'online' | 'poor' | 'offline'
  let status = 'online';
  if (!effectiveOnline) {
    status = 'offline';
  } else if (connectionType === '2g' || connectionType === 'slow-2g') {
    status = 'poor';
  }

  return {
    isOnline: effectiveOnline,
    status, // 'online' | 'poor' | 'offline'
    connectionType,
    isSimulatedOffline,
    toggleSimulateOffline,
  };
}
