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
                <button className="text-orange-600 hover:bg-orange-50 p-2 rounded-lg transition-colors">
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
                <button className="text-sm bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2">
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
                              <DollarSign size={12} className="inline" />
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
                            onClick={() => setEditingProduct(product.id)}
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
    </div>
  );
};

export default Suppliers;
