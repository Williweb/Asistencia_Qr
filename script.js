const URL_API = "https://script.google.com/macros/s/AKfycbwKy5ejOBAvQC-vmwkGenPz2VatLV6tnhVK9nEST5izFSdWoZq8JNj_tq3CTC8cZpBi/exec";

let scanner;

/*****************************************************
 * INICIAR ESCÁNER
 *****************************************************/
function iniciarScanner() {
    // Evita duplicar escáneres si ya existe uno
    if (!scanner) {
        scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    }
    
    scanner.render(text => {
        scanner.clear();
        document.getElementById("status").textContent = "⏳ Registrando...";

        // Eliminamos 'no-cors' para poder manejar la respuesta
        fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({ nombre: text }) 
            // Nota: Apps Script a veces prefiere enviar como texto plano o URLSearchParams
        })
        .then(res => {
            document.getElementById("status").textContent = "✅ Asistencia registrada";
            setTimeout(() => {
                actualizarTabla();
                iniciarScanner(); // Reiniciar después de actualizar
            }, 1500);
        })
        .catch(err => {
            console.error(err);
            document.getElementById("status").textContent = "❌ Error al conectar";
            setTimeout(iniciarScanner, 4000);
        });
    });
}

function actualizarTabla() {
    // Añadimos un timestamp para evitar cache del navegador
    fetch(`${URL_API}?t=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector("#tablaAsistencia tbody");
            tbody.innerHTML = "";
            
            let presentes = 0;
            const usuarios = (data.usuarios || []).slice(1); // Saltar encabezado si existe

            usuarios.forEach(u => {
                const nombre = u[0];
                if(!nombre) return;

                const registro = (data.asistencias || []).find(r => r.nombre === nombre);
                const tr = document.createElement("tr");
                
                if (registro) presentes++;
                
                tr.innerHTML = `
                    <td>${nombre}</td>
                    <td class="${registro ? 'text-success' : 'text-danger'}">${registro ? 'Presente' : 'Ausente'}</td>
                    <td>${registro ? registro.fecha : '--'}</td>
                    <td>${registro ? registro.hora : '--'}</td>
                `;
                tbody.appendChild(tr);
            });

            document.getElementById("totalPresentes").textContent = presentes;
            document.getElementById("totalAusentes").textContent = usuarios.length - presentes;
        })
        .catch(err => {
            console.error("Error tabla:", err);
        });
}
