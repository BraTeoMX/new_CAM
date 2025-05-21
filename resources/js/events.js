const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

// Estados posibles de las OT
const OT_STATUSES = ["PENDIENTE", "ASIGNADO", "PROCESO", "ATENDIDO", "FINALIZADO"];

// Contenedores globales para cada estado
const containers = {};

// Inicializa los contenedores globales
function initContainers() {
    OT_STATUSES.forEach((status) => {
        containers[status] = document.getElementById(status);
    });
}

// Obtiene el color correspondiente al estado
function getStatusColor(status) {
    switch (status) {
        case 'FINALIZADO':
            return 'bg-blue-800 text-blue-100';
        case 'ASIGNADO':
            return 'bg-blue-100 text-blue-800';
        case 'PROCESO':
            return 'bg-yellow-100 text-yellow-800';
        case 'PENDIENTE':
            return 'bg-red-100 text-red-800';
        case 'ATENDIDO':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Crea una tarjeta de OT
function createOTCard(ot) {
    const card = document.createElement("div");
    card.classList.add(
        "bg-gray-200",
        "dark:bg-gray-800",
        "rounded-lg",
        "shadow",
        "p-4",
        "cursor-move",
        "border",
        "border-black",
        "text-black",
        "w-full"
    );
    card.setAttribute("data-id", ot.id);
    const statusColor = getStatusColor(ot.Status);
    card.innerHTML = `
        <div class="p-0.5">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Folio: ${ot.Folio}
            </h5>
            <p class="mb-1 font-semibold text-gray-700 dark:text-gray-400">Módulo: ${ot.Modulo}</p>
            <p class="mb-1 font-semibold text-gray-700 dark:text-gray-400">Mecánico: ${ot.Mecanico}</p>
            <p class="mb-1 font-semibold text-gray-700 dark:text-gray-400">Supervisor: ${ot.Supervisor}</p>
            <p class="mb-1 font-semibold text-gray-700 dark:text-gray-400">Maquina: ${ot.Maquina}</p>
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Problema: ${ot.Problema}</p>
            <span class="inline-block px-3 py-1 text-xs font-medium rounded ${statusColor}">${ot.Status}</span>
        </div>
    `;
    return card;
}

// Limpia todos los contenedores
function clearContainers() {
    Object.values(containers).forEach((container) => {
        container.innerHTML = "";
    });
}

// Inserta una OT en el contenedor correspondiente según su status
function insertOTCard(ot) {
    if (containers[ot.Status]) {
        // Cambia de appendChild(createOTCard(ot)) a containers[ot.Status].appendChild(createOTCard(ot));
        containers[ot.Status].appendChild(createOTCard(ot));
    }
}

// Inicializa SortableJS en todos los contenedores
function initializeSortable() {
    Object.values(containers).forEach((container) => {
        Sortable.create(container, {
            group: "shared",
            animation: 150,
            ghostClass: "bg-blue-100",
            onEnd: handleDragEnd,
        });
    });
}

// Maneja el evento de drag & drop
function handleDragEnd(event) {
    const card = event.item;
    const movedId = card.dataset.id;
    const folioElem = card.querySelector("h5");
    const folio = folioElem ? folioElem.textContent : movedId;
    const newStatus = event.to.id;

    if (newStatus === "PENDIENTE") {
        toggleModal(true);

        const formPendiente = document.getElementById("formPendiente");
        formPendiente.onsubmit = function (e) {
            e.preventDefault();

            const fecha = document.getElementById("fechaPendiente").value;
            const motivo = document.getElementById("motivoPendiente").value;

            // Actualizar estado y guardar evento
            updateOTStatus(movedId, newStatus, fecha, motivo, () => {
                saveCalendarEvent(folio, fecha, motivo, () => {
                    toggleModal(false);
                });
            });
        };
    } else {
        updateOTStatus(movedId, newStatus, null, null);
    }
}

// Actualiza el estado de una OT vía fetch
function updateOTStatus(id, status, fecha = null, motivo = null, callback = null) {
    const body = { id, status };
    if (fecha) body.fecha = fecha;
    if (motivo) body.motivo = motivo;

    fetch("/update-status", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(body),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Emitir evento de status actualizado para Pusher
                fetch("/broadcast-status-ot", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify({ id, status }),
                });
                if (callback) callback();
            } else {
                console.error("Error al actualizar la OT:", data.error);
            }
        })
        .catch((error) => console.error("Error de red:", error));
}

// Guarda un evento en el calendario
function saveCalendarEvent(title, fecha, description, callback = null) {
    fetch("/events", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({
            title,
            start: fecha.split(" to ")[0],
            end: fecha.split(" to ")[1] || fecha,
            description,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                console.log(`Evento registrado: ${title}.`);
                if (callback) callback();
            } else {
                console.error("Error al guardar el evento:", data.error);
            }
        })
        .catch((error) => console.error("Error de red al guardar evento:", error));
}

// Muestra/Oculta el modal
window.toggleModal = function (open) {
    const modal = document.getElementById("modalPendiente");
    modal.classList.toggle("hidden", !open);

    if (open) {
        document.getElementById("fechaPendiente").value = "";
        document.getElementById("motivoPendiente").value = "";
    }
};

// Variables globales para el menú y modal de reasignación
let contextMenu, reasignarModal, selectedCardId;

