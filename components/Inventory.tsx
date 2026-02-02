
import React, { useState, useEffect } from 'react';
import { Package, Plus, AlertCircle, Search, X, ChevronDown, ShoppingCart, Loader2 } from 'lucide-react';
import * as inventoryService from '../services/inventoryService';

type OrderMode = 'manual' | 'semi-auto' | 'full-auto';

interface ExtendedInventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  min_threshold: number;
  order_mode: OrderMode;
  suppliers?: Array<{ id: string; name: string }>;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<ExtendedInventoryItem[]>([]);
  const [allSuppliers, setAllSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [editingSuppliers, setEditingSuppliers] = useState<string | null>(null);
  const [newSupplier, setNewSupplier] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // טעינת נתונים מהדאטאבייס
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [items, suppliers] = await Promise.all([
        inventoryService.getInventoryItems(),
        inventoryService.getSuppliers()
      ]);
      setInventory(items as ExtendedInventoryItem[]);
      setAllSuppliers(suppliers);
    } catch (err: any) {
      setError(err.message || 'שגיאה בטעינת הנתונים');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderModeChange = async (itemId: string, newMode: OrderMode) => {
    try {
      await inventoryService.updateInventoryItem(itemId, { order_mode: newMode });
      setInventory(prev => prev.map(item => 
        item.id === itemId ? { ...item, order_mode: newMode } : item
      ));
    } catch (err: any) {
      alert('שגיאה בעדכון מצב ההזמנה: ' + err.message);
    }
  };

  const toggleSupplier = async (itemId: string, supplierId: string) => {
    try {
      const item = inventory.find(i => i.id === itemId);
      const hasSupplier = item?.suppliers?.some(s => s.id === supplierId);
      
      if (hasSupplier) {
        await inventoryService.unlinkItemFromSupplier(itemId, supplierId);
      } else {
        await inventoryService.linkItemToSupplier(itemId, supplierId);
      }
      
      // עדכון מקומי
      setInventory(prev => prev.map(item => {
        if (item.id === itemId) {
          const suppliers = item.suppliers || [];
          return {
            ...item,
            suppliers: hasSupplier 
              ? suppliers.filter(s => s.id !== supplierId)
              : [...suppliers, allSuppliers.find(s => s.id === supplierId)!]
          };
        }
        return item;
      }));
    } catch (err: any) {
      alert('שגיאה בעדכון ספק: ' + err.message);
    }
  };

  const addNewSupplier = async (itemId: string) => {
    if (!newSupplier.trim()) return;
    
    try {
      // בדוק אם הספק כבר קיים
      let supplier = allSuppliers.find(s => s.name === newSupplier.trim());
      
      // אם לא, צור אותו
      if (!supplier) {
        supplier = await inventoryService.addSupplier(newSupplier.trim());
        setAllSuppliers(prev => [...prev, supplier!]);
      }
      
      // קשר לפריט
      await inventoryService.linkItemToSupplier(itemId, supplier.id);
      
      // עדכון מקומי
      setInventory(prev => prev.map(item => {
        if (item.id === itemId) {
          const suppliers = item.suppliers || [];
          return {
            ...item,
            suppliers: [...suppliers, supplier!]
          };
        }
        return item;
      }));
      
      setNewSupplier('');
    } catch (err: any) {
      alert('שגיאה בהוספת ספק: ' + err.message);
    }
  };

  const getOrderModeColor = (mode: OrderMode) => {
    switch(mode) {
      case 'manual': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'semi-auto': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'full-auto': return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  const addNewInventoryItem = async () => {
    try {
      const newItem = await inventoryService.addInventoryItem({
        name: 'פריט חדש',
        quantity: 0,
        unit: 'ק"ג',
        min_threshold: 10,
        order_mode: 'manual'
      });
      setInventory(prev => [...prev, { ...newItem, suppliers: [] } as ExtendedInventoryItem]);
    } catch (err: any) {
      alert('שגיאה בהוספת פריט: ' + err.message);
    }
  };

  const handleEditAction = (itemId: string, action: 'immediate' | 'supplier-schedule') => {
    const item = inventory.find(i => i.id === itemId);
    const supplierNames = item?.suppliers?.map(s => s.name).join(', ') || 'לא נבחרו';
    if (action === 'immediate') {
      alert(`הזמנה מיידית עבור: ${item?.name}\nספקים: ${supplierNames}`);
    } else {
      alert(`הזמנה בהתאם ללוז הספק עבור: ${item?.name}\nספקים: ${supplierNames}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="mx-auto text-red-600 mb-2" size={48} />
        <h3 className="text-xl font-bold text-red-800 mb-2">שגיאה בטעינת הנתונים</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadData}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ניהול מלאי</h2>
          <p className="text-slate-500">עקוב אחר חומרי הגלם ונהל הזמנות ספקים.</p>
        </div>
        <button 
          onClick={addNewInventoryItem}
          className="bg-orange-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-orange-700 transition-colors shadow-lg"
        >
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
          <table className="w-full text-right border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-3 md:p-4 font-semibold">שם הפריט</th>
                <th className="p-3 md:p-4 font-semibold">כמות נוכחית</th>
                <th className="p-3 md:p-4 font-semibold">יחידה</th>
                <th className="p-3 md:p-4 font-semibold">סטטוס</th>
                <th className="p-3 md:p-4 font-semibold">ספקים</th>
                <th className="p-3 md:p-4 font-semibold">הזמנת מלאי</th>
                <th className="p-3 md:p-4 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {inventory.map((item) => {
                const isLow = item.quantity < item.min_threshold;
                const isEditing = editingSuppliers === item.id;
                const suppliers = item.suppliers || [];
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
                      <div className="relative">
                        {!isEditing ? (
                          <button
                            onClick={() => setEditingSuppliers(item.id)}
                            className="text-right w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs hover:bg-slate-50 transition-colors"
                          >
                            {suppliers.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {suppliers.map(supplier => (
                                  <span key={supplier.id} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                    {supplier.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400">בחר ספקים...</span>
                            )}
                          </button>
                        ) : (
                          <div className="absolute z-10 bg-white border border-slate-200 rounded-lg shadow-lg p-3 min-w-[250px] left-0">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-slate-700">בחר ספקים</span>
                              <button onClick={() => setEditingSuppliers(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={16} />
                              </button>
                            </div>
                            <div className="space-y-1 max-h-48 overflow-y-auto mb-2">
                              {allSuppliers.map(supplier => (
                                <label key={supplier.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={suppliers.some(s => s.id === supplier.id)}
                                    onChange={() => toggleSupplier(item.id, supplier.id)}
                                    className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                  />
                                  <span className="text-sm text-slate-700">{supplier.name}</span>
                                </label>
                              ))}
                            </div>
                            <div className="border-t border-slate-100 pt-2">
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={newSupplier}
                                  onChange={(e) => setNewSupplier(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && addNewSupplier(item.id)}
                                  placeholder="הוסף ספק חדש..."
                                  className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                                <button
                                  onClick={() => addNewSupplier(item.id)}
                                  className="px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700"
                                >
                                  הוסף
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 md:p-4">
                      <select
                        value={item.order_mode}
                        onChange={(e) => handleOrderModeChange(item.id, e.target.value as OrderMode)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${getOrderModeColor(item.order_mode)} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-orange-500`}
                      >
                        <option value="manual">ידני</option>
                        <option value="semi-auto">חצי אוטומטי</option>
                        <option value="full-auto">אוטומטי לחלוטין</option>
                      </select>
                    </td>
                    <td className="p-3 md:p-4">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleEditAction(item.id, e.target.value as 'immediate' | 'supplier-schedule');
                            e.target.value = '';
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 text-xs font-medium cursor-pointer transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">בחר פעולה...</option>
                        <option value="immediate">הזמן מיידי</option>
                        <option value="supplier-schedule">הזמן בהתאם ללוז הספק</option>
                      </select>
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
