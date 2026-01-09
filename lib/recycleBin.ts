import { LOCAL_STORAGE_UPDATE_EVENT } from '../hooks/usePersistence';

export interface DeletedItem {
  id: string;            // Unique ID in the bin
  originalId: string;    // Original ID of the item
  moduleKey: string;     // LocalStorage key (e.g., AERO_RESTOCK_DATA)
  moduleName: string;    // Human readable name (e.g., 'Inventory')
  data: any;             // The full data object
  title: string;         // Display title (e.g., product name)
  deletedAt: string;     // ISO Date
  expiresAt: string;     // ISO Date (14 days later)
}

const BIN_KEY = 'AERO_RECYCLE_BIN';
const RETENTION_DAYS = 14;

export const getRecycleBin = (): DeletedItem[] => {
  try {
    const raw = localStorage.getItem(BIN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const addToRecycleBin = (moduleKey: string, moduleName: string, item: any, title: string) => {
  const currentBin = getRecycleBin();
  
  const now = new Date();
  const expires = new Date();
  expires.setDate(now.getDate() + RETENTION_DAYS);

  const newItem: DeletedItem = {
    id: `bin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    originalId: item.id,
    moduleKey,
    moduleName,
    data: item,
    title: title || 'Untitled Item',
    deletedAt: now.toISOString(),
    expiresAt: expires.toISOString()
  };

  const updatedBin = [newItem, ...currentBin];
  localStorage.setItem(BIN_KEY, JSON.stringify(updatedBin));
  
  // Trigger update for UI components listening to storage changes
  window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_UPDATE_EVENT, { detail: { key: BIN_KEY } }));
};

export const restoreFromBin = (binId: string) => {
  const currentBin = getRecycleBin();
  const targetItem = currentBin.find(i => i.id === binId);
  
  if (!targetItem) return;

  // 1. Get original module data
  try {
    const moduleRaw = localStorage.getItem(targetItem.moduleKey);
    const moduleData = moduleRaw ? JSON.parse(moduleRaw) : [];
    
    // 2. Add item back (avoid duplicates if ID exists)
    if (Array.isArray(moduleData)) {
      // Check if it already exists (maybe re-created manually)
      const exists = moduleData.find((i: any) => i.id === targetItem.originalId);
      if (!exists) {
        const updatedModuleData = [targetItem.data, ...moduleData];
        localStorage.setItem(targetItem.moduleKey, JSON.stringify(updatedModuleData));
        // Notify the specific module to re-render
        window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_UPDATE_EVENT, { detail: { key: targetItem.moduleKey } }));
      }
    }
  } catch (e) {
    console.error("Failed to restore item", e);
    alert("恢复失败：源数据格式错误");
    return;
  }

  // 3. Remove from bin
  permanentDelete(binId);
};

export const permanentDelete = (binId: string) => {
  const currentBin = getRecycleBin();
  const updatedBin = currentBin.filter(i => i.id !== binId);
  localStorage.setItem(BIN_KEY, JSON.stringify(updatedBin));
  window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_UPDATE_EVENT, { detail: { key: BIN_KEY } }));
};

export const emptyBin = () => {
  localStorage.setItem(BIN_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_UPDATE_EVENT, { detail: { key: BIN_KEY } }));
};

// Auto-run on app load usually, but we call it when accessing the bin
export const cleanupExpiredItems = () => {
  const currentBin = getRecycleBin();
  const now = new Date();
  const validItems = currentBin.filter(item => new Date(item.expiresAt) > now);
  
  if (validItems.length !== currentBin.length) {
    localStorage.setItem(BIN_KEY, JSON.stringify(validItems));
    window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_UPDATE_EVENT, { detail: { key: BIN_KEY } }));
  }
};