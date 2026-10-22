import API from './api';
import { offlineStorage } from './offlineStorage';

export const syncService = {
  // Execute synchronization with the central registry
  async triggerSync() {
    const pendingRecords = offlineStorage.getPendingRecords();
    const pendingPatients = offlineStorage.getPendingPatients();

    if (pendingRecords.length === 0 && pendingPatients.length === 0) {
      return { success: true, count: 0, message: 'No records pending synchronization' };
    }

    try {
      const response = await API.post('/sync', {
        records: pendingRecords,
        patients: pendingPatients,
      });

      if (response.data && response.data.success) {
        // Collect synced temp IDs
        const syncedRecordIds = pendingRecords.map((r) => r.clientTempId);
        const syncedPatientIds = pendingPatients.map((p) => p.clientTempId);

        // Clear only confirmed synced items from local queue
        offlineStorage.clearPendingQueue([...syncedRecordIds, ...syncedPatientIds]);

        return {
          success: true,
          syncedRecords: response.data.syncedRecordsCount || 0,
          syncedPatients: response.data.syncedPatientsCount || 0,
          totalSynced:
            (response.data.syncedRecordsCount || 0) + (response.data.syncedPatientsCount || 0),
          message: response.data.message || 'All records synchronized successfully',
        };
      } else {
        throw new Error(response.data?.message || 'Synchronization failed');
      }
    } catch (error) {
      console.error('[Sync Service Error]:', error);
      throw error;
    }
  },
};
