-- ============================================================
-- db/schema.sql
-- Ejecuta este script en SQL Server Management Studio (SSMS)
-- para crear la base de datos y todas las tablas de MotoPartes
-- ============================================================

-- 1. Crear la base de datos (si no existe)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'MotoPartesDB')
BEGIN
    CREATE DATABASE MotoPartesDB;
END
GO

USE MotoPartesDB;
GO

-- ─── Tabla: categories ──────────────────────────────────────
CREATE TABLE categories (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL UNIQUE,
    slug        NVARCHAR(100) NOT NULL UNIQUE,
    icon        NVARCHAR(100),
    description NVARCHAR(500),
    created_at  DATETIME2 DEFAULT GETDATE()
);
GO

-- ─── Tabla: brands ──────────────────────────────────────────
CREATE TABLE brands (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    name       NVARCHAR(100) NOT NULL UNIQUE,
    slug       NVARCHAR(100) NOT NULL UNIQUE,
    logo_url   NVARCHAR(300),
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- ─── Tabla: products ────────────────────────────────────────
CREATE TABLE products (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    name          NVARCHAR(200) NOT NULL,
    slug          NVARCHAR(200) NOT NULL UNIQUE,
    description   NVARCHAR(MAX),
    price         DECIMAL(12,2) NOT NULL,
    original_price DECIMAL(12,2),                  -- precio antes del descuento
    stock         INT NOT NULL DEFAULT 0,
    image_url     NVARCHAR(300),
    badge         NVARCHAR(50),                    -- 'Más Vendido', 'Oferta', 'Nuevo'...
    category_id   INT REFERENCES categories(id) ON DELETE SET NULL,
    brand_id      INT REFERENCES brands(id)      ON DELETE SET NULL,
    is_active     BIT DEFAULT 1,
    created_at    DATETIME2 DEFAULT GETDATE(),
    updated_at    DATETIME2 DEFAULT GETDATE()
);
GO

-- ─── Tabla: users ───────────────────────────────────────────
CREATE TABLE users (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    name          NVARCHAR(150) NOT NULL,
    email         NVARCHAR(200) NOT NULL UNIQUE,
    password_hash NVARCHAR(300) NOT NULL,
    role          NVARCHAR(20) NOT NULL DEFAULT 'customer', -- 'customer' | 'admin'
    phone         NVARCHAR(30),
    address       NVARCHAR(500),
    is_active     BIT DEFAULT 1,
    created_at    DATETIME2 DEFAULT GETDATE()
);
GO

-- ─── Tabla: orders ──────────────────────────────────────────
CREATE TABLE orders (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    user_id      INT REFERENCES users(id),
    status       NVARCHAR(30) NOT NULL DEFAULT 'pending',
                 -- pending | confirmed | shipped | delivered | cancelled
    total        DECIMAL(12,2) NOT NULL,
    shipping_address NVARCHAR(500),
    notes        NVARCHAR(500),
    created_at   DATETIME2 DEFAULT GETDATE(),
    updated_at   DATETIME2 DEFAULT GETDATE()
);
GO

-- ─── Tabla: order_items ─────────────────────────────────────
CREATE TABLE order_items (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    order_id    INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  INT NOT NULL REFERENCES products(id),
    quantity    INT NOT NULL,
    unit_price  DECIMAL(12,2) NOT NULL,   -- precio al momento de la compra
    subtotal    AS (quantity * unit_price) PERSISTED
);
GO

-- ─── Tabla: reviews ─────────────────────────────────────────
CREATE TABLE reviews (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id     INT REFERENCES users(id),
    rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     NVARCHAR(1000),
    created_at  DATETIME2 DEFAULT GETDATE()
);
GO

-- ─── Tabla: newsletter ──────────────────────────────────────
CREATE TABLE newsletter (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    email      NVARCHAR(200) NOT NULL UNIQUE,
    subscribed_at DATETIME2 DEFAULT GETDATE()
);
GO

-- ─── Trigger: actualizar updated_at en products ─────────────
CREATE OR ALTER TRIGGER trg_products_updated_at
ON products
AFTER UPDATE
AS
BEGIN
    UPDATE products
    SET updated_at = GETDATE()
    FROM products p
    INNER JOIN inserted i ON p.id = i.id;
END;
GO

-- ─── Trigger: actualizar updated_at en orders ───────────────
CREATE OR ALTER TRIGGER trg_orders_updated_at
ON orders
AFTER UPDATE
AS
BEGIN
    UPDATE orders
    SET updated_at = GETDATE()
    FROM orders o
    INNER JOIN inserted i ON o.id = i.id;
END;
GO

PRINT '✅ Esquema MotoPartesDB creado correctamente.';
GO
