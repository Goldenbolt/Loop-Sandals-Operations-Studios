import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Users, 
  AlertCircle, 
  ChevronRight, 
  LayoutDashboard,
  FileText,
  Presentation,
  Target,
  TrendingUp,
  Settings
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { EVENTS, PASSES, TEAM } from './constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'team'>('overview');

  // Calculate some stats
  const totalTasks = PASSES.reduce((acc, pass) => acc + pass.tasks.length, 0);
  const completedTasks = 0; // Based on OCR "Not Started"
  const progress = (completedTasks / totalTasks) * 100;

  const chartData = PASSES.map(pass => ({
    name: `Pass ${pass.id}`,
    completed: 0,
    total: pass.tasks.length,
    pending: pass.tasks.length
  }));

  const pieData = [
    { name: 'Not Started', value: totalTasks, color: '#141414' },
    { name: 'In Progress', value: 0, color: '#E4E3E0' },
    { name: 'Completed', value: 0, color: '#F27D26' },
  ];

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Sidebar / Navigation */}
      <div className="fixed left-0 top-0 h-full w-64 border-r border-[#141414] bg-[#E4E3E0] z-20 hidden md:block">
        <div className="p-8 border-bottom border-[#141414]">
          <h1 className="font-serif italic text-2xl tracking-tight">OpsFlow</h1>
          <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1 font-mono">Operations Dashboard v1.0</p>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200",
              activeTab === 'overview' ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#141414]/5"
            )}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200",
              activeTab === 'schedule' ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#141414]/5"
            )}
          >
            <Calendar size={18} />
            Schedule
          </button>
          <button 
            onClick={() => setActiveTab('team')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200",
              activeTab === 'team' ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#141414]/5"
            )}
          >
            <Users size={18} />
            Team
          </button>
        </nav>

        <div className="absolute bottom-8 left-8 right-8">
          <div className="p-4 border border-[#141414] bg-white/50">
            <p className="text-[10px] uppercase font-mono opacity-50 mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono">Live Monitoring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="md:ml-64 p-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest opacity-50 font-mono mb-2">
              <span>Business Operations</span>
              <ChevronRight size={12} />
              <span>{activeTab}</span>
            </div>
            <h2 className="text-5xl font-serif italic tracking-tight">
              {activeTab === 'overview' && "Strategic Overview"}
              {activeTab === 'schedule' && "Operational Timeline"}
              {activeTab === 'team' && "Resource Allocation"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] uppercase font-mono opacity-50">Current Cycle</p>
              <p className="text-sm font-medium">Q1 - Pass 1 Active</p>
            </div>
            <div className="w-12 h-12 border border-[#141414] flex items-center justify-center hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors cursor-pointer">
              <Settings size={20} />
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-[#141414] border border-[#141414]">
              <div className="bg-[#E4E3E0] p-6">
                <p className="text-[10px] uppercase font-mono opacity-50 mb-4">Total Deliverables</p>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-serif italic">{totalTasks}</span>
                  <FileText className="opacity-20" size={32} />
                </div>
              </div>
              <div className="bg-[#E4E3E0] p-6">
                <p className="text-[10px] uppercase font-mono opacity-50 mb-4">Completion Rate</p>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-serif italic">{progress}%</span>
                  <TrendingUp className="opacity-20" size={32} />
                </div>
              </div>
              <div className="bg-[#E4E3E0] p-6">
                <p className="text-[10px] uppercase font-mono opacity-50 mb-4">Upcoming Events</p>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-serif italic">3</span>
                  <Calendar className="opacity-20" size={32} />
                </div>
              </div>
              <div className="bg-[#E4E3E0] p-6">
                <p className="text-[10px] uppercase font-mono opacity-50 mb-4">Active Team</p>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-serif italic">{TEAM.length}</span>
                  <Users className="opacity-20" size={32} />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="border border-[#141414] p-8 bg-white/30">
                <h3 className="font-serif italic text-xl mb-6">Pass Progression</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#141414" opacity={0.1} vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={{ stroke: '#141414' }} 
                        tickLine={false}
                        tick={{ fontSize: 10, fontFamily: 'monospace' }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 10, fontFamily: 'monospace' }}
                      />
                      <Tooltip 
                        cursor={{ fill: '#141414', opacity: 0.05 }}
                        contentStyle={{ backgroundColor: '#E4E3E0', border: '1px solid #141414', borderRadius: 0 }}
                      />
                      <Bar dataKey="pending" fill="#141414" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="border border-[#141414] p-8 bg-white/30">
                <h3 className="font-serif italic text-xl mb-6">Task Distribution</h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-serif italic">{totalTasks}</span>
                    <span className="text-[8px] uppercase font-mono opacity-50">Total</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity / Critical Dates */}
            <div className="border border-[#141414]">
              <div className="p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0] flex justify-between items-center">
                <h3 className="font-serif italic text-lg">Critical Milestones</h3>
                <span className="text-[10px] uppercase font-mono tracking-widest">Priority View</span>
              </div>
              <div className="divide-y divide-[#141414]">
                {EVENTS.filter(e => e.type === 'important').map((event, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all group cursor-default">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 border border-[#141414] group-hover:border-[#E4E3E0] flex items-center justify-center">
                        <AlertCircle size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-[10px] uppercase font-mono opacity-50 group-hover:opacity-100">Milestone Event</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono">{event.date}</p>
                      <p className="text-[10px] uppercase font-mono opacity-50 group-hover:opacity-100">Deadline</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Events Timeline */}
            <div className="lg:col-span-2 space-y-8">
              <div className="border border-[#141414]">
                <div className="p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0]">
                  <h3 className="font-serif italic text-lg">Upcoming Events & Pop-ups</h3>
                </div>
                <div className="divide-y divide-[#141414]">
                  {EVENTS.filter(e => e.type === 'pending').map((event, i) => (
                    <div key={i} className="p-6 flex items-start justify-between hover:bg-white/50 transition-colors">
                      <div className="flex gap-6">
                        <div className="text-center min-w-[80px]">
                          <p className="text-2xl font-serif italic">{event.date.split(' ')[0]}</p>
                          <p className="text-[10px] uppercase font-mono opacity-50">{event.date.split(' ').slice(1).join(' ')}</p>
                        </div>
                        <div className="pt-1">
                          <h4 className="text-lg font-medium">{event.title}</h4>
                          <p className="text-xs opacity-60 mt-1">Pending confirmation and logistics setup.</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 border border-[#141414] text-[10px] uppercase font-mono">
                        Pending
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-[#141414]">
                <div className="p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0]">
                  <h3 className="font-serif italic text-lg">Individual Update Cycles</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#141414]">
                  {EVENTS.filter(e => e.type === 'update').map((event, i) => (
                    <div key={i} className="p-6 text-center hover:bg-white/50 transition-colors">
                      <Clock size={20} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-mono">{event.date}</p>
                      <p className="text-[10px] uppercase font-mono opacity-50 mt-1">Status Sync</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pass Tracking */}
            <div className="space-y-6">
              {PASSES.map((pass) => (
                <div key={pass.id} className="border border-[#141414] bg-white/30">
                  <div className="p-4 border-b border-[#141414] flex justify-between items-center">
                    <h4 className="font-serif italic text-lg">Pass {pass.id}</h4>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 border border-[#141414]">
                      {pass.id === 1 ? 'Active' : 'Upcoming'}
                    </span>
                  </div>
                  <div className="p-4 space-y-4">
                    {pass.tasks.map((task, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 border border-[#141414] flex items-center justify-center">
                          {task.status === 'Completed' && <CheckCircle2 size={12} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-baseline">
                            <p className="text-sm font-medium">{task.title}</p>
                            <span className="text-[10px] font-mono opacity-50">{task.date}</span>
                          </div>
                          <div className="w-full h-1 bg-[#141414]/10 mt-1">
                            <div className="h-full bg-[#141414]" style={{ width: task.status === 'Completed' ? '100%' : '0%' }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {TEAM.map((member, i) => (
                <div key={i} className="border border-[#141414] bg-white/30 group hover:bg-[#141414] hover:text-[#E4E3E0] transition-all duration-300">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 border border-[#141414] group-hover:border-[#E4E3E0] flex items-center justify-center">
                        <Users size={32} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-mono opacity-50 group-hover:opacity-100">Role</p>
                        <p className="text-sm font-medium">{member.role}</p>
                      </div>
                    </div>
                    <h3 className="text-3xl font-serif italic mb-4">{member.name}</h3>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-mono opacity-50 group-hover:opacity-100 mb-2">Primary Responsibilities</p>
                      {member.tasks.map((task, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm">
                          <ChevronRight size={14} className="opacity-30" />
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border-t border-[#141414] group-hover:border-[#E4E3E0] flex justify-between items-center">
                    <span className="text-[10px] uppercase font-mono">Availability</span>
                    <span className="text-[10px] font-mono">100%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Responsibility Matrix */}
            <div className="border border-[#141414]">
              <div className="p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0]">
                <h3 className="font-serif italic text-lg">Responsibility Matrix</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#141414]">
                      <th className="p-4 font-serif italic text-sm">Activity</th>
                      <th className="p-4 font-serif italic text-sm">Lead</th>
                      <th className="p-4 font-serif italic text-sm">Status</th>
                      <th className="p-4 font-serif italic text-sm">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141414]">
                    <tr className="hover:bg-white/50">
                      <td className="p-4 text-sm">Target Vs Achievement</td>
                      <td className="p-4 text-sm font-mono">Jeph</td>
                      <td className="p-4"><span className="text-[10px] uppercase font-mono px-2 py-0.5 border border-[#141414]">Pending</span></td>
                      <td className="p-4 text-sm">High</td>
                    </tr>
                    <tr className="hover:bg-white/50">
                      <td className="p-4 text-sm">Marketing Activities</td>
                      <td className="p-4 text-sm font-mono">Pia</td>
                      <td className="p-4"><span className="text-[10px] uppercase font-mono px-2 py-0.5 border border-[#141414]">Pending</span></td>
                      <td className="p-4 text-sm">Medium</td>
                    </tr>
                    <tr className="hover:bg-white/50">
                      <td className="p-4 text-sm">Operations & Finance</td>
                      <td className="p-4 text-sm font-mono">Carlo / Ashley</td>
                      <td className="p-4"><span className="text-[10px] uppercase font-mono px-2 py-0.5 border border-[#141414]">Pending</span></td>
                      <td className="p-4 text-sm">High</td>
                    </tr>
                    <tr className="hover:bg-white/50">
                      <td className="p-4 text-sm">Strategic Pivots</td>
                      <td className="p-4 text-sm font-mono">Kenri</td>
                      <td className="p-4"><span className="text-[10px] uppercase font-mono px-2 py-0.5 border border-[#141414]">Pending</span></td>
                      <td className="p-4 text-sm">Low</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Nav Overlay */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#E4E3E0] border-t border-[#141414] flex justify-around p-4 z-30">
        <button onClick={() => setActiveTab('overview')} className={cn("p-2", activeTab === 'overview' && "bg-[#141414] text-[#E4E3E0]")}>
          <LayoutDashboard size={20} />
        </button>
        <button onClick={() => setActiveTab('schedule')} className={cn("p-2", activeTab === 'schedule' && "bg-[#141414] text-[#E4E3E0]")}>
          <Calendar size={20} />
        </button>
        <button onClick={() => setActiveTab('team')} className={cn("p-2", activeTab === 'team' && "bg-[#141414] text-[#E4E3E0]")}>
          <Users size={20} />
        </button>
      </div>
    </div>
  );
}
