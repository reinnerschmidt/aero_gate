import { Pool } from 'pg';

// Configuração comum para conexões na Railway
const sslConfig = {
  rejectUnauthorized: false,
};

// Banco Local (Aero Gate)
export const localPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
});

// Banco Externo (Comparador de Imagens)
export const externalPool = new Pool({
  connectionString: process.env.COMPARADOR_DATABASE_URL,
  ssl: sslConfig,
});
