import React, { useState, useEffect } from 'react';
import { Package, Plus, AlertCircle, Search, X, ChevronDown, ShoppingCart, Edit2 } from 'lucide-react';
import { InventoryItem } from '../types';
import * as suppliersService from '../services/suppliersService';
import * as ordersService from '../services/ordersService';

type OrderMode = 'manual' | 'semi-auto' | 'full-auto';
type OrderActionType = 'immediate' | 'by-quantity' | 'by-supplier-dates' | 'next-week' | 'next-month';

interface ExtendedInventoryItem extends InventoryItem {
  orderMode: OrderMode;
  suppliers: string[];
}

const availableSuppliers = [
  'טמפו',
  'תנובה',
  'קוקה קולה',
  'אסם',
  'יינות ביתן',
  'עלית',
  'אורז הזהב',
  'סנפרוסט',
  'זוגלובק',
  'מעדנות יוכנן'
];

const mockInventory: ExtendedInventoryItem[] = [
  { id: '1', name: 'עגבניות', quantity: 15, unit: 'ק"ג', minThreshold: 10, orderMode: 'manual', suppliers: ['סנפרוסט'] },
  { id: '2', name: 'קמח', quantity: 5, unit: 'ק"ג', minThreshold: 20, orderMode: 'semi-auto', suppliers: ['אסם'] },
  { id: '3', name: 'שמן זית', quantity: 40, unit: 'ליטר', minThreshold: 10, orderMode: 'full-auto', suppliers: ['עלית'] },
  { id: '4', name: 'ביצים', quantity: 24, unit: 'יחידות', minThreshold: 60, orderMode: 'semi-auto', suppliers: ['תנובה'] },
  { id: '5', name: 'חזה עוף', quantity: 12, unit: 'ק"ג', minThreshold: 5, orderMode: 'manual', suppliers: ['מעדנות יוכנן', 'זוגלובק'] },
];

