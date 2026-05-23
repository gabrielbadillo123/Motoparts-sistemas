// ─── Variables globales ──────────────────────────────────────
let cartItems = [];
let cartCount = 0;

// ─── Cargar productos desde la API ──────────────────────────
async function cargarProductos(categoria = null) {
  const grid = document.getElementById('productsGrid');
  const title = document.getElementById('productosTitle');
  const btnVerTodos = document.getElementById('btnVerTodos');

  grid.innerHTML = `<div style="text-align:center; padding:3rem; grid-column:1/-1;">
    <i class="fas fa-spinner fa-spin" style="font-size:2rem; color:#10b981"></i>
    <p>Cargando productos...</p>
  </div>`;

  try {
    let url = '/api/products?limit=18';
    if (categoria) url += `&category=${categoria}`;

    const res  = await fetch(url);
    const data = await res.json();
    const productos = data.data || [];

    if (!productos.length) {
      grid.innerHTML = `<p style="text-align:center; grid-column:1/-1; padding:2rem;">No hay productos en esta categoría.</p>`;
      return;
    }

    title.textContent = categoria ? `Categoría: ${categoria}` : 'Productos Destacados';
    btnVerTodos.style.display = categoria ? 'inline-flex' : 'none';

    grid.innerHTML = productos.map(p => `
      <div class="product-card fade-in">
        <div class="product-image">
          <img src="${p.image_url || '/placeholder.png'}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Sin+imagen'">
          ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
        </div>
        <div class="product-info">
          <h3>${p.name}</h3>
          <div class="product-rating">
            <div class="stars">${renderStars(p.avg_rating)}</div>
            <span>(${p.review_count} reseñas)</span>
          </div>
          <div class="product-price">
            <span class="current-price">$${Number(p.price).toLocaleString('es-CO')}</span>
            ${p.original_price ? `<span class="original-price">$${Number(p.original_price).toLocaleString('es-CO')}</span>` : ''}
          </div>
          <button class="btn btn-primary add-to-cart" onclick="agregarAlCarrito(${p.id}, '${p.name.replace(/'/g,"\\'")}', ${p.price}, '${p.image_url || ''}')">
            Agregar al Carrito
          </button>
        </div>
      </div>
    `).join('');

    // Animar cards
    setTimeout(() => {
      document.querySelectorAll('.product-card.fade-in').forEach(el => el.classList.add('visible'));
    }, 100);

  } catch (err) {
    // Si la API falla, mostrar productos del HTML estático
    console.warn('API no disponible, mostrando productos estáticos');
    cargarProductosEstaticos(categoria);
  }
}

function renderStars(rating) {
  const r = Math.round(rating || 0);
  return [1,2,3,4,5].map(i =>
    `<i class="${i <= r ? 'fas' : 'far'} fa-star"></i>`
  ).join('');
}

// ─── Fallback: productos estáticos si no hay API ─────────────
function cargarProductosEstaticos(categoria) {
  const grid  = document.getElementById('productsGrid');
  const todos = [
    { name: 'Pastillas de Freno Honda CB',  price: 45990,   original: 52990,   badge: 'Más Vendido', img: '' },
    { name: 'Filtro de Aceite Yamaha R15',  price: 18990,   original: 24990,   badge: 'Oferta',      img: '' },
    { name: 'Cadena 520 Reforzada',         price: 89990,   original: null,    badge: null,          img: '' },
    { name: 'Batería 12V 7Ah Gel',          price: 125990,  original: null,    badge: 'Nuevo',       img: '' },
    { name: 'Kit de Arrastre Suzuki GS',    price: 109990,  original: 129990,  badge: 'Popular',     img: '' },
    { name: 'Aceite Motul 5100 10W40',      price: 39990,   original: 44990,   badge: 'Recomendado', img: '' },
    { name: 'Llave Combinada 10mm',         price: 9990,    original: 12990,   badge: 'Herramienta', img: '' },
    { name: 'Carenado Kawasaki Z1000',      price: 1500000, original: 2000990, badge: 'Carrocería',  img: '' },
    { name: 'Válvula Yamaha FZ',            price: 19990,   original: 24990,   badge: 'Motor',       img: '' },
  ];

  grid.innerHTML = todos.map((p, i) => `
    <div class="product-card fade-in">
      <div class="product-image">
        <img src="${p.img || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(p.name)}" alt="${p.name}">
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="product-rating">
          <div class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
          <span>(0 reseñas)</span>
        </div>
        <div class="product-price">
          <span class="current-price">$${p.price.toLocaleString('es-CO')}</span>
          ${p.original ? `<span class="original-price">$${p.original.toLocaleString('es-CO')}</span>` : ''}
        </div>
        <button class="btn btn-primary add-to-cart" onclick="agregarAlCarrito(${i}, '${p.name.replace(/'/g,"\\'")}', ${p.price}, '')">
          Agregar al Carrito
        </button>
      </div>
    </div>
  `).join('');

  setTimeout(() => {
    document.querySelectorAll('.product-card.fade-in').forEach(el => el.classList.add('visible'));
  }, 100);
}

