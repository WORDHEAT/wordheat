
import { createClient } from '@supabase/supabase-js';

// Credentials provided for the WordHeat application
const supabaseUrl = 'https://rfslpnihinkmtyiqdkvp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmc2xwbmloaW5rbXR5aXFka3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4OTU0NTgsImV4cCI6MjA3OTQ3MTQ1OH0.sVTbBfIit01xs6FJnY2Z_H7n7tZC8CyT8IbUs3Xgw_U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
