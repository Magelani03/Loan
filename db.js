// db.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://sgdjwdaykeeoovqhjhrh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnZGp3ZGF5a2Vlb292cWhqaHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTk3MzYsImV4cCI6MjA3Njg5NTczNn0.DykuOEKUYd_ZzeynfetBQ83HwVbDR8FB7dSLsX1qrco';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
