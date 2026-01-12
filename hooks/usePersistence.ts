import { useState, useEffect, useRef } from 'react';
import { pb } from '../lib/pb';

export const LOCAL_STORAGE_UPDATE_EVENT = 'aero-storage-update';

/**
 * World-Class Hybrid Persistence Hook (v2.1)
 * Fixes:
 * - Immediate Local Save: Prevents data loss if user refreshes immediately after editing.
 * - Timestamp Protection: Uses isFirstMount to avoid overwriting timestamps on initial load.
 * - Conflict Resolution: Robust server vs local time comparison.
 */
export function usePersistence<T>(key: string, initialValue: T, delay: number = 500) {
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
  const isFirstMount = useRef(true); // Prevents initial render from updating timestamp

  // 2. Cloud Sync Logic (On Mount)
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
          // If no local TS, default to 0 (Server wins), unless we have data (then we assume it's fresh/unsynced)
          const localTime = localTimeStr ? parseInt(localTimeStr) : (hasLocalData ? Date.now() : 0);

          // LOGIC: Server wins only if it is significantly NEWER (> 2s) than local.
          if (serverTime > localTime + 2000) {
              if (JSON.stringify(record.val) !== JSON.stringify(state)) {
                 console.log(`[Cloud] Server data is newer (${serverTime} > ${localTime}). Syncing down.`);
                 isRemoteUpdate.current = true; // Mark as remote update so we don't bounce it back
                 setState(record.val);
                 
                 // Persist the Server Data to Local immediately
                 localStorage.setItem(key, JSON.stringify(record.val));
                 localStorage.setItem(key + '_TS', serverTime.toString());
              }
          } else {
              console.log(`[Cloud] Local data is authoritative. Keeping local.`);
          }
        }
      } catch (err: any) {
        if (err.status === 0 || err.message === 'Something went wrong.') {
            isOffline.current = true;
        }
      }

      // Realtime Subscription
      if (!isOffline.current) {
          try {
              pb.collection('sync_store').subscribe('*', function (e) {
                if (e.action === 'update' && e.record.key === key) {
                   const updateTime = new Date(e.record.updated).getTime();
                   const currentLocalTime = parseInt(localStorage.getItem(key + '_TS') || '0');
                   
                   // Only accept push if strictly newer
                   if (updateTime > currentLocalTime) {
                       console.log(`[Realtime] Received update for ${key}`);
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

  // 3. Persist Local Changes (Immediate Local + Debounced Cloud)
  useEffect(() => {
    // Skip saving on the very first render to protect the existing timestamp
    if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
    }

    // If this change came from the cloud, we already saved it in initCloud/subscribe.
    if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
    }

    // A. IMMEDIATE LOCAL SAVE
    // Critical: Save to LS synchronously so refreshing page immediately doesn't lose data.
    try {
        const valString = JSON.stringify(state);
        const now = Date.now();
        localStorage.setItem(key, valString);
        localStorage.setItem(key + '_TS', now.toString());
        window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_UPDATE_EVENT, { detail: { key } }));
    } catch (e) {
        console.error("Local Save Failed", e);
    }

    // B. DEBOUNCED CLOUD SYNC
    const handler = setTimeout(async () => {
      if (isOffline.current) return;

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
      } catch (error: any) {
         if (error.status === 0) isOffline.current = true;
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [key, state, delay]);

  return [state, setState] as const;
}