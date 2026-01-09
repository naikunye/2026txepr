import React, { useState } from 'react';
import { Search, Plus, MoreVertical, Calendar, ArrowRight, ArrowLeft, Trash2, CheckCircle, ListTodo } from 'lucide-react';
import { usePersistence } from '../hooks/usePersistence';
import { addToRecycleBin } from '../lib/recycleBin';

interface Task { id: string; title: string; status: 'todo' | 'progress' | 'done'; tag: string; sub: string; user: string; date: string; }

// Helper for formatted date
const getToday = () => new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });

const initialTasks: Task[] = [
  { id: '1', title: 'Q1 市场营销复盘', status: 'todo', tag: 'HIGH', sub: 'Marketing', user: 'S', date: getToday() },
  { id: '2', title: 'SEO 关键词优化', status: 'progress', tag: 'MED', sub: 'Tech', user: 'M', date: getToday() },
];

export const TaskModule: React.FC = () => {
  // --- Upgrade to Real-time Persistence ---
  const [tasks, setTasks] = usePersistence<Task[]>('AERO_TASKS_DATA', initialTasks);

  const [searchTerm, setSearchTerm] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddInput, setShowAddInput] = useState<string | null>(null);

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const addTask = (status: any) => {
    if (!newTaskTitle) return;
    setTasks([...tasks, { 
        id: Date.now().toString(), 
        title: newTaskTitle, 
        status, 
        tag: 'NEW', 
        sub: 'Gen', 
        user: 'Me', 
        date: getToday()
    }]);
    setNewTaskTitle(''); 
    setShowAddInput(null);
  };

  const deleteTask = (id: string) => {
      if(confirm('Delete task?')) {
          const task = tasks.find(t => t.id === id);
          if (task) {
              addToRecycleBin('AERO_TASKS_DATA', 'Tasks', task, task.title);
              setTasks(tasks.filter(t => t.id !== id));
          }
      }
  };

  const updateStatus = (id: string, newStatus: 'todo'|'progress'|'done') => {
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const Column = ({ status, title, color, border }: { status: 'todo'|'progress'|'done', title: string, color: string, border: string }) => {
    const items = filteredTasks.filter(t => t.status === status);
    
    return (
        <div className="flex flex-col h-full bg-black/40 border border-white/10 relative group-col">
           {/* Top Border Accent */}
           <div className={`h-1 w-full ${color} shadow-[0_0_10px_${border}]`}></div>
           
           <div className="p-4 flex justify-between items-center border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                 <span className={`font-bold text-white tracking-wider`}>{title}</span>
                 <span className="px-1.5 py-0.5 border border-gray-600 text-[10px] font-mono text-gray-400">
                   {items.length}
                 </span>
              </div>
              <button 
                onClick={() => setShowAddInput(status)} 
                className="text-gray-400 hover:text-white hover:bg-white/10 p-1 rounded transition-colors"
                title="添加新任务"
              >
                  <Plus size={16} />
              </button>
           </div>
           
           <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
              {showAddInput === status && (
                 <div className="p-3 bg-black border border-cyber-cyan mb-2 animate-in fade-in zoom-in-95 duration-200">
                    <input 
                      autoFocus
                      placeholder="输入任务名称..."
                      className="w-full bg-transparent text-white text-sm outline-none font-mono"
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTask(status)}
                      onBlur={() => { if(!newTaskTitle) setShowAddInput(null); }}
                    />
                 </div>
              )}
    
              {items.map(task => (
                 <div key={task.id} className="bg-black border border-gray-800 p-4 hover:border-white/50 transition-all cursor-default group relative shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                       <span className={`text-[10px] font-bold px-1 py-0.5 border ${task.tag === 'HIGH' ? 'border-cyber-pink text-cyber-pink' : 'border-cyber-cyan text-cyber-cyan'}`}>
                          {task.tag}
                       </span>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           {/* Quick Move Buttons */}
                           {status !== 'todo' && <button onClick={() => updateStatus(task.id, 'todo')} className="p-1 hover:text-white text-gray-500"><ArrowLeft size={12}/></button>}
                           {status !== 'done' && <button onClick={() => updateStatus(task.id, 'done')} className="p-1 hover:text-white text-gray-500"><ArrowRight size={12}/></button>}
                           <button onClick={() => deleteTask(task.id)} className="p-1 hover:text-red-500 text-gray-600"><Trash2 size={12}/></button>
                       </div>
                    </div>
                    <div className="text-sm font-bold text-white mb-3 leading-snug">{task.title}</div>
                    
                    <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                       <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-gray-600">
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
  }

  return (
    <div className="h-full px-6 pb-6 flex flex-col animate-in fade-in duration-500">
       {/* Sticky Header with Fixed Gap Adjustment */}
       <div className="sticky top-0 z-30 bg-cyber-bg/95 backdrop-blur-xl border-b border-white/10 pb-4 pt-6 -mx-6 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] mb-6 flex justify-between items-end">
          <div>
             <h1 className="text-3xl font-black text-white tracking-wider flex items-center gap-3">
                <ListTodo className="text-cyber-yellow" />
                任务看板
             </h1>
             <p className="text-gray-400 font-mono text-xs mt-1">团队协同任务控制中心 / REAL-TIME SYNC</p>
          </div>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-cyan" size={16} />
             <input 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               placeholder="检索任务指令..."
               className="bg-black border border-white/20 pl-10 pr-4 py-2 text-sm text-white focus:border-cyber-cyan outline-none font-mono w-64 transition-all"
             />
          </div>
       </div>

       <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-6">
          <Column status="todo" title="待办事项 (TODO)" color="bg-cyber-pink" border="#FF003C" />
          <Column status="progress" title="进行中 (WIP)" color="bg-cyber-yellow" border="#FCEE0A" />
          <Column status="done" title="已完成 (DONE)" color="bg-cyber-green" border="#39FF14" />
       </div>
    </div>
  );
};