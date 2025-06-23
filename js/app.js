// ===========================
// CONFIGURACIÓN DE LA API
// ===========================
const urlAPI = "https://fakestoreapi.com/products";
const categoriasPermitidas = ["electronics"]; 

// ===========================
// SELECCIÓN DE ELEMENTOS
// ===========================
const productosSeccion = document.querySelector('#productos');
const carritoList = document.querySelector('#lista-carrito');
const totalSpan = document.querySelector('#total');
const contadorCarrito = document.querySelector('#contador-carrito'); // Asegúrate de añadir este span en tu HTML
const formularioContacto = document.querySelector('#formulario-contacto form');
const nombreInput = document.querySelector('#nombre');
const emailInput = document.querySelector('#email');
const mensajeInput = document.querySelector('#mensaje');

// ===========================
// FUNCIONES PARA EL CARRITO
// ===========================
function obtenerCarrito() {
  return JSON.parse(localStorage.getItem('carrito')) || [];
}

function guardarCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function actualizarCarritoDOM() {
  const carrito = obtenerCarrito();
  carritoList.innerHTML = '';
  let total = 0;

  carrito.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${item.nombre} - $${item.precio} 
      <input class="cantidad-item" type="number" value="${item.cantidad}" min="1" data-id="${item.id}" />
      <button class="btn-eliminar" data-id="${item.id}">❌</button>
    `;
    carritoList.appendChild(li);
    total += item.precio * item.cantidad;
  });
  totalSpan.textContent = total.toFixed(2);
  actualizarContadorCarrito();

  // Eventos para cambiar cantidades
  document.querySelectorAll('.cantidad-item').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      actualizarCantidad(id, parseInt(e.target.value));
    });
  });
  // Eventos para eliminar productos
  document.querySelectorAll('.btn-eliminar').forEach(boton => {
    boton.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      eliminarDelCarrito(id);
    });
  });
}

function actualizarContadorCarrito() {
  const carrito = obtenerCarrito();
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  contadorCarrito.textContent = totalItems;
}

function agregarAlCarrito(producto) {
  const carrito = obtenerCarrito();
  const productoExistente = carrito.find(p => p.id === producto.id);

  if (productoExistente) {
    productoExistente.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  guardarCarrito(carrito);
  actualizarCarritoDOM();
}

function actualizarCantidad(idProducto, nuevaCantidad) {
  const carrito = obtenerCarrito();
  const producto = carrito.find(p => p.id === idProducto);
  if (producto && nuevaCantidad > 0) {
    producto.cantidad = nuevaCantidad;
    guardarCarrito(carrito);
    actualizarCarritoDOM();
  }
}

function eliminarDelCarrito(idProducto) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(item => item.id !== idProducto);
  guardarCarrito(carrito);
  actualizarCarritoDOM();
}

// ===========================
// RENDERIZADO DE PRODUCTOS
// ===========================
function crearTarjetaProducto(producto) {
  const div = document.createElement('div');
  div.classList.add('producto');

  div.innerHTML = `
    <img src="${producto.imagen}" alt="${producto.nombre}" title="${producto.nombre}">
    <h3>${producto.nombre}</h3>
    <p class="producto-precio">💵 $${producto.precio}</p>
    <button class="btn-agregar">🎮 Añadir al Carrito</button>
  `;

  const boton = div.querySelector('.btn-agregar');
  boton.addEventListener('click', () => {
    agregarAlCarrito(producto);
  });
  return div;
}

async function obtenerYRenderizarProductos() {
  try {
    const response = await fetch(urlAPI);
    if (!response.ok) {
      throw new Error("Error al obtener productos");
    }
    const productos = await response.json();

    const productosFiltrados = productos.filter(prod =>
      categoriasPermitidas.includes(prod.category)
    );
    productosSeccion.innerHTML = '<h2>🔥 Productos Gamer Destacados</h2>';
    const productosContainer = document.createElement('div');
    productosContainer.classList.add('productos-container');

    productosFiltrados.forEach(prod => {
      const producto = {
        id: prod.id,
        nombre: transformarNombreGamer(prod.title),
        precio: prod.price,
        imagen: prod.image
      };
      productosContainer.appendChild(crearTarjetaProducto(producto));
    });
    productosSeccion.appendChild(productosContainer);
  } catch (error) {
    productosSeccion.innerHTML = '<p>💔 No pudimos cargar los productos gamer en este momento. ¡Intentá de nuevo más tarde!</p>';
    console.error(error);
  }
}

// ===========================
// UTILERÍA PARA RENOMBRAR
// ===========================
function transformarNombreGamer(nombreOriginal) {
  return `🎮 ${nombreOriginal}`;
}

// ===========================
// VALIDACIÓN DE FORMULARIO
// ===========================
function validarFormulario(event) {
  if (!nombreInput.value.trim()) {
    alert("Por favor, ingresa tu nombre.");
    event.preventDefault();
    return;
  }

  const emailVal = emailInput.value.trim();
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regexEmail.test(emailVal)) {
    alert("Por favor, ingresa un correo electrónico válido.");
    event.preventDefault();
    return;
  }

  if (!mensajeInput.value.trim()) {
    alert("Por favor, ingresa un mensaje.");
    event.preventDefault();
    return;
  }

  alert("✅ ¡Formulario enviado exitosamente!");
}


// ===========================
// SIMULAR COMPRA
// ===========================
const btnFinalizar = document.querySelector('#btn-finalizar-compra');
if (btnFinalizar) {
  btnFinalizar.addEventListener('click', finalizarCompra);
}

function finalizarCompra() {
  const carrito = obtenerCarrito();
  if (carrito.length === 0) {
    alert("🛍️ El carrito está vacío. Agrega productos antes de finalizar.");
    return;
  }
  alert("✅ ¡Gracias por tu compra! Nos pondremos en contacto para continuar.");
  guardarCarrito([]);
  actualizarCarritoDOM();
}


// ===========================
// INICIALIZACIÓN
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  obtenerYRenderizarProductos();
  actualizarCarritoDOM();
  formularioContacto?.addEventListener('submit', validarFormulario);
});
