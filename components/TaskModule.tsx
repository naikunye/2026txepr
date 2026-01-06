import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Calendar, ArrowRight, ArrowLeft, Trash2, CheckCircle } from 'lucide-react';

interface Task { id: string; title: string; status: 'todo' | 'progress' | 'done'; tag: string; sub: string; user: string; date: string; }
const initialTasks: Task[] = [
  { id: '1', title: 'Q1 市场营销复盘', status: 'todo', tag: 'HIGH', sub: 'Marketing', user: 'S', date: '01/05' },
  { id: '2', title: 'SEO 关键词优化', status: 'progress', tag: 'MED', sub: 'Tech', user: 'M', date: '01/08' },
];

export const TaskModule: React.FC = () => {
  // Initialize with Persistence
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('AERO_TASKS_DATA');
      return saved ? JSON.parse(saved) : initialTasks;
    } catch (e) {
      return initialTasks;
    }
  });

  // Save on change
  useEffect(() => {
    localStorage.setItem('AERO_TASKS_DATA', JSON.stringify(tasks));
  }, [tasks]);

  const [searchTerm, setSearchTerm] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddInput, setShowAddInput] = useState<string | null>(null);

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const addTask = (status: any) => {
    if (!newTaskTitle) return;
    setTasks([...tasks, { id: Date.now().toString(), title: newTaskTitle, status, tag: 'NEW', sub: 'Gen', user: 'Me', date: 'Today' }]);
    setNewTaskTitle(''); setShowAddInput(null);
  };

  const deleteTask = (id: string) => {
      if(confirm('Delete task?')) {
          setTasks(tasks.filter(t => t.id !== id));
      }
  };

  const Column = ({ status, title, color, border }: { status: string, title: string, color: string, border: string }) => (
    <div className="flex flex-col h-full bg-black/40 border border-white/10 relative">
       {/* Top Border Accent */}
       <div className={`h-1 w-full ${color} shadow-[0_0_10px_${border}]`}></div>
       
       <div className="p-4 flex justify-between items-center border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
             <span className={`font-bold text-white tracking-wider`}>{title}</span>
             <span className="px-1.5 py-0.5 border border-gray-600 text-[10px] font-mono text-gray-400">
               {filteredTasks.filter(t => t.status === status).length}
             </span>
          </div>
          <button onClick={() => setShowAddInput(status)} className="text-gray-400 hover:text-white"><Plus size={16} /></button>
       </div>
       
       <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
          {showAddInput === status && (
             <div className="p-3 bg-black border border-cyber-cyan mb-2">
                <input 
                  autoFocus
                  placeholder="输入任务..."
                  className="w-full bg-transparent text-white text-sm outline-none font-mono"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask(status)}
                />
             </div>
          )}

          {filteredTasks.filter(t => t.status === status).map(task => (
             <div key={task.id} className="bg-black border border-gray-800 p-4 hover:border-white/50 transition-all cursor-grab group relative">
                <div className="flex justify-between items-start mb-2">
                   <span className={`text-[10px] font-bold px-1 py-0.5 border ${task.tag === 'HIGH' ? 'border-cyber-pink text-cyber-pink' : 'border-cyber-cyan text-cyber-cyan'}`}>
                      {task.tag}
                   </span>
                   <button 
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                       <Trash2 size={14} />
                   </button>
                </div>
                <div className="text-sm font-bold text-white mb-3">{task.title}</div>
                
                <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                   <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center text-[10px] text-white">
                         {task.user}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">{task.date}</span>
                   </div>
                   {status === 'done' && <CheckCircle size={14} className="text-cyber-green" />}
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
       <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-white/10 pb-4 pt-2 -mx-6 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] mb-6 flex justify-between items-end">
          <div>
             <h1 className="text-3xl font-black text-white tracking-wider">任务看板</h1>
             <p className="text-gray-400 font-mono text-xs mt-1">任务控制中心</p>
          </div>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-cyan" size={16} />
             <input 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               placeholder="检索任务指令..."
               className="bg-black border border-white/20 pl-10 pr-4 py-2 text-sm text-white focus:border-cyber-cyan outline-none font-mono w-64"
             />
          </div>
       </div>

       <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-6">
          <Column status="todo" title="待办事项" color="bg-cyber-pink" border="#FF003C" />
          <Column status="progress" title="进行中" color="bg-cyber-yellow" border="#FCEE0A" />
          <Column status="done" title="已完成" color="bg-cyber-green" border="#39FF14" />
       </div>
    </div>
  );
};