interface InventoryProps {
  onNavigateToOrders?: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ onNavigateToOrders }) => {
  const [inventory, setInventory] = useState<ExtendedInventoryItem[]>(mockInventory);
  const [allSuppliers, setAllSuppliers] = useState<suppliersService.SupplierWithProducts[]>([]);
  const [editingSuppliers, setEditingSuppliers] = useState<string | null>(null);
  const [newSupplier, setNewSupplier] = useState<string>('');
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ExtendedInventoryItem | null>(null);
  const [selectedOrderItem, setSelectedOrderItem] = useState<ExtendedInventoryItem | null>(null);
  const [orderActionType, setOrderActionType] = useState<OrderActionType | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: 'ק"ג',
    minThreshold: 0,
    orderMode: 'manual' as OrderMode,
    suppliers: [] as string[]
  });

  const [orderFormData, setOrderFormData] = useState({
    supplierId: '',
    quantity: 0,
    price: 0,
    notes: ''
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await suppliersService.getSuppliersWithProducts();
      setAllSuppliers(data);
    } catch (err) {
      console.error('Error loading suppliers:', err);
    }
  };

  const handleOrderModeChange = (itemId: string, newMode: OrderMode) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, orderMode: newMode } : item
    ));
  };

  const toggleSupplier = (itemId: string, supplier: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const hasSupplier = item.suppliers.includes(supplier);
        return {
          ...item,
          suppliers: hasSupplier 
            ? item.suppliers.filter(s => s !== supplier)
            : [...item.suppliers, supplier]
        };
      }
      return item;
    }));
  };

  const addNewSupplier = (itemId: string) => {
    if (newSupplier.trim()) {
      toggleSupplier(itemId, newSupplier.trim());
      setNewSupplier('');
    }
  };

  const getOrderModeColor = (mode: OrderMode) => {
    switch(mode) {
      case 'manual': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'semi-auto': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'full-auto': return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  const calculateOrderQuantity = (item: ExtendedInventoryItem, actionType: OrderActionType): number => {
    switch(actionType) {
      case 'immediate':
        // הזמנה מיידית - חוסר עד הסף
        return Math.max(0, item.minThreshold - item.quantity);
      case 'by-quantity':
        // לפי כמות שנקבעה - פעמיים הסף
        return item.minThreshold * 2;
      case 'by-supplier-dates':
      case 'next-week':
        // להערכה שבועית
        return item.minThreshold * 1.5;
      case 'next-month':
        // להערכה חודשית
        return item.minThreshold * 4;
      default:
        return item.minThreshold;
    }
  };

  const openOrderModal = (item: ExtendedInventoryItem, actionType: OrderActionType) => {
    setSelectedOrderItem(item);
    setOrderActionType(actionType);
    const suggestedQuantity = calculateOrderQuantity(item, actionType);
    
    // מצא ספק מהרשימה של הפריט
    const itemSupplier = allSuppliers.find(s => item.suppliers.includes(s.name));
    const supplierProduct = itemSupplier?.products?.find(p => p.product_name.includes(item.name) || item.name.includes(p.product_name));
    
    setOrderFormData({
      supplierId: itemSupplier?.id || '',
      quantity: suggestedQuantity,
      price: supplierProduct?.price || 0,
      notes: ''
    });
    
    setShowOrderModal(true);
    setOpenActionMenu(null);
  };

  const handleCreateOrder = async () => {
    if (!selectedOrderItem || !orderFormData.supplierId || orderFormData.quantity <= 0) {
      alert('אנא מלא את כל הפרטים');
      return;
    }

    try {
      // חישוב תאריך אחרון להוספה (7 ימים מהיום)
      const canAddUntil = new Date();
      canAddUntil.setDate(canAddUntil.getDate() + 7);

      // יצירת ההזמנה
      await ordersService.createSupplierOrder(
        orderFormData.supplierId,
        [{
          product_name: selectedOrderItem.name,
          quantity: orderFormData.quantity,
          unit: selectedOrderItem.unit,
          price_per_unit: orderFormData.price,
          inventory_item_id: selectedOrderItem.id
        }],
        canAddUntil
      );

      // סגירת המודל
      setShowOrderModal(false);
      setSelectedOrderItem(null);
      setOrderActionType(null);
      setOrderFormData({ supplierId: '', quantity: 0, price: 0, notes: '' });

      // הצגת הודעת הצלחה
      alert('ההזמנה נוצרה בהצלחה!');

      // מעבר לדף הזמנות מספקים
      if (onNavigateToOrders) {
        onNavigateToOrders();
      }
    } catch (err: any) {
      alert('שגיאה ביצירת הזמנה: ' + err.message);
      console.error('Error creating order:', err);
    }
  };

  const openEditModal = (item: ExtendedInventoryItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleEditItem = () => {
    if (!editingItem) return;
    
    setInventory(prev => prev.map(item => 
      item.id === editingItem.id ? editingItem : item
    ));
    
    setShowEditModal(false);
    setEditingItem(null);
  };

  const getOrderActionLabel = (actionType: OrderActionType): string => {
    switch(actionType) {
      case 'immediate': return 'הזמנה מיידית';
      case 'by-quantity': return 'הזמנה לפי כמות';
      case 'by-supplier-dates': return 'הזמנה לפי תאריכי ספק';
      case 'next-week': return 'הזמנה לשבוע הבא';
      case 'next-month': return 'הזמנה לחודש הבא';
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Modal */}
      {showOrderModal && selectedOrderItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {orderActionType && getOrderActionLabel(orderActionType)}
              </h3>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl mb-6">
              <p className="font-semibold text-blue-900">פריט: {selectedOrderItem.name}</p>
              <p className="text-sm text-blue-700">מלאי נוכחי: {selectedOrderItem.quantity} {selectedOrderItem.unit}</p>
              <p className="text-sm text-blue-700">סף מינימום: {selectedOrderItem.minThreshold} {selectedOrderItem.unit}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">בחר ספק *</label>
                <select
                  value={orderFormData.supplierId}
                  onChange={(e) => {
                    const supplier = allSuppliers.find(s => s.id === e.target.value);
                    const product = supplier?.products?.find(p => 
                      p.product_name.includes(selectedOrderItem.name) || 
                      selectedOrderItem.name.includes(p.product_name)
                    );
                    setOrderFormData({
                      ...orderFormData,
                      supplierId: e.target.value,
                      price: product?.price || orderFormData.price
                    });
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">בחר ספק...</option>
                  {allSuppliers
                    .filter(s => selectedOrderItem.suppliers.includes(s.name))
                    .map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">כמות להזמנה *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={orderFormData.quantity}
                    onChange={(e) => setOrderFormData({...orderFormData, quantity: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">מחיר ליחידה *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={orderFormData.price}
                    onChange={(e) => setOrderFormData({...orderFormData, price: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-green-900">
                  סה"כ: ₪{(orderFormData.quantity * orderFormData.price).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">הערות (אופציונלי)</label>
                <textarea
                  value={orderFormData.notes}
                  onChange={(e) => setOrderFormData({...orderFormData, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="הערות נוספות..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateOrder}
                className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-semibold"
              >
                צור הזמנה
              </button>
              <button
                onClick={() => setShowOrderModal(false)}
                className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg hover:bg-slate-300 font-semibold"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">ערוך פריט מלאי</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">שם הפריט</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">כמות</label>
                  <input
                    type="number"
                    value={editingItem.quantity}
                    onChange={(e) => setEditingItem({...editingItem, quantity: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">יחידה</label>
                  <select
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({...editingItem, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="ק״ג">ק״ג</option>
                    <option value="ליטר">ליטר</option>
                    <option value="יחידות">יחידות</option>
                    <option value="חבילות">חבילות</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">כמות מינימום</label>
                <input
                  type="number"
                  value={editingItem.minThreshold}
                  onChange={(e) => setEditingItem({...editingItem, minThreshold: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEditItem}
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 font-medium"
                >
                  שמור שינויים
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 font-medium"
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">הוסף פריט מלאי חדש</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">שם הפריט</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="לדוגמה: עגבניות"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">כמות</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">יחידה</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="ק״ג">ק״ג</option>
                    <option value="ליטר">ליטר</option>
                    <option value="יחידות">יחידות</option>
                    <option value="חבילות">חבילות</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">כמות מינימום</label>
                <input
                  type="number"
                  value={formData.minThreshold}
                  onChange={(e) => setFormData({...formData, minThreshold: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    const newItem: ExtendedInventoryItem = {
                      id: String(inventory.length + 1),
                      name: formData.name,
                      quantity: formData.quantity,
                      unit: formData.unit,
                      minThreshold: formData.minThreshold,
                      orderMode: 'manual',
                      suppliers: []
                    };
                    setInventory([...inventory, newItem]);
                    setShowAddModal(false);
                    setFormData({ name: '', quantity: 0, unit: 'ק״ג', minThreshold: 0, orderMode: 'manual', suppliers: [] });
                  }}
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 font-medium"
                >
                  הוסף
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 font-medium"
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ניהול מלאי</h2>
          <p className="text-slate-500">עקוב אחר חומרי הגלם ונהל הזמנות ספקים.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
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
                <th className="p-3 md:p-4 font-semibold">מצב הזמנה</th>
                <th className="p-3 md:p-4 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {inventory.map((item) => {
                const isLow = item.quantity < item.minThreshold;
                const isEditing = editingSuppliers === item.id;
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
                            {item.suppliers.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {item.suppliers.map(supplier => (
                                  <span key={supplier} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                    {supplier}
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
                                    checked={item.suppliers.includes(supplier.name)}
                                    onChange={() => toggleSupplier(item.id, supplier.name)}
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
                      <div className="relative">
                        <button
                          onClick={() => setOpenActionMenu(openActionMenu === item.id ? null : item.id)}
                          className="px-3 py-1.5 bg-orange-600 text-white rounded-lg flex items-center gap-1 hover:bg-orange-700 transition-colors text-sm font-medium"
                        >
                          <ShoppingCart size={16} />
                          <span>פעולות</span>
                          <ChevronDown size={14} />
                        </button>
                        
                        {openActionMenu === item.id && (
                          <div className="absolute z-20 left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl min-w-[220px]">
                            <div className="py-1">
                              <button
                                onClick={() => openOrderModal(item, 'immediate')}
                                className="w-full text-right px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center gap-2"
                              >
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                בצע הזמנה מיידית
                              </button>
                              <button
                                onClick={() => openOrderModal(item, 'by-quantity')}
                                className="w-full text-right px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center gap-2"
                              >
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                בצע הזמנה לפי כמות שנקבעה
                              </button>
                              <button
                                onClick={() => openOrderModal(item, 'by-supplier-dates')}
                                className="w-full text-right px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center gap-2"
                              >
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                בצע הזמנה לפי תאריכי הספק
                              </button>
                              <div className="border-t border-slate-100 my-1"></div>
                              <button
                                onClick={() => openOrderModal(item, 'next-week')}
                                className="w-full text-right px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center gap-2"
                              >
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                בצע הזמנה לשבוע הבא
                              </button>
                              <button
                                onClick={() => openOrderModal(item, 'next-month')}
                                className="w-full text-right px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center gap-2"
                              >
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                בצע הזמנה לחודש הבא
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
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
                      <button 
                        onClick={() => openEditModal(item)}
                        className="text-orange-600 hover:bg-orange-50 p-2 rounded-lg transition-colors flex items-center gap-1"
                        title="ערוך פריט"
                      >
                        <Edit2 size={16} />
                        <span className="text-sm font-medium">ערוך</span>
                      </button>
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
