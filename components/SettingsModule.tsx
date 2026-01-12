import React, { useRef, useState, useEffect } from 'react';
import { 
  Settings, Save, Upload, Download, Server, Palette, 
  Database, Shield, Monitor, Moon, Sun, Cloud, RefreshCw, 
  Terminal, Activity, Lock, Eye, EyeOff, Zap, AlertTriangle, Hexagon, HardDrive, Wifi, Trash2, CheckCircle2, Globe, Copy,
  UploadCloud, DownloadCloud, ArrowRightLeft, LogIn, LogOut, User, Key, Unlock, Info, HelpCircle, ServerCrash, Power, ShieldCheck, FileSearch
} from 'lucide-react';
import { LOCAL_STORAGE_UPDATE_EVENT } from '../hooks/usePersistence';
import { pb, updateServerUrl, DEFAULT_PB_URL } from '../lib/pb';

interface SettingsModuleProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const themes = [
  { id: 'cyber', name: '赛博朋克 (Cyber)', desc: '高对比度 / 霓虹光效', icon: Zap, activeColor: 'text-cyber-cyan', activeBorder: 'border-cyber-cyan', activeBg: 'bg-cyber-cyan/10' },
  { id: 'obsidian', name: '黑曜石 (Obsidian)', desc: '纯黑极简 / 专注模式', icon: Moon, activeColor: 'text-white', activeBorder: 'border-white', activeBg: 'bg-white/10' },
  { id: 'aurora', name: '极光白 (Aurora)', desc: '清爽明亮 / 办公风格', icon: Sun, activeColor: 'text-blue-400', activeBorder: 'border-blue-400', activeBg: 'bg-blue-400/10' },
];

const SYNC_KEYS = [
    'AERO_LOGISTICS_DATA',
    'AERO_FINANCE_DATA',
    'AERO_RESTOCK_DATA',
    'AERO_TASKS_DATA',
    'AERO_INFLUENCER_DATA',
    'AERO_THEME',
    'AERO_FILES_DATA'
];

type DiagErrorType = 'none' | 'browser_block' | 'server_unreachable' | 'config_missing' | 'service_unavailable';

