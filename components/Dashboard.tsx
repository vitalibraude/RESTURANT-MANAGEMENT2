
import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { TrendingUp, Users, ShoppingCart, AlertTriangle } from 'lucide-react';
import { getFinancialInsights } from '../services/geminiService';

const data = [
  { name: 'א\'', sales: 4000, profit: 2400 },
  { name: 'ב\'', sales: 3000, profit: 1398 },
  { name: 'ג\'', sales: 2000, profit: 9800 },
  { name: 'ד\'', sales: 2780, profit: 3908 },
  { name: 'ה\'', sales: 1890, profit: 4800 },
  { name: 'ו\'', sales: 2390, profit: 3800 },
  { name: 'ש\'', sales: 3490, profit: 4300 },
];

const Dashboard: React.FC = () => {
  const [insight, setInsight] = useState<string>("מנתח נתונים...");

  useEffect(() => {
    const fetchInsight = async () => {
      const res = await getFinancialInsights(12400, 8200);
      setInsight(res);
    };
    fetchInsight();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">שלום, מנהל! 👋</h1>
          <p className="text-slate-500">הנה סקירה של מה שקורה היום במסעדה.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-slate-600">שידור חי מהמסעדה</span>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={TrendingUp} label="מכירות היום" value="₪4,250" delta="+12%" color="bg-blue-50 text-blue-600" />
        <StatCard icon={Users} label="לקוחות" value="128" delta="+5%" color="bg-purple-50 text-purple-600" />
        <StatCard icon={ShoppingCart} label="הזמנות פעילות" value="12" delta="" color="bg-orange-50 text-orange-600" />
        <StatCard icon={AlertTriangle} label="מלאי נמוך" value="3 פריטים" delta="דחוף" color="bg-red-50 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800">ביצועי שבוע אחרון</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-xl text-white flex flex-col justify-between">
          <div>
            <div className="bg-orange-500/20 text-orange-400 w-fit px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
              תובנה חכמה
            </div>
            <h3 className="text-xl font-bold mb-4">סיכום פיננסי אוטומטי</h3>
            <p className="text-slate-300 leading-relaxed italic">
              "{insight}"
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">רווח נקי משוער</span>
              <span className="text-green-400 font-bold text-lg">₪4,200</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: any;
  label: string;
  value: string;
  delta: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, delta, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
    <div className={`p-4 rounded-xl ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
        {delta && <span className="text-xs font-bold text-green-500">{delta}</span>}
      </div>
    </div>
  </div>
);

export default Dashboard;
