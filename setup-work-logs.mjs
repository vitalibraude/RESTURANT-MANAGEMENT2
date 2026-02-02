import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gyvocixnoxlgfvccfmvf.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dm9jaXhub3hsZ2Z2Y2NmbXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MzI4MzgsImV4cCI6MjA1NDAwODgzOH0.w_UuMOJ_VW0nBfOcOKFP_AxMnwUFfKQnb6jOXhyMtZY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupWorkLogs() {
  try {
    console.log('Setting up work_logs table...');
    
    const schema = readFileSync('./database/work-logs-schema.sql', 'utf8');
    
    // Note: This requires supabase SQL editor or service role key
    // For now, please run the SQL manually in Supabase SQL Editor
    console.log('Please run the following SQL in Supabase SQL Editor:');
    console.log('='.repeat(50));
    console.log(schema);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

setupWorkLogs();
