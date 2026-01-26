
import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, Scale, Ruler, Box, ArrowRightLeft, 
  RefreshCcw, Package, Truck, Divide, X, Plus, Minus, Equal, Delete, 
  Container, Ship, History, Trash2, ArrowDown, Settings2, Weight, Info,
  Globe, Sun, Moon, Clock, Type, Scissors, AlignLeft, FileType
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

  return (
    <ToolCard title="万能换算 (CONVERTER)" icon={RefreshCcw} color="cyber-purple">
        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-8 bg-black/40 p-1 rounded-xl border border-white/10">
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

        <div className="flex flex-col gap-6">
            {/* From */}
            <div className="relative group">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">输入 (Input)</label>
                <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl p-1 transition-all focus-within:border-cyber-purple focus-within:shadow-[0_0_15px_rgba(192,38,211,0.2)]">
                    <input 
                        type="number" 
                        value={val}
                        onChange={e => setVal(e.target.value)}
                        className="bg-transparent w-full p-3 text-2xl font-mono font-black text-white outline-none placeholder-gray-700"
                        placeholder="0"
                    />
                    <div className="pr-2 border-l border-white/10 pl-2">
                        <select 
                            value={fromUnit}
                            onChange={e => setFromUnit(e.target.value)}
                            className="bg-white/5 text-cyber-purple font-bold text-xs py-1.5 px-3 rounded-lg outline-none cursor-pointer hover:bg-white/10 appearance-none text-center min-w-[60px]"
                        >
                            {Object.keys(rates[category]).map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Swap Button */}
            <div className="relative h-4 flex items-center justify-center">
                <div className="absolute w-full h-[1px] bg-white/10"></div>
                <button 
                    onClick={handleSwap}
                    className="relative z-10 w-8 h-8 rounded-full bg-[#1c1c1e] border border-white/20 text-gray-400 flex items-center justify-center hover:text-white hover:border-cyber-purple transition-all hover:rotate-180 duration-500"
                >
                    <ArrowRightLeft size={14} className="rotate-90"/>
                </button>
            </div>

            {/* To */}
            <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">结果 (Result)</label>
                <div className="flex items-center bg-cyber-purple/5 border border-cyber-purple/20 rounded-2xl p-1">
                    <div className="w-full p-3 text-2xl font-mono font-black text-cyber-purple truncate tracking-tight">
                        {result === 0 ? '0' : Number.isInteger(result) ? result : result.toFixed(4)}
                    </div>
                    <div className="pr-2 border-l border-cyber-purple/20 pl-2">
                        <select 
                            value={toUnit}
                            onChange={e => setToUnit(e.target.value)}
                            className="bg-cyber-purple/10 text-cyber-purple font-bold text-xs py-1.5 px-3 rounded-lg outline-none cursor-pointer hover:bg-cyber-purple/20 appearance-none text-center min-w-[60px]"
                        >
                            {Object.keys(rates[category]).map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                        </select>
                    </div>
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
                <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center">
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

// --- 3. Audit Calculator (Tape History) ---
const AuditCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<string[]>([]);
  const [expression, setExpression] = useState('');
  
  // Safe evaluation
  const safeEval = (exp: string) => {
      try {
          // Only allow numbers and operators
          if (/[^0-9+\-*/().]/.test(exp)) return 'Error';
          // eslint-disable-next-line no-new-func
          return new Function('return ' + exp)();
      } catch {
          return 'Error';
      }
  };

  const handleInput = (val: string) => {
      if (val === 'AC') {
          setDisplay('0');
          setExpression('');
      } else if (val === 'DEL') {
          setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
          setExpression(prev => prev.slice(0, -1));
      } else if (val === '=') {
          const res = safeEval(expression);
          const final = String(res);
          // Add to tape
          if (final !== 'Error') {
              setHistory(prev => [`${expression} = ${final}`, ...prev].slice(0, 50));
          }
          setDisplay(final);
          setExpression(final);
      } else if (['+', '-', '*', '/'].includes(val)) {
          setExpression(prev => prev + val);
          setDisplay('0'); // Reset display for next number but keep expression
      } else {
          // Number
          if (display === '0' || ['+', '-', '*', '/'].includes(expression.slice(-1))) {
              setDisplay(val);
          } else {
              setDisplay(prev => prev + val);
          }
          setExpression(prev => prev + val);
      }
  };

  const clearHistory = () => setHistory([]);

  const btnClass = "h-12 rounded-xl font-bold text-lg flex items-center justify-center transition-all active:scale-95 border border-white/5 shadow-lg select-none";
  const numClass = `${btnClass} bg-[#151515] hover:bg-[#202020] text-white`;
  const opClass = `${btnClass} bg-cyber-cyan/10 hover:bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/20`;
  const actionClass = `${btnClass} bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20`;

  return (
    <ToolCard title="审计计算 (AUDIT CALC)" icon={Calculator} color="cyber-cyan">
        <div className="flex flex-col h-full">
            
            {/* History Tape */}
            <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-t-xl mb-0 p-4 overflow-y-auto custom-scrollbar relative">
                <div className="absolute top-2 right-2 z-10">
                    <button onClick={clearHistory} className="p-1.5 text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
                </div>
                <div className="flex flex-col-reverse justify-end min-h-full gap-2">
                    {history.length === 0 && <div className="text-gray-700 text-xs font-mono text-center mt-auto opacity-50">// TAPE READY //</div>}
                    {history.map((h, i) => (
                        <div key={i} className="text-right font-mono text-xs border-b border-white/5 pb-1 mb-1 last:border-0">
                            <div className="text-gray-500">{h.split('=')[0]}</div>
                            <div className="text-cyber-cyan font-bold text-sm">= {h.split('=')[1]}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Display */}
            <div className="bg-black border-x border-b border-white/10 p-4 mb-4 rounded-b-xl text-right">
                <div className="text-gray-500 text-[10px] font-mono h-4">{expression || '0'}</div>
                <div className="text-4xl font-black text-white font-mono tracking-wider truncate">{display}</div>
            </div>

            {/* Keyboard */}
            <div className="grid grid-cols-4 gap-2">
                <button onClick={() => handleInput('AC')} className={actionClass}>AC</button>
                <button onClick={() => handleInput('DEL')} className={actionClass}><Delete size={18}/></button>
                <button onClick={() => handleInput('/')} className={opClass}><Divide size={18}/></button>
                <button onClick={() => handleInput('*')} className={opClass}><X size={18}/></button>

                <button onClick={() => handleInput('7')} className={numClass}>7</button>
                <button onClick={() => handleInput('8')} className={numClass}>8</button>
                <button onClick={() => handleInput('9')} className={numClass}>9</button>
                <button onClick={() => handleInput('-')} className={opClass}><Minus size={18}/></button>

                <button onClick={() => handleInput('4')} className={numClass}>4</button>
                <button onClick={() => handleInput('5')} className={numClass}>5</button>
                <button onClick={() => handleInput('6')} className={numClass}>6</button>
                <button onClick={() => handleInput('+')} className={opClass}><Plus size={18}/></button>

                <button onClick={() => handleInput('1')} className={numClass}>1</button>
                <button onClick={() => handleInput('2')} className={numClass}>2</button>
                <button onClick={() => handleInput('3')} className={numClass}>3</button>
                <button onClick={() => handleInput('=')} className={`${btnClass} row-span-2 bg-cyber-cyan text-black hover:bg-white hover:shadow-[0_0_20px_rgba(64,200,224,0.5)]`}><Equal size={24}/></button>

                <button onClick={() => handleInput('0')} className={`${numClass} col-span-2`}>0</button>
                <button onClick={() => handleInput('.')} className={numClass}>.</button>
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

// --- 5. Text Refinery (Amazon Keyword Cleaner) ---
const TextRefinery = () => {
    const [text, setText] = useState('');
    
    // Stats
    const charCount = text.length;
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    // Amazon Bytes Calc (UTF-8)
    const byteCount = new Blob([text]).size; 

    const handleAction = (action: string) => {
        let newText = text;
        switch(action) {
            case 'upper': newText = text.toUpperCase(); break;
            case 'lower': newText = text.toLowerCase(); break;
            case 'title': 
                newText = text.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '); 
                break;
            case 'dedup':
                const words = text.split(/\s+/);
                newText = [...new Set(words)].join(' ');
                break;
            case 'clean':
                newText = text.replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim();
                break;
        }
        setText(newText);
    };

    return (
        <ToolCard title="文本清洗站 (REFINERY)" icon={Type} color="cyber-blue">
            <div className="flex flex-col h-full gap-4">
                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-2">
                    <div className={`p-2 rounded-lg border bg-black/40 text-center ${byteCount > 250 ? 'border-red-500/50 text-red-500' : 'border-white/10 text-gray-400'}`}>
                        <div className="text-[9px] font-bold uppercase mb-1">Bytes (Amz)</div>
                        <div className={`text-lg font-black font-mono ${byteCount > 250 ? 'text-red-500' : 'text-white'}`}>{byteCount}<span className="text-[10px] opacity-50">/250</span></div>
                    </div>
                    <div className="p-2 rounded-lg border border-white/10 bg-black/40 text-center">
                        <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">Characters</div>
                        <div className="text-lg font-black text-white font-mono">{charCount}</div>
                    </div>
                    <div className="p-2 rounded-lg border border-white/10 bg-black/40 text-center">
                        <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">Words</div>
                        <div className="text-lg font-black text-white font-mono">{wordCount}</div>
                    </div>
                </div>

                <textarea 
                    value={text}
                    onChange={e => setText(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white font-mono outline-none resize-none focus:border-cyber-blue transition-colors"
                    placeholder="在此粘贴 Listing 标题或关键词..."
                />

                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleAction('title')} className="btn-tool"><Type size={12}/> Title Case</button>
                    <button onClick={() => handleAction('upper')} className="btn-tool"><ArrowDown size={12} className="rotate-180"/> UPPER</button>
                    <button onClick={() => handleAction('dedup')} className="btn-tool"><Scissors size={12}/> 去重 (Dedup)</button>
                    <button onClick={() => handleAction('clean')} className="btn-tool"><Delete size={12}/> 去符号 (Clean)</button>
                </div>
            </div>
            <style>{`
                .btn-tool {
                    @apply flex items-center justify-center gap-2 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all uppercase tracking-wider;
                }
            `}</style>
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
                {/* Row 1 */}
                {/* 1. Logistics Master (Wide) */}
                <LogisticsMaster />

                {/* 2. Quantum Converter */}
                <div className="h-[500px]">
                    <UnitConverter />
                </div>

                {/* 3. Audit Calculator */}
                <div className="h-[500px]">
                    <AuditCalculator />
                </div>

                {/* Row 2 (New Tools) */}
                {/* 4. World Clock */}
                <div className="h-[400px] col-span-1 md:col-span-2">
                    <WorldClock />
                </div>

                {/* 5. Text Refinery */}
                <div className="h-[400px] col-span-1 md:col-span-2">
                    <TextRefinery />
                </div>
            </div>
        </div>
    </div>
  );
};
