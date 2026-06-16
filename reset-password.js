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

async function reset() {
  const env = getEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  // Find user id by email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  const testUser = users.find(u => u.email === 'himasouka02@gmail.com');
  
  if (!testUser) {
    console.log('Test user himasouka02@gmail.com not found.');
    process.exit(1);
  }

  console.log(`Resetting password for test user ${testUser.email}...`);
  const { error: resetError } = await supabase.auth.admin.updateUserById(testUser.id, {
    password: 'password123'
  });

  if (resetError) {
    console.error('Error resetting password:', resetError.message);
  } else {
    console.log('Password successfully reset to password123');
  }
  
  process.exit(0);
}

reset();
