import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, Trash2, CheckCircle2, ListTodo, 
  Clock, AlertCircle, MoreHorizontal, User, Zap, ChevronRight, 
  Layout, Flag, Paperclip, ArrowRight, ArrowLeft
} from 'lucide-react';
import { usePersistence } from '../hooks/usePersistence';

interface Task { 
  id: string; 
  title: string; 
  status: 'todo' | 'progress' | 'done'; 
  priority: 'high' | 'med' | 'low'; 
  tag: string; 
  assignee: string; 
  dueDate: string; 
  comments: number;
}

const getToday = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const initialTasks: Task[] = [
  { id: '1', title: 'Q1 市场营销复盘报告', status: 'todo', priority: 'high', tag: 'Marketing', assignee: 'Sarah', dueDate: getToday(), comments: 3 },
  { id: '2', title: 'SEO 关键词深度优化', status: 'progress', priority: 'med', tag: 'Growth', assignee: 'Mike', dueDate: 'Tomorrow', comments: 1 },
  { id: '3', title: '修复 iOS 端支付网关 Bug', status: 'todo', priority: 'high', tag: 'Dev', assignee: 'Alex', dueDate: 'Urgent', comments: 5 },
  { id: '4', title: '达人寄样清单确认', status: 'done', priority: 'low', tag: 'Ops', assignee: 'Lisa', dueDate: 'Yesterday', comments: 0 },
  { id: '5', title: '设计 618 大促海报', status: 'progress', priority: 'med', tag: 'Design', assignee: 'Eva', dueDate: 'In 2 days', comments: 2 },
];

