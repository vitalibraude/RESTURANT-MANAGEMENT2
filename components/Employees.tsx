import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Coins, Calendar, User, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface Employee {
  id: string;
  full_name: string;
  start_date: string;
  hourly_rate: number;
  position: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at?: string;
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    start_date: new Date().toISOString().split('T')[0],
    hourly_rate: 0,
    position: '',
    phone: '',
    email: '',
    is_active: true
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setEmployees(data || []);
    } catch (err: any) {
      setError(err.message || 'שגיאה בטעינת עובדים');
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEmployee) {
        const { error: err } = await supabase
          .from('employees')
          .update(formData)
          .eq('id', editingEmployee.id);
        
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from('employees')
          .insert([formData]);
        
        if (err) throw err;
      }
      
      await loadEmployees();
      resetForm();
      setShowAddModal(false);
      setEditingEmployee(null);
    } catch (err: any) {
      alert('שגיאה בשמירת עובד: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק עובד זה?')) return;
    
    try {
      const { error: err } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (err) throw err;
      await loadEmployees();
    } catch (err: any) {
      alert('שגיאה במחיקת עובד: ' + err.message);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      full_name: employee.full_name,
      start_date: employee.start_date,
      hourly_rate: employee.hourly_rate,
      position: employee.position,
      phone: employee.phone || '',
      email: employee.email || '',
      is_active: employee.is_active
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      start_date: new Date().toISOString().split('T')[0],
      hourly_rate: 0,
      position: '',
      phone: '',
      email: '',
      is_active: true
    });
  };

  const calculateWorkDuration = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0) {
      return `${years} שנים${remainingMonths > 0 ? ` ו-${remainingMonths} חודשים` : ''}`;
    }
    return `${remainingMonths} חודשים`;
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
          onClick={loadEmployees}
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
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-orange-600" size={32} />
            ניהול עובדים
          </h2>
          <p className="text-slate-500">נהל את צוות העובדים שלך</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingEmployee(null);
            setShowAddModal(true);
          }}
          className="bg-orange-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-orange-700 transition-colors shadow-lg"
        >
          <Plus size={20} />
          <span>הוסף עובד</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">סה"כ עובדים</p>
              <p className="text-3xl font-bold mt-1">{employees.length}</p>
            </div>
            <Users size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">עובדים פעילים</p>
              <p className="text-3xl font-bold mt-1">{employees.filter(e => e.is_active).length}</p>
            </div>
            <User size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">עלות שעתית ממוצעת</p>
              <p className="text-3xl font-bold mt-1">
                ₪{employees.length > 0 ? (employees.reduce((sum, e) => sum + e.hourly_rate, 0) / employees.length).toFixed(0) : 0}
              </p>
            </div>
            <Coins size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-right p-4 text-sm font-semibold text-slate-700">שם מלא</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-700">תפקיד</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-700">תחילת עבודה</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-700">ותק</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-700">שכר לשעה</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-700">סטטוס</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-700">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-semibold text-slate-800">{employee.full_name}</p>
                      {employee.phone && <p className="text-sm text-slate-500">{employee.phone}</p>}
                    </div>
                  </td>
                  <td className="p-4 text-slate-700">{employee.position}</td>
                  <td className="p-4 text-slate-700">
                    {new Date(employee.start_date).toLocaleDateString('he-IL')}
                  </td>
                  <td className="p-4 text-slate-700">
                    {calculateWorkDuration(employee.start_date)}
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-green-600">₪{employee.hourly_rate}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      employee.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {employee.is_active ? 'פעיל' : 'לא פעיל'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <Users className="mx-auto mb-2 text-slate-300" size={48} />
                    <p>אין עובדים במערכת</p>
                    <p className="text-sm mt-1">לחץ על "הוסף עובד" כדי להתחיל</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              {editingEmployee ? 'ערוך עובד' : 'הוסף עובד חדש'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">שם מלא</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">תפקיד</label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">תאריך תחילת עבודה</label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">שכר לשעה (₪)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.5"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">טלפון</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">אימייל</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">עובד פעיל</label>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  {editingEmployee ? 'עדכן' : 'הוסף'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEmployee(null);
                    resetForm();
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
