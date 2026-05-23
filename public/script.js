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

async function finalizarCompra() {
  cerrarCarrito();

  // Crear formulario de checkout
  const checkoutHTML = `
    <div id="checkoutModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:10000; overflow-y:auto; padding:20px;">
      <div style="background:white; border-radius:12px; max-width:600px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 20px 40px rgba(0,0,0,0.1);">
        <div style="display:flex; justify-content:space-between; align-items:center; padding:20px; border-bottom:1px solid #e5e7eb;">
          <h3 style="margin:0; color:#059669;"><i class="fas fa-credit-card"></i> Finalizar Compra</h3>
          <button onclick="document.getElementById('checkoutModal').remove()" style="background:none; border:none; font-size:20px; cursor:pointer;">×</button>
        </div>
        <form id="checkoutForm" style="padding:20px;">
          <div style="margin-bottom:25px;">
            <h4 style="margin:0 0 15px 0; color:#374151; font-size:16px;">Información Personal</h4>
            <input type="text" placeholder="Nombre completo" id="checkoutName" required style="width:100%; padding:12px; border:1px solid #d1d5db; border-radius:8px; margin-bottom:15px; box-sizing:border-box;">
            <input type="email" placeholder="Correo electrónico" id="checkoutEmail" required style="width:100%; padding:12px; border:1px solid #d1d5db; border-radius:8px; margin-bottom:15px; box-sizing:border-box;">
            <input type="tel" placeholder="Teléfono" id="checkoutPhone" required style="width:100%; padding:12px; border:1px solid #d1d5db; border-radius:8px; margin-bottom:15px; box-sizing:border-box;">
            <input type="text" placeholder="Documento de identidad" id="checkoutDocument" required style="width:100%; padding:12px; border:1px solid #d1d5db; border-radius:8px; box-sizing:border-box;">
          </div>

          <div style="margin-bottom:25px;">
            <h4 style="margin:0 0 15px 0; color:#374151; font-size:16px;">Dirección de Entrega</h4>
            <input type="text" placeholder="Dirección completa" id="checkoutAddress" required style="width:100%; padding:12px; border:1px solid #d1d5db; border-radius:8px; margin-bottom:15px; box-sizing:border-box;">
            <input type="text" placeholder="Ciudad" id="checkoutCity" required style="width:100%; padding:12px; border:1px solid #d1d5db; border-radius:8px; margin-bottom:15px; box-sizing:border-box;">
            <input type="text" placeholder="Código postal" id="checkoutPostal" required style="width:100%; padding:12px; border:1px solid #d1d5db; border-radius:8px; box-sizing:border-box;">
          </div>

          <div style="margin-bottom:25px;">
            <h4 style="margin:0 0 15px 0; color:#374151; font-size:16px;">Método de Pago</h4>
            <label style="display:flex; align-items:center; gap:10px; padding:12px; border:1px solid #d1d5db; border-radius:8px; margin-bottom:10px; cursor:pointer;">
              <input type="radio" name="payment" value="card" checked required>
              <span><i class="fas fa-credit-card"></i> Tarjeta de Crédito/Débito</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:12px; border:1px solid #d1d5db; border-radius:8px; margin-bottom:10px; cursor:pointer;">
              <input type="radio" name="payment" value="pse" required>
              <span><i class="fas fa-university"></i> PSE</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:12px; border:1px solid #d1d5db; border-radius:8px; cursor:pointer;">
              <input type="radio" name="payment" value="cash" required>
              <span><i class="fas fa-money-bill"></i> Pago Contraentrega</span>
            </label>
          </div>

          <div style="background:#f9fafb; padding:20px; border-radius:8px; margin:20px 0;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
              <span>Subtotal:</span>
              <span id="subtotal">$0</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
              <span>Envío:</span>
              <span>$15.000</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-weight:700; font-size:18px; color:#059669; border-top:1px solid #d1d5db; padding-top:10px; margin-top:15px;">
              <span>Total:</span>
              <span id="totalAmount">$0</span>
            </div>
          </div>

          <button type="submit" style="width:100%; padding:15px; background:#059669; color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer; font-size:16px;">
            <i class="fas fa-lock"></i> Confirmar Pedido
          </button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', checkoutHTML);

  // Calcular totales
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + 15000;
  document.getElementById('subtotal').textContent = '$' + subtotal.toLocaleString('es-CO');
  document.getElementById('totalAmount').textContent = '$' + total.toLocaleString('es-CO');

  // Manejar envío del formulario
  document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const orderData = {
      name: document.getElementById('checkoutName').value,
      email: document.getElementById('checkoutEmail').value,
      phone: document.getElementById('checkoutPhone').value,
      document: document.getElementById('checkoutDocument').value,
      address: document.getElementById('checkoutAddress').value,
      city: document.getElementById('checkoutCity').value,
      postal_code: document.getElementById('checkoutPostal').value,
      payment_method: document.querySelector('input[name="payment"]:checked').value,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    };

    document.getElementById('checkoutModal').remove();
    showNotification('Procesando pedido...', 'info');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok) {
        showNotification(`¡Pedido #${result.order_id} confirmado! Recibirás un email de confirmación.`, 'success');
        cartItems = [];
        cartCount = 0;
        document.getElementById('cartCount').textContent = 0;
      } else {
        showNotification('Error: ' + result.error, 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Error al procesar el pedido: ' + err.message, 'error');
    }
  });
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
