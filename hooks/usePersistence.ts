import { useState, useEffect, useRef } from 'react';
import { pb } from '../lib/pb';

export const LOCAL_STORAGE_UPDATE_EVENT = 'aero-storage-update';

/**
 * World-Class Hybrid Persistence Hook
 * 1. Loads instantly from LocalStorage (Optimistic UI)
 * 2. Background syncs with Tencent Cloud (PocketBase)
 * 3. Handles Offline/Network errors gracefully
 */
export function usePersistence<T>(key: string, initialValue: T, delay: number = 500) {
  // 1. Initialize State from Local Storage (Fastest)
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
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
  const isMounted = useRef(false);
  const isOffline = useRef(false);

  // 2. Cloud Sync & Realtime Subscription
  useEffect(() => {
    isMounted.current = true;

    // Detect unconfigured IP
    if (pb.baseUrl.includes('YOUR_TENCENT_IP')) {
        isOffline.current = true;
        // Suppress warning to avoid spam, just fallback to local
        return;
    }

    const initCloud = async () => {
      try {
        const record = await pb.collection('sync_store').getFirstListItem(`key="${key}"`);
        
        if (record && record.val) {
          recordIdRef.current = record.id;
          if (JSON.stringify(record.val) !== JSON.stringify(state)) {
             console.log(`[Cloud] Loaded remote data for ${key}`);
             isRemoteUpdate.current = true;
             setState(record.val);
             localStorage.setItem(key, JSON.stringify(record.val));
          }
        }
      } catch (err: any) {
        // Handle Errors Gracefully
        const status = err.status;
        
        // 404: Key doesn't exist yet -> Normal
        // 0: Network Error / Offline -> Normal if server down
        if (status === 404) {
            // New key, will create on first write
        } else if (status === 0 || err.message === 'Something went wrong.' || err.name === 'ClientResponseError 0') {
            if (!isOffline.current) {
                console.log(`[Cloud] Offline mode active for ${key} (Server unreachable)`);
                isOffline.current = true;
            }
        } else {
            console.warn(`[Cloud] Sync warning for ${key}:`, err.message);
        }
      }

      // Subscribe if online
      if (!isOffline.current) {
          try {
              pb.collection('sync_store').subscribe('*', function (e) {
                if (e.action === 'update' && e.record.key === key) {
                   isRemoteUpdate.current = true;
                   setState(e.record.val);
                   localStorage.setItem(key, JSON.stringify(e.record.val));
                }
              }).catch(() => {
                  isOffline.current = true;
              });
          } catch (e) {
              // Ignore sub errors
          }
      }
    };

    initCloud();

    return () => {
      isMounted.current = false;
      try { pb.collection('sync_store').unsubscribe('*'); } catch (e) {}
    };
  }, [key]); 

  // 3. Persist Local Changes to Cloud
  useEffect(() => {
    if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
    }

    const handler = setTimeout(async () => {
      try {
        const valString = JSON.stringify(state);
        
        // Always save to LocalStorage
        localStorage.setItem(key, valString);
        window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_UPDATE_EVENT, { detail: { key } }));

        // Sync to Cloud if online
        if (isOffline.current) return;

        if (recordIdRef.current) {
            await pb.collection('sync_store').update(recordIdRef.current, { val: state });
        } else {
            try {
                // Double check before creating to avoid race conditions
                const existing = await pb.collection('sync_store').getFirstListItem(`key="${key}"`);
                recordIdRef.current = existing.id;
                await pb.collection('sync_store').update(existing.id, { val: state });
            } catch (err: any) {
                if (err.status === 404) {
                    const newRecord = await pb.collection('sync_store').create({ key, val: state });
                    recordIdRef.current = newRecord.id;
                } else {
                    throw err; 
                }
            }
        }
      } catch (error: any) {
         // Silently fail to offline mode
         if (error.status === 0 || error.message === 'Something went wrong.') {
             isOffline.current = true;
         } else {
             console.warn(`[Cloud] Save failed for "${key}"`, error.message);
         }
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [key, state, delay]);

  return [state, setState] as const;
}