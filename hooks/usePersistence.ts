
import { useState, useEffect, useRef } from 'react';
import { pb } from '../lib/pb';

export const LOCAL_STORAGE_UPDATE_EVENT = 'aero-storage-update';
export const SYNC_START_EVENT = 'AERO_SYNC_START';
export const SYNC_SUCCESS_EVENT = 'AERO_SYNC_SUCCESS';
export const SYNC_ERROR_EVENT = 'AERO_SYNC_ERROR';

/**
 * World-Class Hybrid Persistence Hook (v2.3 - Robust Sync Edition)
 * Features:
 * - Immediate Local Save: Prevents data loss on refresh.
 * - Robust Cloud Push: Handles 404s (record deleted) gracefully by re-creating.
 * - Auto-Recovery: Does not permanently lock offline on transient network errors.
 */
export function usePersistence<T>(key: string, initialValue: T, delay: number = 1000) {
  // 1. Initialize State from Local Storage (Fastest)
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        // Migration Patch: Ensure TS exists
        if (!localStorage.getItem(key + '_TS')) {
            localStorage.setItem(key + '_TS', Date.now().toString());
        }

        const parsed = JSON.parse(item);
        if (Array.isArray(initialValue) && !Array.isArray(parsed)) return initialValue;
        return parsed;
      }
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const recordIdRef = useRef<string | null>(null);
  const isRemoteUpdate = useRef(false);
  const isOffline = useRef(false);
  const isFirstMount = useRef(true); 

  // 2. Initial Configuration Check
  useEffect(() => {
      // Only force offline if using the default placeholder IP
      if (pb.baseUrl.includes('YOUR_TENCENT_IP')) {
          isOffline.current = true;
      } else {
          isOffline.current = false;
      }
  }, []);

  // 3. Cloud Sync Logic (On Mount) - Pull Phase
  useEffect(() => {
    if (isOffline.current) return;

    const initCloud = async () => {
      try {
        // Attempt to fetch existing record
        const record = await pb.collection('sync_store').getFirstListItem(`key="${key}"`).catch(() => null);
        
        if (record) {
          recordIdRef.current = record.id;
          
          if (record.val) {
              // --- CONFLICT RESOLUTION ---
              const serverTime = new Date(record.updated).getTime();
              const localTimeStr = localStorage.getItem(key + '_TS');
              
              const hasLocalData = localStorage.getItem(key) !== null;
              const localTime = localTimeStr ? parseInt(localTimeStr) : (hasLocalData ? Date.now() : 0);

              // Server wins only if significantly NEWER (> 2s) to avoid loop
              if (serverTime > localTime + 2000) {
                  const currentStr = JSON.stringify(state);
                  const serverStr = JSON.stringify(record.val);
                  
                  if (currentStr !== serverStr) {
                     console.log(`[Cloud] Pulling newer data for ${key}`);
                     isRemoteUpdate.current = true; 
                     setState(record.val);
                     
                     // Persist locally
                     localStorage.setItem(key, serverStr);
                     localStorage.setItem(key + '_TS', serverTime.toString());
                  }
              }
          }
        }
      } catch (err: any) {
        console.warn(`[Sync Init] ${key}:`, err.message);
      }

      // Realtime Subscription (Pull changes from other users)
      try {
          pb.collection('sync_store').subscribe('*', function (e) {
            if (e.action === 'update' && e.record.key === key) {
               const updateTime = new Date(e.record.updated).getTime();
               const currentLocalTime = parseInt(localStorage.getItem(key + '_TS') || '0');
               
               // Only accept push if strictly newer
               if (updateTime > currentLocalTime) {
                   isRemoteUpdate.current = true;
                   setState(e.record.val);
                   localStorage.setItem(key, JSON.stringify(e.record.val));
                   localStorage.setItem(key + '_TS', updateTime.toString());
               }
            }
          }).catch((e) => console.warn("Realtime connection issue:", e.message));
      } catch (e) {}
    };

    initCloud();

    return () => {
      try { pb.collection('sync_store').unsubscribe('*'); } catch (e) {}
    };
  }, [key]); 

  // 4. Persist Local Changes (Immediate Local + Realtime Cloud Push)
  useEffect(() => {
    if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
    }

    if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
    }

    // A. IMMEDIATE LOCAL SAVE
    try {
        const valString = JSON.stringify(state);
        const now = Date.now();
        localStorage.setItem(key, valString);
        localStorage.setItem(key + '_TS', now.toString());
        window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_UPDATE_EVENT, { detail: { key } }));
    } catch (e) {
        console.error("Local Save Failed", e);
    }

    // B. REALTIME CLOUD PUSH (Debounced)
    const handler = setTimeout(async () => {
      if (isOffline.current) return;

      // Broadcast Start Event
      window.dispatchEvent(new CustomEvent(SYNC_START_EVENT));

      try {
        let targetId = recordIdRef.current;

        // If ID is missing, try to find it one last time
        if (!targetId) {
            try {
                const existing = await pb.collection('sync_store').getFirstListItem(`key="${key}"`);
                targetId = existing.id;
                recordIdRef.current = existing.id;
            } catch (e: any) { 
                if (e.status !== 404) throw e; 
            }
        }

        if (targetId) {
            // Update Existing
            try {
                await pb.collection('sync_store').update(targetId, { val: state });
            } catch (updateErr: any) {
                // If 404 (deleted on server while we were working), fallback to create
                if (updateErr.status === 404) {
                    console.log(`[Sync] Record ${targetId} not found, recreating...`);
                    recordIdRef.current = null;
                    const newRecord = await pb.collection('sync_store').create({ key, val: state });
                    recordIdRef.current = newRecord.id;
                } else {
                    throw updateErr;
                }
            }
        } else {
            // Create New
            const newRecord = await pb.collection('sync_store').create({ key, val: state });
            recordIdRef.current = newRecord.id;
        }

        // Broadcast Success Event
        window.dispatchEvent(new CustomEvent(SYNC_SUCCESS_EVENT));
      } catch (error: any) {
         console.error(`[Sync Failed] ${key}`, error);
         
         // Only set offline if strictly a configuration error, otherwise keep retrying next time
         if (pb.baseUrl.includes('YOUR_TENCENT_IP')) {
             isOffline.current = true;
         }
         
         // Broadcast Error Event
         window.dispatchEvent(new CustomEvent(SYNC_ERROR_EVENT));
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [key, state, delay]);

  return [state, setState] as const;
}
