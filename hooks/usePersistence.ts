import { useState, useEffect, useRef } from 'react';

// Shared event key for same-tab synchronization
export const LOCAL_STORAGE_UPDATE_EVENT = 'aero-storage-update';

/**
 * A hook that manages state with debounced localStorage persistence AND real-time event listening.
 * Ensures all open tabs and components stay in sync instantly.
 * 
 * @param key The localStorage key
 * @param initialValue Default value
 * @param delay Debounce delay in ms (default 500ms for snappier feel)
 */
export function usePersistence<T>(key: string, initialValue: T, delay: number = 500) {
  // 1. Initialize State
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Integrity check: if we expect an array but got something else, fallback
        if (Array.isArray(initialValue) && !Array.isArray(parsed)) {
            return initialValue;
        }
        return parsed;
      }
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 2. Listen for external changes (Cross-tab + Cross-component)
  useEffect(() => {
    const handleStorageChange = (e: any) => {
      // Check if this event involves our key
      // 'storage' event fires on other tabs
      // 'aero-storage-update' event fires on current tab
      if (
        (e.type === 'storage' && e.key === key) || 
        (e.type === LOCAL_STORAGE_UPDATE_EVENT && e.detail?.key === key)
      ) {
        try {
           const newValue = localStorage.getItem(key);
           if (newValue) {
             const parsed = JSON.parse(newValue);
             // Functional update to avoid dependency issues, only update if stringified value differs
             setState((prev) => {
                if (JSON.stringify(prev) === newValue) return prev;
                return parsed;
             });
           }
        } catch (err) {
            console.error("Sync error in usePersistence", err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(LOCAL_STORAGE_UPDATE_EVENT, handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(LOCAL_STORAGE_UPDATE_EVENT, handleStorageChange);
    };
  }, [key]);

  // 3. Persist changes (Debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        const currentStored = localStorage.getItem(key);
        const nextValue = JSON.stringify(state);
        
        // Only write and dispatch if different to avoid infinite loops
        if (currentStored !== nextValue) {
            localStorage.setItem(key, nextValue);
            // Dispatch local event so other components in the SAME tab update instantly
            window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_UPDATE_EVENT, { detail: { key } }));
        }
      } catch (error) {
        console.warn(`Error writing localStorage key "${key}":`, error);
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [key, state, delay]);

  return [state, setState] as const;
}
