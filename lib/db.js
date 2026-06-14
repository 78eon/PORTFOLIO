import { Pool } from 'pg'

if (!global._pgPool) {
  global._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
  })
}

export default global._pgPool
