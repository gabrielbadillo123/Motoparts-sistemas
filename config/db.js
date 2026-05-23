const sql = require('mssql');

const config = {
  server:   'localhost',
  port:     1433,
  database: 'MotoPartesDB',
  user:     'sa',
  password: 'MotoPartes123!',
  options: {
    trustServerCertificate: true,
    enableArithAbort:       true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('✅ Conectado a SQL Server — MotoPartesDB');
  }
  return pool;
}

async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

module.exports = { sql, getPool, closePool };