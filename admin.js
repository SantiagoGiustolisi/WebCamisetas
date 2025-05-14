function verificarPassword() {
    const pass = document.getElementById("adminPass").value;
    if (pass === "admin123") {
        document.getElementById("loginAdmin").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
        cargarDatosAdmin();
    } else {
        document.getElementById("error").innerText = "Contraseña incorrecta.";
    }
}

function cargarDatosAdmin() {
    fetch("RemerasFutbol.json")
        .then(res => res.json())
        .then(data => {
            const stockContainer = document.getElementById("stockContainer");
            stockContainer.innerHTML = "";
            data.forEach(item => {
                stockContainer.innerHTML += `
                    <div>
                        <strong>${item.nombre}</strong> - 
                        <span id="stock-${item.id}">Stock: ${stockCamisetas[item.id] || item.stock || 0}</span>
                    </div>
                `;
            });
        });

    mostrarVentas();
    mostrarPedidos();
}

function mostrarPedidos() {
    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    document.getElementById("pedidosContainer").innerText = pedidos.length > 0 ?
        pedidos.map(p => `${p.nombre} x${p.cantidad}`).join("\n") :
        "Sin pedidos cargados.";
}

function mostrarSeccion(id) {
    document.querySelectorAll(".admin-section").forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";

    if (id === 'ventas') {
        mostrarCamisetas(camisetas);
        mostrarStockEnVentas();
    }
}

let camisetas = [];
let stockCamisetas = {};
let historialVentas = JSON.parse(localStorage.getItem("historialVentas")) || [];

fetch('RemerasFutbol.json')
    .then(response => response.json())
    .then(data => {
        camisetas = data;
        mostrarCamisetas(camisetas);
        cargarStock();
        mostrarVentas();
    })
    .catch(error => {
        console.error("Error al cargar camisetas:", error);
    });

function mostrarCamisetas(lista) {
    const selectCamisetas = document.getElementById("ventaCamiseta");
    if (!selectCamisetas) return;

    selectCamisetas.innerHTML = "";

    const optionDefault = document.createElement("option");
    optionDefault.value = "";
    optionDefault.textContent = "Seleccionar Camiseta";
    selectCamisetas.appendChild(optionDefault);

    lista.forEach(camiseta => {
        const option = document.createElement("option");
        option.value = camiseta.id;
        const stock = stockCamisetas[camiseta.id] ?? camiseta.stock ?? 0;
        option.textContent = `${camiseta.nombre} (Stock: ${stock})`;
        selectCamisetas.appendChild(option);
    });
}

function cargarStock() {
    const stockGuardado = localStorage.getItem("stockCamisetas");
    if (stockGuardado) {
        stockCamisetas = JSON.parse(stockGuardado);
        camisetas.forEach(camiseta => {
            camiseta.stock = stockCamisetas[camiseta.id] ?? camiseta.stock;
        });
    } else {
        camisetas.forEach(camiseta => {
            stockCamisetas[camiseta.id] = camiseta.stock;
        });
        localStorage.setItem("stockCamisetas", JSON.stringify(stockCamisetas));
    }

    camisetas.forEach(c => {
        const el = document.getElementById(`stock-${c.id}`);
        if (el) el.textContent = `Stock: ${c.stock}`;
    });

    mostrarFormularioAgregarStock();
}

