// Supabase Configuration
const SUPABASE_URL = 'https://ytopnodbhyhontivamrr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0b3Bub2RiaHlob250aXZhbXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNzI2NDIsImV4cCI6MjA5Mjc0ODY0Mn0.OKpJAZ_yj7TAlBN1R68EZ__VSMXfWpeGFtHA8Ncv3-Q';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other scripts
window.supabase = supabaseClient;

console.log('Supabase Connected Successfully!');
