// routes/categories.js

const express = require('express');
const router  = express.Router();
const { sql, getPool } = require('../config/db');

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request().query('SELECT * FROM categories ORDER BY name');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

module.exports = router;
