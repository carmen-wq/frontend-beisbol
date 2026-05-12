let filaActual = null;

// Capturar elementos del DOM (como en equipos.js)
const editPartidoId = document.getElementById('editPartidoId');
const editLocal = document.getElementById('editLocal');
const editVisitante = document.getElementById('editVisitante');
const editPrincipal = document.getElementById('editPrincipal');
const editCentral = document.getElementById('editCentral');
const editLineal1 = document.getElementById('editLineal1');
const editLineal2 = document.getElementById('editLineal2');
const editCampo = document.getElementById('editCampo');
const editMarcadorLocal = document.getElementById('editMarcadorLocal');
const editMarcadorVisitante = document.getElementById('editMarcadorVisitante');
const editEstado = document.getElementById('editEstado');
const btnGuardarEdicion = document.getElementById('btnGuardarEdicion');

const playerTableBody = document.getElementById("playerTableBody");
const modalEditar = document.getElementById("modalEditar");
const modalCrear = document.getElementById("modalCrear");
const modalAmpayers = document.getElementById("modalAmpayers");

document.addEventListener("DOMContentLoaded", async () => {
    await llenarCatalogos();
    await obtenerPartidos();
});

// 1. LLENAR SELECTS (Equipos, Locaciones y los 4 Umpires)
async function llenarCatalogos() {
    try {
        const [resE, resU, resL] = await Promise.all([
            fetch("https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/equipos"),
            fetch("https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/umpires"),
            fetch("https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/locaciones")
        ]);

        // Validar que las respuestas sean OK
        if (!resE.ok || !resU.ok || !resL.ok) {
            console.error("Error en una de las respuestas del servidor");
            return;
        }

        const dataEquipos = await resE.json();
        const dataUmpires = await resU.json();
        const dataLocaciones = await resL.json();

        const equipos = dataEquipos.equipos;
        const umpires = dataUmpires;
        const locaciones = dataLocaciones;

        // Validar que sean Arrays
        if (!Array.isArray(equipos) || !Array.isArray(umpires) || !Array.isArray(locaciones)) {
            console.error("Las respuestas no son Arrays válidos");
            return;
        }

        const selectsEquipos = [
            document.getElementById('crearLocal'), 
            document.getElementById('crearVisitante'), 
            editLocal, 
            editVisitante
        ];
        const selectsUmpires = [
            document.getElementById('crearPrincipal'), editPrincipal,
            document.getElementById('crearCentral'), editCentral,
            document.getElementById('crearLineal1'), editLineal1,
            document.getElementById('crearLineal2'), editLineal2
        ];
        const selectsLoc = [
            document.getElementById('crearCampo'), 
            editCampo
        ];

        equipos.forEach(item => {
            selectsEquipos.forEach(s => { 
                if(s) s.innerHTML += `<option value="${item.id}">${item.nombre}</option>`; 
            });
        });

        umpires.forEach(item => {
            selectsUmpires.forEach(s => { 
                if(s) s.innerHTML += `<option value="${item.id}">${item.nombre}</option>`; 
            });
        });

        locaciones.forEach(item => {
            selectsLoc.forEach(s => { 
                if(s) s.innerHTML += `<option value="${item.id}">${item.nombre}</option>`; 
            });
        });

    } catch (err) { 
        console.error("Error al cargar catálogos:", err);
    }
}

