// routes/newsletter.js

const express = require('express');
const router  = express.Router();
const { sql, getPool } = require('../config/db');

// POST /api/newsletter
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });

    const pool = await getPool();
    await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM newsletter WHERE email = @email)
          INSERT INTO newsletter (email) VALUES (@email)
      `);
    res.json({ message: '¡Suscripción exitosa!' });
  } catch (err) {
    res.status(500).json({ error: 'Error al suscribirse' });
  }
});

module.exports = router;
