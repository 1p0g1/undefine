import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  'https://eaclljwvsicezmkjnlbm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhY2xsand2c2ljZXpta2pubGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMjk3NzIsImV4cCI6MjA1OTYwNTc3Mn0.56sdQFmC4sNAbyenWoDeiATGC1Vq2cXURTxJxLvZtrM'
);

console.log('Supabase client created:', !!supabase);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('words').select('*').limit(1);
    
    if (error) {
      console.error('DB connection error:', error);
      return;
    }
    
    console.log('DB connection successful!');
    console.log('Sample word:', data[0]);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection(); 