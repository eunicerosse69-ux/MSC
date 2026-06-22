import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('MISSING_ENV');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    const { data, error } = await supabase.from('tracks').select('*').limit(5);
    if (error) {
      console.error('ERROR', error.message || error);
      process.exit(1);
    }
    console.log('OK', data.length);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('UNEXPECTED', err.message || err);
    process.exit(1);
  }
}

run();