// 2. OBTENER PARTIDOS
async function obtenerPartidos() {
    try {
        const res = await fetch("https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/partidos");
        
        if (!res.ok) {
            playerTableBody.innerHTML = `
                <tr>
                    <td colspan="8">Error del servidor al cargar partidos.</td>
                </tr>
            `;
            return;
        }

        const data = await res.json();
        const partidos = data.partidos;

        if (!Array.isArray(partidos)) {
            console.error("La respuesta no es un arreglo:", data);
            playerTableBody.innerHTML = `
                <tr>
                    <td colspan="8">La API no devolvió una lista válida.</td>
                </tr>
            `;
            return;
        }

        if (partidos.length === 0) {
            playerTableBody.innerHTML = `
                <tr>
                    <td colspan="8">No hay partidos registrados.</td>
                </tr>
            `;
            return;
        }

        playerTableBody.innerHTML = "";

        partidos.forEach(p => {
            const fila = document.createElement("tr");
            fila.dataset.id = p.id;
            fila.dataset.fecha = p.fecha;
            
            // --- CORRECCIÓN DE ZONA HORARIA AQUÍ ---
            const fechaObj = new Date(p.fecha);
            const offset = fechaObj.getTimezoneOffset() * 60000; 
            const fechaLocalCorregida = new Date(fechaObj.getTime() - offset).toISOString().slice(0, 16);
            fila.dataset.fechaLocal = fechaLocalCorregida;
            // ---------------------------------------

            fila.dataset.local = p.id_equipo_local;
            fila.dataset.visitante = p.id_equipo_visitante;
            fila.dataset.principal = p.id_umpire_1 || '';
            fila.dataset.central = p.id_umpire_2 || '';
            fila.dataset.lineal1 = p.id_umpire_3 || '';
            fila.dataset.lineal2 = p.id_umpire_4 || '';
            fila.dataset.campo = p.id_locacion || '';
            fila.dataset.marcadorLocal = p.marcador_local || 0;
            fila.dataset.marcadorVisitante = p.marcador_visitante || 0;
            fila.dataset.estado = p.estado || 'Programado';
            
            fila.innerHTML = `
                <td>${formatearFechaDesdeDB(p.fecha)}</td>
                <td class="amp-cell" 
                    data-h="${p.umpire_1 || '—'}" 
                    data-b1="${p.umpire_2 || '—'}" 
                    data-b2="${p.umpire_3 || '—'}" 
                    data-b3="${p.umpire_4 || '—'}">
                    <button class="btn-primary btn-amp">Ver</button>
                </td>
                <td>${p.equipo_local_nombre}</td>
                <td>vs</td>
                <td>${p.equipo_visitante_nombre}</td>
                <td>${p.marcador_local} - ${p.marcador_visitante}</td>
                <td>${p.locacion_nombre || '—'}</td>
                <td><span class="estado">${p.estado || 'Programado'}</span></td>
                <td>
                    <button class="btn-edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete"><i class="fas fa-trash"></i></button>
                </td>
            `;
            playerTableBody.appendChild(fila);
        });
    } catch (err) { 
        console.error("Error al obtener partidos:", err);
        playerTableBody.innerHTML = `
            <tr>
                <td colspan="8">Error al cargar los partidos.</td>
            </tr>
        `;
    }
}

// 3. EVENTOS DE LA TABLA
playerTableBody.addEventListener("click", (e) => {
    const btnAmp = e.target.closest(".btn-amp");
    if (btnAmp) {
        const td = btnAmp.closest("td");
        document.getElementById("infoAmpayers").innerHTML = 
            "<b>Home:</b> " + td.dataset.h + "<br>" +
            "<b>1B:</b> " + td.dataset.b1 + "<br>" +
            "<b>2B:</b> " + td.dataset.b2 + "<br>" +
            "<b>3B:</b> " + td.dataset.b3;
        modalAmpayers.classList.add("show");
        return;
    }

    if (e.target.closest(".btn-edit")) {
        filaActual = e.target.closest("tr");
        
        // Cargar datos en el modal de edición
        editPartidoId.value = filaActual.dataset.id;
        editLocal.value = filaActual.dataset.local;
        editVisitante.value = filaActual.dataset.visitante;
        editPrincipal.value = filaActual.dataset.principal;
        editCentral.value = filaActual.dataset.central;
        editLineal1.value = filaActual.dataset.lineal1;
        editLineal2.value = filaActual.dataset.lineal2;
        editCampo.value = filaActual.dataset.campo;
        editMarcadorLocal.value = filaActual.dataset.marcadorLocal;
        editMarcadorVisitante.value = filaActual.dataset.marcadorVisitante;
        editEstado.value = filaActual.dataset.estado;
        
        const editFechaInput = document.getElementById('editFecha');
        if (editFechaInput && filaActual.dataset.fechaLocal) {
            editFechaInput.value = filaActual.dataset.fechaLocal;
        }
        
        modalEditar.classList.add("show");
        return;
    }

    if (e.target.closest(".btn-delete")) {
        const fila = e.target.closest("tr");
        eliminarPartido(fila.dataset.id);
    }
});

