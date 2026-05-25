import { useEffect, useState, useRef } from 'react';
import api from '../utils/api';

/**
 * Custom React Hook to manage pessimistic concurrency lock for a dashboard configuration page.
 * @param {string} guildId - The Discord Guild ID.
 * @param {string} moduleName - The name of the module (e.g., 'tickets', 'welcome').
 * @returns {object} Lock state and handlers: { isLocked, lockOwner, loading, forceUnlock }
 */
export function useModuleLock(guildId, moduleName) {
  const [isLocked, setIsLocked] = useState(false);
  const [lockOwner, setLockOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const heartbeatIntervalRef = useRef(null);
  const lockAcquiredRef = useRef(false);

  // Helper to release the lock
  const releaseLock = async () => {
    if (!guildId || !moduleName || !lockAcquiredRef.current) return;
    try {
      // Clear interval first
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      
      // Mark as released
      lockAcquiredRef.current = false;
      
      // Make fire-and-forget release call
      await fetch(`/api/locks/${guildId}/${moduleName}/release`, {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch (e) {
      console.warn('[useModuleLock] Error releasing lock:', e);
    }
  };

  // Helper to acquire the lock
  const acquireLock = async () => {
    if (!guildId || !moduleName) return;
    setLoading(true);
    try {
      const result = await api.request(`/locks/${guildId}/${moduleName}/acquire`, {
        method: 'POST'
      });

      if (result && result.lock) {
        // Lock acquired successfully!
        setIsLocked(false);
        setLockOwner(null);
        lockAcquiredRef.current = true;

        // Setup heartbeat interval (renew every 15 seconds, lock lasts 30 seconds)
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        
        heartbeatIntervalRef.current = setInterval(async () => {
          try {
            await api.request(`/locks/${guildId}/${moduleName}/heartbeat`, {
              method: 'POST'
            });
          } catch (err) {
            console.error('[useModuleLock] Heartbeat failed:', err);
            // If heartbeat fails due to a conflict (e.g. 423 Locked / expired), stop interval and lock page
            if (err.status === 423) {
              setIsLocked(true);
              lockAcquiredRef.current = false;
              if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
                heartbeatIntervalRef.current = null;
              }
              if (err.data?.lock) {
                setLockOwner(err.data.lock);
              }
            }
          }
        }, 15000);
      }
    } catch (err) {
      // If 423 Locked, set lock state
      if (err.status === 423) {
        setIsLocked(true);
        lockAcquiredRef.current = false;
        if (err.data?.lock) {
          setLockOwner(err.data.lock);
        }
      } else {
        console.error('[useModuleLock] Failed to acquire lock:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Force unlock handler (for native admins)
  const forceUnlock = async () => {
    if (!guildId || !moduleName) return;
    setLoading(true);
    try {
      await api.request(`/locks/${guildId}/${moduleName}/force-unlock`, {
        method: 'POST'
      });
      
      // Lock released! Now let's try to acquire it ourselves immediately
      await acquireLock();
    } catch (err) {
      console.error('[useModuleLock] Force unlock error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    acquireLock();

    // Release lock on unmount
    return () => {
      releaseLock();
    };
  }, [guildId, moduleName]);

  return {
    isLocked,
    lockOwner,
    loading,
    forceUnlock,
    refreshLock: acquireLock
  };
}

export default useModuleLock;