// ─── Filtrar por categoría ───────────────────────────────────
function filtrarCategoria(slug) {
  document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
  cargarProductos(slug);
}

// ─── Carrito ─────────────────────────────────────────────────
function agregarAlCarrito(id, nombre, precio, imagen) {
  const existing = cartItems.find(i => i.id === id);
  if (existing) {
    existing.quantity++;
  } else {
    cartItems.push({ id, name: nombre, price: precio, image: imagen, quantity: 1 });
  }
  cartCount++;
  document.getElementById('cartCount').textContent = cartCount;
  showNotification(`${nombre} agregado al carrito`, 'success');
}

function abrirCarrito() {
  showCartModal();
}

function cerrarCarrito() {
  const m = document.getElementById('carritoModal');
  if (m) m.style.display = 'none';
}

function showCartModal() {
  const modal = document.getElementById('carritoModal');
  const itemsDiv = document.getElementById('carritoItems');
  const totalDiv = document.getElementById('carritoTotal');

  if (!cartItems.length) {
    itemsDiv.innerHTML = '<p style="text-align:center; padding:2rem; color:#6b7280;">Tu carrito está vacío</p>';
    totalDiv.innerHTML = '';
  } else {
    itemsDiv.innerHTML = cartItems.map(item => `
      <div style="display:flex; align-items:center; gap:1rem; padding:1rem 0; border-bottom:1px solid #f3f4f6;">
        <img src="${item.image || 'https://via.placeholder.com/60'}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;" onerror="this.src='https://via.placeholder.com/60'">
        <div style="flex:1">
          <strong style="font-size:14px">${item.name}</strong><br>
          <span style="color:#10b981; font-weight:600">$${Number(item.price).toLocaleString('es-CO')}</span>
          <div style="display:flex; align-items:center; gap:8px; margin-top:8px;">
            <button onclick="cambiarCantidad(${item.id}, -1)" style="width:28px; height:28px; border:1px solid #d1d5db; background:white; border-radius:4px; cursor:pointer;">-</button>
            <span>${item.quantity}</span>
            <button onclick="cambiarCantidad(${item.id}, 1)" style="width:28px; height:28px; border:1px solid #d1d5db; background:white; border-radius:4px; cursor:pointer;">+</button>
          </div>
        </div>
        <button onclick="eliminarDelCarrito(${item.id})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:1.2rem;"><i class="fas fa-trash"></i></button>
      </div>
    `).join('');

    const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    totalDiv.innerHTML = `Total: $${total.toLocaleString('es-CO')}`;
  }

  modal.style.display = 'block';
}

function cambiarCantidad(id, delta) {
  const item = cartItems.find(i => i.id === id);
  if (!item) return;
  item.quantity += delta;
  cartCount += delta;
  if (item.quantity <= 0) {
    eliminarDelCarrito(id);
    return;
  }
  document.getElementById('cartCount').textContent = cartCount;
  showCartModal();
}

function eliminarDelCarrito(id) {
  const idx = cartItems.findIndex(i => i.id === id);
  if (idx > -1) {
    cartCount -= cartItems[idx].quantity;
    cartItems.splice(idx, 1);
    document.getElementById('cartCount').textContent = cartCount;
    showCartModal();
  }
}

