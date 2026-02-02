
import React, { useState } from 'react';
import { HelpCircle, Volume2, X } from 'lucide-react';

const AppGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const guideSections = [
    {
      title: 'מכירות והזמנות',
      content: 'כאן תוכלו לנהל את כל ההזמנות הנכנסות מהשולחנות, לעדכן סטטוס הכנה ולבצע תשלום סופי.'
    },
    {
      title: 'ניהול מלאי',
      content: 'עקבו אחרי חומרי הגלם שלכם. המערכת תתריע לכם כאשר פריט מסוים עומד להיגמר.'
    },
    {
      title: 'כספים וסליקה',
      content: 'ריכוז כל ההכנסות וההוצאות, כולל ניהול עסקאות אשראי, דוחות רווח והפסד וניתוח ביצועים.'
    },
    {
      title: 'הודעות ללקוח',
      content: 'שלחו הודעות SMS שיווקיות או אישורי הזמנה ללקוחות שלכם בעזרת בינה מלאכותית.'
    },
    {
      title: 'ניהול עובדים',
      content: 'שעון נוכחות, ניהול משמרות ומעקב אחר ביצועי המלצרים והטבחים.'
    },
    {
      title: 'דוחות וניתוחים',
      content: 'גרפים מתקדמים המראים את המנות הפופולריות ביותר ואת שעות העומס במסעדה.'
    }
  ];

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const speakAll = () => {
    const fullText = "ברוכים הבאים לסמארט-רסט. האפליקציה מכסה את התחומים הבאים: " + 
      guideSections.map(s => `${s.title}: ${s.content}`).join(". ");
    speak(fullText);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 bg-orange-600 text-white p-4 rounded-full shadow-2xl hover:bg-orange-700 transition-transform hover:scale-110 z-50 flex items-center gap-2"
      >
        <HelpCircle size={24} />
        <span className="font-bold hidden md:inline">מקרא האפליקציה</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-orange-600 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <HelpCircle size={28} />
                <h2 className="text-2xl font-bold">מדריך ומקרא האפליקציה</h2>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={speakAll}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                  title="הקרא הכל"
                >
                  <Volume2 size={20} />
                  <span>הקרא הכל</span>
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full">
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {guideSections.map((section, idx) => (
                <div key={idx} className="border border-slate-100 p-4 rounded-xl hover:bg-orange-50 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-800">{section.title}</h3>
                    <button 
                      onClick={() => speak(`${section.title}. ${section.content}`)}
                      className="text-slate-400 hover:text-orange-600 transition-colors"
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 text-center text-sm text-slate-500 border-t border-slate-100">
              לחצו על האייקון של הרמקול ליד כל סעיף כדי לשמוע הסבר קולי
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppGuide;
