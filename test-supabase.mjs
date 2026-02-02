import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://htqutxvjykalsxejfvuv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0cXV0eHZqeWthbHN4ZWpmdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNTA2NTAsImV4cCI6MjA4NTYyNjY1MH0.T3EG46jFPWz3aO0ANuRDA4cZZdtnW35NheqemuEluUY';

console.log('🔍 בודק חיבור ל-Supabase...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('📡 מנסה לקרוא פריטי מלאי...');
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .limit(3);

    if (error) {
      console.error('❌ שגיאה:', error.message);
      console.error('פרטים:', error);
      process.exit(1);
    }

    console.log('✅ החיבור עובד!');
    console.log(`📦 נמצאו ${data.length} פריטים:\n`);
    data.forEach(item => {
      console.log(`  - ${item.name}: ${item.quantity} ${item.unit}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ שגיאה קריטית:', err);
    process.exit(1);
  }
}

testConnection();
