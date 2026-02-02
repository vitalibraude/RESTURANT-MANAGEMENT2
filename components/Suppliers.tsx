import React, { useState, useEffect } from 'react';
import { Store, Plus, Edit2, Trash2, Phone, Mail, MapPin, Package, DollarSign, Calendar, Loader2, AlertCircle } from 'lucide-react';
import * as suppliersService from '../services/suppliersService';

const WEEK_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<suppliersService.SupplierWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedSupplierForProduct, setSelectedSupplierForProduct] = useState<string | null>(null);
  const [newSupplierData, setNewSupplierData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: ''
  });
  const [newProductData, setNewProductData] = useState({
    product_name: '',
    price: '',
    unit: 'ק"ג',
    min_order_quantity: '',
    available_days: [] as string[]
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await suppliersService.getSuppliersWithProducts();
      setSuppliers(data);
    } catch (err: any) {
      setError(err.message || 'שגיאה בטעינת ספקים');
      console.error('Error loading suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('האם למחוק מוצר זה?')) return;
    try {
      await suppliersService.deleteSupplierProduct(productId);
      loadSuppliers();
    } catch (err: any) {
      alert('שגיאה במחיקת מוצר: ' + err.message);
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplierData.name.trim()) {
      alert('יש להזין שם ספק');
      return;
    }

    try {
      await suppliersService.addSupplier(newSupplierData);
      setShowAddSupplierModal(false);
      setNewSupplierData({ name: '', contact_person: '', phone: '', email: '' });
      loadSuppliers();
    } catch (err: any) {
      alert('שגיאה בהוספת ספק: ' + err.message);
    }
  };

  const handleAddProduct = async () => {
    if (!newProductData.product_name.trim() || !newProductData.price || !newProductData.min_order_quantity) {
      alert('יש למלא את כל השדות החובה');
      return;
    }

    if (!selectedSupplierForProduct) return;

    try {
      await suppliersService.addSupplierProduct({
        supplier_id: selectedSupplierForProduct,
        product_name: newProductData.product_name,
        price: parseFloat(newProductData.price),
        unit: newProductData.unit,
        min_order_quantity: parseFloat(newProductData.min_order_quantity),
        available_days: newProductData.available_days.length > 0 ? newProductData.available_days : ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'],
        is_available: true
      });
      setShowAddProductModal(false);
      setSelectedSupplierForProduct(null);
      setNewProductData({ product_name: '', price: '', unit: 'ק"ג', min_order_quantity: '', available_days: [] });
      loadSuppliers();
    } catch (err: any) {
      alert('שגיאה בהוספת מוצר: ' + err.message);
    }
  };

  const toggleDay = (day: string) => {
    setNewProductData(prev => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter(d => d !== day)
        : [...prev.available_days, day]
    }));
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
        <h3 className="text-xl font-bold text-red-800 mb-2">שגיאה בטעינת הספקים</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadSuppliers}
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
          <h2 className="text-2xl font-bold text-slate-800">ניהול ספקים</h2>
          <p className="text-slate-500">נהל ספקים, מוצרים, מחירים וזמני הזמנה.</p>
        </div>
        <button
          onClick={() => setShowAddSupplierModal(true)}
          className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={20} />
          הוסף ספק
        </button>
      </div>

      <div className="grid gap-6">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* כותרת הספק */}
            <div className="bg-gradient-to-l from-orange-50 to-white p-6 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-xl">
                    <Store className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{supplier.name}</h3>
                    <div className="mt-2 space-y-1">
                      {supplier.contact_person && (
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <Phone size={14} />
                          {supplier.contact_person}
                        </p>
                      )}
                      {supplier.phone && (
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <Phone size={14} />
                          {supplier.phone}
                        </p>
                      )}
                      {supplier.email && (
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <Mail size={14} />
                          {supplier.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => alert('עריכת ספק בפיתוח...')}
                  className="text-orange-600 hover:bg-orange-50 p-2 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                </button>
              </div>
            </div>

            {/* רשימת מוצרים */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                  <Package size={18} />
                  מוצרים ({supplier.products?.length || 0})
                </h4>
                <button 
                  onClick={() => {
                    setSelectedSupplierForProduct(supplier.id);
                    setShowAddProductModal(true);
                  }}
                  className="text-sm bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
                >
                  <Plus size={16} />
                  הוסף מוצר
                </button>
              </div>

              {supplier.products && supplier.products.length > 0 ? (
                <div className="grid gap-3">
                  {supplier.products.map((product) => (
                    <div key={product.id} className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="font-semibold text-slate-800">{product.product_name}</h5>
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                              ₪{product.price} / {product.unit}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Package size={14} />
                              הזמנה מינימלית: {product.min_order_quantity} {product.unit}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              ימי אספקה: {product.available_days.join(', ')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => alert(`עריכת מוצר: ${product.product_name}\nמחיר: ₪${product.price}\nפונקציה זו בפיתוח...`)}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Package size={48} className="mx-auto mb-2 opacity-50" />
                  <p>אין מוצרים עדיין</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {suppliers.length === 0 && (
        <div className="text-center py-12">
          <Store size={64} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">אין ספקים במערכת</h3>
          <p className="text-slate-400">הרץ את קובץ suppliers-schema.sql כדי להוסיף ספקים</p>
        </div>
      )}

      {/* דיאלוג הוספת ספק */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddSupplierModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-slate-800 mb-6">הוסף ספק חדש</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">שם הספק *</label>
                <input
                  type="text"
                  value={newSupplierData.name}
                  onChange={(e) => setNewSupplierData({...newSupplierData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="למשל: סנפרוסט"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">איש קשר</label>
                <input
                  type="text"
                  value={newSupplierData.contact_person}
                  onChange={(e) => setNewSupplierData({...newSupplierData, contact_person: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="שם איש הקשר"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">טלפון</label>
                <input
                  type="tel"
                  value={newSupplierData.phone}
                  onChange={(e) => setNewSupplierData({...newSupplierData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="054-1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">אימייל</label>
                <input
                  type="email"
                  value={newSupplierData.email}
                  onChange={(e) => setNewSupplierData({...newSupplierData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddSupplier}
                className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-semibold transition-colors"
              >
                הוסף
              </button>
              <button
                onClick={() => {
                  setShowAddSupplierModal(false);
                  setNewSupplierData({ name: '', contact_person: '', phone: '', email: '' });
                }}
                className="flex-1 bg-slate-200 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-300 font-semibold transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* דיאלוג הוספת מוצר */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddProductModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-slate-800 mb-6">הוסף מוצר חדש</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">שם המוצר *</label>
                <input
                  type="text"
                  value={newProductData.product_name}
                  onChange={(e) => setNewProductData({...newProductData, product_name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="למשל: עגבניות"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">מחיר *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProductData.price}
                    onChange={(e) => setNewProductData({...newProductData, price: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">יחידה *</label>
                  <select
                    value={newProductData.unit}
                    onChange={(e) => setNewProductData({...newProductData, unit: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="ק״ג">ק״ג</option>
                    <option value="ליטר">ליטר</option>
                    <option value="יחידה">יחידה</option>
                    <option value="חבילה">חבילה</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">הזמנה מינימלית *</label>
                <input
                  type="number"
                  step="0.1"
                  value={newProductData.min_order_quantity}
                  onChange={(e) => setNewProductData({...newProductData, min_order_quantity: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="כמות מינימלית להזמנה"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ימי אספקה (אופציונלי)</label>
                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        newProductData.available_days.includes(day)
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">אם לא תבחר, כל הימים יהיו זמינים</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddProduct}
                className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-semibold transition-colors"
              >
                הוסף מוצר
              </button>
              <button
                onClick={() => {
                  setShowAddProductModal(false);
                  setSelectedSupplierForProduct(null);
                  setNewProductData({ product_name: '', price: '', unit: 'ק״ג', min_order_quantity: '', available_days: [] });
                }}
                className="flex-1 bg-slate-200 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-300 font-semibold transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
