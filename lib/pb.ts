import PocketBase from 'pocketbase';

// Key for LocalStorage
export const STORAGE_KEY_PB_URL = 'AERO_PB_URL';

// Default placeholder
export const DEFAULT_PB_URL = 'http://YOUR_TENCENT_IP:8090'; 

// 1. Try to get the configured URL from LocalStorage
const savedUrl = localStorage.getItem(STORAGE_KEY_PB_URL);

// 2. Initialize PocketBase with saved URL or default
export const pb = new PocketBase(savedUrl || DEFAULT_PB_URL);

// Disable auto-cancellation
pb.autoCancellation(false);

/**
 * Helper to update the server URL dynamically from the UI
 */
export const updateServerUrl = (url: string) => {
    // Remove trailing slash if present
    const cleanUrl = url.replace(/\/$/, '');
    localStorage.setItem(STORAGE_KEY_PB_URL, cleanUrl);
    pb.baseUrl = cleanUrl;
};
