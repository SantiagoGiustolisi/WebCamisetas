let camisetas = [];
let carrito = [];

// Cargar camisetas desde JSON al inicio
fetch('RemerasFutbol.json')
  .then(response => response.json())
  .then(data => {
    camisetas = data;
    mostrarCamisetas(camisetas);
  })
  .catch(error => {
    console.error("Error al cargar camisetas:", error);
  });

// Mostrar las camisetas
function mostrarCamisetas(lista) {
    const contenedor = document.getElementById("listaCamisetas");
    contenedor.innerHTML = "";

    lista.forEach(camiseta => {
        contenedor.innerHTML += `
            <div class="camiseta">
                <img src="${camiseta.imagen}" alt="${camiseta.nombre}" onclick="abrirModal(${camiseta.id})">
                <h3>${camiseta.nombre}</h3>
                <p>${camiseta.precio}</p>
                Unidades disponibles: <p id="stock-${camiseta.id}">${camiseta.stock}</p> 
                <button onclick="agregarAlCarrito(${camiseta.id})">Agregar al carrito</button>
            </div>
        `;
    });
}

let imagenesActuales = [];
let indiceActual = 0;

function abrirModal(id) {
    const camiseta = camisetas.find(c => c.id === id);
    if (!camiseta || !camiseta.imagenesExtras || camiseta.imagenesExtras.length === 0) return;

    imagenesActuales = camiseta.imagenesExtras;
    indiceActual = 0;

    mostrarImagenActual();
    document.getElementById("modal").style.display = "flex";
}

function mostrarImagenActual() {
    const imagen = document.getElementById("imagenModal");
    imagen.src = imagenesActuales[indiceActual];
}

function cambiarImagen(direccion) {
    indiceActual += direccion;

    if (indiceActual < 0) {
        indiceActual = imagenesActuales.length - 1;
    } else if (indiceActual >= imagenesActuales.length) {
        indiceActual = 0;
    }

    mostrarImagenActual();
}

function cerrarModal() {
    document.getElementById("modal").style.display = "none";
}

function agregarAlCarrito(id) {
    const camisetaSeleccionada = camisetas.find(c => c.id === id);
    if (!camisetaSeleccionada) return;

    if (camisetaSeleccionada.stock <= 0) {
        alert("¡No hay más stock de esta camiseta!");
        return;
    }

    // Descontar el stock de la camiseta en el inventario
    camisetaSeleccionada.stock--; 

    // Actualizar el stock visual en la página
    document.getElementById(`stock-${camisetaSeleccionada.id}`).textContent = `Unidades disponibles: ${camisetaSeleccionada.stock}`;

    // Guardar el carrito en localStorage
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const existente = carrito.find(item => item.id === id);
    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({ ...camisetaSeleccionada, cantidad: 1 });
    }

    // Guardar el carrito y las camisetas actualizadas en localStorage
    localStorage.setItem("carrito", JSON.stringify(carrito));
    localStorage.setItem("camisetasConStock", JSON.stringify(camisetas)); // Actualizar el stock

    // Actualizar la visualización de las camisetas
    mostrarCamisetas(camisetas); 

    // Redirigir al carrito
    window.location.href = "carrito.html";
}

// Cargar las camisetas desde localStorage si están disponibles
const stockGuardado = JSON.parse(localStorage.getItem("camisetasConStock"));
if (stockGuardado) {
    camisetas = stockGuardado;
    mostrarCamisetas(camisetas);
} else {
    fetch('RemerasFutbol.json')
        .then(response => response.json())
        .then(data => {
            camisetas = data;
            localStorage.setItem("camisetasConStock", JSON.stringify(camisetas));
            mostrarCamisetas(camisetas);
        });
}

localStorage.setItem("camisetasConStock", JSON.stringify(camisetas));

// Función para redirigir a la página de checkout con todos los parámetros necesarios
function comprarAhoraDesdeCarrito(id) {
    const camiseta = carrito.find(item => item.id === id);
    if (camiseta) {
        const url = `checkout.html?nombre=${encodeURIComponent(camiseta.nombre)}&precio=${encodeURIComponent(camiseta.precio)}&imagen=${encodeURIComponent(camiseta.imagen)}&cantidad=${encodeURIComponent(camiseta.cantidad)}`;
        window.location.href = url;
    }
}

// Función para filtrar las camisetas
function filtrarCamisetas() {
    const texto = document.getElementById("buscador").value.toLowerCase();
    
    // Si el campo está vacío, no mostrar nada
    if (texto === "") {
        document.getElementById("listaCamisetas").innerHTML = ""; // Limpiar la lista
    } else {
        const filtradas = camisetas.filter(camiseta => camiseta.nombre.toLowerCase().includes(texto));
        mostrarCamisetas(filtradas);
    }
}

function enviarComprobante() {
    // Mostrar un mensaje de éxito
    alert("¡Compra exitosa! El comprobante se enviará a tu correo.");

    // Abrir Gmail en una nueva ventana con el destinatario predefinido
    window.open("https://mail.google.com/mail/?view=cm&fs=1&to=santiagogiustolisi10@gmail.com", "_blank");

    // Puedes retornar false para prevenir que el formulario se envíe realmente, ya que queremos abrir Gmail
    return false;
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}
