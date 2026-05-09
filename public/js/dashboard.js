document.addEventListener("DOMContentLoaded", async () => {
    await cargarDashboard();
    await cargarPartidos();
});

// 🔹 DASHBOARD (Estadísticas)
async function cargarDashboard() {
    try {
        const res = await fetch("https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/dashboard-stats");
        const data = await res.json();

        if (!res.ok) throw new Error("Error en la respuesta del servidor");

        // Usamos || 0 por si el dato llega vacío
        document.getElementById("equiposTotal").innerText = data.totalEquipos || 0;
        document.getElementById("jugadoresTotal").innerText = data.totalJugadores || 0;
        document.getElementById("partidosTotal").innerText = data.totalPartidos || 0;

    } catch (error) {
        console.error("Error al cargar estadísticas:", error);
    }
}

// 🔹 TABLA DE PARTIDOS
async function cargarPartidos() {
    try {
        const res = await fetch("https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/partidos-proximos");
        const partidos = await res.json();

        const tabla = document.getElementById("tablaPartidos");
        tabla.innerHTML = "";

        // Verificamos que 'partidos' sea un arreglo y no el formato doble de mysql2
        if (!Array.isArray(partidos)) {
            console.error("El backend envió un formato incorrecto. Revisa los [rows]");
            return;
        }

        partidos.forEach(p => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${formatearFecha(p.fecha)}</td>
                <td>${p.equipo_local || 'Sin nombre'}</td>
                <td>${p.equipo_visitante || 'Sin nombre'}</td>
                <td>${formatearHora(p.fecha)}</td>
                <td>${p.estadio || "N/A"}</td>
            `;
            tabla.appendChild(fila);
        });

    } catch (error) {
        console.error("Error al cargar partidos:", error);
    }
}

// 🔹 HELPERS
function formatearFecha(fecha) {
    if(!fecha) return "N/A";
    const f = new Date(fecha);
    return f.toLocaleDateString();
}

// Esta es la función que te faltaba
function formatearHora(fecha) {
    if(!fecha) return "N/A";
    const f = new Date(fecha);
    return f.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}