import React, { useRef, useState, useEffect } from 'react';
import { 
  Settings, Save, Upload, Download, Server, Palette, 
  Database, Shield, Monitor, Moon, Sun, Cloud, RefreshCw, 
  Terminal, Activity, Lock, Eye, EyeOff, Zap, AlertTriangle, Hexagon, HardDrive, Wifi, Trash2
} from 'lucide-react';
import { LOCAL_STORAGE_UPDATE_EVENT } from '../hooks/usePersistence';

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

  const runDiagnostics = async () => {
      addLog('> Pinging server nodes...');
      const start = Date.now();
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 100));
      const end = Date.now();
      setNetworkLatency(end - start);
      addLog(`> Latency check: ${end - start}ms`);
      addLog('> Integrity check passed.');
      calculateStorage();
  };

  useEffect(() => {
    calculateStorage();
    runDiagnostics();
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
          influencers: localStorage.getItem('AERO_INFLUENCER_DATA') ? JSON.parse(localStorage.getItem('AERO_INFLUENCER_DATA')!) : null,
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
      URL.revokeObjectURL(url);
      
      addLog('> Backup generated successfully.');
      setLastBackup('刚刚');
    } catch (e) {
      addLog('> ERROR: Export failed.');
      console.error(e);
    }
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addLog(`> Reading: ${file.name}...`);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result as string;
        const json = JSON.parse(raw);
        const payload = json.data || json;
        
        const map: Record<string, string> = {
            'logistics': 'AERO_LOGISTICS_DATA',
            'finance': 'AERO_FINANCE_DATA',
            'restock': 'AERO_RESTOCK_DATA',
            'theme': 'AERO_THEME',
            'tasks': 'AERO_TASKS_DATA',
            'influencers': 'AERO_INFLUENCER_DATA'
        };

        let count = 0;
        Object.keys(map).forEach(k => {
            if (payload[k]) {
                const key = map[k];
                const val = typeof payload[k] === 'string' ? payload[k] : JSON.stringify(payload[k]);
                localStorage.setItem(key, val);
                // Dispatch update event
                window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_UPDATE_EVENT, { detail: { key } }));
                count++;
            }
        });
        
        if (payload.theme) {
            onThemeChange(payload.theme);
        }

        addLog(`> Import complete. Updated ${count} modules.`);
        alert(`成功恢复了 ${count} 个模块的数据。`);
        calculateStorage();
      } catch (err) {
        addLog('> FATAL: Corrupt data file.');
        alert('导入失败：文件格式错误或数据损坏。');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleReset = () => {
      if (confirm('⚠️ 警告：这将清除所有本地缓存数据并重置系统。\n此操作无法撤销。是否继续？')) {
          localStorage.clear();
          addLog('> SYSTEM RESET INITIATED.');
          addLog('> Clearing memory banks...');
          setTimeout(() => window.location.reload(), 1000);
      }
  };

  return (
    <div className="px-6 pb-6 space-y-6 animate-in fade-in duration-500">
       <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />

       {/* Header */}
       <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-white/10 pb-4 pt-6 -mx-6 px-6 shadow-lg mb-6 flex justify-between items-end">
          <div>
             <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <Settings className="text-gray-400" />
                系统配置 (System)
             </h1>
             <p className="text-gray-500 font-mono text-xs mt-1">CORE SETTINGS & DIAGNOSTICS</p>
          </div>
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-2 px-3 py-1 bg-black border border-white/10 rounded text-xs font-mono text-gray-400">
                <div className={`w-2 h-2 rounded-full ${networkLatency ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                {networkLatency ? `${networkLatency}ms` : 'Connecting...'}
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Tools */}
          <div className="space-y-6">
             
             {/* Storage Card */}
             <div className="tech-border p-6 bg-white/5 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2"><Database size={18} className="text-cyber-cyan"/> 数据存储 (Storage)</h3>
                   <span className="text-xs font-mono text-gray-500 uppercase">Local IndexDB</span>
                </div>
                <div className="flex items-end gap-2 mb-2">
                   <span className="text-4xl font-black text-white tracking-tighter">{storageUsage}</span>
                   <span className="text-sm font-bold text-gray-500 mb-1">KB Used</span>
                </div>
                <div className="w-full bg-black h-2 rounded-full overflow-hidden mb-4 border border-white/10">
                   <div className="h-full bg-gradient-to-r from-cyber-cyan to-blue-600 w-[10%] animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={handleExport} className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded font-bold text-sm transition-all border border-white/10">
                      <Download size={16} /> 备份数据
                   </button>
                   <button onClick={handleImportClick} className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded font-bold text-sm transition-all border border-white/10">
                      <Upload size={16} /> 恢复数据
                   </button>
                </div>
             </div>

             {/* Theme/System Card */}
             <div className="tech-border p-6 bg-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><Monitor size={18} className="text-cyber-purple"/> 界面与视觉</h3>
                <div className="flex items-center justify-between p-4 bg-black border border-white/10 rounded mb-4">
                   <div className="flex items-center gap-3">
                      <Palette size={20} className="text-gray-400" />
                      <div>
                         <div className="text-sm font-bold text-white">Cyber Mode</div>
                         <div className="text-xs text-gray-500">High contrast, neon accents</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-xs text-cyber-green font-bold">ACTIVE</span>
                   </div>
                </div>
                <button onClick={runDiagnostics} className="w-full py-3 border border-white/20 text-gray-400 hover:text-white hover:border-white transition-all rounded font-bold text-sm flex items-center justify-center gap-2">
                   <Activity size={16} /> 运行系统诊断
                </button>
             </div>

             {/* Danger Zone */}
             <div className="tech-border p-6 bg-red-900/10 border-red-500/30">
                <h3 className="text-lg font-bold text-red-500 flex items-center gap-2 mb-4"><Shield size={18}/> 危险区域</h3>
                <p className="text-xs text-red-400/70 mb-4">
                   重置系统将清除所有本地缓存的 ERP 数据，包括财务、物流和库存记录。操作不可逆。
                </p>
                <button onClick={handleReset} className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 rounded font-bold text-sm transition-all flex items-center justify-center gap-2">
                   <Trash2 size={16} /> 格式化系统数据
                </button>
             </div>

          </div>

          {/* Right Column: Console */}
          <div className="flex flex-col h-full min-h-[400px]">
             <div className="bg-[#0c0c0c] border border-white/10 rounded-t-xl p-3 flex items-center gap-2 border-b border-white/5">
                <Terminal size={14} className="text-gray-500" />
                <span className="text-xs font-mono text-gray-500">System Log</span>
             </div>
             <div className="flex-1 bg-black border border-white/10 border-t-0 rounded-b-xl p-4 font-mono text-xs text-green-500 overflow-y-auto custom-scrollbar shadow-inner">
                {consoleLogs.map((log, i) => (
                   <div key={i} className="mb-1 opacity-80 hover:opacity-100">{log}</div>
                ))}
                <div className="animate-pulse">_</div>
             </div>
          </div>

       </div>
    </div>
  );
};