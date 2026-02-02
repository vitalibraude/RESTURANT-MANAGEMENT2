
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Messaging from './components/Messaging';
import AppGuide from './components/AppGuide';
import { View } from './types';
import { CreditCard, Utensils } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'messaging':
        return <Messaging />;
      case 'orders':
        return (
          <div className="flex items-center justify-center h-[60vh] text-slate-400 flex-col gap-4">
            <Utensils size={64} className="opacity-20" />
            <h2 className="text-xl font-medium">מערכת הזמנות ומכירות (POS)</h2>
            <p className="text-sm">בפיתוח: ממשק מהיר למלצרים וניהול שולחנות.</p>
          </div>
        );
      case 'finance':
        return (
          <div className="flex items-center justify-center h-[60vh] text-slate-400 flex-col gap-4">
            <CreditCard size={64} className="opacity-20" />
            <h2 className="text-xl font-medium">כספים, חיובים וסליקה</h2>
            <p className="text-sm">בפיתוח: חיבור לספקי סליקה ומערכת חשבוניות.</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <Sidebar activeView={currentView} onViewChange={setCurrentView} />

      {/* Main Content Area */}
      <main className="flex-1 md:mr-64 p-4 md:p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>

      {/* Interactive Legend / Guide */}
      <AppGuide />
    </div>
  );
};

export default App;
