import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    encrypted: true,
});

function getStatusColor(status) {
    switch (status) {
        case 'FINALIZADO':
            return 'bg-blue-100 text-blue-800';
        case 'ASIGNADO':
            return 'bg-green-100 text-green-800';
        case 'PROCESO':
            return 'bg-yellow-100 text-yellow-800';
        case 'PENDIENTE':
            return 'bg-orange-100 text-orange-800';
        case 'ATENDIDO':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Nuevo: función para el contorno de la imagen según status
function getRingClass(status) {
    switch (status) {
        case 'FINALIZADO':
            return 'ring-blue-600 dark:ring-blue-600 bg-blue-600';
        case 'ASIGNADO':
            return 'ring-green-600 dark:ring-green-600 bg-green-600';
        case 'PROCESO':
            return 'ring-yellow-400 dark:ring-yellow-400 bg-yellow-400';
        case 'PENDIENTE':
            return 'ring-orange-500 dark:ring-orange-500 bg-orange-500';
        case 'ATENDIDO':
            return 'ring-red-600 dark:ring-red-600 bg-red-600';
        default:
            return 'ring-gray-400 dark:ring-gray-400 bg-gray-400';
    }
}

// Renderizar una tarjeta de asignación
function renderAsignacion(asig) {
    let imgUrl = asig.foto
        ? asig.foto
        : 'http://128.150.102.45:8000/Intimark/' + asig.Num_Mecanico + '.jpg';
    const statusColor = getStatusColor(asig.Status);
    const ringClass = getRingClass(asig.Status);
    return `
    <div class="relative max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700" data-folio="${asig.Folio}">
        <div class="absolute" style="top: -2rem; left: -2rem;">
            <img class="w-28 h-28 rounded-full ring-4 ${ringClass} shadow-lg object-cover"
                src="${imgUrl}" alt="${asig.Num_Mecanico}"
                onerror="this.onerror=null; this.src='/default-avatar.jpg';">
        </div>
        <div class="p-5 mt-16">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Folio: ${asig.Folio}
            </h5>
            <p class="mb-1 font-semibold text-gray-700 dark:text-gray-400">Módulo: ${asig.Modulo}</p>
            <p class="mb-1 font-semibold text-gray-700 dark:text-gray-400">Mecánico: ${asig.Mecanico}</p>
            <p class="mb-1 font-semibold text-gray-700 dark:text-gray-400">Supervisor: ${asig.Supervisor}</p>
            <p class="mb-1 font-semibold text-gray-700 dark:text-gray-400">Maquina: ${asig.Maquina}</p>
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Problema: ${asig.Problema}</p>
            <span class="inline-block px-3 py-1 text-xs font-medium rounded ${statusColor}">${asig.Status}</span>
        </div>
    </div>
    `;
}

// Cargar asignaciones iniciales (solo las que no son AUTONOMO)
function cargarAsignaciones() {
    fetch('/asignaciones-ot')
        .then(res => res.json())
        .then(data => {
            const cont = document.getElementById('asignaciones-container');
            cont.innerHTML = '';
            data
                .filter(asig => asig.Status !== 'AUTONOMO')
                .forEach(asig => {
                    cont.innerHTML += renderAsignacion(asig);
                });
        });
}

document.addEventListener('DOMContentLoaded', function() {
    cargarAsignaciones();
});

// Escuchar el canal y evento, evitando duplicados y ocultando AUTONOMO
window.Echo.channel('asignaciones-ot')
    .listen('AsignacionOTCreated', (e) => {
        const cont = document.getElementById('asignaciones-container');
        if (e.Status !== 'AUTONOMO' && !cont.querySelector(`[data-folio="${e.Folio}"]`)) {
            cont.insertAdjacentHTML('afterbegin', renderAsignacion(e));
        }
    })
    .listen('AsignacionOTReasignada', (e) => {
        const cont = document.getElementById('asignaciones-container');
        const card = cont.querySelector(`[data-folio="${e.Folio}"]`);
        if (card) {
            card.outerHTML = renderAsignacion(e);
        }
    })
    .listen('StatusOTUpdated', (e) => {
        const cont = document.getElementById('asignaciones-container');
        const card = cont.querySelector(`[data-folio="${e.Folio}"]`);
        if (card) {
            card.outerHTML = renderAsignacion(e);
        }
    });
