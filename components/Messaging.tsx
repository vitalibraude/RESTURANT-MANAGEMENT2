
import React, { useState } from 'react';
import { Send, Sparkles, MessageSquare } from 'lucide-react';
import { generateCustomerMessage } from '../services/geminiService';

const Messaging: React.FC = () => {
  const [msgType, setMsgType] = useState('הנחה מיוחדת');
  const [details, setDetails] = useState('');
  const [generated, setGenerated] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const msg = await generateCustomerMessage(msgType, details);
    setGenerated(msg || "");
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">הודעות ללקוחות</h2>
        <p className="text-slate-500">השתמש בבינה מלאכותית כדי ליצור הודעות שיווקיות מנצחות.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Sparkles className="text-orange-500" size={20} />
            מחולל הודעות חכם
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">סוג ההודעה</label>
            <select 
              value={msgType}
              onChange={(e) => setMsgType(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
            >
              <option>הנחה מיוחדת</option>
              <option>חגיגת יום הולדת</option>
              <option>מנה חדשה בתפריט</option>
              <option>תזכורת להזמנה</option>
              <option>סקר שביעות רצון</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">פרטים נוספים (אופציונלי)</label>
            <textarea 
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="למשל: 20% הנחה על כל הקינוחים רק היום..."
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 transition-all h-32 resize-none"
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? "יוצר הודעה..." : "צור הודעה עם AI"}
          </button>
        </div>

        <div className="flex flex-col">
          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">תצוגה מקדימה (SMS)</span>
              <MessageSquare size={18} className="text-slate-300" />
            </div>
            
            {generated ? (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-slate-800 leading-relaxed relative flex-1">
                {generated}
                <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-r border-b border-slate-100 rotate-45"></div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic">
                לחצו על הכפתור כדי לראות את ההודעה המיוצרת כאן
              </div>
            )}

            {generated && (
              <button className="mt-6 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20">
                <Send size={18} />
                שלח לכל הלקוחות
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messaging;
