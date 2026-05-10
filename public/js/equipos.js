const form = document.getElementById("teamForm");
const teamsBody = document.getElementById("teamsBody");
const teamCategorySelect = document.getElementById("teamCategory");

// inputs del modal de edición
const editTeamId = document.getElementById("editTeamId");
const editNombre = document.getElementById("editNombre");
const editCategoria = document.getElementById("editCategoria");
const editCoach = document.getElementById("editCoach");
const btnGuardarEdicion = document.getElementById("btnGuardarEdicion");

const modalEditar = document.getElementById("modalEditar");

// Abrir modal
function abrirModalEditar() {
  modalEditar.classList.add("show");
}

// Cerrar modal
function cerrarModalEditar() {
  modalEditar.classList.remove("show");
}


// Cargar equipos
async function cargarEquipos() {
  try {
    const res = await fetch('https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/equipos');
    const data = await res.json();
    const listaEquipos = data.equipos;

    teamsBody.innerHTML = "";

    if (!res.ok) {
      teamsBody.innerHTML = `
        <tr>
          <td colspan="4">Error del servidor al cargar equipos.</td>
        </tr>
      `;
      return;
    }

    if (!Array.isArray(listaEquipos)) {
      console.error("La respuesta no es un arreglo:", data);
      teamsBody.innerHTML = `
        <tr>
          <td colspan="4">La API no devolvió una lista válida.</td>
        </tr>
      `;
      return;
    }

    if (listaEquipos.length === 0) {
      teamsBody.innerHTML = `
        <tr>
          <td colspan="4">No hay equipos registrados.</td>
        </tr>
      `;
      return;
    }

    listaEquipos.forEach((equipo) => {
      const categoriaTexto = equipo.categoria || `Categoría ${equipo.id_categoria}`;

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td><strong>${equipo.nombre}</strong></td>
        <td>${categoriaTexto}</td>
        <td>${equipo.nombre_coach}</td>
        <td>
          <button 
            class="btn-edit"
            data-id="${equipo.id}"
            data-nombre="${equipo.nombre}"
            data-id_categoria="${equipo.id_categoria}"
            data-nombre_coach="${equipo.nombre_coach}"
            title="Editar"
          >
            <i class="fas fa-edit"></i>
          </button>

          <button class="btn-delete" data-id="${equipo.id}" title="Eliminar">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      teamsBody.appendChild(fila);
    });

  } catch (error) {
    console.error("Error al cargar equipos:", error);
    teamsBody.innerHTML = `
      <tr>
        <td colspan="4">Error al cargar los equipos.</td>
      </tr>
    `;
  }
}

// Cargar categorías en ambos selects
async function cargarCategorias() {
  try {
    const res = await fetch('https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/categorias');
    const categorias = await res.json();
    console.log("Respuesta /categorias:", categorias);

    teamCategorySelect.innerHTML = `<option value="">Selecciona una categoría</option>`;
    editCategoria.innerHTML = `<option value="">Selecciona una categoría</option>`;

    if (!res.ok) {
      teamCategorySelect.innerHTML = `<option value="">Error al cargar categorías</option>`;
      editCategoria.innerHTML = `<option value="">Error al cargar categorías</option>`;
      return;
    }

    if (!Array.isArray(categorias)) {
      console.error("La respuesta de categorías no es un arreglo:", categorias);
      teamCategorySelect.innerHTML = `<option value="">Categorías inválidas</option>`;
      editCategoria.innerHTML = `<option value="">Categorías inválidas</option>`;
      return;
    }

    categorias.forEach((categoria) => {
      const option1 = document.createElement("option");
      option1.value = categoria.id;
      option1.textContent = categoria.nombre;
      teamCategorySelect.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = categoria.id;
      option2.textContent = categoria.nombre;
      editCategoria.appendChild(option2);
    });

  } catch (error) {
    console.error("Error al cargar categorías:", error);
    teamCategorySelect.innerHTML = `<option value="">No se pudieron cargar</option>`;
    editCategoria.innerHTML = `<option value="">No se pudieron cargar</option>`;
  }
}

// Registrar equipo
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("teamName").value.trim();
  const id_categoria = Number(teamCategorySelect.value);
  const nombre_coach = document.getElementById("coachName").value.trim();

  const payload = { nombre, id_categoria, nombre_coach };

  try {
    const res = await fetch('https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/equipos', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("POST data:", data);

    if (!res.ok) {
      alert(data.error || "No se pudo registrar el equipo");
      return;
    }

    alert("Equipo registrado correctamente");
    form.reset();
    await cargarEquipos();

  } catch (error) {
    console.error("Error al guardar equipo:", error);
    alert("Hubo un error al conectar con el servidor");
  }
});

// Delegación de eventos para editar y eliminar
teamsBody.addEventListener("click", async (e) => {
  const btnEditar = e.target.closest(".btn-edit");
  const btnEliminar = e.target.closest(".btn-delete");

  if (btnEditar) {
    editTeamId.value = btnEditar.dataset.id;
    editNombre.value = btnEditar.dataset.nombre;
    editCategoria.value = btnEditar.dataset.id_categoria;
    editCoach.value = btnEditar.dataset.nombre_coach;

    abrirModalEditar();
    return;
  }

  if (btnEliminar) {
    const id = btnEliminar.dataset.id;
    console.log("ID a eliminar:", id);
    await eliminarEquipo(id);
  }
});

// Guardar edición
btnGuardarEdicion.addEventListener("click", async () => {
  const id = editTeamId.value;

  const datosActualizados = {
    nombre: editNombre.value.trim(),
    id_categoria: Number(editCategoria.value),
    nombre_coach: editCoach.value.trim()
  };

  try {
    const res = await fetch('https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/equipos/' + id, 
      {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datosActualizados)
    });

    const data = await res.json();
    console.log("Respuesta PUT:", data);

    if (!res.ok) {
      alert(data.error || "No se pudo actualizar el equipo");
      return;
    }

    alert(data.mensaje || "Equipo actualizado correctamente");
    cerrarModalEditar();
    await cargarEquipos();

  } catch (error) {
    console.error("Error al actualizar:", error);
    alert("Error al conectar con el servidor");
  }
});

// Eliminar equipo
async function eliminarEquipo(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar este equipo?");

  if (!confirmar) return;

  try {
    const res = await fetch('https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/equipos/' + id, {
      method: "DELETE"
    });

    const data = await res.json();
    console.log("Respuesta delete:", data);

    if (!res.ok) {
      alert(data.error || "No se pudo eliminar");
      return;
    }

    alert("Equipo eliminado correctamente");
    await cargarEquipos();

  } catch (error) {
    console.error("Error al eliminar:", error);
    alert("Error al conectar con el servidor");
  }
}

// Cargar todo al iniciar
document.addEventListener("DOMContentLoaded", async () => {
  await cargarCategorias();
  await cargarEquipos();
});

// Para que el botón cancelar del HTML pueda usarla
window.cerrarModalEditar = cerrarModalEditar;