// 4. GUARDAR EDICIÓN
async function guardarCambios() {
    const id = editPartidoId.value;
    let fechaFormateada = null;

    // Formatear la fecha para evitar errores de zona horaria en MySQL
    const fechaInput = document.getElementById('editFecha').value;
    if (fechaInput) {
        fechaFormateada = fechaInput.replace('T', ' ') + ':00';
    }

    const datosActualizados = {
        fecha: fechaFormateada,
        estado: editEstado.value, // <-- SE ENVÍA EL ESTADO ACTUALIZADO
        id_equipo_local: Number(editLocal.value) || null,
        id_equipo_visitante: Number(editVisitante.value) || null,
        id_locacion: Number(editCampo.value) || null,
        id_umpire_1: Number(editPrincipal.value) || null,
        id_umpire_2: Number(editCentral.value) || null,
        id_umpire_3: Number(editLineal1.value) || null,
        id_umpire_4: Number(editLineal2.value) || null,
        marcador_local: Number(editMarcadorLocal.value) || 0,
        marcador_visitante: Number(editMarcadorVisitante.value) || 0
    };

    try {
        const res = await fetch(`https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/partidos/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosActualizados)
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Error del backend:", data);
            alert(data.error?.sqlMessage || data.error || data.mensaje || "No se pudo actualizar el partido");
            return;
        }

        alert(data.mensaje || "Partido actualizado correctamente");
        cerrarModal();
        await obtenerPartidos();

    } catch (error) {
        console.error("Error al actualizar partido:", error);
        alert("Error al conectar con el servidor");
    }
}

// Event listener para el botón de guardar edición
btnGuardarEdicion.addEventListener("click", guardarCambios);

// 5. CREAR PARTIDO
async function crearPartido() {
    let fechaFormateada = null;
    const fechaInput = document.getElementById('crearFecha').value;
    
    // Formatear la fecha para evitar errores de zona horaria en MySQL
    if (fechaInput) {
        fechaFormateada = fechaInput.replace('T', ' ') + ':00';
    }

    const local = document.getElementById('crearLocal').value;
    const visitante = document.getElementById('crearVisitante').value;
    const campo = document.getElementById('crearCampo').value;
    const principal = document.getElementById('crearPrincipal').value;
    const central = document.getElementById('crearCentral').value;
    const lineal1 = document.getElementById('crearLineal1').value;
    const lineal2 = document.getElementById('crearLineal2').value;

    if (!fechaFormateada || !local || !visitante) {
        alert("Por favor, completa los campos obligatorios: Fecha, Equipo Local y Equipo Visitante.");
        return;
    }

    const nuevoPartido = {
        fecha: fechaFormateada,
        estado: 'Programado', // <-- LOS PARTIDOS NUEVOS INICIAN COMO PROGRAMADOS
        id_equipo_local: Number(local),
        id_equipo_visitante: Number(visitante),
        id_locacion: Number(campo) || null,
        id_umpire_1: Number(principal) || null,
        id_umpire_2: Number(central) || null,
        id_umpire_3: Number(lineal1) || null,
        id_umpire_4: Number(lineal2) || null,
        marcador_local: 0,
        marcador_visitante: 0
    };

    try {
        const res = await fetch("https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/partidos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoPartido)
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Error del backend:", data);
            alert(data.error?.sqlMessage || data.error || data.mensaje || "No se pudo crear el partido");
            return;
        }

        alert(data.mensaje || "Partido creado correctamente");
        cerrarModalCrear();
        await obtenerPartidos();

    } catch (error) {
        console.error("Error al crear partido:", error);
        alert("Error al conectar con el servidor");
    }
}

// 6. ELIMINAR PARTIDO (función separada como en equipos.js)
async function eliminarPartido(id) {
    const confirmar = confirm("¿Seguro que quieres eliminar este partido?");
    if (!confirmar) return;

    try {
        const res = await fetch(`https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/partidos/${id}`, {
            method: 'DELETE'
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || data.mensaje || "No se pudo eliminar");
            return;
        }

        alert(data.mensaje || "Partido eliminado correctamente");
        await obtenerPartidos();

    } catch (error) {
        console.error("Error al eliminar partido:", error);
        alert("Error al conectar con el servidor");
    }
}

// 7. FUNCIONES DE UI
function cerrarModal() { 
    modalEditar.classList.remove("show"); 
}

function abrirModalCrear() { 
    modalCrear.classList.add("show"); 
}

function cerrarModalCrear() { 
    modalCrear.classList.remove("show"); 
}

function cerrarModalAmpayers() { 
    modalAmpayers.classList.remove("show"); 
}

function formatearFechaDesdeDB(f) {
    const fecha = new Date(f);
    return fecha.toLocaleString('es-MX', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}