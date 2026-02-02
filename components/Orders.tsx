
import React, { useState } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface MenuItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  items: MenuItem[];
  total: number;
  time: string;
  status: 'completed' | 'active';
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 101,
    customerName: 'דוד כהן',
    items: [
      { name: 'שניצל', quantity: 2, price: 50 },
      { name: 'סלט ירקות', quantity: 1, price: 25 },
      { name: 'קוקה קולה', quantity: 2, price: 12 }
    ],
    total: 149,
    time: '14:30',
    status: 'completed'
  },
  {
    id: '2',
    orderNumber: 102,
    customerName: 'שרה לוי',
    items: [
      { name: 'פסטה ברוטב עגבניות', quantity: 1, price: 55 },
      { name: 'מרק בצל', quantity: 1, price: 22 },
      { name: 'מיץ תפוזים', quantity: 1, price: 15 }
    ],
    total: 92,
    time: '15:15',
    status: 'completed'
  },
  {
    id: '3',
    orderNumber: 103,
    customerName: 'משה ישראלי',
    items: [
      { name: 'סטייק אנטריקוט', quantity: 2, price: 120 },
      { name: 'תפוח אדמה אפוי', quantity: 2, price: 18 },
      { name: 'סלט קיסר', quantity: 2, price: 32 },
      { name: 'יין אדום', quantity: 1, price: 80 }
    ],
    total: 420,
    time: '16:00',
    status: 'completed'
  },
  {
    id: '4',
    orderNumber: 104,
    customerName: 'רחל אברהם',
    items: [
      { name: 'המבורגר', quantity: 2, price: 48 },
      { name: 'צ\'יפס', quantity: 2, price: 20 },
      { name: 'בירה', quantity: 2, price: 24 }
    ],
    total: 160,
    time: '17:45',
    status: 'completed'
  },
  {
    id: '5',
    orderNumber: 105,
    customerName: 'יוסף מזרחי',
    items: [
      { name: 'פיצה משפחתית', quantity: 1, price: 65 },
      { name: 'מנה ילדים', quantity: 2, price: 30 },
      { name: 'לימונדה', quantity: 3, price: 12 }
    ],
    total: 161,
    time: '18:20',
    status: 'active'
  },
  {
    id: '6',
    orderNumber: 106,
    customerName: 'מירי גולן',
    items: [
      { name: 'פילה דג', quantity: 2, price: 85 },
      { name: 'ראשונה גזפצ\'ו', quantity: 2, price: 28 },
      { name: 'תוספות', quantity: 2, price: 15 },
      { name: 'קינוח שוקולד', quantity: 2, price: 35 },
      { name: 'קפה', quantity: 2, price: 12 }
    ],
    total: 350,
    time: '19:10',
    status: 'active'
  },
];

const Orders: React.FC = () => {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrder = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const activeOrders = mockOrders.filter(o => o.status === 'active').length;
  const completedOrders = mockOrders.filter(o => o.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">הזמנות ומכירות</h2>
          <p className="text-sm md:text-base text-slate-500">צפייה והנהלה של הזמנות לקוחות.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <SummaryCard label="סה״כ מכירות" value={`₪${totalRevenue.toLocaleString()}`} color="text-green-600" />
        <SummaryCard label="הזמנות פעילות" value={activeOrders.toString()} color="text-orange-600" />
        <SummaryCard label="הזמנות שהושלמו" value={completedOrders.toString()} color="text-blue-600" />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-slate-600" />
            <h3 className="font-bold text-slate-800">הזמנות היום</h3>
          </div>
          <span className="text-sm text-slate-500">{mockOrders.length} הזמנות</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-3 md:p-4 font-semibold w-12"></th>
                <th className="p-3 md:p-4 font-semibold">מס׳ הזמנה</th>
                <th className="p-3 md:p-4 font-semibold">שם לקוח</th>
                <th className="p-3 md:p-4 font-semibold">סה״כ</th>
                <th className="p-3 md:p-4 font-semibold">שעה</th>
                <th className="p-3 md:p-4 font-semibold">סטטוס</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockOrders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                return (
                  <React.Fragment key={order.id}>
                    {/* Main Row */}
                    <tr 
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => toggleOrder(order.id)}
                    >
                      <td className="p-3 md:p-4">
                        {isExpanded ? (
                          <ChevronUp size={18} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={18} className="text-slate-400" />
                        )}
                      </td>
                      <td className="p-3 md:p-4">
                        <span className="font-mono font-bold text-orange-600">#{order.orderNumber}</span>
                      </td>
                      <td className="p-3 md:p-4 font-medium text-slate-800">{order.customerName}</td>
                      <td className="p-3 md:p-4 font-bold text-slate-800">₪{order.total.toLocaleString()}</td>
                      <td className="p-3 md:p-4 text-slate-600 flex items-center gap-1">
                        <Clock size={14} />
                        <span>{order.time}</span>
                      </td>
                      <td className="p-3 md:p-4">
                        {order.status === 'active' ? (
                          <span className="text-orange-600 text-xs font-bold bg-orange-50 px-2 py-1 rounded-full">
                            פעיל
                          </span>
                        ) : (
                          <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                            הושלם
                          </span>
                        )}
                      </td>
                    </tr>
                    
                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr className="bg-slate-50/30">
                        <td colSpan={6} className="p-0">
                          <div className="p-4 md:p-6 pr-12 md:pr-16">
                            <h4 className="text-sm font-bold text-slate-700 mb-3">פירוט המנות:</h4>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
                                  <div className="flex items-center gap-3">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                                      x{item.quantity}
                                    </span>
                                    <span className="text-slate-800 font-medium">{item.name}</span>
                                  </div>
                                  <span className="text-slate-600 font-mono">₪{(item.quantity * item.price).toLocaleString()}</span>
                                </div>
                              ))}
                              <div className="flex justify-between items-center bg-slate-900 text-white p-3 rounded-lg font-bold mt-3">
                                <span>סה״כ</span>
                                <span className="font-mono">₪{order.total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  label: string;
  value: string;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, color }) => (
  <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
    <p className="text-xs md:text-sm text-slate-500 font-medium mb-1">{label}</p>
    <h4 className={`text-lg md:text-2xl font-bold ${color}`}>{value}</h4>
  </div>
);

export default Orders;
