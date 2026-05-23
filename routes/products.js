// routes/products.js — CRUD de productos

const express = require('express');
const router  = express.Router();
const { sql, getPool } = require('../config/db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const multer  = require('multer');
const path    = require('path');

// ─── Multer: subida de imágenes ──────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

// ─── GET /api/products ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const { category, brand, search, page = 1, limit = 18 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const request = pool.request();
    request.input('offset', sql.Int, offset);
    request.input('limit',  sql.Int, parseInt(limit));

    let where = 'WHERE p.is_active = 1';

    if (category) {
      where += ' AND c.slug = @category';
      request.input('category', sql.NVarChar, category);
    }
    if (brand) {
      where += ' AND b.slug = @brand';
      request.input('brand', sql.NVarChar, brand);
    }
    if (search) {
      where += ' AND (p.name LIKE @search OR p.description LIKE @search)';
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    const query = `
      SELECT
        p.id, p.name, p.slug, p.description,
        p.price, p.original_price, p.stock,
        p.image_url, p.badge, p.is_active,
        c.name AS category_name, c.slug AS category_slug,
        b.name AS brand_name,    b.slug AS brand_slug,
        ISNULL(AVG(CAST(r.rating AS FLOAT)), 0) AS avg_rating,
        COUNT(r.id) AS review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands      b ON p.brand_id    = b.id
      LEFT JOIN reviews     r ON p.id          = r.product_id
      ${where}
      GROUP BY
        p.id, p.name, p.slug, p.description,
        p.price, p.original_price, p.stock,
        p.image_url, p.badge, p.is_active,
        c.name, c.slug, b.name, b.slug
      ORDER BY p.id
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const result = await request.query(query);

    // Total para paginación
    const countReq = pool.request();
    let countWhere = 'WHERE p.is_active = 1';
    if (category) { countWhere += ' AND c.slug = @cat'; countReq.input('cat', sql.NVarChar, category); }
    if (brand)    { countWhere += ' AND b.slug = @brd'; countReq.input('brd', sql.NVarChar, brand); }
    if (search)   { countWhere += ' AND (p.name LIKE @s OR p.description LIKE @s)'; countReq.input('s', sql.NVarChar, `%${search}%`); }

    const countResult = await countReq.query(`
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands      b ON p.brand_id    = b.id
      ${countWhere}
    `);

    res.json({
      data: result.recordset,
      pagination: {
        total: countResult.recordset[0].total,
        page:  parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult.recordset[0].total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('ERROR /api/products:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/products/:slug ─────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('slug', sql.NVarChar, req.params.slug)
      .query(`
        SELECT p.*, c.name AS category_name, c.slug AS category_slug,
               b.name AS brand_name, b.slug AS brand_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands      b ON p.brand_id    = b.id
        WHERE p.slug = @slug AND p.is_active = 1
      `);

    if (!result.recordset.length)
      return res.status(404).json({ error: 'Producto no encontrado' });

    const reviews = await pool.request()
      .input('pid', sql.Int, result.recordset[0].id)
      .query(`
        SELECT r.rating, r.comment, r.created_at, u.name AS user_name
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.product_id = @pid
        ORDER BY r.created_at DESC
      `);

    res.json({ ...result.recordset[0], reviews: reviews.recordset });
  } catch (err) {
    console.error('ERROR /api/products/:slug:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/products (admin) ──────────────────────────────
router.post('/', authMiddleware, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const pool = await getPool();
    const { name, description, price, original_price, stock, badge, category_id, brand_id } = req.body;
    const slug      = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.request()
      .input('name',           sql.NVarChar,      name)
      .input('slug',           sql.NVarChar,      slug)
      .input('description',    sql.NVarChar,      description    || null)
      .input('price',          sql.Decimal(12,2), parseFloat(price))
      .input('original_price', sql.Decimal(12,2), original_price ? parseFloat(original_price) : null)
      .input('stock',          sql.Int,           parseInt(stock) || 0)
      .input('image_url',      sql.NVarChar,      image_url)
      .input('badge',          sql.NVarChar,      badge          || null)
      .input('category_id',    sql.Int,           category_id    || null)
      .input('brand_id',       sql.Int,           brand_id       || null)
      .query(`
        INSERT INTO products (name, slug, description, price, original_price, stock, image_url, badge, category_id, brand_id)
        OUTPUT INSERTED.*
        VALUES (@name, @slug, @description, @price, @original_price, @stock, @image_url, @badge, @category_id, @brand_id)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('ERROR POST /api/products:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/products/:id (admin) ───────────────────────────
router.put('/:id', authMiddleware, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const pool = await getPool();
    const { name, description, price, original_price, stock, badge, category_id, brand_id, is_active } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    const request = pool.request()
      .input('name',           sql.NVarChar,      name)
      .input('description',    sql.NVarChar,      description    || null)
      .input('price',          sql.Decimal(12,2), parseFloat(price))
      .input('original_price', sql.Decimal(12,2), original_price ? parseFloat(original_price) : null)
      .input('stock',          sql.Int,           parseInt(stock))
      .input('badge',          sql.NVarChar,      badge          || null)
      .input('category_id',    sql.Int,           category_id    || null)
      .input('brand_id',       sql.Int,           brand_id       || null)
      .input('is_active',      sql.Bit,           is_active !== undefined ? parseInt(is_active) : 1)
      .input('id',             sql.Int,           parseInt(req.params.id));

    let updateQuery = `
      UPDATE products SET
        name = @name, description = @description,
        price = @price, original_price = @original_price,
        stock = @stock, badge = @badge,
        category_id = @category_id, brand_id = @brand_id,
        is_active = @is_active
    `;
    if (image_url) {
      updateQuery += ', image_url = @image_url';
      request.input('image_url', sql.NVarChar, image_url);
    }
    updateQuery += ' OUTPUT INSERTED.* WHERE id = @id';

    const result = await request.query(updateQuery);
    if (!result.recordset.length)
      return res.status(404).json({ error: 'Producto no encontrado' });

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('ERROR PUT /api/products/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/products/:id (admin — soft delete) ──────────
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, parseInt(req.params.id))
      .query('UPDATE products SET is_active = 0 WHERE id = @id');
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('ERROR DELETE /api/products/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;