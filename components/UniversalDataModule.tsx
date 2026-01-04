import React, { useState } from 'react';
import { Search, FileText, Download, MoreHorizontal, FileJson, FileSpreadsheet, Image as ImageIcon, HardDrive } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'json' | 'img';
  date: string;
}

const mockFiles: FileItem[] = [
  { id: '1', name: 'Q1_财务报表_最终版.pdf', size: '2.4 MB', type: 'pdf', date: '刚刚' },
  { id: '2', name: 'HK_物流清单_Manifest.json', size: '450 KB', type: 'json', date: '2 小时前' },
  { id: '3', name: '新品拍摄_V2.png', size: '12 MB', type: 'img', date: '昨天' },
  { id: '4', name: '库存审计报告_2025.pdf', size: '5.1 MB', type: 'pdf', date: '1月2日' },
];

export const UniversalDataModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const FileIcon = ({ type }: { type: string }) => {
    if (type === 'pdf') return <FileText className="text-cyber-pink" size={32} />;
    if (type === 'json') return <FileJson className="text-cyber-yellow" size={32} />;
    return <ImageIcon className="text-cyber-cyan" size={32} />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
         <div>
            <h1 className="text-3xl font-black text-white tracking-wider flex items-center gap-3">
               <HardDrive className="text-cyber-purple" />
               数据文档库
            </h1>
            <p className="text-gray-400 mt-1 font-mono text-xs">SECURE DATA VAULT // ENCRYPTED</p>
         </div>
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-cyan" size={16} />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="搜索加密文档..."
              className="bg-black border border-white/20 pl-10 pr-4 py-2 text-sm text-white focus:border-cyber-cyan outline-none w-64 font-mono transition-all"
            />
         </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
         {/* Upload Card */}
         <div className="aspect-square border border-dashed border-gray-700 bg-black/30 flex flex-col items-center justify-center cursor-pointer hover:border-cyber-cyan hover:text-cyber-cyan transition-colors group text-gray-500">
             <div className="w-12 h-12 border border-gray-700 group-hover:border-cyber-cyan flex items-center justify-center mb-2 transition-colors">
                <span className="text-2xl font-light">+</span>
             </div>
             <span className="text-sm font-bold font-mono uppercase">上传数据</span>
         </div>

         {/* File Cards */}
         {mockFiles.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map((file) => (
            <div key={file.id} className="aspect-square bg-cyber-panel/40 border border-white/10 p-6 hover:border-cyber-cyan hover:shadow-neon-cyan transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden">
               {/* Scanline effect */}
               <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20 pointer-events-none"></div>

               <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <MoreHorizontal size={20} className="text-gray-400 hover:text-white" />
               </div>
               
               <div className="flex-1 flex items-center justify-center relative z-10">
                  <div className="w-20 h-24 border border-white/10 bg-black flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                     <FileIcon type={file.type} />
                  </div>
               </div>
               
               <div className="text-center mt-2 relative z-10">
                  <div className="text-sm font-bold text-white truncate w-full group-hover:text-cyber-cyan transition-colors">{file.name}</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-1">{file.size} • {file.date}</div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};