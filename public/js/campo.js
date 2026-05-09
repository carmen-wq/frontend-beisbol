var campos = [
  { id: 1, nombre: "Diamante Águilas", coords: { lat: 32.715427850073375, lng: -114.60182877427721 }, color: "#ff1744", categoria: "Categoría 7–9 años", horarioSem: "8:00am – 8:00pm", horarioFin: "7:00am – 9:00pm", capacidad: "200 espectadores", uso: "Juegos de temporada regular" },
  { id: 2, nombre: "Diamante Tiburones", coords: { lat: 32.715672650951745, lng: -114.60152070206139 }, color: "#1e88e5", categoria: "Categoría 10–12 años", horarioSem: "8:00am – 8:00pm", horarioFin: "7:00am – 9:00pm", capacidad: "180 espectadores", uso: "Juegos de temporada regular" },
  { id: 3, nombre: "Diamante Toros", coords: { lat: 32.71548030746228, lng: -114.60073218383613 }, color: "#ffd600", categoria: "Campo Principal", horarioSem: "8:00am – 8:00pm", horarioFin: "7:00am – 9:00pm", capacidad: "220 espectadores", uso: "Torneos, semifinales y finales" },
  { id: 4, nombre: "Diamante Cóndores", coords: { lat: 32.71481790209746, lng: -114.60045711930353 }, color: "#8e24aa", categoria: "Categoría 13–15 años", horarioSem: "8:00am – 8:00pm", horarioFin: "7:00am – 9:00pm", capacidad: "150 espectadores", uso: "Juegos de temporada regular" },
  { id: 5, nombre: "Diamante Leones", coords: { lat: 32.71456487017211, lng: -114.60072973879649 }, color: "#ff00aa", categoria: "Prácticas", horarioSem: "8:00am – 8:00pm", horarioFin: "7:00am – 9:00pm", capacidad: "160 espectadores", uso: "Entrenamientos y amistosos" },
  { id: 6, nombre: "Diamante Halcones", coords: { lat: 32.71478293023981, lng: -114.60154148463494 }, color: "#f57c00", categoria: "Categoría 7–9 años", horarioSem: "8:00am – 8:00pm", horarioFin: "7:00am – 9:00pm", capacidad: "175 espectadores", uso: "Juegos de temporada regular" }
];

function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 32.7152, lng: -114.6012 },
    zoom: 17,
    mapTypeId: "satellite"
  });

  const bounds = new google.maps.LatLngBounds();

  // 🔥 variable global para controlar popups
  let activeInfoWindow = null;

  campos.forEach(c => {

    // 🔥 marcador con color
    const marker = new google.maps.Marker({
      position: c.coords,
      map: map,
      title: c.nombre,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: c.color,
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2
      }
    });

    bounds.extend(c.coords);

    const info = new google.maps.InfoWindow({
      content: `
        <div style="font-family:sans-serif; max-width:220px;">
          <h3 style="margin:0 0 5px 0;">${c.nombre}</h3>
          <p style="margin:0; font-size:13px;"><b>${c.categoria}</b></p>
          <p style="margin:5px 0;">🕒 Lun–Vie: ${c.horarioSem}</p>
          <p style="margin:5px 0;">🕒 Sáb–Dom: ${c.horarioFin}</p>
          <p style="margin:5px 0;">👥 ${c.capacidad}</p>
          <p style="margin:5px 0;">⚾ ${c.uso}</p>
        </div>
      `
    });

    // Para no tener todos los popups abiertos a la vez
    marker.addListener("click", () => {
      if (activeInfoWindow) {
        activeInfoWindow.close();
      }
      info.open(map, marker);
      activeInfoWindow = info;
    });

    // CARD
    const card = document.createElement('div');
    card.className = 'field-card';
 card.style.setProperty('--c', c.color);

card.innerHTML = `
  <strong>${c.nombre}</strong>
  <div class="field-cat">${c.categoria}</div>
  <div class="field-info">
    <span>L-V:</span> ${c.horarioSem}<br>
    <span>S-D:</span> ${c.horarioFin}<br>
    <span>Uso:</span> ${c.uso}
  </div>
`;
    
    card.onclick = () => {
      map.setCenter(c.coords);
      map.setZoom(18);

      if (activeInfoWindow) {
        activeInfoWindow.close();
      }
      info.open(map, marker);
      activeInfoWindow = info;
    };

    document.getElementById('fieldsList').appendChild(card);

    // LEGEND
    const legend = document.createElement('div');
    legend.className = 'legend-item';
    legend.innerHTML = `
      <div class="legend-dot" style="background:${c.color}"></div>
      ${c.nombre}
    `;
    document.getElementById('legend').appendChild(legend);
  });

  map.fitBounds(bounds);
}