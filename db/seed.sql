-- ============================================================
-- db/seed.sql
-- Datos iniciales: categorías, marcas y todos los productos
-- del HTML original. Ejecutar DESPUÉS de schema.sql
-- ============================================================

USE MotoPartesDB;
GO

-- ─── Categorías ─────────────────────────────────────────────
INSERT INTO categories (name, slug, icon, description) VALUES
('Motor',        'motor',        'fas fa-cog',          'Pistones, anillos, válvulas y más'),
('Frenos',       'frenos',       'fas fa-tools',        'Pastillas, discos, líquidos'),
('Eléctrico',    'electrico',    'fas fa-tachometer-alt','Baterías, luces, cables'),
('Carrocería',   'carroceria',   'fas fa-shield-alt',   'Carenados, espejos, guardabarros'),
('Lubricantes',  'lubricantes',  'fas fa-oil-can',      'Aceites, filtros, aditivos'),
('Herramientas', 'herramientas', 'fas fa-wrench',       'Llaves, destornilladores, equipos');
GO

-- ─── Marcas ─────────────────────────────────────────────────
INSERT INTO brands (name, slug) VALUES
('Honda',   'honda'),
('Yamaha',  'yamaha'),
('Kawasaki','kawasaki'),
('Suzuki',  'suzuki'),
('Bajaj',   'bajaj'),
('Motul',   'motul'),
('Castrol', 'castrol'),
('Brembo',  'brembo');
GO

-- ─── Productos ──────────────────────────────────────────────
-- (category_id y brand_id según las tablas anteriores)
INSERT INTO products (name, slug, description, price, original_price, stock, image_url, badge, category_id, brand_id) VALUES

-- Frenos
('Pastillas de Freno Honda CB',
 'pastillas-freno-honda-cb',
 'Pastillas de freno originales para Honda CB, alto rendimiento y larga durabilidad.',
 45990, 52990, 50,
 '/uploads/brembo-brake-pads.png', 'Más Vendido',
 (SELECT id FROM categories WHERE slug='frenos'),
 (SELECT id FROM brands     WHERE slug='brembo')),

('Disco de Freno Suzuki GS',
 'disco-freno-suzuki-gs',
 'Disco de freno ventilado para Suzuki GS, resistente al calor y corrosión.',
 59990, 69990, 30,
 '/uploads/disco-freno-suzuki.png', 'Frenos',
 (SELECT id FROM categories WHERE slug='frenos'),
 (SELECT id FROM brands     WHERE slug='suzuki')),

('Caliper Honda CB',
 'caliper-honda-cb',
 'Caliper de freno delantero original para Honda CB.',
 89990, 99990, 15,
 '/uploads/caliper-honda-cb.png', 'Frenos',
 (SELECT id FROM categories WHERE slug='frenos'),
 (SELECT id FROM brands     WHERE slug='honda')),

-- Lubricantes
('Filtro de Aceite Yamaha R15',
 'filtro-aceite-yamaha-r15',
 'Filtro de aceite de alta eficiencia para Yamaha R15.',
 18990, 24990, 80,
 '/uploads/filtro aceite r15.jpeg', 'Oferta',
 (SELECT id FROM categories WHERE slug='lubricantes'),
 (SELECT id FROM brands     WHERE slug='yamaha')),

('Aceite Motul 5100 10W40',
 'aceite-motul-5100-10w40',
 'Aceite semisintético de alta performance para motos 4T.',
 39990, 44990, 100,
 '/uploads/MOTUL510010W-404T1L.webp', 'Recomendado',
 (SELECT id FROM categories WHERE slug='lubricantes'),
 (SELECT id FROM brands     WHERE slug='motul')),

('Aceite Castrol Power1 10W40',
 'aceite-castrol-power1-10w40',
 'Aceite semisintético Castrol Power1, protección total para tu motor.',
 34990, 39990, 90,
 '/uploads/aceite-castrol.png', 'Lubricante',
 (SELECT id FROM categories WHERE slug='lubricantes'),
 (SELECT id FROM brands     WHERE slug='castrol')),

-- Transmisión
('Cadena 520 Reforzada',
 'cadena-520-reforzada',
 'Cadena de transmisión 520 con eslabones reforzados, compatible con múltiples modelos.',
 89990, NULL, 40,
 '/uploads/cadena 520.jpeg', NULL,
 (SELECT id FROM categories WHERE slug='motor'),
 NULL),

