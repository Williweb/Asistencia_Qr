// 1. Configuración de la URL de tu Google Apps Script
const URL_API = "https://script.google.com/macros/s/AKfycbwKy5ejOBAvQC-vmwkGenPz2VatLV6tnhVK9nEST5izFSdWoZq8JNj_tq3CTC8cZpBi/exec";

// Forzar inicio al cargar la ventana
window.onload = () => {
    console.log("Iniciando Sistema...");
    iniciarEscaner();
    actualizarDashboard();
};

function iniciarEscaner() {
    // Verificar si la librería cargó
    if (typeof Html5QrcodeScanner === 'undefined') {
        document.getElementById("status").innerText = "❌ Error: Librería QR no cargada";
        return;
    }

    const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 } 
    });

    scanner.render((text) => {
        const ahora = new Date();
        const data = { 
            nombre: text, 
            fecha: ahora.toLocaleDateString(), 
            hora: ahora.toLocaleTimeString() 
        };

        document.getElementById("status").innerText = "⏳ Registrando...";

        fetch(URL_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // importante
            body: JSON.stringify(data)
        }).then(() => {
            document.getElementById("status").innerText = "✅ Bienvenido: " + text;
            actualizarDashboard();
        }).catch(err => {
            console.error("Error al registrar:", err);
            document.getElementById("status").innerText = "❌ Error al registrar";
        });
    }, (err) => { 
        console.warn("Error escaneo:", err); 
    });
}

async function actualizarDashboard() {
    try {
        const res = await fetch(URL_API);
        const db = await res.json();
        
        const tbody = document.querySelector("#tablaAsistencia tbody");
        tbody.innerHTML = "";
        let pres = 0, aus = 0;

        // Procesar lista (Saltar encabezado i=1)
        for (let i = 1; i < db.usuarios.length; i++) {
            const nombre = db.usuarios[i][0];
            const registro = db.asistencias.find(r => r[0] === nombre);

            if (registro) {
                pres++;
                tbody.innerHTML += `<tr><td>${nombre}</td><td style="color:green">✅ Presente</td><td>${registro[2]}</td></tr>`;
            } else {
                aus++;
                tbody.innerHTML += `<tr><td>${nombre}</td><td style="color:red">❌ Ausente</td><td>--:--</td></tr>`;
            }
        }
        document.getElementById("totalPresentes").innerText = pres;
        document.getElementById("totalAusentes").innerText = aus;
    } catch (e) {
        console.error("Error Dashboard:", e);
        document.getElementById("status").innerText = "❌ Error al cargar dashboard";
    }
}

function descargarExcel() {
    const table = document.getElementById("tablaAsistencia");
    const wb = XLSX.utils.table_to_book(table);
    XLSX.writeFile(wb, "Asistencia_Hoy.xlsx");
}
