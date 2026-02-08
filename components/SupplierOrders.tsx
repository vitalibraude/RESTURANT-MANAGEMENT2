import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Calendar, DollarSign, Loader2, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import * as ordersService from '../services/ordersService';

interface SupplierOrdersProps {
  preSelectedItem?: {id: string; name: string; quantity: number} | null;
}

const SupplierOrders: React.FC<SupplierOrdersProps> = ({ preSelectedItem }) => {
  const [orders, setOrders] = useState<ordersService.OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (preSelectedItem) {
      // כאן אפשר להוסיף לוגיקה לפתיחת מודל הזמנה חדשה עם הפריט הנבחר
      console.log('פריט נבחר להזמנה:', preSelectedItem);
    }
  }, [preSelectedItem]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersService.getSupplierOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'שגיאה בטעינת הזמנות');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'ממתין', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      confirmed: { label: 'אושר', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      received: { label: 'התקבל', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      cancelled: { label: 'בוטל', color: 'bg-red-100 text-red-700', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const canAddToOrder = (canAddUntil: string): boolean => {
    const today = new Date();
    const deadline = new Date(canAddUntil);
    return today <= deadline;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' });
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
        <h3 className="text-xl font-bold text-red-800 mb-2">שגיאה בטעינת ההזמנות</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadOrders}
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
          <h2 className="text-2xl font-bold text-slate-800">הזמנות מספקים</h2>
          <p className="text-slate-500">צפייה וניהול הזמנות מספקים.</p>
        </div>
        <button
          className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 font-medium shadow-lg"
          onClick={() => {
            alert('פתיחת טופס יצירת הזמנה חדשה - בקרוב!');
          }}
        >
          <ShoppingCart size={20} />
          צור הזמנה חדשה
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <ShoppingCart size={64} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">אין הזמנות במערכת</h3>
          <p className="text-slate-400">כשתבצע הזמנה מניהול המלאי, היא תופיע כאן</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* כותרת ההזמנה */}
              <div className="bg-gradient-to-l from-orange-50 to-white p-6 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 p-3 rounded-xl">
                      <ShoppingCart className="text-orange-600" size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-800">הזמנה #{order.order_number}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                          <Package size={14} />
                          <span className="font-semibold">ספק:</span> {order.supplier_name || 'לא צוין'}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span className="font-semibold">תאריך הזמנה:</span> {formatDate(order.order_date)}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span className="font-semibold">ניתן להוסיף עד:</span> {formatDate(order.can_add_until)}
                          {canAddToOrder(order.can_add_until) && (
                            <span className="text-green-600 font-medium">(פעיל)</span>
                          )}
                        </p>
                        <p className="flex items-center gap-2">
                          <DollarSign size={14} />
                          <span className="font-semibold">סה"כ:</span> ₪{order.total_cost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* כפתורי מחיקה וסימון */}
                  <div className="flex flex-col gap-2">
                    <button
                      className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-xs font-medium"
                      onClick={async () => {
                        if (window.confirm('האם למחוק את ההזמנה?')) {
                          try {
                            await ordersService.deleteSupplierOrder(order.id);
                            loadOrders();
                          } catch (err) {
                            alert('שגיאה במחיקה');
                          }
                        }
                      }}
                    >
                      <XCircle size={16} />
                      מחק הזמנה
                    </button>
                    {order.status !== 'received' && order.status !== 'cancelled' && (
                      <button
                        className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-xs font-medium"
                        onClick={async () => {
                          try {
                            await ordersService.updateSupplierOrderStatus(order.id, 'received');
                            loadOrders();
                          } catch (err) {
                            alert('שגיאה בסימון כהזמנה שהגיעה');
                          }
                        }}
                      >
                        <CheckCircle size={16} />
                        סמן כהזמנה שהגיעה
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* פריטי ההזמנה */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-700">פריטים בהזמנה ({order.items.length})</h4>
                  {canAddToOrder(order.can_add_until) && order.status !== 'cancelled' && (
                    <button
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm font-medium"
                      onClick={() => {
                        // פתיחת מודל להוספת פריטים להזמנה
                        alert(`הוספת פריטים להזמנה #${order.order_number}`);
                      }}
                    >
                      <Package size={16} />
                      הוסף פריטים להזמנה
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{item.product_name}</p>
                        <p className="text-sm text-slate-600">
                          {item.quantity} {item.unit} × ₪{item.price_per_unit.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-orange-600">
                          ₪{(item.quantity * item.price_per_unit).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierOrders;
