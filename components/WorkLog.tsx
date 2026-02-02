import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Download, Plus, X, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface Employee {
  id: string;
  full_name: string;
  hourly_rate: number;
  position: string;
}

interface WorkLogEntry {
  id?: string;
  employee_id: string;
  work_date: string;
  hours_worked: number;
  notes?: string;
  created_at?: string;
}

interface DayLog {
  date: string;
  entries: (WorkLogEntry & { employee_name: string; hourly_rate: number })[];
}

const WorkLog: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [workLogs, setWorkLogs] = useState<DayLog[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    employee_id: '',
    hours_worked: 0,
    notes: ''
  });

  useEffect(() => {
    loadEmployees();
    loadWorkLogs();
  }, [currentDate]);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, hourly_rate, position')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (err: any) {
      console.error('Error loading employees:', err);
    }
  };

  const loadWorkLogs = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('work_logs')
        .select(`
          *,
          employees (
            full_name,
            hourly_rate
          )
        `)
        .gte('work_date', startOfMonth.toISOString().split('T')[0])
        .lte('work_date', endOfMonth.toISOString().split('T')[0])
        .order('work_date', { ascending: false });

      if (error) throw error;

      // Group by date
      const grouped: { [key: string]: DayLog } = {};
      (data || []).forEach((log: any) => {
        const date = log.work_date;
        if (!grouped[date]) {
          grouped[date] = { date, entries: [] };
        }
        grouped[date].entries.push({
          id: log.id,
          employee_id: log.employee_id,
          work_date: log.work_date,
          hours_worked: log.hours_worked,
          notes: log.notes,
          employee_name: log.employees?.full_name || 'לא ידוע',
          hourly_rate: log.employees?.hourly_rate || 0
        });
      });

      setWorkLogs(Object.values(grouped));
    } catch (err: any) {
      console.error('Error loading work logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const addWorkLog = async () => {
    if (!formData.employee_id || !selectedDate || formData.hours_worked <= 0) {
      alert('אנא מלא את כל השדות');
      return;
    }

    try {
      const { error } = await supabase
        .from('work_logs')
        .insert([{
          employee_id: formData.employee_id,
          work_date: selectedDate,
          hours_worked: formData.hours_worked,
          notes: formData.notes
        }]);

      if (error) throw error;

      await loadWorkLogs();
      setShowAddModal(false);
      setFormData({ employee_id: '', hours_worked: 0, notes: '' });
      setSelectedDate('');
    } catch (err: any) {
      alert('שגיאה בהוספת רשומה: ' + err.message);
    }
  };

  const deleteWorkLog = async (id: string) => {
    if (!confirm('האם למחוק רשומה זו?')) return;

    try {
      const { error } = await supabase
        .from('work_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadWorkLogs();
    } catch (err: any) {
      alert('שגיאה במחיקה: ' + err.message);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getMonthSummary = () => {
    const summary: { [key: string]: { hours: number; salary: number; days: number } } = {};

    workLogs.forEach(dayLog => {
      dayLog.entries.forEach(entry => {
        if (!summary[entry.employee_id]) {
          summary[entry.employee_id] = { hours: 0, salary: 0, days: 0 };
        }
        summary[entry.employee_id].hours += entry.hours_worked;
        summary[entry.employee_id].salary += entry.hours_worked * entry.hourly_rate;
        summary[entry.employee_id].days += 1;
      });
    });

    return summary;
  };

  const exportToExcel = () => {
    const summary = getMonthSummary();
    let csv = 'שם עובד,ימי עבודה,שעות עבודה,שכר לשעה,סה״כ משכורת\n';

    employees.forEach(emp => {
      const stats = summary[emp.id] || { days: 0, hours: 0, salary: 0 };
      csv += `${emp.full_name},${stats.days},${stats.hours},₪${emp.hourly_rate},₪${stats.salary.toFixed(2)}\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `יומן_עבודה_${currentDate.getMonth() + 1}_${currentDate.getFullYear()}.csv`;
    link.click();
  };

  const changeMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const monthName = currentDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth();
  const summary = getMonthSummary();

  return (
    <div className="space-y-6">
      {/* Add Work Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">הוסף רשומת עבודה</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">תאריך</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">עובד</label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">בחר עובד...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name} - {emp.position}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">שעות עבודה</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.hours_worked}
                  onChange={(e) => setFormData({...formData, hours_worked: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">הערות</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={addWorkLog}
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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">יומן עבודה</h2>
          <p className="text-slate-500">מעקב אחר נוכחות עובדים ושעות עבודה</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-orange-700 transition-colors shadow-lg"
          >
            <Plus size={20} />
            הוסף רשומה
          </button>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg"
          >
            <Download size={20} />
            ייצא לאקסל
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight size={24} />
          </button>
          <h3 className="text-xl font-bold text-slate-800">{monthName}</h3>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Users size={20} />
              <span className="text-sm font-medium">עובדים פעילים</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{Object.keys(summary).length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Calendar size={20} />
              <span className="text-sm font-medium">סה״כ שעות</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {Object.values(summary).reduce((acc, s) => acc + s.hours, 0).toFixed(1)}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <DollarSign size={20} />
              <span className="text-sm font-medium">סה״כ שכר</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">
              ₪{Object.values(summary).reduce((acc, s) => acc + s.salary, 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Work Logs by Day */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-700 mb-3">רשומות יומיות</h4>
          {loading ? (
            <div className="text-center py-8 text-slate-500">טוען נתונים...</div>
          ) : workLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">אין רשומות לחודש זה</div>
          ) : (
            workLogs.map(dayLog => (
              <div key={dayLog.date} className="bg-slate-50 rounded-xl p-4">
                <div className="font-semibold text-slate-800 mb-3">
                  {new Date(dayLog.date).toLocaleDateString('he-IL', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="space-y-2">
                  {dayLog.entries.map(entry => (
                    <div key={entry.id} className="bg-white p-3 rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{entry.employee_name}</p>
                        <p className="text-sm text-slate-600">
                          {entry.hours_worked} שעות × ₪{entry.hourly_rate} = ₪{(entry.hours_worked * entry.hourly_rate).toFixed(2)}
                        </p>
                        {entry.notes && (
                          <p className="text-xs text-slate-500 mt-1">{entry.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => entry.id && deleteWorkLog(entry.id)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Employee Summary Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">סיכום לפי עובד</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 font-semibold text-slate-700">שם עובד</th>
                <th className="p-4 font-semibold text-slate-700">תפקיד</th>
                <th className="p-4 font-semibold text-slate-700">ימי עבודה</th>
                <th className="p-4 font-semibold text-slate-700">סה״כ שעות</th>
                <th className="p-4 font-semibold text-slate-700">שכר לשעה</th>
                <th className="p-4 font-semibold text-slate-700">סה״כ משכורת</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map(emp => {
                const stats = summary[emp.id] || { days: 0, hours: 0, salary: 0 };
                return (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">{emp.full_name}</td>
                    <td className="p-4 text-slate-600">{emp.position}</td>
                    <td className="p-4 text-slate-600">{stats.days}</td>
                    <td className="p-4 text-slate-600 font-mono">{stats.hours.toFixed(1)}</td>
                    <td className="p-4 text-slate-600">₪{emp.hourly_rate}</td>
                    <td className="p-4 font-bold text-orange-600">₪{stats.salary.toFixed(2)}</td>
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

export default WorkLog;
