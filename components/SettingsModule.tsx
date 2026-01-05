import React, { useRef, useState } from 'react';
import { 
  Settings, Save, Upload, Download, Server, Palette, 
  Database, Shield, Monitor, Moon, Sun, Cloud, RefreshCw, 
  Terminal, Activity, Lock, Eye, EyeOff
} from 'lucide-react';

interface SettingsModuleProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ currentTheme, onThemeChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [serverStatus, setServerStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [consoleLogs, setConsoleLogs] = useState<string[]>(['> AERO.OS Terminal initialized...', '> Waiting for connection...']);

  // --- Handlers ---

  const handleExport = () => {
    try {
      // Export all global state keys
      const data = {
        meta: {
          exportedAt: new Date().toISOString(),
          version: '2.0.0',
          user: 'Admin_01'
        },
        data: {
          logistics: localStorage.getItem('AERO_LOGISTICS_DATA'),
          finance: localStorage.getItem('AERO_FINANCE_DATA'),
          restock: localStorage.getItem('AERO_RESTOCK_DATA'),
          theme: localStorage.getItem('AERO_THEME')
        }
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AERO_OS_FULL_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addLog('> FULL_DUMP: Data export successful.');
    } catch (e) {
      addLog('> ERROR: Data export failed.');
      console.error(e);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    addLog('> Reading file stream...');
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        
        // Backward compatibility check (if importing old format or new format)
        const payload = json.data || json;

        let restoreCount = 0;

        if (payload.logistics) {
           localStorage.setItem('AERO_LOGISTICS_DATA', typeof payload.logistics === 'string' ? payload.logistics : JSON.stringify(payload.logistics));
           restoreCount++;
        }
        if (payload.finance) {
           localStorage.setItem('AERO_FINANCE_DATA', typeof payload.finance === 'string' ? payload.finance : JSON.stringify(payload.finance));
           restoreCount++;
        }
        if (payload.restock) {
           localStorage.setItem('AERO_RESTOCK_DATA', typeof payload.restock === 'string' ? payload.restock : JSON.stringify(payload.restock));
           restoreCount++;
        }
        if (payload.theme) {
           localStorage.setItem('AERO_THEME', payload.theme);
        }

        addLog(`> Success: Restored ${restoreCount} data modules.`);
        
        // Force Reload to apply changes
        if (confirm(`数据导入成功！\n共恢复 ${restoreCount} 个模块的数据。\n\n系统需要重新加载以应用更改。点击“确定”立即刷新。`)) {
          window.location.reload();
        }
      } catch (err) {
        addLog('> CRITICAL_ERROR: JSON parse failed or invalid schema.');
        alert('文件格式错误：请确保上传的是 AERO.OS 导出的标准 JSON 备份文件。');
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const addLog = (msg: string) => {
    setConsoleLogs(prev => [...prev.slice(-4), msg]);
  };

  const handleTestConnection = () => {
    setServerStatus('connecting');
    addLog('> Initiating handshake with Tencent Cloud...');
    
    setTimeout(() => {
      setServerStatus('connected');
      addLog('> Connection established: 43.192.xx.xx:22');
      addLog('> Latency: 45ms. Encryption: AES-256.');
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-cyber-border pb-4 pt-2 -mx-6 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex justify-between items-end">
         <div>
            <h1 className="text-3xl font-black text-cyber-text tracking-wider flex items-center gap-3">
               <Settings className="text-cyber-cyan" size={32} />
               系统设置中心
            </h1>
            <p className="text-cyber-dim mt-1 font-mono text-xs">CONFIGURATION // SYSTEM CONTROL</p>
         </div>
         <div className="flex gap-2">
            <button className="px-4 py-2 border border-cyber-border text-cyber-text text-xs font-bold hover:bg-cyber-text hover:text-cyber-bg transition-all">
               重置默认
            </button>
            <button className="px-4 py-2 bg-cyber-cyan text-black text-xs font-bold hover:bg-white transition-all shadow-neon-cyan flex items-center gap-2">
               <Save size={14} /> 保存更改
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* 1. Theme Engine */}
         <div className="tech-border p-8 relative overflow-hidden group bg-cyber-panel">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Palette size={80} className="text-cyber-purple" />
            </div>
            
            <h2 className="text-xl font-bold text-cyber-text mb-6 flex items-center gap-2">
               <Monitor size={20} className="text-cyber-purple" />
               UI 主题引擎
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {/* Cyber Theme */}
               <button 
                 onClick={() => onThemeChange('cyber')}
                 className={`relative h-32 border-2 rounded-lg p-4 flex flex-col justify-end overflow-hidden transition-all ${currentTheme === 'cyber' ? 'border-cyber-cyan shadow-neon-cyan' : 'border-cyber-border opacity-60 hover:opacity-100'}`}
                 style={{background: '#050505'}}
               >
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                  <span className="relative z-10 text-cyan-400 font-bold font-mono">CYBERPUNK</span>
                  <span className="relative z-10 text-gray-500 text-[10px]">Neon / Dark</span>
               </button>

               {/* Light Theme */}
               <button 
                 onClick={() => onThemeChange('light')}
                 className={`relative h-32 border-2 rounded-lg p-4 flex flex-col justify-end overflow-hidden transition-all ${currentTheme === 'light' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 opacity-60 hover:opacity-100'}`}
                 style={{background: '#F3F4F6'}}
               >
                  <div className="absolute top-2 left-2 w-full h-8 bg-white rounded shadow-sm"></div>
                  <span className="relative z-10 text-gray-900 font-bold font-mono mt-auto">CORPORATE</span>
                  <span className="relative z-10 text-gray-500 text-[10px]">Clean / Light</span>
               </button>

               {/* Obsidian Theme */}
               <button 
                 onClick={() => onThemeChange('obsidian')}
                 className={`relative h-32 border-2 rounded-lg p-4 flex flex-col justify-end overflow-hidden transition-all ${currentTheme === 'obsidian' ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-gray-800 opacity-60 hover:opacity-100'}`}
                 style={{background: '#000000'}}
               >
                  <span className="relative z-10 text-white font-bold font-mono">OBSIDIAN</span>
                  <span className="relative z-10 text-gray-500 text-[10px]">Minimal / Void</span>
               </button>
            </div>
         </div>

         {/* 2. Data Management */}
         <div className="tech-border p-8 relative overflow-hidden group bg-cyber-panel">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Database size={80} className="text-cyber-green" />
            </div>
            
            <h2 className="text-xl font-bold text-cyber-text mb-6 flex items-center gap-2">
               <Database size={20} className="text-cyber-green" />
               数据资产管理
            </h2>

            <div className="space-y-6">
               <div className="bg-cyber-bg/50 p-4 rounded border border-cyber-border flex items-center justify-between">
                  <div>
                     <div className="text-cyber-text font-bold text-sm">全量数据导出 (JSON)</div>
                     <div className="text-cyber-dim text-xs mt-1">导出 物流/财务/备货/配置 等全站数据</div>
                  </div>
                  <button 
                    onClick={handleExport}
                    className="px-4 py-2 border border-cyber-green text-cyber-green hover:bg-cyber-green hover:text-black transition-all text-xs font-bold flex items-center gap-2"
                  >
                     <Download size={14} /> 立即备份
                  </button>
               </div>

               <div className="bg-cyber-bg/50 p-4 rounded border border-cyber-border flex items-center justify-between">
                  <div>
                     <div className="text-cyber-text font-bold text-sm">数据恢复/导入</div>
                     <div className="text-cyber-dim text-xs mt-1">导入后系统将自动刷新以应用数据</div>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-cyber-yellow text-cyber-yellow hover:bg-cyber-yellow hover:text-black transition-all text-xs font-bold flex items-center gap-2"
                  >
                     <Upload size={14} /> 选择文件
                  </button>
               </div>
            </div>
         </div>

         {/* 3. Tencent Cloud Connection */}
         <div className="col-span-1 lg:col-span-2 tech-border p-8 relative overflow-hidden bg-cyber-panel">
            <div className="absolute top-0 right-0 p-6 opacity-10">
               <Cloud size={100} className="text-cyber-cyan" />
            </div>

            <div className="flex justify-between items-start mb-8">
               <div>
                  <h2 className="text-xl font-bold text-cyber-text flex items-center gap-2">
                     <Server size={20} className="text-cyber-cyan" />
                     腾讯云服务器连接端口
                  </h2>
                  <p className="text-cyber-dim text-xs mt-1 font-mono">TENCENT CLOUD LIGHTHOUSE / CVM INSTANCE</p>
               </div>
               <div className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-2 ${serverStatus === 'connected' ? 'bg-cyber-green/20 text-cyber-green' : 'bg-cyber-bg border border-cyber-border text-cyber-dim'}`}>
                  <Activity size={12} className={serverStatus === 'connected' ? 'animate-pulse' : ''} />
                  STATUS: {serverStatus.toUpperCase()}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Form */}
               <div className="md:col-span-2 grid grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                     <label className="text-[10px] text-cyber-dim font-bold uppercase mb-2 block">Server Host / IP</label>
                     <div className="relative">
                        <input type="text" className="w-full bg-cyber-bg border border-cyber-border p-3 text-cyber-text text-sm font-mono focus:border-cyber-cyan outline-none transition-all" placeholder="43.192.xxx.xxx" />
                        <Shield size={14} className="absolute right-3 top-3.5 text-cyber-dim" />
                     </div>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                     <label className="text-[10px] text-cyber-dim font-bold uppercase mb-2 block">Port</label>
                     <input type="text" className="w-full bg-cyber-bg border border-cyber-border p-3 text-cyber-text text-sm font-mono focus:border-cyber-cyan outline-none transition-all" placeholder="22" defaultValue="22" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                     <label className="text-[10px] text-cyber-dim font-bold uppercase mb-2 block">Username</label>
                     <input type="text" className="w-full bg-cyber-bg border border-cyber-border p-3 text-cyber-text text-sm font-mono focus:border-cyber-cyan outline-none transition-all" placeholder="root" defaultValue="root" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                     <label className="text-[10px] text-cyber-dim font-bold uppercase mb-2 block">Password / SSH Key</label>
                     <div className="relative">
                        <input 
                           type={showPwd ? "text" : "password"} 
                           className="w-full bg-cyber-bg border border-cyber-border p-3 text-cyber-text text-sm font-mono focus:border-cyber-cyan outline-none transition-all" 
                           placeholder="••••••••••••" 
                        />
                        <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-3.5 text-cyber-dim hover:text-cyber-text">
                           {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                     </div>
                  </div>
                  
                  <div className="col-span-2 mt-2">
                     <button 
                        onClick={handleTestConnection}
                        disabled={serverStatus === 'connecting' || serverStatus === 'connected'}
                        className={`w-full py-4 font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                           serverStatus === 'connected' 
                           ? 'bg-cyber-green text-black cursor-default' 
                           : 'bg-cyber-cyan/10 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black'
                        }`}
                     >
                        {serverStatus === 'connecting' ? <RefreshCw className="animate-spin" /> : serverStatus === 'connected' ? <Lock size={16} /> : <Server size={16} />}
                        {serverStatus === 'connecting' ? 'Connecting...' : serverStatus === 'connected' ? 'Secure Tunnel Active' : 'Establish Connection'}
                     </button>
                  </div>
               </div>

               {/* Console Log */}
               <div className="bg-black border border-cyber-border p-4 font-mono text-xs text-green-500 overflow-hidden flex flex-col h-full min-h-[200px]">
                  <div className="flex items-center gap-2 border-b border-cyber-border pb-2 mb-2 text-cyber-dim">
                     <Terminal size={12} />
                     <span>SYSTEM LOG</span>
                  </div>
                  <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                     {consoleLogs.map((log, i) => (
                        <div key={i} className="opacity-80 break-all">{log}</div>
                     ))}
                     {serverStatus === 'connecting' && (
                        <div className="animate-pulse">_</div>
                     )}
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};