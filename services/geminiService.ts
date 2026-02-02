// Simple service without AI dependency

export const generateCustomerMessage = async (type: string, details: string) => {
  // Return predefined messages based on type
  const messages: Record<string, string> = {
    'ברכה': `שלום! ${details} 🎉`,
    'מבצע': `מבצע מיוחד! ${details} 🔥 הזמינו עכשיו!`,
    'עדכון': `עדכון חשוב: ${details}`,
    'תודה': `תודה רבה! ${details} ❤️`,
  };
  
  return messages[type] || `${details}`;
};

export const getFinancialInsights = async (revenue: number, expenses: number) => {
  const profit = revenue - expenses;
  const margin = ((profit / revenue) * 100).toFixed(1);
  
  if (profit > 0) {
    return `✅ רווח של ${profit.toLocaleString()}₪ (${margin}% מהכנסות). המשיכו כך!`;
  } else {
    return `⚠️ הפסד של ${Math.abs(profit).toLocaleString()}₪. מומלץ לבדוק הוצאות ולשפר שיווק.`;
  }
};
