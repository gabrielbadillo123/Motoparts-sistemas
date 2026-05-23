// routes/orders.js — Pedidos de clientes

const express = require('express');
const router  = express.Router();
const { sql, getPool } = require('../config/db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// ─── POST /api/orders — Crear pedido ────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    const { items, shipping_address, notes } = req.body;
    // items: [{ product_id, quantity }]

    if (!items || !items.length)
      return res.status(400).json({ error: 'El pedido debe tener al menos un producto' });

    await transaction.begin();
    const tr = new sql.Request(transaction);

    // Verificar stock y calcular total
    let total = 0;
    const enriched = [];

    for (const item of items) {
      const prod = await new sql.Request(transaction)
        .input('pid', sql.Int, item.product_id)
        .query('SELECT id, name, price, stock FROM products WHERE id = @pid AND is_active = 1');

      if (!prod.recordset.length) throw new Error(`Producto ${item.product_id} no encontrado`);

      const p = prod.recordset[0];
      if (p.stock < item.quantity) throw new Error(`Stock insuficiente para "${p.name}"`);

      total += p.price * item.quantity;
      enriched.push({ ...item, unit_price: p.price });
    }

    // Insertar orden
    const orderResult = await tr
      .input('user_id',          sql.Int,       req.user.id)
      .input('total',            sql.Decimal(12,2), total)
      .input('shipping_address', sql.NVarChar,  shipping_address || null)
      .input('notes',            sql.NVarChar,  notes            || null)
      .query(`
        INSERT INTO orders (user_id, total, shipping_address, notes)
        OUTPUT INSERTED.id
        VALUES (@user_id, @total, @shipping_address, @notes)
      `);

    const order_id = orderResult.recordset[0].id;

    // Insertar items y descontar stock
    for (const item of enriched) {
      await new sql.Request(transaction)
        .input('order_id',   sql.Int,           order_id)
        .input('product_id', sql.Int,           item.product_id)
        .input('quantity',   sql.Int,           item.quantity)
        .input('unit_price', sql.Decimal(12,2), item.unit_price)
        .query(`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price)
          VALUES (@order_id, @product_id, @quantity, @unit_price)
        `);

      await new sql.Request(transaction)
        .input('qty', sql.Int, item.quantity)
        .input('pid', sql.Int, item.product_id)
        .query('UPDATE products SET stock = stock - @qty WHERE id = @pid');
    }

    await transaction.commit();
    res.status(201).json({ message: 'Pedido creado correctamente', order_id, total });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(400).json({ error: err.message || 'Error al crear el pedido' });
  }
});

// ─── GET /api/orders — Mis pedidos ─────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pool   = await getPool();
    const isAdmin = req.user.role === 'admin';

    const request = pool.request();
    let query = `
      SELECT o.id, o.status, o.total, o.shipping_address, o.notes, o.created_at,
             u.name AS customer_name, u.email AS customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    `;

    if (!isAdmin) {
      query += ' WHERE o.user_id = @uid';
      request.input('uid', sql.Int, req.user.id);
    }

    query += ' ORDER BY o.created_at DESC';
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// ─── GET /api/orders/:id — Detalle de pedido ────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const pool = await getPool();

    const order = await pool.request()
      .input('id', sql.Int, parseInt(req.params.id))
      .query('SELECT * FROM orders WHERE id = @id');

    if (!order.recordset.length) return res.status(404).json({ error: 'Pedido no encontrado' });
    const o = order.recordset[0];

    // Solo el dueño o un admin pueden verlo
    if (o.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Sin permiso' });

    const items = await pool.request()
      .input('oid', sql.Int, o.id)
      .query(`
        SELECT oi.*, p.name AS product_name, p.image_url
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = @oid
      `);

    res.json({ ...o, items: items.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
});

// ─── PATCH /api/orders/:id/status (admin) ───────────────────
router.patch('/:id/status', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status))
      return res.status(400).json({ error: 'Estado inválido' });

    const pool = await getPool();
    await pool.request()
      .input('status', sql.NVarChar, status)
      .input('id',     sql.Int,      parseInt(req.params.id))
      .query('UPDATE orders SET status = @status WHERE id = @id');

    res.json({ message: `Pedido actualizado a "${status}"` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

module.exports = router;