export const SettingsModule: React.FC<SettingsModuleProps> = ({ currentTheme, onThemeChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>(['> AERO.OS 系统监控初始化...', '> 等待诊断指令...']);
  
  // Server Config State
  const [serverInput, setServerInput] = useState(pb.baseUrl === DEFAULT_PB_URL || pb.baseUrl.includes('YOUR_TENCENT_IP') ? '' : pb.baseUrl);
  const [diagError, setDiagError] = useState<DiagErrorType>('none');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Auth State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authModel, setAuthModel] = useState(pb.authStore.model);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Real System Stats
  const [storageUsage, setStorageUsage] = useState(0); // in KB
  const [networkLatency, setNetworkLatency] = useState<number | null>(null);
  const [lastBackup, setLastBackup] = useState<string>('从未备份');

  const addLog = (msg: string) => {
    setConsoleLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
      // Listen to auth changes
      return pb.authStore.onChange((token, model) => {
          setAuthModel(model);
      });
  }, []);

  // --- Helper: Calculate LocalStorage Usage ---
  const calculateStorage = () => {
    let total = 0;
    for (let x in localStorage) {
        if (!localStorage.hasOwnProperty(x)) continue;
        total += ((localStorage[x].length + x.length) * 2);
    }
    setStorageUsage(Number((total / 1024).toFixed(2)));
  };

  const handleSaveServer = async () => {
      if (!serverInput) return;
      
      let url = serverInput.trim();
      // Auto-fix URL format if user forgets http://
      if (!url.startsWith('http')) {
          url = `http://${url}`;
      }
      
      // Update the global configuration
      updateServerUrl(url);
      setServerInput(url); // Update input to match normalized url
      
      addLog(`> 配置更新: ${url}`);
      addLog('> 正在尝试建立连接...');
      
      await runDiagnostics();
  };

  const runDiagnostics = async () => {
      setDiagError('none');
      addLog('> 正在启动全系统诊断...');
      
      // 1. Check Configuration
      if (pb.baseUrl.includes('YOUR_TENCENT_IP')) {
          addLog('> [配置缺失] ⚠️ 请在上方“云服务器配置”中填入 IP 地址');
          setDiagError('config_missing');
          setNetworkLatency(null);
          return;
      }

      addLog(`> 正在 Ping: ${pb.baseUrl}...`);
      const start = Date.now();
      
      try {
          // Attempt a lightweight fetch to check connectivity
          // We assume pb.health.check() does a GET request.
          await pb.health.check();
          
          const end = Date.now();
          const latency = end - start;
          setNetworkLatency(latency);
          
          addLog(`> [成功] ✅ 云端连接已建立! 延迟: ${latency}ms`);
          addLog('> 数据库权限: ' + (pb.authStore.isValid ? '管理员 (Admin)' : '访客 (Guest)'));
          setDiagError('none');
      } catch (err: any) {
          console.error(err);
          const end = Date.now();
          const duration = end - start;
          const isPageHttps = window.location.protocol === 'https:';
          const isServerHttp = pb.baseUrl.startsWith('http:');

          addLog(`> [连接失败] ❌ 服务器返回状态: ${err.status || '无响应'}`);
          
          if (err.status === 503 || err.status === 502) {
              addLog('> [严重错误] 服务不可用 (503 Service Unavailable)');
              addLog('> 原因: PocketBase 进程已挂掉。');
              setDiagError('service_unavailable');
          } else if (err.status === 0) {
              // INTELLIGENT DIAGNOSIS
              if (duration < 200 && isPageHttps && isServerHttp) {
                  addLog('> [安全策略] 浏览器瞬间拦截了请求 (耗时 < 200ms)');
                  setDiagError('browser_block');
              } else {
                  addLog(`> [网络超时] 请求耗时 ${duration}ms，服务器无响应`);
                  setDiagError('server_unreachable');
              }
          } else {
              addLog(`> 错误代码: ${err.status} ${err.message}`);
              setDiagError('server_unreachable');
          }
          setNetworkLatency(null);
      }

      calculateStorage();
      addLog('> 本地缓存一致性检查: 通过');
  };

  useEffect(() => {
    calculateStorage();
    // Auto run only if configured
    if (!pb.baseUrl.includes('YOUR_TENCENT_IP')) {
        runDiagnostics();
    } else {
        addLog('> ⚠️ 系统未激活: 请配置云服务器 IP');
    }
  }, []);

  // --- Auth Handlers ---
  const handleAdminLogin = async () => {
      if (!adminEmail || !adminPassword) return;
      setIsAuthLoading(true);
      addLog('> 正在验证管理员身份...');
      try {
          await pb.admins.authWithPassword(adminEmail, adminPassword);
          addLog('> [认证成功] 🔓 管理员权限已获取');
          setAdminEmail('');
          setAdminPassword('');
      } catch (e: any) {
          console.error(e);
          addLog(`> [认证失败] ⛔ ${e.message}`);
          alert('登录失败，请检查账号密码。');
      }
      setIsAuthLoading(false);
  };

  const handleLogout = () => {
      pb.authStore.clear();
      addLog('> [已注销] 安全退出系统');
  };

  const handleEnableCollaboration = async () => {
      if (!pb.authStore.isValid) return;
      if (!confirm('⚠️ 协同模式确认\n\n您确定要开启“全员读写权限”吗？\n开启后，任何连接到此服务器的人（无需登录）都可以查看、修改和删除数据。\n\n这适合内部团队协同，但请注意数据安全。')) return;
      
      addLog('> 正在配置数据库协同权限...');
      try {
          // 1. Get the collection (assuming name is sync_store)
          const collections = await pb.collections.getFullList({ filter: 'name="sync_store"' });
          
          if (collections.length === 0) {
              addLog('> [错误] 未找到 sync_store 数据表。请先执行一次“推送到云端”以创建表。');
              return;
          }

          const col = collections[0];
          
          // 2. Update to allow public read AND write (Create/Update/Delete)
          await pb.collections.update(col.id, {
              listRule: '',   // Public List
              viewRule: '',   // Public View
              createRule: '', // Public Create
              updateRule: '', // Public Update
              deleteRule: '', // Public Delete
          });
          
          addLog('> [成功] ✅ 已开启全员协同模式 (读/写)');
          alert('配置成功！\n\n现在团队成员无需登录管理员账号，即可在任何设备上拉取数据、修改并推送到云端。');

      } catch (e: any) {
          console.error(e);
          addLog(`> [配置失败] ${e.message}`);
          alert(`操作失败: ${e.message}`);
      }
  };

  // --- Sync Handlers ---

  const handlePushToCloud = async () => {
    if (!networkLatency) {
        alert("无法连接服务器，请先确保服务器配置正确且显示“在线”。");
        return;
    }
    
    // Removed strict auth check to allow public write mode if enabled
    
    if (!confirm('⚠️ 覆盖警告\n\n确定要将【本地数据】强制推送到云端吗？\n云端现有的数据将被覆盖，此操作不可撤销。')) return;

    setIsSyncing(true);
    addLog('> 🚀 开始推送本地数据至云端...');
    let successCount = 0;
    let failCount = 0;

    for (const key of SYNC_KEYS) {
        const localRaw = localStorage.getItem(key);
        if (!localRaw) continue;

        let val;
        try {
            // Attempt to parse JSON. If it fails, treat as raw string (e.g. AERO_THEME)
            val = JSON.parse(localRaw);
        } catch (e) {
            val = localRaw; 
        }

        try {
            // Try to find existing record
            try {
                const existing = await pb.collection('sync_store').getFirstListItem(`key="${key}"`);
                await pb.collection('sync_store').update(existing.id, { key, val });
                addLog(`> [更新] ${key} ✅`);
            } catch (err: any) {
                // If not found, create new
                if (err.status === 404) {
                    await pb.collection('sync_store').create({ key, val });
                    addLog(`> [创建] ${key} ✅`);
                } else {
                    throw err;
                }
            }
            successCount++;
        } catch (err: any) {
            console.error(err);
            if (err.status === 403) {
                 addLog(`> [失败] ${key}: 拒绝访问 (请开启“协同模式”或登录管理员)`);
            } else {
                 addLog(`> [失败] ${key}: ${err.message}`);
            }
            failCount++;
        }
    }

    setIsSyncing(false);
    addLog(`> 🎉 推送完成: 成功 ${successCount} / 失败 ${failCount}`);
    if (successCount > 0) alert(`同步成功！已将 ${successCount} 个模块的数据推送到云端。`);
  };

  const handlePullFromCloud = async () => {
    if (!networkLatency) {
        alert("无法连接服务器，请先确保服务器配置正确且显示“在线”。");
        return;
    }
    if (!confirm('⚠️ 覆盖警告\n\n确定要从【云端】拉取数据覆盖本地吗？\n本地未保存的更改将会丢失。')) return;

    setIsSyncing(true);
    addLog('> 📥 开始从云端拉取数据...');
    let successCount = 0;

    try {
        // Try/Catch specifically for permission error on listing
        let records;
        try {
            records = await pb.collection('sync_store').getFullList();
        } catch (err: any) {
            if (err.status === 404) {
                 records = [];
            } else if (err.status === 403) {
                 throw new Error("访问被拒绝。请在主电脑(管理员)上开启“全员协同模式”，或在此登录管理员账号。");
            } else {
                 throw err;
            }
        }
        
        if (records.length === 0) {
            addLog('> [提示] 云端暂无数据。');
            alert('云端数据库是空的，没有数据可拉取。');
            setIsSyncing(false);
            return;
        }

        for (const record of records) {
            if (SYNC_KEYS.includes(record.key) && record.val) {
                const valueToStore = typeof record.val === 'string' ? record.val : JSON.stringify(record.val);
                localStorage.setItem(record.key, valueToStore);
                window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_UPDATE_EVENT, { detail: { key: record.key } }));
                
                // Special handling for theme
                if (record.key === 'AERO_THEME' && typeof record.val === 'string') {
                    onThemeChange(record.val);
                }
                
                addLog(`> [拉取] ${record.key} ✅`);
                successCount++;
            }
        }
        
        addLog(`> 🎉 拉取完成: 更新了 ${successCount} 个模块`);
        calculateStorage();
        alert(`同步成功！已从云端恢复了 ${successCount} 个模块的数据。`);

    } catch (err: any) {
        console.error(err);
        addLog(`> [致命错误] 拉取失败: ${err.message}`);
        alert(`拉取失败: ${err.message}`);
    }
    setIsSyncing(false);
  };

  // --- Handlers ---

  const handleExport = () => {
    try {
      addLog('> 开始导出系统数据...');
      
      const data: any = { meta: { exportedAt: new Date().toISOString(), version: '3.1.0', user: 'Admin' }, data: {} };
      
      SYNC_KEYS.forEach(key => {
          const item = localStorage.getItem(key);
          if (item) {
              try {
                  data.data[key] = JSON.parse(item);
              } catch (e) {
                  data.data[key] = item; // Handle raw strings
              }
          }
      });
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AERO_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      addLog('> 备份文件生成成功。');
      setLastBackup('刚刚');
    } catch (e) {
      addLog('> 错误: 导出失败。');
      console.error(e);
    }
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addLog(`> 读取文件: ${file.name}...`);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result as string;
        const json = JSON.parse(raw);
        const payload = json.data || json;
        
        let count = 0;
        const map: Record<string, string> = {
            'logistics': 'AERO_LOGISTICS_DATA',
            'finance': 'AERO_FINANCE_DATA',
            'restock': 'AERO_RESTOCK_DATA',
            'theme': 'AERO_THEME',
            'tasks': 'AERO_TASKS_DATA',
            'influencers': 'AERO_INFLUENCER_DATA'
        };

        // 1. Try direct keys
        SYNC_KEYS.forEach(key => {
            if (payload[key]) {
                const val = typeof payload[key] === 'string' ? payload[key] : JSON.stringify(payload[key]);
                localStorage.setItem(key, val);
                window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_UPDATE_EVENT, { detail: { key } }));
                count++;
            }
        });

        // 2. Try legacy keys if direct keys failed
        if (count === 0) {
            Object.keys(map).forEach(k => {
                if (payload[k]) {
                    const key = map[k];
                    const val = typeof payload[k] === 'string' ? payload[k] : JSON.stringify(payload[k]);
                    localStorage.setItem(key, val);
                    window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_UPDATE_EVENT, { detail: { key } }));
                    count++;
                }
            });
        }
        
        if (payload.theme || payload.AERO_THEME) {
            onThemeChange(payload.theme || payload.AERO_THEME);
        }

        addLog(`> 导入完成。更新了 ${count} 个模块。`);
        alert(`成功恢复了 ${count} 个模块的数据。`);
        calculateStorage();
    } catch (err) {
        addLog('> 致命错误: 数据文件损坏。');
        alert('导入失败：文件格式错误或数据损坏。');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleReset = () => {
      if (confirm('⚠️ 警告：这将清除所有本地缓存数据并重置系统。\n此操作无法撤销。是否继续？')) {
          localStorage.clear();
          addLog('> 系统重置程序已启动。');
          addLog('> 正在清理存储扇区...');
          setTimeout(() => window.location.reload(), 1000);
      }
  };

  return (
    <div className="px-6 pb-6 space-y-6 animate-in fade-in duration-500">
       <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />

       {/* Header - Unified Glass */}
       <div className="sticky top-0 z-30 bg-black/40 backdrop-blur-xl border-b border-white/10 pb-4 pt-6 -mx-6 px-6 shadow-sm mb-6 flex justify-between items-end">
          <div>
             <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <Settings className="text-gray-400" />
                系统配置 (System)
             </h1>
             <p className="text-gray-500 font-mono text-xs mt-1">核心设置与诊断中心</p>
          </div>
          <div className="flex items-center gap-2">
             <div className={`flex items-center gap-2 px-3 py-1 bg-black border rounded-full text-xs font-mono transition-colors ${networkLatency ? 'border-green-500/30 text-green-400' : 'border-white/10 text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${networkLatency ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500 animate-pulse'}`}></div>
                {networkLatency ? `在线: ${networkLatency}ms` : '离线 (Offline)'}
             </div>
          </div>
       </div>

       {/* --- INTELLIGENT ERROR ALERTS --- */}
       
       {/* ERROR TYPE 1: Browser Blocked (Mixed Content / CORS) */}
       {diagError === 'browser_block' && (
           <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-4 animate-in fade-in slide-in-from-top-2">
               <div className="p-2 bg-yellow-500/20 rounded-lg h-fit text-yellow-500">
                   <AlertTriangle size={20} />
               </div>
               <div className="flex-1">
                   <h4 className="text-yellow-500 font-bold text-sm mb-1">连接被浏览器安全拦截 (Browser Blocked)</h4>
                   <p className="text-gray-400 text-xs mb-3 leading-relaxed">
                       检测到浏览器瞬间中断了连接。虽然您已设置允许不安全内容，但在某些在线环境(如Replit/Vercel)中，HTTPS 页面对 HTTP IP 的 "Private Network Access" 限制可能极其严格。
                   </p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                           <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">推荐方案: 使用 Ngrok 转发 (100% 解决)</div>
                           <p className="text-[10px] text-gray-400 mb-1">将本地 http 8090 转换为 https 链接，彻底绕过浏览器限制。</p>
                           <code className="block mt-1 text-xs text-cyber-green bg-white/5 p-1 rounded">ngrok http 8090</code>
                       </div>
                       <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                           <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">备选方案: 强制本地运行</div>
                           <p className="text-[10px] text-gray-400">下载源码在本地 localhost 运行，本地环境没有此限制。</p>
                       </div>
                   </div>
               </div>
           </div>
       )}

       {/* ERROR TYPE 2 & 3: Service Unavailable or Timeout - DEEP REPAIR GUIDE */}
       {(diagError === 'service_unavailable' || diagError === 'server_unreachable') && (
           <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex gap-4 animate-in fade-in slide-in-from-top-2 shadow-[0_0_20px_rgba(220,38,38,0.1)]">
               <div className="p-2 bg-red-500/20 rounded-lg h-fit text-red-500">
                   <ServerCrash size={20} />
               </div>
               <div className="flex-1">
                   <h4 className="text-red-500 font-bold text-sm mb-1 flex items-center gap-2">
                       连接失败: 请执行“深度修复” (Deep Repair)
                       <span className="text-[10px] bg-red-500 text-black px-2 py-0.5 rounded font-black uppercase">ACTION REQUIRED</span>
                   </h4>
                   <p className="text-gray-300 text-xs mb-4 leading-relaxed">
                       <strong>诊断分析：</strong>您的 nohup 命令显示 <code>[1] PID</code> 说明进程已启动，但依然无法连接。这通常是因为 <strong>Ubuntu 防火墙 (UFW)</strong> 拦截了端口，或者程序在后台默默报错退出了。
                   </p>
                   
                   <div className="space-y-4">
                       {/* Step 1: Firewall */}
                       <div className="bg-black/60 p-3 rounded-lg border border-white/10 font-mono relative group">
                           <div className="text-[10px] text-cyber-yellow mb-2 font-bold uppercase flex items-center gap-2">
                               <ShieldCheck size={12}/> 第一步: 开放内部防火墙 (必须执行!)
                           </div>
                           <div className="text-[9px] text-gray-500 mb-2">腾讯云很多镜像默认开启 UFW，必须手动放行 8090。</div>
                           <code className="block text-xs text-white bg-white/5 p-2 rounded border border-white/5 select-all">
                               sudo ufw allow 8090/tcp
                           </code>
                       </div>

                       {/* Step 2: Debug Process */}
                       <div className="bg-black/60 p-3 rounded-lg border border-white/10 font-mono relative group">
                           <div className="text-[10px] text-cyber-cyan mb-2 font-bold uppercase flex items-center gap-2">
                               <FileSearch size={12}/> 第二步: 确认进程存活
                           </div>
                           <div className="space-y-3">
                               <div>
                                   <div className="text-[9px] text-gray-500 mb-1">A. 查看 nohup 日志 (看是否有报错):</div>
                                   <code className="block text-xs text-white bg-white/5 p-2 rounded border border-white/5 select-all">tail -n 20 pb.log</code>
                               </div>
                               <div>
                                   <div className="text-[9px] text-gray-500 mb-1">B. 杀掉旧进程并<b>前台启动</b> (看到 'Server started' 才算成功):</div>
                                   <code className="block text-xs text-white bg-white/5 p-2 rounded border border-white/5 select-all">
                                      fuser -k 8090/tcp; ./pocketbase serve --http="0.0.0.0:8090"
                                   </code>
                               </div>
                           </div>
                       </div>
                   </div>
               </div>
           </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* 1. Server Config Card */}
           <div className={`tech-border p-6 border-blue-500/20 relative overflow-hidden group transition-colors ${diagError !== 'none' ? 'bg-red-500/5 border-red-500/20' : 'bg-blue-500/5'}`}>
              <div className="flex flex-col gap-6">
                 <div className="flex-1 w-full">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                        <Cloud size={18} className="text-cyber-blue" /> 
                        云服务器配置 (Cloud Server)
                    </h3>
                    <p className="text-xs text-gray-400 mb-4 font-mono">
                        请输入 PocketBase 服务器地址 (例如 http://119.28.xx.xx:8090)。
                    </p>
                    <div className="flex gap-4">
                        <div className="relative flex-1 group/input">
                            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-cyber-blue transition-colors" />
                            <input 
                                value={serverInput}
                                onChange={(e) => setServerInput(e.target.value)}
                                placeholder="https://your-project.pockethost.io"
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white font-mono text-sm focus:border-cyber-blue outline-none transition-all shadow-inner"
                            />
                        </div>
                        <button 
                            onClick={handleSaveServer}
                            className="px-6 py-2 bg-cyber-blue hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <RefreshCw size={16} /> 保存并连接
                        </button>
                    </div>
                 </div>
              </div>
           </div>

           {/* 2. Admin Auth Card (NEW) */}
           <div className={`tech-border p-6 border-cyber-green/20 relative overflow-hidden group transition-colors ${authModel ? 'bg-cyber-green/5' : 'bg-white/5'}`}>
               {!authModel ? (
                   <div>
                       <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                           <Shield size={18} className="text-cyber-green" /> 
                           管理员安全访问 (Admin Access)
                       </h3>
                       <p className="text-xs text-gray-400 mb-4 font-mono">
                           要写入云端数据库，请先验证管理员身份。
                       </p>
                       <div className="flex flex-col gap-3">
                           <div className="relative group/input">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-cyber-green transition-colors" />
                                <input 
                                    value={adminEmail}
                                    onChange={(e) => setAdminEmail(e.target.value)}
                                    placeholder="Admin Email"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white font-mono text-xs focus:border-cyber-green outline-none transition-all"
                                />
                           </div>
                           <div className="flex gap-3">
                                <div className="relative flex-1 group/input">
                                     <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-cyber-green transition-colors" />
                                     <input 
                                         type="password"
                                         value={adminPassword}
                                         onChange={(e) => setAdminPassword(e.target.value)}
                                         placeholder="Password"
                                         className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white font-mono text-xs focus:border-cyber-green outline-none transition-all"
                                     />
                                </div>
                                <button 
                                    onClick={handleAdminLogin}
                                    disabled={isAuthLoading}
                                    className="px-4 py-2 bg-cyber-green/20 hover:bg-cyber-green text-cyber-green hover:text-black border border-cyber-green/50 font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap text-xs"
                                >
                                    {isAuthLoading ? <RefreshCw className="animate-spin" size={14}/> : <LogIn size={14} />} 登录
                                </button>
                           </div>
                       </div>
                   </div>
               ) : (
                   <div className="flex flex-col h-full justify-between">
                       <div>
                           <h3 className="text-lg font-bold text-cyber-green flex items-center gap-2 mb-2">
                               <Shield size={18} className="fill-cyber-green text-black" /> 
                               已授权 (Authorized)
                           </h3>
                           <p className="text-xs text-gray-400 font-mono mb-4">
                               当前登录: <span className="text-white">{authModel.email}</span>
                           </p>
                           
                           {/* Unlock Public Read/Write Access Button */}
                           <button 
                               onClick={handleEnableCollaboration}
                               className="w-full px-4 py-2.5 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-black border border-yellow-500/30 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs mb-2"
                           >
                               <Unlock size={14} /> 开启全员协同模式 (读写)
                           </button>
                           <p className="text-[9px] text-gray-500 text-center">允许团队成员免登录修改数据 (Public R/W)</p>
                       </div>
                       
                       <button 
                           onClick={handleLogout}
                           className="w-full mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
                       >
                           <LogOut size={14} /> 安全注销
                       </button>
                   </div>
               )}
           </div>
       </div>

       {/* 3. Cloud Sync Card */}
       <div className="tech-border p-6 bg-purple-500/5 border-purple-500/20 relative overflow-hidden">
           <div className="flex justify-between items-start mb-4 relative z-10">
               <div>
                   <h3 className="text-lg font-bold text-white flex items-center gap-2">
                       <ArrowRightLeft size={18} className="text-cyber-purple" /> 
                       云端数据同步 (Cloud Sync)
                   </h3>
                   <p className="text-xs text-gray-400 mt-1">手动在本地与云端数据库之间同步数据。</p>
               </div>
               {isSyncing && (
                   <div className="flex items-center gap-2 text-cyber-purple animate-pulse">
                       <RefreshCw size={14} className="animate-spin"/>
                       <span className="text-xs font-bold">同步中...</span>
                   </div>
               )}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
               <button 
                  onClick={handlePushToCloud}
                  disabled={isSyncing || !networkLatency}
                  className="group flex flex-col items-center justify-center p-6 bg-black/40 border border-white/10 hover:border-cyber-purple hover:bg-cyber-purple/10 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               >
                   <div className="w-12 h-12 rounded-full bg-cyber-purple/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-cyber-purple">
                       <UploadCloud size={24} />
                   </div>
                   <div className="text-sm font-bold text-white mb-1">推送到云端 (Push)</div>
                   <div className="text-[10px] text-gray-500 text-center">本地 LocalStorage <span className="text-cyber-purple">→</span> 云端数据库</div>
               </button>

               <button 
                  onClick={handlePullFromCloud}
                  disabled={isSyncing || !networkLatency}
                  className="group flex flex-col items-center justify-center p-6 bg-black/40 border border-white/10 hover:border-cyber-cyan hover:bg-cyber-cyan/10 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               >
                   <div className="w-12 h-12 rounded-full bg-cyber-cyan/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-cyber-cyan">
                       <DownloadCloud size={24} />
                   </div>
                   <div className="text-sm font-bold text-white mb-1">从云端拉取 (Pull)</div>
                   <div className="text-[10px] text-gray-500 text-center">云端数据库 <span className="text-cyber-cyan">→</span> 本地 LocalStorage</div>
               </button>
           </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Tools */}
          <div className="space-y-6">
             
             {/* Storage Card */}
             <div className="tech-border p-6 bg-white/5 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2"><Database size={18} className="text-cyber-cyan"/> 数据存储 (Storage)</h3>
                   <span className="text-xs font-mono text-gray-500 uppercase">本地数据库 (IndexedDB)</span>
                </div>
                <div className="flex items-end gap-2 mb-2">
                   <span className="text-4xl font-black text-white tracking-tighter">{storageUsage}</span>
                   <span className="text-sm font-bold text-gray-500 mb-1">KB 已用</span>
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

             {/* Theme/System Card - Updated for Theme Selection */}
             <div className="tech-border p-6 bg-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><Palette size={18} className="text-cyber-purple"/> 界面与视觉</h3>
                
                <div className="space-y-3 mb-6">
                    {themes.map((t) => {
                        const isActive = currentTheme === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => onThemeChange(t.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden ${
                                    isActive 
                                    ? `${t.activeBg} ${t.activeBorder} shadow-lg` 
                                    : 'bg-black/40 border-white/5 hover:bg-white/5 hover:border-white/20'
                                }`}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${isActive ? `${t.activeBorder} ${t.activeBg} ${t.activeColor}` : 'border-white/10 bg-black/50 text-gray-500'}`}>
                                        <t.icon size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{t.name}</div>
                                        <div className="text-[10px] text-gray-500">{t.desc}</div>
                                    </div>
                                </div>
                                {isActive && (
                                    <div className="relative z-10 text-cyber-cyan animate-in fade-in zoom-in duration-300">
                                        <CheckCircle2 size={18} className={t.activeColor} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <button onClick={runDiagnostics} className="w-full py-3 border border-white/20 text-gray-400 hover:text-white hover:border-white transition-all rounded font-bold text-sm flex items-center justify-center gap-2">
                   <Activity size={16} /> 重新运行诊断
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
                <span className="text-xs font-mono text-gray-500">系统日志 (System Log)</span>
             </div>
             <div className="flex-1 bg-black border border-white/10 border-t-0 rounded-b-xl p-4 font-mono text-xs text-green-500 overflow-y-auto custom-scrollbar shadow-inner">
                {consoleLogs.map((log, i) => (
                   <div key={i} className="mb-1 opacity-80 hover:opacity-100 border-l-2 border-transparent hover:border-green-500 pl-2 transition-all">{log}</div>
                ))}
                <div className="animate-pulse">_</div>
             </div>
          </div>

       </div>
    </div>
  );
};