function mostrarFormularioAgregarStock() {
    const stockAgregarContainer = document.getElementById("stockAgregar");
    if (!stockAgregarContainer) return;

    stockAgregarContainer.innerHTML = "";

    const form = document.createElement("form");

    const select = document.createElement("select");
    select.id = "selectCamisetaStock";
    select.innerHTML = `<option value="">Seleccionar Camiseta</option>`;
    camisetas.forEach(camiseta => {
        const option = document.createElement("option");
        option.value = camiseta.id;
        option.textContent = `${camiseta.nombre} (Stock actual: ${camiseta.stock || 0})`;
        select.appendChild(option);
    });
    form.appendChild(select);

    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number";
    inputCantidad.id = "cantidadAgregarStock";
    inputCantidad.min = 1;
    inputCantidad.placeholder = "Cantidad a agregar";
    form.appendChild(inputCantidad);

    const buttonAgregar = document.createElement("button");
    buttonAgregar.type = "button";
    buttonAgregar.textContent = "Agregar Stock";
    buttonAgregar.onclick = function () {
        const idCamiseta = parseInt(select.value);
        const cantidadAgregar = parseInt(inputCantidad.value);

        if (!idCamiseta || cantidadAgregar <= 0) {
            alert("Selecciona una camiseta y una cantidad válida.");
            return;
        }

        const camiseta = camisetas.find(c => c.id === idCamiseta);
        if (!camiseta) {
            alert("Camiseta no encontrada");
            return;
        }

        stockCamisetas[idCamiseta] = (stockCamisetas[idCamiseta] || 0) + cantidadAgregar;
        camiseta.stock = stockCamisetas[idCamiseta];
        localStorage.setItem("stockCamisetas", JSON.stringify(stockCamisetas));

        const stockElement = document.getElementById(`stock-${idCamiseta}`);
        if (stockElement) {
            stockElement.textContent = `Stock: ${camiseta.stock}`;
        }

        inputCantidad.value = "";
        select.value = "";

        alert(`Se agregaron ${cantidadAgregar} unidades a ${camiseta.nombre}. Nuevo stock: ${camiseta.stock}`);
        mostrarCamisetas(camisetas);
    };

    form.appendChild(buttonAgregar);
    stockAgregarContainer.appendChild(form);
}

function realizarVenta() {
    const idCamiseta = parseInt(document.getElementById("ventaCamiseta").value);
    const cantidadVenta = parseInt(document.getElementById("cantidadVenta").value);
    const camiseta = camisetas.find(c => c.id === idCamiseta);

    if (!camiseta) {
        alert("Camiseta no encontrada");
        return;
    }

    if (stockCamisetas[camiseta.id] < cantidadVenta) {
        alert("No hay suficiente stock");
        return;
    }

    stockCamisetas[camiseta.id] -= cantidadVenta;
    camiseta.stock = stockCamisetas[camiseta.id];
    localStorage.setItem("stockCamisetas", JSON.stringify(stockCamisetas));

    const venta = {
        nombre: camiseta.nombre,
        cantidad: cantidadVenta,
        precio: camiseta.precio,
        total: camiseta.precio * cantidadVenta,
        fecha: new Date().toLocaleString()
    };

    historialVentas.push(venta);
    localStorage.setItem("historialVentas", JSON.stringify(historialVentas));

    alert(`Venta realizada: ${cantidadVenta} ${camiseta.nombre} vendidas`);

    const stockElement = document.getElementById(`stock-${camiseta.id}`);
    if (stockElement) {
        stockElement.textContent = `Stock: ${camiseta.stock}`;
    }

    mostrarCamisetas(camisetas);
    mostrarVentas();
}

function mostrarVentas() {
    const historial = JSON.parse(localStorage.getItem("historialVentas")) || [];
    const container = document.getElementById("ventasRealizadas");

    if (!container) return;

    container.innerHTML = "";

    if (historial.length > 0) {
        historial.forEach(venta => {
            const html = `<div>🧾 ${venta.fecha} - ${venta.nombre} x${venta.cantidad} = $${venta.total}</div>`;
            container.innerHTML += html;
        });
    } else {
        container.innerHTML = "Aún no se han realizado ventas.";
    }
}

function vaciarVentas() {
    if (confirm("¿Estás seguro de que deseas eliminar todas las ventas?")) {
        localStorage.removeItem("historialVentas");
        historialVentas = [];
        document.getElementById('ventasRealizadas').innerHTML = 'Aún no se han realizado ventas.';
        alert('Las ventas han sido eliminadas.');
    }
}

window.onload = function () {
    mostrarVentas();
};
