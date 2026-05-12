const form = document.getElementById("playerForm");
const playerTableBody = document.getElementById("playerTableBody");
const teamSelect = document.getElementById("teamSelect");
const playerSearch = document.getElementById("playerSearch"); // Input del buscador

// inputs del modal de edición
const editJugadorId = document.getElementById("editJugadorId");
const editNombre = document.getElementById("editNombre");
const editApellido = document.getElementById("editApellido");
const editDOB = document.getElementById("editDOB");
const editEquipoSelect = document.getElementById("editEquipoSelect");
const editNotas = document.getElementById("editNotas");
const btnGuardarEdicion = document.getElementById("btnGuardarEdicion");

const modalEditar = document.getElementById("modalEditarJugador");
const modalNotas = document.getElementById("modalNotas"); // NUEVO: Modal de notas

let equiposMap = {};

// Abrir modal (Adaptado a las clases CSS)
function abrirModalEditar() {
  modalEditar.classList.add("show");
}

// Cerrar modal (Adaptado a las clases CSS)
function cerrarModalEditar() {
  modalEditar.classList.remove("show");
}

// NUEVO: Cerrar modal de notas
function cerrarModalNotas() {
  modalNotas.classList.remove("show");
}

// Format Date to YYYY-MM-DD
function formatDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toISOString().split('T')[0];
}

// Cargar equipos para el select y mapeo rápido
async function cargarEquipos() {
  try {
    const res = await fetch("https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/equipos");
    const data = await res.json();

    const listaEquipos = data.equipos; // Aseguramos que accedemos a la propiedad correcta
    console.log("Respuesta /equipos (en jugadores):", listaEquipos);

    teamSelect.innerHTML = `<option value="">Selecciona un equipo</option>`;
    editEquipoSelect.innerHTML = `<option value="">Selecciona un equipo</option>`;
    equiposMap = {};

    if (!res.ok || !Array.isArray(listaEquipos)) {
      teamSelect.innerHTML = `<option value="">Error al cargar equipos</option>`;
      editEquipoSelect.innerHTML = `<option value="">Error al cargar equipos</option>`;
      return;
    }

    listaEquipos.forEach((equipo) => {
      equiposMap[equipo.id] = equipo.nombre; // Para mapear id_equipo -> nombre
      
      const opt1 = document.createElement("option");
      opt1.value = equipo.id;
      opt1.textContent = equipo.nombre;
      teamSelect.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = equipo.id;
      opt2.textContent = equipo.nombre;
      editEquipoSelect.appendChild(opt2);
    });

  } catch (error) {
    console.error("Error cargando equipos:", error);
  }
}

// Cargar jugadores
async function cargarJugadores() {
  try {
    //const playerTableBody = document.getElementById("playerTableBody");

    const res = await fetch("https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/jugadores");
    const data = await res.json();

    const listaJugadores = data; // Aseguramos que accedemos a la propiedad correcta
    console.log("Respuesta /jugadores:", listaJugadores);

    playerTableBody.innerHTML = "";

    // Cambié los colspan a 7 porque ahora hay una columna más
    if (!res.ok) {
      playerTableBody.innerHTML = `<tr><td colspan="7">Error del servidor al cargar jugadores.</td></tr>`;
      return;
    }

    if (!Array.isArray(listaJugadores)) {
      console.error("La respuesta no es un arreglo:", listaJugadores);
      playerTableBody.innerHTML = `<tr><td colspan="7">La API no devolvió una lista válida.</td></tr>`;
      return;
    }

    if (listaJugadores.length === 0) {
      playerTableBody.innerHTML = `<tr><td colspan="7">No hay jugadores registrados.</td></tr>`;
      return;
    }

    listaJugadores.forEach((jugador) => {
      const nombreEquipo = equiposMap[jugador.id_equipo] || `Equipo ${jugador.id_equipo}`;
      
      const dobFormatted = formatDate(jugador.fecha_nacimiento);
      let dobDisplay = "";
      
      if(jugador.fecha_nacimiento) {
        const utcDate = new Date(jugador.fecha_nacimiento);
        const userTimezoneOffset = utcDate.getTimezoneOffset() * 60000;
        const localDate = new Date(utcDate.getTime() + userTimezoneOffset);
        dobDisplay = localDate.toLocaleDateString();
      }

      // NUEVO: Validamos si hay notas para cambiar el estilo del botón
      const tieneNotas = jugador.notas_medicas && jugador.notas_medicas.trim() !== "";
      const btnNotasHTML = `
        <button class="${tieneNotas ? 'btn-primary' : 'btn-cancel'} btn-notas" 
                data-notas="${jugador.notas_medicas || ''}">
            Ver
        </button>
      `;

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td><strong>${jugador.nombre}</strong></td>
        <td>${jugador.apellido}</td>
        <td>${dobDisplay}</td>
        <td>${nombreEquipo}</td>
        <td>${btnNotasHTML}</td> <td><span class="status-badge">Inscrito</span></td>
        <td>
          <button 
            class="btn-edit"
            data-id="${jugador.id}"
            data-nombre="${jugador.nombre}"
            data-apellido="${jugador.apellido}"
            data-dob="${dobFormatted}"
            data-idequipo="${jugador.id_equipo}"
            data-notas="${jugador.notas_medicas || ''}"
            title="Editar"
          >
            <i class="fas fa-edit"></i>
          </button>

          <button class="btn-delete" data-id="${jugador.id}" title="Eliminar">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      playerTableBody.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al cargar jugadores:", error);
    playerTableBody.innerHTML = `<tr><td colspan="7">Error al cargar listado.</td></tr>`;
  }
}

// Registrar Jugador
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    nombre: document.getElementById("firstName").value.trim(),
    apellido: document.getElementById("lastName").value.trim(),
    fecha_nacimiento: document.getElementById("dob").value,
    id_equipo: Number(teamSelect.value),
    notas_medicas: document.getElementById("medicalNotes").value.trim()
  };

  try {
    const res = await fetch("https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/jugadores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log("POST data:", data);

    if(!res.ok) {
      alert(data.error || data.mensaje || "No se pudo registrar el jugador");
      return;
    }
    
    alert("Jugador registrado correctamente");
    form.reset();
    await cargarJugadores();

  } catch (error) {
    console.error("Error al guardar jugador:", error);
    alert("Hubo un error al conectar con el servidor");
  }
});

