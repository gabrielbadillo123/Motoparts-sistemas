// routes/checkout.js — Procesar compras sin autenticación

const express = require('express');
const router = express.Router();
const { sql, getPool } = require('../config/db');

// ─── POST /api/checkout — Crear pedido sin autenticación ────
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      document, 
      address, 
      city, 
      postal_code, 
      payment_method,
      items 
    } = req.body;

    // Validar datos
    if (!name || !email || !phone || !address || !items || !items.length) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const pool = await getPool();

    // Calcular total
    let total = 0;
    for (const item of items) {
      const result = await pool.request()
        .input('id', sql.Int, parseInt(item.id))
        .query('SELECT price FROM products WHERE id = @id');
      
      if (!result.recordset.length) {
        return res.status(404).json({ error: `Producto ${item.id} no encontrado` });
      }

      total += result.recordset[0].price * item.quantity;
    }

    // Agregar envío
    const shipping = 15000;
    const grand_total = total + shipping;

    // Insertar en tabla orders (sin user_id)
    const orderResult = await pool.request()
      .input('customer_name', sql.NVarChar, name)
      .input('customer_email', sql.NVarChar, email)
      .input('customer_phone', sql.NVarChar, phone)
      .input('customer_document', sql.NVarChar, document)
      .input('total', sql.Decimal(12, 2), grand_total)
      .input('shipping_address', sql.NVarChar, address)
      .input('city', sql.NVarChar, city)
      .input('postal_code', sql.NVarChar, postal_code)
      .input('payment_method', sql.NVarChar, payment_method)
      .query(`
        INSERT INTO orders (total, shipping_address, notes)
        OUTPUT INSERTED.id
        VALUES (@total, @shipping_address, 
                CONCAT('Cliente: ', @customer_name, ' | Email: ', @customer_email, 
                       ' | Tel: ', @customer_phone, ' | Doc: ', @customer_document,
                       ' | Ciudad: ', @city, ' | CP: ', @postal_code,
                       ' | Pago: ', @payment_method))
      `);

    const orderId = orderResult.recordset[0].id;

    // Insertar items del pedido
    for (const item of items) {
      const prodResult = await pool.request()
        .input('id', sql.Int, parseInt(item.id))
        .query('SELECT price FROM products WHERE id = @id');

      const unit_price = prodResult.recordset[0].price;

      await pool.request()
        .input('order_id', sql.Int, orderId)
        .input('product_id', sql.Int, parseInt(item.id))
        .input('quantity', sql.Int, item.quantity)
        .input('unit_price', sql.Decimal(12, 2), unit_price)
        .query(`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price)
          VALUES (@order_id, @product_id, @quantity, @unit_price)
        `);
    }

    res.status(201).json({
      success: true,
      order_id: orderId,
      total: grand_total,
      message: '¡Pedido confirmado! Recibirás un email de confirmación.'
    });

  } catch (err) {
    console.error('Error en checkout:', err);
    res.status(500).json({ error: 'Error al procesar el pedido: ' + err.message });
  }
});

module.exports = router;
