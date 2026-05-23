# MotoPartes — Backend Node.js + SQL Server

## Requisitos
- Node.js 18+
- SQL Server (local con SQL Server Management Studio)

## Pasos para arrancar

### 1. Instalar dependencias
```
npm install
```

### 2. Configurar la conexión
Edita el archivo `.env` con tus datos de SQL Server:
```
DB_SERVER=localhost          # o DESKTOP-XXX\SQLEXPRESS
DB_DATABASE=MotoPartesDB
DB_USER=sa
DB_PASSWORD=tu_password
DB_TRUST_CERT=true
```

### 3. Crear la base de datos
Abre SQL Server Management Studio, conecta a tu instancia
y ejecuta el archivo `db/schema.sql` completo.

### 4. Cargar los datos iniciales
En SSMS ejecuta el archivo `db/seed.sql`.
Esto crea categorías, marcas y los 18 productos del catálogo.

### 5. Copiar tu HTML al proyecto
Copia tu `index.html`, `styles.css` y `script.js`
dentro de la carpeta `public/`.

### 6. Arrancar el servidor
```
npm run dev      ← con auto-reload (desarrollo)
npm start        ← producción
```

Abre http://localhost:3000

## Estructura del proyecto
```
motopartes/
├── config/
│   └── db.js              ← Conexión a SQL Server
├── db/
│   ├── schema.sql          ← Crea tablas en SSMS
│   └── seed.sql            ← Datos iniciales
├── middleware/
│   └── auth.js             ← Validación JWT
├── public/                 ← Tu HTML, CSS, JS e imágenes
│   └── uploads/            ← Imágenes subidas
├── routes/
│   ├── auth.js             ← /api/auth (login, registro)
│   ├── categories.js       ← /api/categories
│   ├── newsletter.js       ← /api/newsletter
│   ├── orders.js           ← /api/orders
│   └── products.js         ← /api/products
├── .env                    ← Variables de entorno
├── package.json
└── server.js               ← Punto de entrada
```

## Endpoints principales
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/products | Listar productos (filtros: category, brand, search) |
| GET | /api/products/:slug | Detalle de producto |
| POST | /api/products | Crear producto (admin) |
| PUT | /api/products/:id | Editar producto (admin) |
| DELETE | /api/products/:id | Eliminar producto (admin) |
| GET | /api/categories | Listar categorías |
| POST | /api/auth/register | Registro de usuario |
| POST | /api/auth/login | Login → devuelve JWT |
| GET | /api/auth/me | Perfil del usuario logueado |
| GET | /api/orders | Mis pedidos |
| POST | /api/orders | Crear pedido |
| PATCH | /api/orders/:id/status | Cambiar estado (admin) |
| POST | /api/newsletter | Suscribirse al newsletter |
