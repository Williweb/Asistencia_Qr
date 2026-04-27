const URL_API = "https://script.google.com/macros/s/AKfycbwKy5ejOBAvQC-vmwkGenPz2VatLV6tnhVK9nEST5izFSdWoZq8JNj_tq3CTC8cZpBi/exec";

let scanner;

/*****************************************************
 * INICIAR ESCÁNER
 *****************************************************/
function iniciarScanner() {
  scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

  scanner.render(text => {
    scanner.clear();
    document.getElementById("status").textContent = "⏳ Registrando...";

    fetch(URL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: text })
    })
    .then(res => res.json())
    .then(result => {
      if (result.status !== "ok") {
        throw new Error(result.message || "No se pudo registrar");
      }

      document.getElementById("status").textContent =
        "✅ OK - Asistencia registrada";

      actualizarTabla();
      setTimeout(iniciarScanner, 2500);
    })
    .catch(err => {
      document.getElementById("status").textContent =
        "❌ Error al registrar: " + err.message;
      setTimeout(iniciarScanner, 4000);
    });
  });
}

/*****************************************************
 * ACTUALIZAR TABLA
 *****************************************************/
function actualizarTabla() {
  fetch(URL_API)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#tablaAsistencia tbody");
      tbody.innerHTML = "";

      let presentes = 0;
      let ausentes = 0;

      const usuarios = (data.usuarios || [])
        .map(u => u[0])
        .filter(n => n && n !== "Nombre");

      usuarios.forEach(usuario => {
        const registro = (data.asistencias || [])
          .find(r => r.nombre === usuario);

        const tr = document.createElement("tr");

        if (registro) {
          presentes++;
          tr.innerHTML = `
            <td>${usuario}</td>
            <td>Presente</td>
            <td>${registro.fecha}</td>
            <td>${registro.hora}</td>
          `;
        } else {
          ausentes++;
          tr.innerHTML = `
            <td>${usuario}</td>
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
      document.getElementById("status").textContent =
        "❌ Error al cargar datos: " + err.message;
    });
}

/*****************************************************
 * DESCARGAR EXCEL
 *****************************************************/
function descargarExcel() {
  fetch(URL_API)
    .then(res => res.json())
    .then(data => {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data.asistencias || []);
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
