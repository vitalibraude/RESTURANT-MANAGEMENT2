
import React, { useState } from 'react';
import { Package, Plus, AlertCircle, Search } from 'lucide-react';
import { InventoryItem } from '../types';

type OrderMode = 'manual' | 'semi-auto' | 'full-auto';

interface ExtendedInventoryItem extends InventoryItem {
  orderMode: OrderMode;
}

const mockInventory: ExtendedInventoryItem[] = [
  { id: '1', name: 'עגבניות', quantity: 15, unit: 'ק"ג', minThreshold: 10, orderMode: 'manual' },
  { id: '2', name: 'קמח', quantity: 5, unit: 'ק"ג', minThreshold: 20, orderMode: 'semi-auto' },
  { id: '3', name: 'שמן זית', quantity: 40, unit: 'ליטר', minThreshold: 10, orderMode: 'full-auto' },
  { id: '4', name: 'ביצים', quantity: 24, unit: 'יחידות', minThreshold: 60, orderMode: 'semi-auto' },
  { id: '5', name: 'חזה עוף', quantity: 12, unit: 'ק"ג', minThreshold: 5, orderMode: 'manual' },
];

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<ExtendedInventoryItem[]>(mockInventory);

  const handleOrderModeChange = (itemId: string, newMode: OrderMode) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, orderMode: newMode } : item
    ));
  };

  const getOrderModeLabel = (mode: OrderMode) => {
    switch(mode) {
      case 'manual': return 'ידני';
      case 'semi-auto': return 'חצי אוטומטי';
      case 'full-auto': return 'אוטומטי לחלוטין';
    }
  };

  const getOrderModeColor = (mode: OrderMode) => {
    switch(mode) {
      case 'manual': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'semi-auto': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'full-auto': return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ניהול מלאי</h2>
          <p className="text-slate-500">עקוב אחר חומרי הגלם ונהל הזמנות ספקים.</p>
        </div>
        <button className="bg-orange-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-orange-700 transition-colors shadow-lg">
          <Plus size={20} />
          <span>הוסף פריט מלאי</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center gap-2">
          <Search size={20} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="חפש פריט במלאי..." 
            className="flex-1 outline-none text-slate-600 placeholder:text-slate-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-3 md:p-4 font-semibold">שם הפריט</th>
                <th className="p-3 md:p-4 font-semibold">כמות נוכחית</th>
                <th className="p-3 md:p-4 font-semibold">יחידה</th>
                <th className="p-3 md:p-4 font-semibold">סטטוס</th>
                <th className="p-3 md:p-4 font-semibold">הזמנת מלאי</th>
                <th className="p-3 md:p-4 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {inventory.map((item) => {
                const isLow = item.quantity < item.minThreshold;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 md:p-4 font-medium text-slate-800">{item.name}</td>
                    <td className="p-3 md:p-4 text-slate-600 font-mono">{item.quantity}</td>
                    <td className="p-3 md:p-4 text-slate-500">{item.unit}</td>
                    <td className="p-3 md:p-4">
                      {isLow ? (
                        <span className="flex items-center gap-1 text-red-500 text-xs font-bold bg-red-50 w-fit px-2 py-1 rounded-full">
                          <AlertCircle size={14} />
                          מלאי נמוך
                        </span>
                      ) : (
                        <span className="text-green-600 text-xs font-bold bg-green-50 w-fit px-2 py-1 rounded-full">
                          תקין
                        </span>
                      )}
                    </td>
                    <td className="p-3 md:p-4">
                      <select
                        value={item.orderMode}
                        onChange={(e) => handleOrderModeChange(item.id, e.target.value as OrderMode)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${getOrderModeColor(item.orderMode)} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-orange-500`}
                      >
                        <option value="manual">ידני</option>
                        <option value="semi-auto">חצי אוטומטי</option>
                        <option value="full-auto">אוטומטי לחלוטין</option>
                      </select>
                    </td>
                    <td className="p-3 md:p-4">
                      <button className="text-orange-600 hover:underline text-sm font-medium">ערוך</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
