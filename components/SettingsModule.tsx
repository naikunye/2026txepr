import React, { useRef, useState } from 'react';
import { 
  Settings, Save, Upload, Download, Server, Palette, 
  Database, Shield, Monitor, Moon, Sun, Cloud, RefreshCw, 
  Terminal, Activity, Lock, Eye, EyeOff, Zap, AlertTriangle, Hexagon
} from 'lucide-react';

interface SettingsModuleProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ currentTheme, onThemeChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [serverStatus, setServerStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [consoleLogs, setConsoleLogs] = useState<string[]>(['> AERO.OS Terminal initialized...', '> System ready.']);

  const addLog = (msg: string) => {
    setConsoleLogs(prev => [...prev.slice(-8), msg]);
  };

  // --- Helper: Safely Parse JSON from Storage ---
  const getStorageData = (key: string) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      // Try to parse it to see if it's valid JSON
      return JSON.parse(raw);
    } catch (e) {
      // If parsing fails, it might be a simple string (like theme='cyber')
      return raw;
    }
  };

  // --- Handlers ---

  const handleExport = () => {
    try {
      addLog('> Starting FULL SYSTEM DUMP...');
      
      // Clean Export: We parse the strings back to objects so the JSON file is clean
      const data = {
        meta: {
          exportedAt: new Date().toISOString(),
          version: '3.0.0', // Bumped version
          user: 'Admin_01'
        },
        data: {
          logistics: getStorageData('AERO_LOGISTICS_DATA'),
          finance: getStorageData('AERO_FINANCE_DATA'),
          restock: getStorageData('AERO_RESTOCK_DATA'),
          theme: localStorage.getItem('AERO_THEME') || 'cyber',
          // Add future modules here
          tasks: getStorageData('AERO_TASKS_DATA'), 
        }
      };

      // Check if critical data is empty
      if (!data.data.logistics && !data.data.finance && !data.data.restock) {
         addLog('> WARNING: Primary datasets are empty.');
         alert('⚠️ 警告：检测到关键业务数据（物流/财务/备货）为空。\n导出文件将不包含业务记录。');
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AERO_OS_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addLog('> EXPORT SUCCESSFUL.');
    } catch (e) {
      addLog('> ERROR: Export failed.');
      console.error(e);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    addLog(`> Analyzing file: ${file.name}...`);
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const rawContent = ev.target?.result as string;
        const json = JSON.parse(rawContent);

        // 1. Safety Check: Is it an Array? (Single Module Export)
        if (Array.isArray(json)) {
            addLog('> ERR: Detected Array format.');
            alert('导入失败：\n该文件是单模块列表（Array），请前往“智能备货”等特定模块进行导入。此处仅接受系统级全量备份。');
            return;
        }

        // 2. Resolve Payload (Handle wrapped structure vs flat)
        const payload = json.data || json;
        const keysInFile = Object.keys(payload);
        addLog(`> File Structure Keys: [${keysInFile.join(', ')}]`);

        let restoreCount = 0;
        const logs: string[] = [];

        // 3. Robust Restore Map
        const restoreMap: Record<string, string> = {
            'logistics': 'AERO_LOGISTICS_DATA',
            'finance': 'AERO_FINANCE_DATA',
            'restock': 'AERO_RESTOCK_DATA',
            'theme': 'AERO_THEME',
            'tasks': 'AERO_TASKS_DATA'
        };

        // 4. Execution Loop
        Object.keys(restoreMap).forEach(key => {
            if (payload.hasOwnProperty(key)) {
                const rawVal = payload[key];
                const storageKey = restoreMap[key];

                // Check for explicit null/undefined in file
                if (rawVal === null || rawVal === undefined) {
                    addLog(`> SKIP: ${key} is null.`);
                    return;
                }

                // Determine how to store it
                let valueToStore: string;

                if (typeof rawVal === 'object') {
                    // New Format: It's a real JS Object/Array, needs stringify for localStorage
                    valueToStore = JSON.stringify(rawVal);
                    addLog(`> PARSE: ${key} -> Object detected.`);
                } else {
                    // Old Format: It's likely already a string
                    valueToStore = String(rawVal);
                    addLog(`> PARSE: ${key} -> String detected.`);
                }

                // Final sanity check before writing
                if (valueToStore === 'null' || valueToStore === 'undefined') {
                    addLog(`> SKIP: ${key} converted to null.`);
                    return;
                }

                // EXECUTE WRITE
                localStorage.setItem(storageKey, valueToStore);
                restoreCount++;
                logs.push(key);
            }
        });

        // 5. Final Report
        if (restoreCount > 0) {
            addLog(`> SUCCESS: Restored ${restoreCount} modules.`);
            if (confirm(`✅ 导入成功！\n\n已覆盖/更新以下模块：\n${logs.join(', ')}\n\n点击“确定”刷新页面以加载数据。`)) {
              window.location.reload();
            }
        } else {
            addLog('> FAILED: 0 items imported.');
            alert(`导入完成，但没有数据被写入。\n\n诊断报告：\n1. 文件中包含的 Key: ${keysInFile.join(', ')}\n2. 匹配到的 Key: 0\n3. 可能原因：备份文件中的数据字段为 null，或者文件结构不符合 AERO.OS 标准。`);
        }

      } catch (err) {
        addLog('> CRITICAL: JSON Parse Error.');
        alert('文件严重损坏或格式错误，无法解析。');
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
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
            <button 
                onClick={() => {
                    if(confirm('确定要清空所有本地缓存数据吗？此操作不可逆。')) {
                        localStorage.clear();
                        window.location.reload();
                    }
                }}
                className="px-4 py-2 border border-red-900 text-red-500 text-xs font-bold hover:bg-red-900 hover:text-white transition-all"
            >
               FACTORY RESET (清空)
            </button>
            <button className="px-4 py-2 bg-cyber-cyan text-black text-xs font-bold hover:bg-white transition-all shadow-neon-cyan flex items-center gap-2">
               <Save size={14} /> 保存配置
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
               视觉神经接口 (Theme)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Cyber Theme */}
               <button 
                 onClick={() => onThemeChange('cyber')}
                 className={`relative h-32 border-2 rounded-lg p-4 flex flex-col justify-end overflow-hidden transition-all group ${currentTheme === 'cyber' ? 'border-cyber-cyan shadow-neon-cyan ring-1 ring-cyber-cyan' : 'border-cyber-border opacity-60 hover:opacity-100'}`}
                 style={{background: '#050505'}}
               >
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                  <Zap size={24} className="absolute top-3 right-3 text-cyan-400 opacity-50 group-hover:opacity-100" />
                  <span className="relative z-10 text-cyan-400 font-bold font-mono tracking-wider">NIGHT CITY</span>
                  <span className="relative z-10 text-gray-500 text-[10px] font-mono">Original / Neon</span>
               </button>

               {/* Obsidian Theme (Arasaka) */}
               <button 
                 onClick={() => onThemeChange('obsidian')}
                 className={`relative h-32 border-2 rounded-lg p-4 flex flex-col justify-end overflow-hidden transition-all group ${currentTheme === 'obsidian' ? 'border-red-600 shadow-[0_0_20px_rgba(255,0,0,0.6)] ring-1 ring-red-600' : 'border-red-900/50 opacity-60 hover:opacity-100'}`}
                 style={{background: '#000000'}}
               >
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                  <AlertTriangle size={24} className="absolute top-3 right-3 text-red-600 opacity-50 group-hover:opacity-100 animate-pulse" />
                  <span className="relative z-10 text-red-600 font-bold font-mono tracking-wider">ARASAKA</span>
                  <span className="relative z-10 text-gray-500 text-[10px] font-mono">Tactical / Red</span>
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
               <div className="bg-cyber-bg p-4 rounded border border-cyber-border flex items-center justify-between">
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

               <div className="bg-cyber-bg p-4 rounded border border-cyber-border flex items-center justify-between">
                  <div>
                     <div className="text-cyber-text font-bold text-sm">数据恢复/导入</div>
                     <div className="text-cyber-dim text-xs mt-1">支持 V2.0/V3.0 格式，导入后自动刷新</div>
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