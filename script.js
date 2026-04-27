const URL_API = "https://script.google.com/macros/s/AKfycbxOCamzpbKrCJKZfd9VBSKJqnGlqhVTx1ZDCqElKgCgRUgmqljSpIPDuqVHfXqfmk1t/exec";

let scanner;

/*****************************************************
 * INICIAR ESCÁNER QR
 *****************************************************/
function iniciarScanner() {
  scanner = new Html5QrcodeScanner("reader", {
    fps: 10,
    qrbox: 250
  });

  scanner.render(text => {
    scanner.clear();
    document.getElementById("status").textContent = "⏳ Registrando asistencia...";

    fetch(URL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: text })
    })
      .then(res => res.json())
      .then(resp => {
        console.log("Respuesta POST:", resp);

        if (resp.status === "ok") {
          document.getElementById("status").textContent =
            "✅ Asistencia registrada";
        } else if (resp.status === "ya_registrado") {
          document.getElementById("status").textContent =
            "ℹ️ Ya registró asistencia hoy";
        } else {
          document.getElementById("status").textContent =
            "⚠️ Error al registrar";
        }

        setTimeout(actualizarTabla, 500);
        setTimeout(() => iniciarScanner(), 2000);
      })
      .catch(err => {
        console.error(err);
        document.getElementById("status").textContent =
          "❌ Error de red";
        setTimeout(() => iniciarScanner(), 3000);
      });
  });
}

/*****************************************************
 * ACTUALIZAR TABLA Y DASHBOARD
 *****************************************************/
function actualizarTabla() {
  fetch(URL_API)
    .then(res => res.json())
    .then(data => {
      console.log("GET DATA:", data);

      const tbody = document.querySelector("#tablaAsistencia tbody");
      tbody.innerHTML = "";

      let presentes = 0;
      let ausentes = 0;

      // 📅 Fecha de hoy en el MISMO FORMATO que Apps Script (dd/MM/yyyy)
      const hoy = new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });

      // 👤 Usuarios
      const usuarios = data.usuarios
        .slice(1) // quitar encabezado
        .map(u => u[0])
        .filter(Boolean);

      // 📋 Asistencias de HOY convertidas a objetos
      const asistenciasHoy = data.asistencias
        .slice(1)
        .map(r => ({
          nombre: r[0],
          fecha: r[1],
          hora: r[2],
          estado: r[3]
        }))
        .filter(r => r.fecha === hoy);

      usuarios.forEach(nombre => {
        const registro = asistenciasHoy.find(
          r => r.nombre.trim().toLowerCase() === nombre.trim().toLowerCase()
        );

        const tr = document.createElement("tr");

        if (registro) {
          presentes++;
          tr.innerHTML = `
            <td>${nombre}</td>
            <td>Presente</td>
            <td>${registro.fecha}</td>
            <td>${registro.hora}</td>
          `;
        } else {
          ausentes++;
          tr.innerHTML = `
            <td>${nombre}</td>
            <td>Ausente</td>
            <td>--</td>
            <td>--</td>
          `;
        }

        tbody.appendChild(tr);
      });

      document.getElementById("totalPresentes").textContent = presentes;
      document.getElementById("totalAusentes").textContent = ausentes;
    })
    .catch(err => {
      console.error(err);
      document.getElementById("status").textContent =
        "❌ Error al cargar datos";
    });
}

/*****************************************************
 * DESCARGAR REPORTE EXCEL
 *****************************************************/
function descargarExcel() {
  fetch(URL_API)
    .then(res => res.json())
    .then(data => {
      const registros = data.asistencias.slice(1).map(r => ({
        Nombre: r[0],
        Fecha: r[1],
        Hora: r[2],
        Estado: r[3]
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(registros);
      XLSX.utils.book_append_sheet(wb, ws, "Registro");
      XLSX.writeFile(wb, "Reporte_Asistencia.xlsx");
    });
}

/*****************************************************
 * INIT
 *****************************************************/
window.onload = () => {
  iniciarScanner();
  actualizarTabla();
};
``