function finalizarCompra() {
  cerrarCarrito();
  showNotification('Procesando pedido...', 'info');
  setTimeout(() => showNotification('¡Pedido confirmado! Recibirás un email.', 'success'), 2000);
  cartItems = [];
  cartCount = 0;
  document.getElementById('cartCount').textContent = 0;
}

// ─── Newsletter ──────────────────────────────────────────────
async function suscribirse() {
  const email = document.getElementById('newsletterEmail').value;
  if (!email) return;
  try {
    await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  } catch {}
  showNotification('¡Gracias por suscribirte!', 'success');
  document.getElementById('newsletterEmail').value = '';
}

// ─── Búsqueda ────────────────────────────────────────────────
function buscarProductos() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;
  document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
  const grid  = document.getElementById('productsGrid');
  const title = document.getElementById('productosTitle');
  title.textContent = `Resultados para: "${q}"`;
  grid.innerHTML = `<div style="text-align:center; padding:3rem; grid-column:1/-1;">
    <i class="fas fa-spinner fa-spin" style="font-size:2rem; color:#10b981"></i>
  </div>`;
  fetch(`/api/products?search=${encodeURIComponent(q)}`)
    .then(r => r.json())
    .then(data => {
      const productos = data.data || [];
      if (!productos.length) {
        grid.innerHTML = `<p style="text-align:center; grid-column:1/-1; padding:2rem;">No se encontraron resultados para "${q}"</p>`;
        return;
      }
      grid.innerHTML = productos.map(p => `
        <div class="product-card fade-in">
          <div class="product-image">
            <img src="${p.image_url || ''}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Sin+imagen'">
            ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
          </div>
          <div class="product-info">
            <h3>${p.name}</h3>
            <div class="product-price">
              <span class="current-price">$${Number(p.price).toLocaleString('es-CO')}</span>
              ${p.original_price ? `<span class="original-price">$${Number(p.original_price).toLocaleString('es-CO')}</span>` : ''}
            </div>
            <button class="btn btn-primary" onclick="agregarAlCarrito(${p.id}, '${p.name.replace(/'/g,"\\'")}', ${p.price}, '${p.image_url || ''}')">
              Agregar al Carrito
            </button>
          </div>
        </div>
      `).join('');
      setTimeout(() => document.querySelectorAll('.product-card.fade-in').forEach(el => el.classList.add('visible')), 100);
    })
    .catch(() => showNotification('Error al buscar productos', 'error'));
}

// ─── Menú móvil ──────────────────────────────────────────────
function toggleMenu() {
  const nav  = document.getElementById('mobileNav');
  const btn  = document.querySelector('.mobile-menu-btn i');
  nav.classList.toggle('active');
  btn.className = nav.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
}

// ─── Notificaciones ──────────────────────────────────────────
function showNotification(message, type = 'info') {
  const n = document.createElement('div');
  const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
  Object.assign(n.style, {
    position: 'fixed', top: '20px', right: '20px',
    padding: '15px 20px', borderRadius: '8px',
    color: 'white', fontWeight: '600', zIndex: '9999',
    transform: 'translateX(120%)', transition: 'transform 0.3s ease',
    maxWidth: '300px', backgroundColor: colors[type] || colors.info,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  });
  n.textContent = message;
  document.body.appendChild(n);
  setTimeout(() => n.style.transform = 'translateX(0)', 100);
  setTimeout(() => {
    n.style.transform = 'translateX(120%)';
    setTimeout(() => n.remove(), 300);
  }, 3000);
}

// ─── Header scroll ───────────────────────────────────────────
let lastScrollTop = 0;
window.addEventListener('scroll', () => {
  const st = window.pageYOffset;
  document.querySelector('.header').style.transform =
    st > lastScrollTop && st > 100 ? 'translateY(-100%)' : 'translateY(0)';
  lastScrollTop = st;
});

// ─── Smooth scroll ───────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      const offset = document.querySelector('.header').offsetHeight;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    }
  });
});

// ─── Enter en búsqueda ───────────────────────────────────────
document.getElementById('searchInput')?.addEventListener('keypress', e => {
  if (e.key === 'Enter') buscarProductos();
});

// ─── Inicializar ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
});