export const TaskModule: React.FC = () => {
  const [tasks, setTasks] = usePersistence<Task[]>('AERO_TASKS_DATA', initialTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddInput, setShowAddInput] = useState<string | null>(null);

  // --- Statistics ---
  const stats = useMemo(() => {
      const total = tasks.length;
      const done = tasks.filter(t => t.status === 'done').length;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;
      const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
      return { total, done, progress, highPriority };
  }, [tasks]);

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- Handlers ---
  const addTask = (status: any) => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = { 
        id: Date.now().toString(), 
        title: newTaskTitle, 
        status, 
        priority: 'med', // Default
        tag: 'General', 
        assignee: 'Me', 
        dueDate: getToday(),
        comments: 0
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle(''); 
    setShowAddInput(null);
  };

  const deleteTask = (id: string) => {
      if(confirm('确认删除此任务？')) {
          setTasks(tasks.filter(t => t.id !== id));
      }
  };

  const updateStatus = (id: string, newStatus: 'todo'|'progress'|'done') => {
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const updatePriority = (id: string) => {
      const pMap: Record<string, 'high'|'med'|'low'> = { 'high': 'low', 'low': 'med', 'med': 'high' };
      setTasks(tasks.map(t => t.id === id ? { ...t, priority: pMap[t.priority] } : t));
  };

  // --- Sub-Components ---
  const KanbanCard: React.FC<{ task: Task }> = ({ task }) => {
      const priorityColors = {
          high: 'text-red-500 bg-red-500/10 border-red-500/20',
          med: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
          low: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      };

      return (
          <div className="group relative p-4 rounded-xl bg-[#121212] border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer shadow-lg hover:shadow-2xl overflow-hidden">
              {/* Left Highlight Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.status === 'done' ? 'bg-cyber-green' : task.priority === 'high' ? 'bg-red-500' : 'bg-transparent group-hover:bg-cyber-cyan'} transition-colors`}></div>

              <div className="flex justify-between items-start mb-3 pl-2">
                  <div className="flex gap-2">
                      <span 
                        onClick={(e) => { e.stopPropagation(); updatePriority(task.id); }}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider cursor-pointer hover:opacity-80 ${priorityColors[task.priority]}`}
                      >
                          {task.priority}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 text-gray-400 bg-white/5 uppercase tracking-wider">
                          {task.tag}
                      </span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {/* Move Controls */}
                      {task.status !== 'todo' && (
                          <button onClick={(e) => { e.stopPropagation(); updateStatus(task.id, 'todo'); }} className="p-1 text-gray-500 hover:text-white hover:bg-white/10 rounded"><ArrowLeft size={12}/></button>
                      )}
                      {task.status !== 'done' && (
                          <button onClick={(e) => { e.stopPropagation(); updateStatus(task.id, 'done'); }} className="p-1 text-gray-500 hover:text-white hover:bg-white/10 rounded"><ArrowRight size={12}/></button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded"><Trash2 size={12}/></button>
                  </div>
              </div>

              <h4 className={`text-sm font-bold text-white mb-4 pl-2 leading-relaxed ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
              </h4>

              <div className="flex justify-between items-center pl-2 pt-3 border-t border-white/5">
                  <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-black flex items-center justify-center text-[9px] font-bold text-white">
                          {task.assignee.charAt(0)}
                      </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 text-[10px] font-mono">
                      {task.comments > 0 && (
                          <span className="flex items-center gap-1"><MoreHorizontal size={10} /> {task.comments}</span>
                      )}
                      <span className={`flex items-center gap-1 ${task.status !== 'done' && task.priority === 'high' ? 'text-red-400 animate-pulse' : ''}`}>
                          <Clock size={10} /> {task.dueDate}
                      </span>
                  </div>
              </div>
          </div>
      );
  };

  const KanbanColumn: React.FC<{ status: 'todo'|'progress'|'done', title: string, color: string, icon: any, accent: string }> = ({ status, title, color, icon: Icon, accent }) => {
    const items = filteredTasks.filter(t => t.status === status);
    
    return (
        <div className="flex flex-col h-full min-w-[320px] w-full max-w-[400px] bg-black/20 backdrop-blur-sm rounded-2xl border border-white/5 relative group/col">
           {/* Header */}
           <div className={`p-4 flex justify-between items-center border-b border-white/5 bg-gradient-to-b ${color} rounded-t-2xl`}>
              <div className="flex items-center gap-3">
                 <div className={`p-1.5 rounded-lg bg-black/40 border border-white/10 ${accent}`}>
                    <Icon size={14} />
                 </div>
                 <div>
                     <span className="font-bold text-white text-sm tracking-wide block">{title}</span>
                     <span className="text-[9px] text-gray-400 font-mono">{items.length} TASKS</span>
                 </div>
              </div>
              <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setShowAddInput(status)} 
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  >
                      <Plus size={16} />
                  </button>
              </div>
           </div>
           
           {/* Tasks Area */}
           <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar relative">
              {/* Add Input */}
              {showAddInput === status && (
                 <div className="p-3 bg-[#1A1A1A] border border-cyber-cyan rounded-xl mb-2 animate-in fade-in zoom-in-95 duration-200 shadow-2xl relative z-10">
                    <input 
                      autoFocus
                      placeholder="Enter task title..."
                      className="w-full bg-transparent text-white text-sm outline-none font-medium placeholder-gray-600"
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTask(status)}
                      onBlur={() => { if(!newTaskTitle) setShowAddInput(null); }}
                    />
                    <div className="mt-2 text-[9px] text-cyber-cyan font-mono flex justify-end">PRESS ENTER</div>
                 </div>
              )}
    
              {items.map(task => (
                 <KanbanCard key={task.id} task={task} />
              ))}

              {/* Empty State */}
              {items.length === 0 && !showAddInput && (
                  <div className="h-32 flex flex-col items-center justify-center text-gray-700 border-2 border-dashed border-white/5 rounded-xl">
                      <ListTodo size={24} className="opacity-20 mb-2"/>
                      <span className="text-xs font-mono uppercase tracking-widest opacity-50">No Tasks</span>
                  </div>
              )}
           </div>
        </div>
      );
  }

  return (
    <div className="h-full flex flex-col px-6 pb-6 animate-in fade-in duration-500 overflow-hidden relative">
       
       {/* 1. Glass Header (Consistent with Dashboard) */}
       <div className="sticky top-0 z-30 bg-transparent backdrop-blur-2xl border-b border-white/10 pb-4 pt-6 -mx-6 px-6 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-end gap-4 transition-all">
          <div>
             <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3 text-glow">
                任务协同 <span className="px-2 py-0.5 rounded border border-cyber-yellow text-[10px] text-cyber-yellow font-mono tracking-widest bg-cyber-yellow/10">SPRINT_OS</span>
             </h1>
             <p className="text-gray-500 font-medium text-xs mt-1 flex items-center gap-2">
                <Zap size={12} className="text-cyber-yellow animate-pulse"/> 
                实时同步 • 冲刺进度: <span className="text-white font-bold">{stats.progress}%</span>
             </p>
          </div>
          
          <div className="flex gap-3 items-center">
             {/* Stats Pill */}
             <div className="hidden lg:flex items-center gap-4 bg-black/40 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md mr-2">
                 <div className="flex flex-col items-end">
                     <span className="text-[9px] text-gray-500 font-bold uppercase">Pending</span>
                     <span className="text-white font-bold font-mono leading-none">{stats.total - stats.done}</span>
                 </div>
                 <div className="w-[1px] h-6 bg-white/10"></div>
                 <div className="flex flex-col items-end">
                     <span className="text-[9px] text-red-500 font-bold uppercase">High Prio</span>
                     <span className="text-red-400 font-bold font-mono leading-none">{stats.highPriority}</span>
                 </div>
             </div>

             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyber-cyan transition-colors" size={16} />
                <input 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="检索任务..."
                  className="bg-black/40 border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white focus:border-cyber-cyan outline-none w-64 transition-all font-mono backdrop-blur-sm"
                />
             </div>
             
             <button 
                onClick={() => setShowAddInput('todo')}
                className="bg-white text-black px-4 py-2.5 rounded-xl font-black text-xs hover:bg-cyber-cyan transition-all flex items-center gap-2 shadow-lg uppercase tracking-wide"
             >
                <Plus size={16} /> New Task
             </button>
          </div>
       </div>

       {/* 2. Board Area */}
       <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
          <div className="h-full flex gap-6 min-w-[1000px]">
             <KanbanColumn 
                status="todo" 
                title="待办事项 (BACKLOG)" 
                color="from-pink-500/10 to-transparent" 
                accent="text-pink-500 border-pink-500/30"
                icon={Layout}
             />
             <KanbanColumn 
                status="progress" 
                title="进行中 (IN PROGRESS)" 
                color="from-yellow-500/10 to-transparent" 
                accent="text-yellow-500 border-yellow-500/30"
                icon={Zap}
             />
             <KanbanColumn 
                status="done" 
                title="已完成 (COMPLETED)" 
                color="from-cyber-green/10 to-transparent" 
                accent="text-cyber-green border-cyber-green/30"
                icon={CheckCircle2}
             />
          </div>
       </div>
    </div>
  );
};