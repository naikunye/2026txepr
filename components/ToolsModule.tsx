
import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, Ruler, Box, ArrowRightLeft, 
  RefreshCcw, Truck, Container, Ship, Info,
  Globe, Sun, Moon, Copy, CheckCircle2
} from 'lucide-react';

// --- Shared UI Components ---
const ToolCard = ({ children, title, icon: Icon, color, className }: any) => (
    <div className={`apple-glass flex flex-col relative overflow-hidden h-full ${className}`}>
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${color} to-transparent opacity-50`}></div>
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20">
            <h3 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 text-${color}`}>
                <Icon size={16} /> {title}
            </h3>
            <div className="flex gap-1">
                <div className={`w-2 h-2 rounded-full bg-${color} shadow-[0_0_8px_currentColor]`}></div>
            </div>
        </div>
        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar relative z-10">
            {children}
        </div>
        {/* Ambient Glow */}
        <div className={`absolute -bottom-20 -right-20 w-64 h-64 bg-${color} opacity-[0.03] blur-[80px] pointer-events-none`}></div>
    </div>
);

// --- 1. Quantum Unit Converter ---
const UnitConverter = () => {
  const [category, setCategory] = useState<'weight' | 'length' | 'area'>('weight');
  const [val, setVal] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<string>('kg');
  const [toUnit, setToUnit] = useState<string>('lb');

  const rates: any = {
    weight: { kg: 1, lb: 2.20462, oz: 35.274, g: 1000 },
    length: { cm: 1, inch: 0.393701, ft: 0.0328084, m: 0.01 },
    area: { cbm: 1, cuft: 35.3147, sq_m: 1, sq_ft: 10.7639 }
  };

  const categories = [
    { id: 'weight', label: '重量', icon: Scale },
    { id: 'length', label: '长度', icon: Ruler },
    { id: 'area', label: '体积', icon: Box },
  ];

  // Quick Swap Presets
  const shortcuts: Record<string, Array<{label: string, from: string, to: string}>> = {
      weight: [
          { label: 'KG ⇄ LB', from: 'kg', to: 'lb' },
          { label: 'G ⇄ OZ', from: 'g', to: 'oz' }
      ],
      length: [
          { label: 'CM ⇄ IN', from: 'cm', to: 'inch' },
          { label: 'M ⇄ FT', from: 'm', to: 'ft' }
      ],
      area: [
          { label: 'CBM ⇄ CUFT', from: 'cbm', to: 'cuft' },
          { label: 'M² ⇄ SQ.FT', from: 'sq_m', to: 'sq_ft' }
      ]
  };

  useEffect(() => {
    const keys = Object.keys(rates[category]);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
    setVal('');
  }, [category]);

  const result = val ? (parseFloat(val) / rates[category][fromUnit] * rates[category][toUnit]) : 0;

  const handleSwap = () => {
      const temp = fromUnit;
      setFromUnit(toUnit);
      setToUnit(temp);
  };

  const applyShortcut = (from: string, to: string) => {
      setFromUnit(from);
      setToUnit(to);
  };

  return (
    <ToolCard title="万能换算 (CONVERTER)" icon={RefreshCcw} color="cyber-purple">
        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-6 bg-black/40 p-1 rounded-xl border border-white/10">
            {categories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id as any)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all ${category === cat.id ? 'bg-cyber-purple text-black shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                >
                    <cat.icon size={14} /> {cat.label}
                </button>
            ))}
        </div>

        {/* Shortcuts */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
            {shortcuts[category].map((s, i) => (
                <button
                    key={i}
                    onClick={() => applyShortcut(s.from, s.to)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-cyber-purple hover:text-white transition-all whitespace-nowrap"
                >
                    {s.label}
                </button>
            ))}
        </div>

        <div className="flex flex-col gap-4 relative">
            {/* Swap Button (Absolute Centered) */}
            <button 
                onClick={handleSwap}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#1c1c1e] border-2 border-white/10 text-gray-400 flex items-center justify-center hover:text-cyber-purple hover:border-cyber-purple hover:scale-110 transition-all shadow-xl"
            >
                <ArrowRightLeft size={16} className="rotate-90"/>
            </button>

            {/* Input Card */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 transition-all focus-within:border-cyber-purple/50 focus-within:bg-black/60 relative group">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1 block group-focus-within:text-cyber-purple transition-colors">输入 (Input)</label>
                <div className="flex items-baseline justify-between">
                    <input 
                        type="number" 
                        value={val}
                        onChange={e => setVal(e.target.value)}
                        className="bg-transparent w-full text-3xl font-mono font-black text-white outline-none placeholder-gray-700"
                        placeholder="0"
                    />
                    <select 
                        value={fromUnit}
                        onChange={e => setFromUnit(e.target.value)}
                        className="bg-transparent text-gray-400 font-bold text-sm outline-none cursor-pointer hover:text-white appearance-none text-right uppercase tracking-wider"
                    >
                        {Object.keys(rates[category]).map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                    </select>
                </div>
            </div>

            {/* Result Card */}
            <div className="bg-cyber-purple/10 border border-cyber-purple/20 rounded-2xl p-4 relative">
                <label className="text-[9px] font-bold text-cyber-purple/70 uppercase tracking-widest mb-1 block">结果 (Result)</label>
                <div className="flex items-baseline justify-between">
                    <div className="w-full text-3xl font-mono font-black text-cyber-purple truncate tracking-tight text-glow-purple">
                        {result === 0 ? '0' : Number.isInteger(result) ? result : result.toFixed(4)}
                    </div>
                    <select 
                        value={toUnit}
                        onChange={e => setToUnit(e.target.value)}
                        className="bg-transparent text-cyber-purple font-bold text-sm outline-none cursor-pointer appearance-none text-right uppercase tracking-wider"
                    >
                        {Object.keys(rates[category]).map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                    </select>
                </div>
            </div>
        </div>
    </ToolCard>
  );
};

// --- 2. Logistics Master (CBM) ---
const LogisticsMaster = () => {
  const [l, setL] = useState('');
  const [w, setW] = useState('');
  const [h, setH] = useState('');
  const [ctns, setCtns] = useState('');
  const [weight, setWeight] = useState(''); // Single box weight
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [dimDivisor, setDimDivisor] = useState<5000 | 6000>(6000);
  const [copied, setCopied] = useState(false);

  // Container Specs (Usable Volume)
  const containers = {
      '20GP': { vol: 28, label: '20GP 小柜' },
      '40GP': { vol: 58, label: '40GP 平柜' },
      '40HQ': { vol: 68, label: '40HQ 高柜' }
  };

  const calculate = () => {
    const len = parseFloat(l) || 0;
    const wid = parseFloat(w) || 0;
    const hei = parseFloat(h) || 0;
    const count = parseFloat(ctns) || 0;
    const singleW = parseFloat(weight) || 0;

    if (len === 0 || wid === 0 || hei === 0 || count === 0) return null;

    const toCm = unit === 'in' ? 2.54 : 1;
    const L_cm = len * toCm;
    const W_cm = wid * toCm;
    const H_cm = hei * toCm;

    const singleCbm = (L_cm * W_cm * H_cm) / 1000000;
    const totalCbm = singleCbm * count;
    
    // Weights
    const totalActualWeight = singleW * count;
    const singleDimWeight = (L_cm * W_cm * H_cm) / dimDivisor;
    const totalDimWeight = singleDimWeight * count;
    
    const chargeableWeight = Math.max(totalActualWeight, totalDimWeight);

    return { totalCbm, totalActualWeight, totalDimWeight, chargeableWeight, singleCbm };
  };

  const res = calculate();

  // Helper for progress bar
  const getContainerUsage = (type: '20GP' | '40GP' | '40HQ') => {
      if (!res) return 0;
      const capacity = containers[type].vol;
      return Math.min(100, (res.totalCbm / capacity) * 100);
  };

  const handleCopyResult = () => {
      if (!res) return;
      const text = `装箱数据:\n体积: ${res.totalCbm.toFixed(3)}m³\n计费重: ${res.chargeableWeight.toFixed(1)}kg\n总箱数: ${ctns}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolCard title="物流装载模拟 (LOGISTICS)" icon={Container} color="cyber-yellow" className="col-span-1 lg:col-span-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            
            {/* Input Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                        <button onClick={() => setUnit('cm')} className={`px-3 py-1 text-[10px] font-bold rounded ${unit === 'cm' ? 'bg-cyber-yellow text-black' : 'text-gray-500'}`}>CM</button>
                        <button onClick={() => setUnit('in')} className={`px-3 py-1 text-[10px] font-bold rounded ${unit === 'in' ? 'bg-cyber-yellow text-black' : 'text-gray-500'}`}>INCH</button>
                    </div>
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                        <button onClick={() => setDimDivisor(6000)} className={`px-3 py-1 text-[10px] font-bold rounded ${dimDivisor === 6000 ? 'bg-white/10 text-white' : 'text-gray-500'}`}>/6000 (普)</button>
                        <button onClick={() => setDimDivisor(5000)} className={`px-3 py-1 text-[10px] font-bold rounded ${dimDivisor === 5000 ? 'bg-white/10 text-white' : 'text-gray-500'}`}>/5000 (快)</button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="relative group">
                        <label className="text-[9px] font-bold text-gray-500 uppercase mb-1 block">长 (L)</label>
                        <input type="number" value={l} onChange={e=>setL(e.target.value)} className="input-holo w-full p-2.5 text-center text-sm font-mono font-bold" placeholder="0" />
                    </div>
                    <div className="relative group">
                        <label className="text-[9px] font-bold text-gray-500 uppercase mb-1 block">宽 (W)</label>
                        <input type="number" value={w} onChange={e=>setW(e.target.value)} className="input-holo w-full p-2.5 text-center text-sm font-mono font-bold" placeholder="0" />
                    </div>
                    <div className="relative group">
                        <label className="text-[9px] font-bold text-gray-500 uppercase mb-1 block">高 (H)</label>
                        <input type="number" value={h} onChange={e=>setH(e.target.value)} className="input-holo w-full p-2.5 text-center text-sm font-mono font-bold" placeholder="0" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[9px] font-bold text-gray-500 uppercase mb-1 block">总箱数 (Cartons)</label>
                        <input type="number" value={ctns} onChange={e=>setCtns(e.target.value)} className="input-holo w-full p-2.5 text-center text-white font-bold" placeholder="0" />
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-gray-500 uppercase mb-1 block">单箱重 (kg)</label>
                        <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} className="input-holo w-full p-2.5 text-center text-white font-bold" placeholder="0" />
                    </div>
                </div>

                {/* Quick Result Mini */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-cyber-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    <div>
                        <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">总体积 (Total Volume)</div>
                        <div className="text-2xl font-black text-cyber-yellow font-mono">{res ? res.totalCbm.toFixed(3) : '0.000'} <span className="text-xs text-gray-500">m³</span></div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">计费重 (Chargeable)</div>
                        <div className={`text-xl font-black font-mono ${res && res.chargeableWeight > res.totalActualWeight ? 'text-red-400' : 'text-white'}`}>
                            {res ? res.chargeableWeight.toFixed(1) : '0.0'} <span className="text-xs text-gray-500">kg</span>
                        </div>
                        {res && res.chargeableWeight > res.totalActualWeight && (
                            <div className="text-[9px] text-red-500 font-bold mt-1">抛货 (Volumetric)</div>
                        )}
                    </div>
                    
                    {res && (
                        <button 
                            onClick={handleCopyResult}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-cyber-yellow hover:text-black font-bold shadow-lg"
                        >
                            {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                            {copied ? '已复制' : '复制结果'}
                        </button>
                    )}
                </div>
            </div>

            {/* Visualizer Section */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col relative overflow-hidden">
                <h4 className="text-xs font-bold text-white uppercase mb-6 flex items-center gap-2">
                    <Ship size={14} className="text-blue-400"/> 
                    集装箱利用率 (Utilization)
                </h4>

                <div className="space-y-6 flex-1">
                    {['20GP', '40GP', '40HQ'].map((type) => {
                        const usage = getContainerUsage(type as any);
                        const isOver = usage >= 100;
                        const countNeeded = res ? Math.ceil(res.totalCbm / containers[type as keyof typeof containers].vol) : 0;

                        return (
                            <div key={type} className="relative">
                                <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5 uppercase">
                                    <span>{containers[type as keyof typeof containers].label}</span>
                                    {res && res.totalCbm > 0 && (
                                        <span className={isOver ? 'text-red-500' : 'text-cyber-yellow'}>
                                            {isOver ? `需 ${countNeeded} 个柜` : `${usage.toFixed(1)}%`}
                                        </span>
                                    )}
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-red-500' : 'bg-cyber-yellow'}`}
                                        style={{ width: `${Math.min(100, usage)}%` }}
                                    ></div>
                                </div>
                                {/* Capacity Markers */}
                                <div className="absolute top-5 right-0 text-[9px] text-gray-600 font-mono">
                                    Cap: {containers[type as keyof typeof containers].vol}m³
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Summary Alert */}
                {res && res.totalCbm > 0 && (
                    <div className="mt-6 p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] text-gray-400 leading-relaxed flex gap-3 items-start">
                        <Info size={14} className="text-cyber-yellow shrink-0 mt-0.5"/>
                        <div>
                            单箱体积: <span className="text-white font-bold">{res.singleCbm.toFixed(4)} m³</span><br/>
                            {res.totalCbm > 68 ? (
                                <span className="text-red-400 font-bold">警告：货量已超过一个 40HQ 高柜，建议分批出运或预订多个集装箱。</span>
                            ) : (
                                <span className="text-green-400 font-bold">装载建议：适合 {res.totalCbm < 28 ? '20GP 小柜' : '40HQ 高柜'} 出运。</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </ToolCard>
  );
};

// --- 4. Chrono-Sync (Global Time Visualizer) ---
const WorldClock = () => {
    const [now, setNow] = useState(new Date());
    const [offset, setOffset] = useState(0); // Offset in hours from "Now"

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Cities Config
    const cities = [
        { code: 'CN', name: '深圳 (Shenzhen)', zone: 'Asia/Shanghai', color: 'text-cyber-green' },
        { code: 'UK', name: '伦敦 (London)', zone: 'Europe/London', color: 'text-blue-400' },
        { code: 'US', name: '纽约 (New York)', zone: 'America/New_York', color: 'text-purple-400' },
        { code: 'US', name: '洛杉矶 (LA)', zone: 'America/Los_Angeles', color: 'text-cyber-yellow' },
    ];

    // Calc time with offset
    const getTargetTime = (zone: string) => {
        const target = new Date(now.getTime() + offset * 3600000);
        return target.toLocaleTimeString('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', hour12: false });
    };

    // Calc if it's working hours (9am - 6pm)
    const isWorkingHours = (zone: string) => {
        const target = new Date(now.getTime() + offset * 3600000);
        const hour = parseInt(target.toLocaleTimeString('en-GB', { timeZone: zone, hour: '2-digit', hour12: false }));
        return hour >= 9 && hour <= 18;
    };

    return (
        <ToolCard title="全球时差协同 (CHRONO SYNC)" icon={Globe} color="cyber-green">
            <div className="flex flex-col h-full gap-4">
                {/* Time Slider */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-500 font-bold uppercase">会议规划 (Time Shift)</span>
                        <span className={`font-mono font-bold ${offset === 0 ? 'text-gray-500' : 'text-cyber-green'}`}>
                            {offset === 0 ? '现在 (Now)' : offset > 0 ? `+${offset} 小时` : `${offset} 小时`}
                        </span>
                    </div>
                    <input 
                        type="range" 
                        min="-12" max="12" step="1" 
                        value={offset}
                        onChange={(e) => setOffset(parseInt(e.target.value))}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyber-green"
                    />
                    <div className="flex justify-between text-[9px] text-gray-600 mt-2 font-mono">
                        <span>-12h</span>
                        <span>0</span>
                        <span>+12h</span>
                    </div>
                </div>

                {/* Cities List */}
                <div className="flex-1 space-y-3">
                    {cities.map(c => {
                        const time = getTargetTime(c.zone);
                        const isWork = isWorkingHours(c.zone);
                        return (
                            <div key={c.name} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isWork ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 opacity-60'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${isWork ? 'bg-white/10 text-white' : 'bg-black text-gray-500'}`}>
                                        {isWork ? <Sun size={14}/> : <Moon size={14}/>}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white">{c.code}</div>
                                        <div className="text-[10px] text-gray-500">{c.name}</div>
                                    </div>
                                </div>
                                <div className={`text-xl font-black font-mono tracking-widest ${isWork ? c.color : 'text-gray-600'}`}>
                                    {time}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </ToolCard>
    );
};

// --- Main Module Layout ---
export const ToolsModule: React.FC = () => {
  return (
    <div className="px-6 pb-6 h-screen flex flex-col animate-in fade-in duration-500 overflow-hidden">
        
        {/* Header */}
        <div className="sticky top-0 z-30 bg-transparent backdrop-blur-2xl border-b border-white/10 pb-6 pt-6 -mx-6 px-6 shadow-sm mb-6 flex-shrink-0">
            <div>
                <h1 className="text-3xl font-black text-white tracking-wider flex items-center gap-3 text-glow">
                    <Truck className="text-cyber-yellow" size={32} />
                    跨境工具箱 <span className="text-xs bg-cyber-yellow/10 text-cyber-yellow px-2 py-0.5 rounded border border-cyber-yellow/20 font-mono">UTILITY_HUB</span>
                </h1>
                <p className="text-gray-500 font-mono text-xs mt-1">Cross-Border Logistics & Calculation Center</p>
            </div>
        </div>

        {/* Grid Content */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar -mr-2 pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 h-auto">
                {/* 1. Logistics Master (Wide: 2 Cols) */}
                <LogisticsMaster />

                {/* 2. Quantum Converter (1 Col) */}
                <div className="h-[500px]">
                    <UnitConverter />
                </div>

                {/* 3. World Clock (1 Col) */}
                <div className="h-[500px]">
                    <WorldClock />
                </div>
            </div>
        </div>
    </div>
  );
};
