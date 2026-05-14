const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const schema = `
CREATE TABLE IF NOT EXISTS management_areas (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de logs caso não exista
CREATE TABLE IF NOT EXISTS access_logs (
    id SERIAL PRIMARY KEY,
    aeronave_familia TEXT,
    aeronave_serial TEXT,
    autorizador TEXT,
    nome TEXT,
    id_number TEXT,
    alianca_check TEXT,
    chave_check TEXT,
    relogio_check TEXT,
    cracha_check TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
`;

async function init() {
  try {
    console.log('Initializing local database...');
    await pool.query(schema);
    console.log('Database initialized successfully.');
    
    // Inserir áreas de exemplo se estiver vazio
    const { rows } = await pool.query('SELECT count(*) FROM management_areas');
    if (parseInt(rows[0].count) === 0) {
      await pool.query("INSERT INTO management_areas (name) VALUES ('Cockpit'), ('Asa Esquerda'), ('Asa Direita'), ('Trem de Pouso')");
      console.log('Sample areas inserted.');
    }
    
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await pool.end();
  }
}

init();
