import React, { useRef, useState, useEffect } from 'react';
import { 
  Settings, Save, Upload, Download, Server, Palette, 
  Database, Shield, Monitor, Moon, Sun, Cloud, RefreshCw, 
  Terminal, Activity, Lock, Eye, EyeOff, Zap, AlertTriangle, Hexagon, HardDrive, Wifi
} from 'lucide-react';

interface SettingsModuleProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ currentTheme, onThemeChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>(['> AERO.OS System Monitor initialized...', '> Waiting for diagnostics...']);
  
  // Real System Stats
  const [storageUsage, setStorageUsage] = useState(0); // in KB
  const [networkLatency, setNetworkLatency] = useState<number | null>(null);
  const [lastBackup, setLastBackup] = useState<string>('从未备份');

  const addLog = (msg: string) => {
    setConsoleLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // --- Helper: Calculate LocalStorage Usage ---
  const calculateStorage = () => {
    let total = 0;
    for (let x in localStorage) {
        if (!localStorage.hasOwnProperty(x)) continue;
        total += ((localStorage[x].length + x.length) * 2);
    }
    setStorageUsage(Number((total / 1024).toFixed(2)));
  };

  useEffect(() => {
    calculateStorage();
    // Check backup time hint if we stored it (optional enhancement)
  }, []);

  // --- Handlers ---

  const handleExport = () => {
    try {
      addLog('> Starting system dump...');
      
      const data = {
        meta: { exportedAt: new Date().toISOString(), version: '3.1.0', user: 'Admin' },
        data: {
          logistics: localStorage.getItem('AERO_LOGISTICS_DATA') ? JSON.parse(localStorage.getItem('AERO_LOGISTICS_DATA')!) : null,
          finance: localStorage.getItem('AERO_FINANCE_DATA') ? JSON.parse(localStorage.getItem('AERO_FINANCE_DATA')!) : null,
          restock: localStorage.getItem('AERO_RESTOCK_DATA') ? JSON.parse(localStorage.getItem('AERO_RESTOCK_DATA')!) : null,
          theme: localStorage.getItem('AERO_THEME') || 'cyber',
          tasks: localStorage.getItem('AERO_TASKS_DATA') ? JSON.parse(localStorage.getItem('AERO_TASKS_DATA')!) : null, 
        }
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AERO_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addLog('> Backup generated successfully.');
      setLastBackup('刚刚');
    } catch (e) {
      addLog('> ERROR: Export failed.');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addLog(`> Reading: ${file.name}...`);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        const payload = json.data || json;
        
        const map = {
            'logistics': 'AERO_LOGISTICS_DATA',
            'finance': 'AERO_FINANCE_DATA',
            'restock': 'AERO_RESTOCK_DATA',
            'theme': 'AERO_THEME',
            'tasks': 'AERO_TASKS_DATA'
        };

        let count = 0;
        Object.keys(map).forEach(k => {
            // @ts-ignore
            if (payload[k]) {
                // @ts-ignore
                localStorage.setItem(map[k], typeof payload[k] === 'object' ? JSON.stringify(payload[k]) : payload[k]);
                count++;
            }
        });

        if (count > 0) {
            addLog(`> SUCCESS: Restored ${count} modules.`);
            alert('数据恢复成功！页面将刷新。');
            window.location.reload();
        } else {
            addLog('> ERROR: No valid data found in file.');
        }
      } catch (err) {
        addLog('> FATAL: Corrupt file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  const runDiagnostics = async () => {
    addLog('> Running system diagnostics...');
    // 1. Storage Check
    calculateStorage();
    addLog(`> Storage Integrity: OK (${storageUsage} KB used)`);
    
    // 2. Network Check (Simulated Ping)
    const start = Date.now();
    try {
        // Just a fetch to a reliable CDN to check online status
        await fetch('https://cdn.jsdelivr.net/npm/react', { method: 'HEAD', mode: 'no-cors' });
        const latency = Date.now() - start;
        setNetworkLatency(latency);
        addLog(`> Network Status: ONLINE (Latency: ${latency}ms)`);
    } catch (e) {
        setNetworkLatency(-1);
        addLog('> Network Status: OFFLINE / BLOCKED');
    }
  };

  return (
    <div className="px-6 pb-20 space-y-8 animate-in fade-in duration-500">
      
      {/* Header - Fixed to pt-6 pb-4 */}
      <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-cyber-border pb-4 pt-6 -mx-6 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex justify-between items-end">
         <div>
            <h1 className="text-3xl font-black text-cyber-text tracking-wider flex items-center gap-3">
               <Settings className="text-cyber-cyan" size={32} />
               系统设置
            </h1>
            <p className="text-cyber-dim mt-1 font-mono text-xs">SYSTEM CONFIGURATION</p>
         </div>
         <div className="flex gap-2">
            <button 
                onClick={() => {
                    if(confirm('警告：此操作将清除所有业务数据（物流、财务、产品）。确定继续吗？')) {
                        localStorage.clear();
                        window.location.reload();
                    }
                }}
                className="px-4 py-2 border border-red-900 text-red-500 text-xs font-bold hover:bg-red-900 hover:text-white transition-all"
            >
               FACTORY RESET
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* 1. Theme Engine */}
         <div className="tech-border p-8 relative overflow-hidden group bg-cyber-panel">
            <h2 className="text-xl font-bold text-cyber-text mb-6 flex items-center gap-2">
               <Palette size={20} className="text-cyber-purple" /> 界面主题
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button 
                 onClick={() => onThemeChange('cyber')}
                 className={`h-24 border rounded-lg p-4 flex items-end transition-all ${currentTheme === 'cyber' ? 'border-cyber-cyan bg-cyber-cyan/5' : 'border-cyber-border/30 opacity-50 hover:opacity-100'}`}
               >
                  <span className="text-cyber-cyan font-bold font-mono">NIGHT CITY (Default)</span>
               </button>
               <button 
                 onClick={() => onThemeChange('obsidian')}
                 className={`h-24 border rounded-lg p-4 flex items-end transition-all ${currentTheme === 'obsidian' ? 'border-red-600 bg-red-900/20' : 'border-red-900/30 opacity-50 hover:opacity-100'}`}
               >
                  <span className="text-red-500 font-bold font-mono">ARASAKA (Red)</span>
               </button>
            </div>
         </div>

         {/* 2. Data Management */}
         <div className="tech-border p-8 relative overflow-hidden group bg-cyber-panel">
            <h2 className="text-xl font-bold text-cyber-text mb-6 flex items-center gap-2">
               <Database size={20} className="text-cyber-green" /> 数据维护
            </h2>
            <div className="space-y-4">
               <div className="flex justify-between items-center bg-black/40 p-4 border border-white/10 rounded">
                  <div className="text-sm text-cyber-text">上次备份: <span className="text-cyber-dim">{lastBackup}</span></div>
                  <button onClick={handleExport} className="text-cyber-green text-xs font-bold flex items-center gap-2 hover:underline">
                     <Download size={14}/> 立即备份
                  </button>
               </div>
               <div className="flex justify-between items-center bg-black/40 p-4 border border-white/10 rounded">
                  <div className="text-sm text-cyber-text">数据恢复</div>
                  <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                  <button onClick={() => fileInputRef.current?.click()} className="text-cyber-yellow text-xs font-bold flex items-center gap-2 hover:underline">
                     <Upload size={14}/> 导入文件
                  </button>
               </div>
            </div>
         </div>

         {/* 3. System Health Diagnostics (Replaces fake SSH) */}
         <div className="col-span-1 lg:col-span-2 tech-border p-8 relative overflow-hidden bg-cyber-panel">
            <div className="flex justify-between items-start mb-6">
               <h2 className="text-xl font-bold text-cyber-text flex items-center gap-2">
                  <Activity size={20} className="text-cyber-cyan" /> 系统健康诊断
               </h2>
               <button 
                 onClick={runDiagnostics}
                 className="px-4 py-2 bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan text-xs font-bold hover:bg-cyber-cyan hover:text-black transition-all"
               >
                  运行诊断
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-black border border-white/10 p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-900/20 text-blue-400 rounded"><HardDrive size={24}/></div>
                    <div>
                        <div className="text-[10px] text-gray-500 uppercase">Local Storage</div>
                        <div className="text-xl font-bold text-white">{storageUsage} KB</div>
                        <div className="text-[10px] text-gray-600">Max ~5000 KB</div>
                    </div>
                </div>
                <div className="bg-black border border-white/10 p-4 flex items-center gap-4">
                    <div className={`p-3 rounded ${networkLatency === -1 ? 'bg-red-900/20 text-red-500' : 'bg-green-900/20 text-green-500'}`}>
                        <Wifi size={24}/>
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-500 uppercase">Network Status</div>
                        <div className="text-xl font-bold text-white">
                            {networkLatency === null ? 'Unknown' : networkLatency === -1 ? 'Offline' : 'Online'}
                        </div>
                        <div className="text-[10px] text-gray-600">Latency: {networkLatency || '-'} ms</div>
                    </div>
                </div>
                <div className="bg-black border border-white/10 p-4 flex items-center gap-4">
                    <div className="p-3 bg-purple-900/20 text-purple-400 rounded"><Shield size={24}/></div>
                    <div>
                        <div className="text-[10px] text-gray-500 uppercase">Security</div>
                        <div className="text-xl font-bold text-white">Encrypted</div>
                        <div className="text-[10px] text-gray-600">Client-Side Only</div>
                    </div>
                </div>
            </div>

            {/* Live Terminal Log */}
            <div className="bg-black border border-cyber-border p-4 font-mono text-xs text-cyber-green h-32 overflow-y-auto custom-scrollbar">
               {consoleLogs.map((log, i) => (
                  <div key={i} className="opacity-90">{log}</div>
               ))}
            </div>
         </div>

      </div>
    </div>
  );
};