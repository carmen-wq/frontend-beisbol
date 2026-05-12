document.addEventListener("DOMContentLoaded", async () => {
    await cargarDashboard();
    await cargarPartidos();
});

// 🔹 DASHBOARD (Estadísticas)
async function cargarDashboard() {
    try {

        const res = await fetch("https://backend-rosario-123-hcd6ddhpf4caeveu.eastus-01.azurewebsites.net/api/dashboard");

        if (!res.ok) {
            throw new Error("Error en la respuesta del servidor");
        }

        const data = await res.json();

        document.getElementById("equiposTotal").innerText = data.totalEquipos || 0;
        document.getElementById("jugadoresTotal").innerText = data.totalJugadores || 0;
        document.getElementById("partidosTotal").innerText = data.totalPartidos || 0;

    } catch (error) {
        console.error("Error al cargar estadísticas:", error);
    }
}