('Kit de Arrastre Suzuki GS',
 'kit-arrastre-suzuki-gs',
 'Kit completo de arrastre (piñón, corona y cadena) para Suzuki GS.',
 109990, 129990, 25,
 '/uploads/kit arrastre susuki gs.jpeg', 'Popular',
 (SELECT id FROM categories WHERE slug='motor'),
 (SELECT id FROM brands     WHERE slug='suzuki')),

-- Eléctrico
('Batería 12V 7Ah Gel',
 'bateria-12v-7ah-gel',
 'Batería de gel sellada 12V 7Ah, libre de mantenimiento.',
 125990, NULL, 20,
 '/uploads/bateria 12v.jpeg', 'Nuevo',
 (SELECT id FROM categories WHERE slug='electrico'),
 NULL),

('Batería 12V 9Ah AGM',
 'bateria-12v-9ah-agm',
 'Batería AGM de alta descarga 12V 9Ah para motos de media-alta cilindrada.',
 139990, 149990, 18,
 '/uploads/bateria-agm.png', 'Eléctrico',
 (SELECT id FROM categories WHERE slug='electrico'),
 NULL),

('Bobina de Encendido Honda CB',
 'bobina-encendido-honda-cb',
 'Bobina de encendido original para Honda CB, mejora el arranque y rendimiento.',
 44990, 49990, 22,
 '/uploads/bobina-encendido.png', 'Eléctrico',
 (SELECT id FROM categories WHERE slug='electrico'),
 (SELECT id FROM brands     WHERE slug='honda')),

-- Carrocería
('Carenado Kawasaki Z1000',
 'carenado-kawasaki-z1000',
 'Carenado completo para Kawasaki Z1000, ABS de alta resistencia.',
 1500000, 2000990, 5,
 '/uploads/carenado z1000.jpg', 'Carrocería',
 (SELECT id FROM categories WHERE slug='carroceria'),
 (SELECT id FROM brands     WHERE slug='kawasaki')),

('Carenado Yamaha FZ',
 'carenado-yamaha-fz',
 'Carenado lateral para Yamaha FZ, fácil instalación.',
 99990, 109990, 12,
 '/uploads/carenado-yamaha-fz.png', 'Carrocería',
 (SELECT id FROM categories WHERE slug='carroceria'),
 (SELECT id FROM brands     WHERE slug='yamaha')),

('Espejo Retrovisor Universal',
 'espejo-retrovisor-universal',
 'Espejo retrovisor universal con rosca estándar, compatible con la mayoría de motos.',
 19990, 24990, 60,
 '/uploads/espejo-retrovisor.png', 'Carrocería',
 (SELECT id FROM categories WHERE slug='carroceria'),
 NULL),

-- Motor
('Válvula Yamaha FZ',
 'valvula-yamaha-fz',
 'Válvula de admisión original para Yamaha FZ.',
 19990, 24990, 35,
 '/uploads/valvula-yamaha-fz.png', 'Motor',
 (SELECT id FROM categories WHERE slug='motor'),
 (SELECT id FROM brands     WHERE slug='yamaha')),

('Kit de Empaques Motor Yamaha',
 'kit-empaques-motor-yamaha',
 'Kit completo de empaques y juntas para motor Yamaha.',
 24990, 29990, 28,
 '/uploads/kit-empaques.png', 'Motor',
 (SELECT id FROM categories WHERE slug='motor'),
 (SELECT id FROM brands     WHERE slug='yamaha')),

-- Herramientas
('Llave Combinada 10mm',
 'llave-combinada-10mm',
 'Llave combinada de acero cromo-vanadio 10mm.',
 9990, 12990, 120,
 '/uploads/llave 10mm.jpeg', 'Herramienta',
 (SELECT id FROM categories WHERE slug='herramientas'),
 NULL),

('Llave Ajustable 8"',
 'llave-ajustable-8',
 'Llave ajustable de 8 pulgadas, apertura hasta 25mm.',
 14990, 17990, 75,
 '/uploads/llave-ajustable.png', 'Herramienta',
 (SELECT id FROM categories WHERE slug='herramientas'),
 NULL);
GO

-- ─── Usuario admin por defecto ───────────────────────────────
-- Contraseña: Admin123! (cámbiala después)
INSERT INTO users (name, email, password_hash, role) VALUES
('Administrador', 'admin@motopartes.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHWy',
 'admin');
GO

PRINT '✅ Datos semilla insertados correctamente.';
GO
