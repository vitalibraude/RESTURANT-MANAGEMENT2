
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  CreditCard, 
  MessageSquare,
  UtensilsCrossed,
  Menu,
  X,
  Store,
  ShoppingCart,
  Users,
  Calendar,
  Settings
} from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const menuItems = [
    { id: 'dashboard', label: 'לוח בקרה', icon: LayoutDashboard },
    { id: 'orders', label: 'הזמנות ומכירות', icon: ShoppingBag },
    { id: 'inventory', label: 'ניהול מלאי', icon: Package },
    { id: 'suppliers', label: 'ספקים', icon: Store },
    { id: 'supplier-orders', label: 'הזמנות מספקים', icon: ShoppingCart },
    { id: 'employees', label: 'ניהול עובדים', icon: Users },
    { id: 'work-log', label: 'יומן עבודה', icon: Calendar },
    { id: 'finance', label: 'כספים וסליקה', icon: CreditCard },
    { id: 'messaging', label: 'הודעות ללקוחות', icon: MessageSquare },
    { id: 'settings', label: 'הגדרות API', icon: Settings },
  ];

  const handleNavigation = (view: View) => {
    onViewChange(view);
    setIsOpen(false); // Close menu on mobile after selection
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-30 bg-slate-900 text-white p-3 rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-64 bg-slate-900 text-white h-screen flex flex-col fixed right-0 top-0 shadow-xl z-20
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <UtensilsCrossed className="text-orange-500 w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">STEADY</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            v2.2.26.23.18
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id as View)}
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

        <div className="p-4 text-xs text-slate-500 border-t border-slate-800 text-center shrink-0">
          © 2026 STEADY
        </div>
      </div>
    </>
  );
};

export default Sidebar;