// Crear menú contextual y modal si no existen
function createContextMenuAndModal() {
    // Menú contextual
    contextMenu = document.createElement('div');
    contextMenu.id = 'contextMenuOT';
    contextMenu.className = 'fixed z-50 bg-white dark:bg-gray-800 border rounded shadow-lg hidden';
    contextMenu.innerHTML = `
        <ul>
            <li class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" id="reasignarOtOption">Re asignar OT</li>
        </ul>
    `;
    document.body.appendChild(contextMenu);

    // Modal de reasignación
    reasignarModal = document.createElement('div');
    reasignarModal.id = 'reasignarModal';
    reasignarModal.className = 'fixed inset-0 z-50 hidden bg-gray-800 bg-opacity-50 flex items-center justify-center';
    reasignarModal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Reasignar OT</h2>
            <div id="mecanicos-list" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"></div>
            <div class="flex justify-end space-x-4">
                <button type="button" class="px-4 py-2 text-white dark:text-white bg-red-500 dark:bg-red-500 hover:bg-red-300 rounded-md" id="cancelReasignar">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(reasignarModal);

    // Ocultar menú contextual al hacer click fuera
    document.addEventListener('click', () => contextMenu.classList.add('hidden'));
    // Cancelar modal
    document.getElementById('cancelReasignar').onclick = () => reasignarModal.classList.add('hidden');
}

// Mostrar menú contextual
function showContextMenu(e, cardId) {
    e.preventDefault();
    selectedCardId = cardId;
    contextMenu.style.top = `${e.clientY}px`;
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.classList.remove('hidden');
}

// Mostrar modal de reasignación con cards de mecánicos
function showReasignarModal() {
    // Obtener mecánicos disponibles (puedes ajustar la ruta si tienes un endpoint específico)
    fetch('/mecanicos')
        .then(res => res.json())
        .then(mecanicos => {
            const list = document.getElementById('mecanicos-list');
            list.innerHTML = '';
            mecanicos.forEach(mec => {
                const imagePath = `http://128.150.102.45:8000/Intimark/${mec.cvetra}.jpg`;
                const card = document.createElement('div');
                card.className = 'bg-gray-100 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:ring-2 hover:ring-blue-500 flex items-center gap-4';
                card.innerHTML = `
                    <img class="w-10 h-10 rounded-full cursor-pointer"
                        src="${imagePath}"
                        alt="${mec.cvetra} image"
                        id="user-img-${mec.cvetra}"
                        onerror="this.onerror=null; this.src='/default-avatar.jpg';">
                    <div>
                        <p class="font-bold text-gray-900 dark:text-white">${mec.nombre}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Clave: ${mec.cvetra}</p>
                    </div>
                `;
                card.onclick = () => reasignarOt(selectedCardId, mec.cvetra, mec.nombre);
                list.appendChild(card);
            });
            reasignarModal.classList.remove('hidden');
        });
}

// Modifica la función para enviar también el nombre
function reasignarOt(otId, cvetra, nombre) {
    fetch('/reasignar-ot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ id: otId, num_mecanico: cvetra, nombre: nombre }),
    })
        .then(res => {
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return res.text().then(text => { throw new Error(text); });
            }
            return res.json();
        })
        .then(data => {
            if (data.success) {
                reasignarModal.classList.add('hidden');
                // Actualizar el nombre del mecánico en la card de inmediato
                const card = document.querySelector(`[data-id="${otId}"]`);
                if (card) {
                    const mecElem = card.querySelector('p:nth-child(3)');
                    if (mecElem) {
                        mecElem.textContent = `Mecánico: ${nombre}`;
                    }
                }
            } else {
                alert('Error al reasignar: ' + data.error);
            }
        })
        .catch(error => {
            alert('Error inesperado al reasignar: ' + error.message);
            console.error(error);
        });
}

// Agrega el listener de menú contextual a cada card después de renderizarlas
function addContextMenuToCards() {
    OT_STATUSES.forEach(status => {
        const container = containers[status];
        if (!container) return;
        container.querySelectorAll('[data-id]').forEach(card => {
            card.oncontextmenu = (e) => showContextMenu(e, card.dataset.id);
        });
    });
}

// Inicialización principal
document.addEventListener("DOMContentLoaded", function () {
    initContainers();
    loadOTs();
    initFlatpickr();
    createContextMenuAndModal();

    // Opción del menú contextual
    document.getElementById('reasignarOtOption').onclick = function (e) {
        contextMenu.classList.add('hidden');
        showReasignarModal();
    };
});

// Modifica loadOTs para agregar el menú contextual a las cards
function loadOTs() {
    fetch("/cardsAteOTs")
        .then((response) => response.json())
        .then((data) => {
            clearContainers();
            data.forEach(insertOTCard);
            initializeSortable();
            addContextMenuToCards();
        })
        .catch((error) => {
            console.error("Error al cargar las OTs:", error);
        });
}

// Inicializa Flatpickr para el selector de fechas
function initFlatpickr() {
    flatpickr("#fechaPendiente", {
        mode: "range",
        dateFormat: "Y-m-d",
        minDate: "today", // No permite seleccionar fechas anteriores al día actual
        defaultDate: [new Date()], // Marca el día actual por defecto
    });
}

// Inicialización principal
document.addEventListener("DOMContentLoaded", function () {
    initContainers();
    loadOTs();
    initFlatpickr();
});

// Escuchar el evento de status actualizado para reflejar el cambio de color/status en tiempo real
if (typeof window.Echo !== "undefined") {
    window.Echo.channel('asignaciones-ot')
        .listen('StatusOTUpdated', (e) => {
            // Buscar la card por id y actualizarla
            const card = document.querySelector(`[data-id="${e.id}"]`);
            if (card) {
                // Reemplazar la card por una nueva con el status actualizado
                // Elimina la card actual y agrégala al nuevo contenedor según el nuevo status
                const newCard = createOTCard(e);
                card.parentNode.removeChild(card);
                if (containers[e.Status]) {
                    containers[e.Status].appendChild(newCard);
                }
            }
        });
}

