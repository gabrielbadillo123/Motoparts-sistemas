// server.js — Punto de entrada principal

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { getPool, closePool } = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares globales ────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (HTML, CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));

// ─── Rutas API ───────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/products',   require('./routes/products'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/checkout',   require('./routes/checkout'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/newsletter', require('./routes/newsletter'));

// ─── Ruta raíz → index.html ──────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Manejo de rutas no encontradas ─────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ─── Arranque del servidor ───────────────────────────────────
async function start() {
  try {
    await getPool();
    console.log('✅ Base de datos conectada');
  } catch (err) {
    console.warn('⚠️ Sin base de datos:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📦 API disponible en http://localhost:${PORT}/api`);
  });
}

// Cerrar conexión al detener el proceso
process.on('SIGINT',  async () => { await closePool(); process.exit(0); });
process.on('SIGTERM', async () => { await closePool(); process.exit(0); });

start();