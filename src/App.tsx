import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  Users, 
  AlertCircle, 
  ChevronRight, 
  LayoutDashboard,
  FileText,
  TrendingUp,
  Settings,
  DollarSign,
  ShoppingCart,
  Share2,
  Plus,
  Play,
  Square,
  ArrowRightLeft,
  Save,
  Trash2
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
  Pie,
  LineChart,
  Line
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AppData, FinanceEntry, SocialPost, SalesSession, Product, TeamMember, Event, Task } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'overview' | 'finance' | 'ledger' | 'calendar' | 'social' | 'sales' | 'admin';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<SalesSession | null>(null);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [selectedMember, setSelectedMember] = useState<number>(1);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      const json = await res.json();
      setData(json);
      if (json.activeSessions.length > 0) {
        setActiveSession(json.activeSessions[0]);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Finance Actions
  const addFinance = async (entry: Partial<FinanceEntry>) => {
    await fetch('/api/finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    fetchData();
  };

  // Social Actions
  const addSocial = async (post: Partial<SocialPost>) => {
    await fetch('/api/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    fetchData();
  };

  // Sales Actions
  const startSession = async () => {
    const res = await fetch('/api/sales/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id: selectedMember }),
    });
    const json = await res.json();
    setActiveSession({ id: json.id, member_id: selectedMember, start_time: new Date().toISOString(), sales_closed: 0, total_revenue: 0 });
    fetchData();
  };

  const endSession = async (sales: number, revenue: number) => {
    if (!activeSession) return;
    await fetch('/api/sales/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: activeSession.id, sales_closed: sales, total_revenue: revenue }),
    });
    setActiveSession(null);
    fetchData();
  };

  // POS Actions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const checkout = async () => {
    const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    await fetch('/api/pos/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart.map(i => i.product), total, member_id: selectedMember }),
    });
    setCart([]);
    alert('Transaction Complete');
    fetchData();
  };

  // Admin Actions
  const updateData = async (table: string, id: number, data: any) => {
    await fetch('/api/admin/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, id, data }),
    });
    fetchData();
  };

  const deleteData = async (table: string, id: number) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    await fetch('/api/admin/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, id }),
    });
    fetchData();
  };

  const addData = async (table: string, data: any) => {
    await fetch('/api/admin/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, data }),
    });
    fetchData();
  };

  // Ledger Rebalancing Logic
  const ledgerBalances = useMemo(() => {
    if (!data) return [];
    const balances: Record<number, { name: string; spent: number; sales: number; net: number }> = {};
    
    data.team.forEach(m => {
      balances[m.id] = { name: m.name, spent: 0, sales: 0, net: 0 };
    });

    data.finance.forEach(f => {
      if (f.member_id && balances[f.member_id]) {
        if (f.type === 'expense') balances[f.member_id].spent += f.amount;
        if (f.type === 'revenue') balances[f.member_id].sales += f.amount;
      }
    });

    const totalSpent = Object.values(balances).reduce((acc, b) => acc + b.spent, 0);
    const sharePerPerson = totalSpent / data.team.length;

    return Object.values(balances).map(b => ({
      ...b,
      due: sharePerPerson - b.spent, // Positive means they owe, negative means they are owed
    }));
  }, [data]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#141414] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="font-mono text-xs uppercase tracking-widest">Initializing OpsFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 border-r border-[#141414] bg-[#E4E3E0] z-20 hidden md:block">
        <div className="p-8 border-b border-[#141414]">
          <h1 className="font-serif italic text-2xl tracking-tight">OpsFlow</h1>
          <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1 font-mono">Enterprise Dashboard</p>
        </div>
        
        <nav className="mt-8 px-4 space-y-1">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'finance', icon: DollarSign, label: 'Finance' },
            { id: 'ledger', icon: ArrowRightLeft, label: 'Ledger' },
            { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
            { id: 'social', icon: Share2, label: 'Social' },
            { id: 'sales', icon: ShoppingCart, label: 'Sales & POS' },
            { id: 'admin', icon: Settings, label: 'Admin' },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200",
                activeTab === item.id ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#141414]/5"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="md:ml-64 p-8 pb-24 md:pb-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest opacity-50 font-mono mb-2">
              <span>Business Operations</span>
              <ChevronRight size={12} />
              <span>{activeTab}</span>
            </div>
            <h2 className="text-5xl font-serif italic tracking-tight capitalize">
              {activeTab}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={selectedMember} 
              onChange={(e) => setSelectedMember(Number(e.target.value))}
              className="bg-transparent border border-[#141414] px-3 py-2 text-xs font-mono"
            >
              {data.team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-[#141414] border border-[#141414]">
              <div className="bg-[#E4E3E0] p-6">
                <p className="text-[10px] uppercase font-mono opacity-50 mb-4">Total Revenue</p>
                <span className="text-4xl font-serif italic">₱{data.finance.filter(f => f.type === 'revenue').reduce((acc, f) => acc + f.amount, 0).toLocaleString()}</span>
              </div>
              <div className="bg-[#E4E3E0] p-6">
                <p className="text-[10px] uppercase font-mono opacity-50 mb-4">Total Expenses</p>
                <span className="text-4xl font-serif italic">₱{data.finance.filter(f => f.type === 'expense').reduce((acc, f) => acc + f.amount, 0).toLocaleString()}</span>
              </div>
              <div className="bg-[#E4E3E0] p-6">
                <p className="text-[10px] uppercase font-mono opacity-50 mb-4">Net Profit</p>
                <span className="text-4xl font-serif italic">₱{(data.finance.filter(f => f.type === 'revenue').reduce((acc, f) => acc + f.amount, 0) - data.finance.filter(f => f.type === 'expense').reduce((acc, f) => acc + f.amount, 0)).toLocaleString()}</span>
              </div>
              <div className="bg-[#E4E3E0] p-6">
                <p className="text-[10px] uppercase font-mono opacity-50 mb-4">Active Tasks</p>
                <span className="text-4xl font-serif italic">{data.tasks.filter(t => t.status !== 'Completed').length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="border border-[#141414] p-8 bg-white/30">
                <h3 className="font-serif italic text-xl mb-6">Financial Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.finance.slice(-10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#141414" opacity={0.1} vertical={false} />
                      <XAxis dataKey="date" hide />
                      <YAxis tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#E4E3E0', border: '1px solid #141414', borderRadius: 0 }} />
                      <Line type="monotone" dataKey="amount" stroke="#141414" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="border border-[#141414] p-8 bg-white/30">
                <h3 className="font-serif italic text-xl mb-6">Upcoming Milestones</h3>
                <div className="space-y-4">
                  {data.events.filter(e => e.type === 'important').slice(0, 3).map((e, i) => (
                    <div key={i} className="flex justify-between items-center p-4 border border-[#141414]/10 bg-white/50">
                      <div>
                        <p className="text-sm font-medium">{e.title}</p>
                        <p className="text-[10px] font-mono opacity-50 uppercase">{e.type}</p>
                      </div>
                      <span className="text-xs font-mono">{e.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 border border-[#141414] p-8 bg-white/30">
                <h3 className="font-serif italic text-xl mb-6">Add Entry</h3>
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  addFinance({
                    type: formData.get('type') as 'revenue' | 'expense',
                    amount: Number(formData.get('amount')),
                    description: formData.get('description') as string,
                    member_id: selectedMember
                  });
                  form.reset();
                }}>
                  <div>
                    <label className="text-[10px] uppercase font-mono opacity-50">Type</label>
                    <select name="type" className="w-full bg-transparent border border-[#141414] p-2 text-sm">
                      <option value="revenue">Revenue</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono opacity-50">Amount (₱)</label>
                    <input name="amount" type="number" step="0.01" required className="w-full bg-transparent border border-[#141414] p-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono opacity-50">Description</label>
                    <textarea name="description" required className="w-full bg-transparent border border-[#141414] p-2 text-sm h-24" />
                  </div>
                  <button type="submit" className="w-full bg-[#141414] text-[#E4E3E0] py-3 text-sm font-medium hover:bg-[#141414]/90 transition-all">
                    Record Transaction
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 border border-[#141414]">
                <div className="p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0] flex justify-between">
                  <h3 className="font-serif italic text-lg">Transaction History</h3>
                  <span className="text-[10px] uppercase font-mono">Recent 50</span>
                </div>
                <div className="overflow-y-auto max-h-[600px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#E4E3E0] z-10">
                      <tr className="border-b border-[#141414]">
                        <th className="p-4 font-serif italic text-sm">Date</th>
                        <th className="p-4 font-serif italic text-sm">Member</th>
                        <th className="p-4 font-serif italic text-sm">Description</th>
                        <th className="p-4 font-serif italic text-sm text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141414]">
                      {data.finance.slice().reverse().map((f, i) => (
                        <tr key={i} className="hover:bg-white/50">
                          <td className="p-4 text-[10px] font-mono">{new Date(f.date).toLocaleDateString()}</td>
                          <td className="p-4 text-sm">{f.member_name}</td>
                          <td className="p-4 text-sm">{f.description}</td>
                          <td className={cn("p-4 text-sm font-mono text-right", f.type === 'revenue' ? "text-emerald-600" : "text-rose-600")}>
                            {f.type === 'revenue' ? '+' : '-'}₱{f.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="space-y-8">
            <div className="border border-[#141414]">
              <div className="p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0]">
                <h3 className="font-serif italic text-lg">Member Ledger & Rebalancing</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#141414]">
                      <th className="p-4 font-serif italic text-sm">Member</th>
                      <th className="p-4 font-serif italic text-sm text-right">Personal Expenses</th>
                      <th className="p-4 font-serif italic text-sm text-right">Personal Sales</th>
                      <th className="p-4 font-serif italic text-sm text-right">Net Contribution</th>
                      <th className="p-4 font-serif italic text-sm text-right">Rebalance Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141414]">
                    {ledgerBalances.map((b, i) => (
                      <tr key={i} className="hover:bg-white/50">
                        <td className="p-4 text-sm font-medium">{b.name}</td>
                        <td className="p-4 text-sm font-mono text-right">₱{b.spent.toLocaleString()}</td>
                        <td className="p-4 text-sm font-mono text-right">₱{b.sales.toLocaleString()}</td>
                        <td className="p-4 text-sm font-mono text-right">₱{(b.sales - b.spent).toLocaleString()}</td>
                        <td className={cn("p-4 text-sm font-mono text-right", b.due > 0 ? "text-rose-600" : "text-emerald-600")}>
                          {b.due > 0 ? `Owes ₱${b.due.toLocaleString()}` : `Due ₱${Math.abs(b.due).toLocaleString()}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-6 border border-[#141414] bg-white/50">
              <p className="text-xs font-mono opacity-60 leading-relaxed">
                * Rebalancing is calculated by splitting total business expenses equally among all team members. 
                "Owes" indicates the member needs to contribute more to the shared pool. 
                "Due" indicates the member is owed a reimbursement for over-contribution.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-8">
            <div className="border border-[#141414] bg-white/30 p-8">
              <h3 className="font-serif italic text-xl mb-8">Deliverables Calendar</h3>
              <div className="grid grid-cols-7 gap-px bg-[#141414] border border-[#141414]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="bg-[#141414] text-[#E4E3E0] p-2 text-center text-[10px] uppercase font-mono">{d}</div>
                ))}
                {/* Simplified Calendar Grid for Demo */}
                {Array.from({ length: 31 }).map((_, i) => {
                  const day = i + 1;
                  const dayTasks = data.tasks.filter(t => t.date.includes(`${day}`));
                  return (
                    <div key={i} className="bg-[#E4E3E0] min-h-[120px] p-2 border-b border-r border-[#141414]/10">
                      <span className="text-[10px] font-mono opacity-30">{day}</span>
                      <div className="mt-2 space-y-1">
                        {dayTasks.map((t, j) => (
                          <div key={j} className="text-[9px] p-1 bg-[#141414] text-[#E4E3E0] truncate">
                            {t.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 border border-[#141414] p-8 bg-white/30">
                <h3 className="font-serif italic text-xl mb-6">Schedule Post</h3>
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  addSocial({
                    post_date: formData.get('date') as string,
                    content: formData.get('content') as string,
                    platform: formData.get('platform') as string,
                    assignee_id: selectedMember
                  });
                  form.reset();
                }}>
                  <div>
                    <label className="text-[10px] uppercase font-mono opacity-50">Date</label>
                    <input name="date" type="date" required className="w-full bg-transparent border border-[#141414] p-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono opacity-50">Platform</label>
                    <select name="platform" className="w-full bg-transparent border border-[#141414] p-2 text-sm">
                      <option>Instagram</option>
                      <option>TikTok</option>
                      <option>Facebook</option>
                      <option>X / Twitter</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono opacity-50">Content / Caption</label>
                    <textarea name="content" required className="w-full bg-transparent border border-[#141414] p-2 text-sm h-32" />
                  </div>
                  <button type="submit" className="w-full bg-[#141414] text-[#E4E3E0] py-3 text-sm font-medium hover:bg-[#141414]/90 transition-all">
                    Schedule Post
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 border border-[#141414]">
                <div className="p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0]">
                  <h3 className="font-serif italic text-lg">Content Calendar</h3>
                </div>
                <div className="divide-y divide-[#141414]">
                  {data.socialPosts.map((post, i) => (
                    <div key={i} className="p-6 flex items-start justify-between hover:bg-white/50 transition-colors">
                      <div className="flex gap-6">
                        <div className="text-center min-w-[60px]">
                          <p className="text-xl font-serif italic">{new Date(post.post_date).getDate()}</p>
                          <p className="text-[8px] uppercase font-mono opacity-50">{new Date(post.post_date).toLocaleString('default', { month: 'short' })}</p>
                        </div>
                        <div>
                          <p className="text-xs font-mono uppercase opacity-50 mb-1">{post.platform}</p>
                          <p className="text-sm font-medium line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-4 h-4 rounded-full bg-[#141414] flex items-center justify-center text-[8px] text-[#E4E3E0]">
                              {post.assignee_name?.[0]}
                            </div>
                            <span className="text-[10px] font-mono opacity-60">Assigned to {post.assignee_name}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 border border-[#141414]">{post.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Session Tracker */}
              <div className="border border-[#141414] p-8 bg-white/30">
                <h3 className="font-serif italic text-xl mb-6">Sales Session</h3>
                {!activeSession ? (
                  <div className="text-center py-12 border-2 border-dashed border-[#141414]/20">
                    <p className="text-sm opacity-50 mb-6">No active session for {data.team.find(m => m.id === selectedMember)?.name}</p>
                    <button 
                      onClick={startSession}
                      className="inline-flex items-center gap-2 bg-[#141414] text-[#E4E3E0] px-8 py-3 text-sm font-medium hover:bg-[#141414]/90 transition-all"
                    >
                      <Play size={16} /> Start Session
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center p-6 bg-[#141414] text-[#E4E3E0]">
                      <div>
                        <p className="text-[10px] uppercase font-mono opacity-50">Active Since</p>
                        <p className="text-xl font-mono">{new Date(activeSession.start_time).toLocaleTimeString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-mono opacity-50">Sales Closed</p>
                        <p className="text-3xl font-serif italic">{activeSession.sales_closed}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="border border-[#141414] py-3 text-sm font-medium hover:bg-[#141414] hover:text-[#E4E3E0] transition-all">
                        Log Sale
                      </button>
                      <button 
                        onClick={() => endSession(activeSession.sales_closed, activeSession.total_revenue)}
                        className="bg-rose-600 text-white py-3 text-sm font-medium hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Square size={14} /> End Session
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* POS System */}
              <div className="border border-[#141414] flex flex-col h-[600px]">
                <div className="p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0]">
                  <h3 className="font-serif italic text-lg">Embedded POS</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4">
                  {data.products.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="p-4 border border-[#141414] text-left hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"
                    >
                      <p className="text-xs font-mono opacity-50 uppercase">{p.category}</p>
                      <p className="text-sm font-medium mt-1">{p.name}</p>
                      <p className="text-lg font-serif italic mt-2">₱{p.price.toLocaleString()}</p>
                    </button>
                  ))}
                </div>
                <div className="p-6 border-t border-[#141414] bg-white/50">
                  <div className="space-y-2 mb-6">
                    {cart.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span className="font-mono">₱{(item.product.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    {cart.length === 0 && <p className="text-center text-xs opacity-30 py-4 italic">Cart is empty</p>}
                  </div>
                  <div className="flex justify-between items-end border-t border-[#141414] pt-4 mb-6">
                    <span className="text-[10px] uppercase font-mono">Total Amount</span>
                    <span className="text-3xl font-serif italic">₱{cart.reduce((acc, i) => acc + i.product.price * i.quantity, 0).toLocaleString()}</span>
                  </div>
                  <button 
                    disabled={cart.length === 0}
                    onClick={checkout}
                    className="w-full bg-[#141414] text-[#E4E3E0] py-4 text-sm font-medium disabled:opacity-20"
                  >
                    Complete Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="space-y-8">
            <div className="border border-[#141414]">
              <div className="p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0] flex justify-between items-center">
                <h3 className="font-serif italic text-lg">System Data Management</h3>
              </div>
              <div className="p-8 space-y-12">
                {/* Events Admin */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-serif italic text-xl">Events & Milestones</h4>
                    <button 
                      onClick={() => addData('events', { date: 'New Date', title: 'New Event', type: 'pending' })}
                      className="inline-flex items-center gap-2 text-[10px] uppercase font-mono border border-[#141414] px-3 py-1 hover:bg-[#141414] hover:text-[#E4E3E0]"
                    >
                      <Plus size={12} /> Add Event
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#141414]">
                          <th className="p-2 text-[10px] uppercase font-mono opacity-50">Date</th>
                          <th className="p-2 text-[10px] uppercase font-mono opacity-50">Title</th>
                          <th className="p-2 text-[10px] uppercase font-mono opacity-50">Type</th>
                          <th className="p-2 text-[10px] uppercase font-mono opacity-50">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#141414]/10">
                        {data.events.map(e => (
                          <tr key={e.id}>
                            <td className="p-2">
                              <input 
                                defaultValue={e.date} 
                                onBlur={(ev) => updateData('events', e.id, { date: ev.target.value })}
                                className="bg-transparent border-none w-full text-sm focus:ring-0" 
                              />
                            </td>
                            <td className="p-2">
                              <input 
                                defaultValue={e.title} 
                                onBlur={(ev) => updateData('events', e.id, { title: ev.target.value })}
                                className="bg-transparent border-none w-full text-sm focus:ring-0" 
                              />
                            </td>
                            <td className="p-2">
                              <select 
                                defaultValue={e.type} 
                                onChange={(ev) => updateData('events', e.id, { type: ev.target.value })}
                                className="bg-transparent border-none text-sm focus:ring-0"
                              >
                                <option>pending</option>
                                <option>important</option>
                                <option>update</option>
                              </select>
                            </td>
                            <td className="p-2 flex gap-2">
                              <button 
                                onClick={() => deleteData('events', e.id)}
                                className="p-1 hover:text-rose-600"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Products Admin */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-serif italic text-xl">Product Catalog</h4>
                    <button 
                      onClick={() => addData('products', { name: 'New Product', price: 0, category: 'General' })}
                      className="inline-flex items-center gap-2 text-[10px] uppercase font-mono border border-[#141414] px-3 py-1 hover:bg-[#141414] hover:text-[#E4E3E0]"
                    >
                      <Plus size={12} /> Add Product
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#141414]">
                          <th className="p-2 text-[10px] uppercase font-mono opacity-50">Name</th>
                          <th className="p-2 text-[10px] uppercase font-mono opacity-50">Price</th>
                          <th className="p-2 text-[10px] uppercase font-mono opacity-50">Category</th>
                          <th className="p-2 text-[10px] uppercase font-mono opacity-50">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#141414]/10">
                        {data.products.map(p => (
                          <tr key={p.id}>
                            <td className="p-2">
                              <input 
                                defaultValue={p.name} 
                                onBlur={(ev) => updateData('products', p.id, { name: ev.target.value })}
                                className="bg-transparent border-none w-full text-sm focus:ring-0" 
                              />
                            </td>
                            <td className="p-2">
                              <input 
                                type="number"
                                defaultValue={p.price} 
                                onBlur={(ev) => updateData('products', p.id, { price: parseFloat(ev.target.value) })}
                                className="bg-transparent border-none w-full text-sm focus:ring-0 font-mono" 
                              />
                            </td>
                            <td className="p-2">
                              <input 
                                defaultValue={p.category} 
                                onBlur={(ev) => updateData('products', p.id, { category: ev.target.value })}
                                className="bg-transparent border-none w-full text-sm focus:ring-0" 
                              />
                            </td>
                            <td className="p-2">
                              <button 
                                onClick={() => deleteData('products', p.id)}
                                className="p-1 hover:text-rose-600"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Team Admin */}
                <div className="mb-12">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-serif italic text-xl">Team Roster</h4>
                    <button 
                      onClick={() => addData('team', { name: 'New Member', role: 'Member' })}
                      className="inline-flex items-center gap-2 text-[10px] uppercase font-mono border border-[#141414] px-3 py-1 hover:bg-[#141414] hover:text-[#E4E3E0]"
                    >
                      <Plus size={12} /> Add Member
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.team.map(m => (
                      <div key={m.id} className="p-4 border border-[#141414] space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <input 
                              defaultValue={m.name}
                              onBlur={(ev) => updateData('team', m.id, { name: ev.target.value })}
                              className="text-sm font-medium bg-transparent border-none p-0 w-full focus:ring-0"
                            />
                            <input 
                              defaultValue={m.role}
                              onBlur={(ev) => updateData('team', m.id, { role: ev.target.value })}
                              className="text-[10px] font-mono opacity-50 uppercase bg-transparent border-none p-0 w-full focus:ring-0"
                            />
                          </div>
                          <button 
                            onClick={() => deleteData('team', m.id)}
                            className="p-1 hover:text-rose-600"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Posts Admin */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-serif italic text-xl">Social Media Schedule</h4>
                    <button 
                      onClick={() => addData('social_posts', { post_date: new Date().toISOString().split('T')[0], content: 'New Post', platform: 'Instagram', assignee_id: data.team[0]?.id })}
                      className="inline-flex items-center gap-2 text-[10px] uppercase font-mono border border-[#141414] px-3 py-1 hover:bg-[#141414] hover:text-[#E4E3E0]"
                    >
                      <Plus size={12} /> Add Post
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#141414]">
                          <th className="p-2 text-[10px] uppercase font-mono opacity-50">Date</th>
                          <th className="p-2 text-[10px] uppercase font-mono opacity-50">Platform</th>
                          <th className="p-2 text-[10px] uppercase font-mono opacity-50">Content</th>
                          <th className="p-2 text-[10px] uppercase font-mono opacity-50">Assignee</th>
                          <th className="p-2 text-[10px] uppercase font-mono opacity-50">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#141414]/10">
                        {data.socialPosts.map(s => (
                          <tr key={s.id}>
                            <td className="p-2">
                              <input 
                                type="date"
                                defaultValue={s.post_date} 
                                onBlur={(ev) => updateData('social_posts', s.id, { post_date: ev.target.value })}
                                className="bg-transparent border-none w-full text-sm focus:ring-0" 
                              />
                            </td>
                            <td className="p-2">
                              <select 
                                defaultValue={s.platform} 
                                onChange={(ev) => updateData('social_posts', s.id, { platform: ev.target.value })}
                                className="bg-transparent border-none text-sm focus:ring-0"
                              >
                                <option>Instagram</option>
                                <option>Facebook</option>
                                <option>TikTok</option>
                                <option>Twitter</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <input 
                                defaultValue={s.content} 
                                onBlur={(ev) => updateData('social_posts', s.id, { content: ev.target.value })}
                                className="bg-transparent border-none w-full text-sm focus:ring-0" 
                              />
                            </td>
                            <td className="p-2">
                              <select 
                                defaultValue={s.assignee_id || ''} 
                                onChange={(ev) => updateData('social_posts', s.id, { assignee_id: parseInt(ev.target.value) })}
                                className="bg-transparent border-none text-sm focus:ring-0"
                              >
                                <option value="">Unassigned</option>
                                {data.team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                              </select>
                            </td>
                            <td className="p-2">
                              <button 
                                onClick={() => deleteData('social_posts', s.id)}
                                className="p-1 hover:text-rose-600"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#E4E3E0] border-t border-[#141414] flex justify-around p-4 z-30">
        <button onClick={() => setActiveTab('overview')} className={cn("p-2", activeTab === 'overview' && "bg-[#141414] text-[#E4E3E0]")}>
          <LayoutDashboard size={20} />
        </button>
        <button onClick={() => setActiveTab('finance')} className={cn("p-2", activeTab === 'finance' && "bg-[#141414] text-[#E4E3E0]")}>
          <DollarSign size={20} />
        </button>
        <button onClick={() => setActiveTab('sales')} className={cn("p-2", activeTab === 'sales' && "bg-[#141414] text-[#E4E3E0]")}>
          <ShoppingCart size={20} />
        </button>
        <button onClick={() => setActiveTab('admin')} className={cn("p-2", activeTab === 'admin' && "bg-[#141414] text-[#E4E3E0]")}>
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
}
