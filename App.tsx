
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Messaging from './components/Messaging';
import Finance from './components/Finance';
import Orders from './components/Orders';
import Suppliers from './components/Suppliers';
import SupplierOrders from './components/SupplierOrders';
import Employees from './components/Employees';
import WorkLog from './components/WorkLog';
import AppGuide from './components/AppGuide';
import { View } from './types';
import { CreditCard, Utensils } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const handleNavigateToOrders = () => {
    setCurrentView('supplier-orders');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory onNavigateToOrders={handleNavigateToOrders} />;
      case 'messaging':
        return <Messaging />;
      case 'orders':
        return <Orders />;
      case 'finance':
        return <Finance />;
      case 'suppliers':
        return <Suppliers />;
      case 'supplier-orders':
        return <SupplierOrders />;
      case 'employees':
        return <Employees />;
      case 'work-log':
        return <WorkLog />;
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
