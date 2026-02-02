
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateCustomerMessage = async (type: string, details: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `צור הודעת SMS שיווקית קצרה ומושכת בעברית עבור לקוח מסעדה. 
      סוג ההודעה: ${type}.
      פרטים נוספים: ${details}.
      ההודעה צריכה להיות ידידותית, מקצועית ולכלול קריאה לפעולה.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating message:", error);
    return "מצטערים, לא הצלחנו ליצור הודעה כרגע.";
  }
};

export const getFinancialInsights = async (revenue: number, expenses: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `נתח את המצב הפיננסי של המסעדה: הכנסות ${revenue}₪, הוצאות ${expenses}₪. 
      תן עצה עסקית אחת קצרה וממוקדת בעברית לשיפור הרווחיות.`,
    });
    return response.text;
  } catch (error) {
    return "ניתוח נתונים אינו זמין כרגע.";
  }
};
