
import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  CreditCard, 
  MessageSquare,
  UtensilsCrossed
} from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'לוח בקרה', icon: LayoutDashboard },
    { id: 'orders', label: 'הזמנות ומכירות', icon: ShoppingBag },
    { id: 'inventory', label: 'ניהול מלאי', icon: Package },
    { id: 'finance', label: 'כספים וסליקה', icon: CreditCard },
    { id: 'messaging', label: 'הודעות ללקוחות', icon: MessageSquare },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed right-0 top-0 shadow-xl z-20">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <UtensilsCrossed className="text-orange-500 w-8 h-8" />
        <span className="text-xl font-bold tracking-tight">SmartRest</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as View)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-orange-500 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 text-xs text-slate-500 border-t border-slate-800 text-center">
        © 2024 SmartRest v1.0
      </div>
    </div>
  );
};

export default Sidebar;
