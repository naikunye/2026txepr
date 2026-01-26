
import { useState, useEffect, useRef } from 'react';
import { pb } from '../lib/pb';

export const LOCAL_STORAGE_UPDATE_EVENT = 'aero-storage-update';
export const SYNC_START_EVENT = 'AERO_SYNC_START';
export const SYNC_SUCCESS_EVENT = 'AERO_SYNC_SUCCESS';
export const SYNC_ERROR_EVENT = 'AERO_SYNC_ERROR';

/**
 * World-Class Hybrid Persistence Hook (v2.2 - Realtime Sync Edition)
 * Features:
 * - Immediate Local Save: Prevents data loss on refresh.
 * - Realtime Cloud Push: Pushes to cloud immediately after debounce.
 * - Global Event Broadcasting: Notifies App.tsx to show sync status.
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

  // 2. Cloud Sync Logic (On Mount) - Pull Phase
  useEffect(() => {
    if (pb.baseUrl.includes('YOUR_TENCENT_IP')) {
        isOffline.current = true;
        return;
    }

    const initCloud = async () => {
      try {
        const record = await pb.collection('sync_store').getFirstListItem(`key="${key}"`);
        
        if (record && record.val) {
          recordIdRef.current = record.id;
          
          // --- CONFLICT RESOLUTION ---
          const serverTime = new Date(record.updated).getTime();
          const localTimeStr = localStorage.getItem(key + '_TS');
          
          const hasLocalData = localStorage.getItem(key) !== null;
          const localTime = localTimeStr ? parseInt(localTimeStr) : (hasLocalData ? Date.now() : 0);

          // Server wins only if significantly NEWER (> 2s)
          if (serverTime > localTime + 2000) {
              if (JSON.stringify(record.val) !== JSON.stringify(state)) {
                 console.log(`[Cloud] Server data is newer (${serverTime} > ${localTime}). Syncing down.`);
                 isRemoteUpdate.current = true; 
                 setState(record.val);
                 
                 // Persist
                 localStorage.setItem(key, JSON.stringify(record.val));
                 localStorage.setItem(key + '_TS', serverTime.toString());
              }
          }
        }
      } catch (err: any) {
        if (err.status === 0 || err.message === 'Something went wrong.') {
            isOffline.current = true;
        }
      }

      // Realtime Subscription (Pull changes from other users)
      if (!isOffline.current) {
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
              }).catch(() => {});
          } catch (e) {}
      }
    };

    initCloud();

    return () => {
      try { pb.collection('sync_store').unsubscribe('*'); } catch (e) {}
    };
  }, [key]); 

  // 3. Persist Local Changes (Immediate Local + Realtime Cloud Push)
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
        if (recordIdRef.current) {
            await pb.collection('sync_store').update(recordIdRef.current, { val: state });
        } else {
            // Double check existence before creating
            try {
                const existing = await pb.collection('sync_store').getFirstListItem(`key="${key}"`);
                recordIdRef.current = existing.id;
                await pb.collection('sync_store').update(existing.id, { val: state });
            } catch (err: any) {
                if (err.status === 404) {
                    const newRecord = await pb.collection('sync_store').create({ key, val: state });
                    recordIdRef.current = newRecord.id;
                }
            }
        }
        // Broadcast Success Event
        window.dispatchEvent(new CustomEvent(SYNC_SUCCESS_EVENT));
      } catch (error: any) {
         if (error.status === 0) isOffline.current = true;
         // Broadcast Error Event
         window.dispatchEvent(new CustomEvent(SYNC_ERROR_EVENT));
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [key, state, delay]);

  return [state, setState] as const;
}
