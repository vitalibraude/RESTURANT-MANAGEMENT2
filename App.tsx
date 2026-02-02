
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
import AppGuide from './components/AppGuide';
import { View } from './types';
import { CreditCard, Utensils } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<{id: string; name: string; quantity: number} | null>(null);

  const handleImmediateOrder = (item: {id: string; name: string; quantity: number}) => {
    setSelectedInventoryItem(item);
    setCurrentView('supplier-orders');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory onImmediateOrder={handleImmediateOrder} />;
      case 'messaging':
        return <Messaging />;
      case 'orders':
        return <Orders />;
      case 'finance':
        return <Finance />;
      case 'suppliers':
        return <Suppliers />;
      case 'supplier-orders':
        return <SupplierOrders preSelectedItem={selectedInventoryItem} />;
      case 'employees':
        return <Employees />;
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
