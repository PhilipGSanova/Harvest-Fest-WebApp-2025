import {createClient} from '@supabase/supabase-js';

const supabaseUrl='https://ingujuageyaowinmqmgf.supabase.co';
const supabaseKey='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZ3VqdWFnZXlhb3dpbm1xbWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NjczOTcsImV4cCI6MjA2OTM0MzM5N30.pmJgU9nidKph4M4kCqf3Ed4pirUU4r09R7FnkPGtvsU';
const supabase=createClient(supabaseUrl,supabaseKey);

export default supabase;