// Event delegation para Editar, Eliminar y Ver Notas
playerTableBody.addEventListener("click", async (e) => {
  const btnEditar = e.target.closest(".btn-edit");
  const btnEliminar = e.target.closest(".btn-delete");
  const btnNotas = e.target.closest(".btn-notas"); // NUEVO: Capturar el botón de notas

  // NUEVO: Lógica para abrir el modal de notas médicas
  if (btnNotas) {
    const notas = btnNotas.dataset.notas;
    const infoNotas = document.getElementById("infoNotas");
    
    // Mostramos las notas o un aviso si el campo está vacío
    infoNotas.textContent = notas ? notas : "Este jugador no tiene notas médicas registradas.";
    
    modalNotas.classList.add("show");
    return;
  }

  if (btnEditar) {
    editJugadorId.value = btnEditar.dataset.id;
    editNombre.value = btnEditar.dataset.nombre;
    editApellido.value = btnEditar.dataset.apellido;
    editDOB.value = btnEditar.dataset.dob;
    editEquipoSelect.value = btnEditar.dataset.idequipo;
    // Ahora leemos las notas directamente del atributo de datos
    editNotas.value = btnEditar.dataset.notas; 

    abrirModalEditar();
    return;
  }

  if (btnEliminar) {
    const id = btnEliminar.dataset.id;
    console.log("ID a eliminar:", id);
    await eliminarJugador(id);
  }
});

// Guardar Cambios Edición
btnGuardarEdicion.addEventListener("click", async () => {
  const id = editJugadorId.value;
  
  const payload = {
    nombre: editNombre.value.trim(),
    apellido: editApellido.value.trim(),
    fecha_nacimiento: editDOB.value,
    id_equipo: Number(editEquipoSelect.value),
    notas_medicas: editNotas.value.trim()
  };

  try {
    const res = await fetch(`https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/jugadores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log("Respuesta PUT:", data);

    if(!res.ok) {
      alert(data.error || data.mensaje || "No se pudo actualizar el jugador");
      return;
    }
    
    alert(data.mensaje || "Jugador actualizado correctamente");
    cerrarModalEditar();
    await cargarJugadores();

  } catch(err) {
    console.error("Error al actualizar:", err);
    alert("Error al conectar con el servidor");
  }
});

// Eliminar Jugador
async function eliminarJugador(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar este jugador?");
  
  if (!confirmar) return;

  try {
    const res = await fetch(`https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/jugadores/${id}`, { 
      method: "DELETE" 
    });
    
    const data = await res.json();
    console.log("Respuesta delete:", data);

    if(!res.ok) {
      alert(data.error || data.mensaje || "No se pudo eliminar");
      return;
    }
    
    alert(data.mensaje || "Jugador eliminado correctamente");
    await cargarJugadores();

  } catch (error) {
    console.error("Error al eliminar:", error);
    alert("Error al conectar con el servidor");
  }
}

// Funcionalidad del Buscador de la tabla
if (playerSearch) {
  playerSearch.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = playerTableBody.querySelectorAll("tr");
    
    // Si la fila contiene el texto buscado, se muestra; si no, se oculta
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchTerm) ? "" : "none";
    });
  });
}

// Cargar todo al iniciar
document.addEventListener("DOMContentLoaded", async () => {
  await cargarEquipos();
  await cargarJugadores();
});

// Para que los botones cancelar del HTML puedan usarlas
window.cerrarModalEditar = cerrarModalEditar;
window.cerrarModalNotas = cerrarModalNotas; // Exportamos la función para cerrar el nuevo modal