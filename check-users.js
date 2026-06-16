const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function getEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local file not found in project root!');
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      env[match[1]] = value.trim();
    }
  });
  return env;
}

async function checkUsers() {
  const env = getEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  console.log('--- Diagnosing Database Users ---');

  // Fetch profiles
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  if (pError) {
    console.error('Error fetching profiles:', pError.message);
  } else {
    console.log(`Profiles (${profiles.length}):`, JSON.stringify(profiles, null, 2));
  }

  // Fetch agencies
  const { data: agencies, error: aError } = await supabase.from('agencies').select('*');
  if (aError) {
    console.error('Error fetching agencies:', aError.message);
  } else {
    console.log(`Agencies (${agencies.length}):`, JSON.stringify(agencies, null, 2));
  }

  // Fetch users from Auth
  const { data: { users }, error: uError } = await supabase.auth.admin.listUsers();
  if (uError) {
    console.error('Error listing auth users:', uError.message);
  } else {
    console.log(`Auth Users (${users.length}):`, users.map(u => ({ id: u.id, email: u.email, confirmed: !!u.email_confirmed_at })));
  }

  process.exit(0);
}

checkUsers();
