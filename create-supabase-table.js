import dotenv from 'dotenv';
import pkg from 'pg';
import dns from 'dns/promises';

dotenv.config();

const { Client } = pkg;
const dbUrl = process.env.SUPABASE_DB_URL;
const tableName = 'tracks';

if (!dbUrl) {
  console.error('Missing SUPABASE_DB_URL in environment. Set it to your Supabase database URL.');
  process.exit(1);
}

const createTableSql = `
CREATE TABLE IF NOT EXISTS public.${tableName} (
  id text PRIMARY KEY,
  vessel text,
  origin text,
  dest text,
  eta text,
  status text,
  loc text,
  moving boolean DEFAULT false,
  inserted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
`;

const ensureMovingSql = `
ALTER TABLE public.${tableName}
  ADD COLUMN IF NOT EXISTS moving boolean DEFAULT false;
`;

function parseDbUrl(url) {
  try {
    const u = new URL(url);
    return {
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      host: u.hostname,
      port: u.port || 5432,
      database: u.pathname ? u.pathname.slice(1) : 'postgres',
    };
  } catch (err) {
    throw new Error('Invalid SUPABASE_DB_URL');
  }
}

async function resolveHost(host) {
  const tryResolves = async () => {
    try {
      const addresses = await dns.resolve4(host);
      if (addresses && addresses.length > 0) return addresses[0];
    } catch (err) {
      // ignore
    }

    try {
      const addresses = await dns.resolve6(host);
      if (addresses && addresses.length > 0) return addresses[0];
    } catch (err) {
      // ignore
    }

    return null;
  };

  let address = await tryResolves();
  if (address) return address;

  console.log('Retrying DNS resolution using 1.1.1.1...');
  dns.setServers(['1.1.1.1']);
  address = await tryResolves();
  if (address) return address;

  throw new Error(`Unable to resolve host ${host}`);
}

async function createTable() {
  const params = parseDbUrl(dbUrl);

  try {
    console.log(`Resolving host ${params.host}...`);
    const address = await resolveHost(params.host);
    console.log(`Resolved ${params.host} -> ${address}`);

    const client = new Client({
      host: address,
      port: params.port,
      user: params.user,
      password: params.password,
      database: params.database,
      ssl: { rejectUnauthorized: false },
    });

    console.log(`Connecting to database and creating table ${tableName}...`);
    await client.connect();
    await client.query(createTableSql);
    console.log(`Ensuring 'moving' column exists...`);
    await client.query(ensureMovingSql);
    console.log(`Table ${tableName} is ready.`);
    await client.end();
  } catch (err) {
    console.error('Failed to create table:', err.message || err);
    process.exit(1);
  }
}

createTable().catch((err) => {
  console.error('Unexpected error:', err.message || err);
  process.exit(1);
});