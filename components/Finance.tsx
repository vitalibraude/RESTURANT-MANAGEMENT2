
import React from 'react';
import { CreditCard, FileText, Download } from 'lucide-react';

interface Transaction {
  id: string;
  invoiceNumber: number;
  customerName: string;
  beforeVAT: number;
  vat: number;
  tip: number;
  dateTime: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    invoiceNumber: 1003,
    customerName: 'דוד כהן',
    beforeVAT: 250,
    vat: 42.5,
    tip: 25,
    dateTime: '02/02/2026 14:30'
  },
  {
    id: '2',
    invoiceNumber: 1004,
    customerName: 'שרה לוי',
    beforeVAT: 180,
    vat: 30.6,
    tip: 20,
    dateTime: '02/02/2026 15:15'
  },
  {
    id: '3',
    invoiceNumber: 1005,
    customerName: 'משה ישראלי',
    beforeVAT: 420,
    vat: 71.4,
    tip: 50,
    dateTime: '02/02/2026 16:00'
  },
  {
    id: '4',
    invoiceNumber: 1006,
    customerName: 'רחל אברהם',
    beforeVAT: 310,
    vat: 52.7,
    tip: 35,
    dateTime: '02/02/2026 17:45'
  },
  {
    id: '5',
    invoiceNumber: 1007,
    customerName: 'יוסף מזרחי',
    beforeVAT: 195,
    vat: 33.15,
    tip: 0,
    dateTime: '02/02/2026 18:20'
  },
  {
    id: '6',
    invoiceNumber: 1008,
    customerName: 'מירי גולן',
    beforeVAT: 540,
    vat: 91.8,
    tip: 70,
    dateTime: '02/02/2026 19:10'
  },
];

const Finance: React.FC = () => {
  const totalBeforeVAT = mockTransactions.reduce((sum, t) => sum + t.beforeVAT, 0);
  const totalVAT = mockTransactions.reduce((sum, t) => sum + t.vat, 0);
  const totalTips = mockTransactions.reduce((sum, t) => sum + t.tip, 0);
  const grandTotal = totalBeforeVAT + totalVAT + totalTips;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">כספים, חיובים וסליקה</h2>
          <p className="text-sm md:text-base text-slate-500">ניהול תשלומים, חשבוניות וסליקה.</p>
        </div>
        <button className="bg-orange-600 text-white px-4 md:px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-orange-700 transition-colors shadow-lg">
          <Download size={20} />
          <span>ייצא לאקסל</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <SummaryCard label="סה״כ לפני מע״מ" value={`₪${totalBeforeVAT.toLocaleString()}`} color="bg-blue-50 text-blue-600" />
        <SummaryCard label="מע״מ" value={`₪${totalVAT.toLocaleString()}`} color="bg-purple-50 text-purple-600" />
        <SummaryCard label="טיפים" value={`₪${totalTips.toLocaleString()}`} color="bg-green-50 text-green-600" />
        <SummaryCard label="סה״כ כולל" value={`₪${grandTotal.toLocaleString()}`} color="bg-orange-50 text-orange-600" />
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-slate-600" />
            <h3 className="font-bold text-slate-800">חשבוניות היום</h3>
          </div>
          <span className="text-sm text-slate-500">{mockTransactions.length} עסקאות</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-3 md:p-4 font-semibold">מס׳ חשבונית</th>
                <th className="p-3 md:p-4 font-semibold">שם הסועד</th>
                <th className="p-3 md:p-4 font-semibold">לפני מע״מ</th>
                <th className="p-3 md:p-4 font-semibold">מע״מ (17%)</th>
                <th className="p-3 md:p-4 font-semibold">טיפ</th>
                <th className="p-3 md:p-4 font-semibold">סה״כ</th>
                <th className="p-3 md:p-4 font-semibold">תאריך ושעה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockTransactions.map((transaction) => {
                const total = transaction.beforeVAT + transaction.vat + transaction.tip;
                return (
                  <tr key={transaction.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 md:p-4">
                      <span className="font-mono font-bold text-orange-600">#{transaction.invoiceNumber}</span>
                    </td>
                    <td className="p-3 md:p-4 font-medium text-slate-800">{transaction.customerName}</td>
                    <td className="p-3 md:p-4 text-slate-600 font-mono">₪{transaction.beforeVAT.toLocaleString()}</td>
                    <td className="p-3 md:p-4 text-slate-600 font-mono">₪{transaction.vat.toLocaleString()}</td>
                    <td className="p-3 md:p-4 text-green-600 font-mono">
                      {transaction.tip > 0 ? `₪${transaction.tip}` : '-'}
                    </td>
                    <td className="p-3 md:p-4 font-bold text-slate-800">₪{total.toLocaleString()}</td>
                    <td className="p-3 md:p-4 text-slate-500 text-sm">{transaction.dateTime}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold">
                <td colSpan={2} className="p-3 md:p-4">סה״כ</td>
                <td className="p-3 md:p-4 font-mono">₪{totalBeforeVAT.toLocaleString()}</td>
                <td className="p-3 md:p-4 font-mono">₪{totalVAT.toLocaleString()}</td>
                <td className="p-3 md:p-4 font-mono text-green-400">₪{totalTips.toLocaleString()}</td>
                <td className="p-3 md:p-4">₪{grandTotal.toLocaleString()}</td>
                <td className="p-3 md:p-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  label: string;
  value: string;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, color }) => (
  <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
    <p className="text-xs md:text-sm text-slate-500 font-medium mb-1">{label}</p>
    <h4 className={`text-lg md:text-2xl font-bold ${color.split(' ')[1]}`}>{value}</h4>
  </div>
);

export default Finance;
