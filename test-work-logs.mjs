import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gyvocixnoxlgfvccfmvf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dm9jaXhub3hsZ2Z2Y2NmbXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MzI4MzgsImV4cCI6MjA1NDAwODgzOH0.w_UuMOJ_VW0nBfOcOKFP_AxMnwUFfKQnb6jOXhyMtZY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createWorkLogsTable() {
  try {
    console.log('Creating work_logs table...');
    
    // Create the table using RPC or direct SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS work_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
          work_date DATE NOT NULL,
          hours_worked DECIMAL(5,2) NOT NULL CHECK (hours_worked > 0),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (error) {
      console.log('Table might already exist or need manual creation.');
      console.log('Please run the SQL from work-logs-schema.sql in Supabase Dashboard');
    } else {
      console.log('✅ work_logs table created successfully!');
    }

    // Test insert
    console.log('\nTesting work_logs table...');
    const testResult = await supabase.from('work_logs').select('count');
    console.log('Table is accessible:', testResult.error ? 'NO - ' + testResult.error.message : 'YES');
    
  } catch (error) {
    console.error('Error:', error);
    console.log('\nℹ️  Please create the table manually in Supabase SQL Editor using the schema from database/work-logs-schema.sql');
  }
}

createWorkLogsTable();
