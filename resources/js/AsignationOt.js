import Echo from "laravel-echo";
import Pusher from "pusher-js";

// --- Configuración de Echo/Pusher ---
window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    encrypted: true,
});

// --- Variables globales para seguimiento de comida/break ---
window.foliosComidaBreak = [];
window.horasComidaBreak = [];

// --- Utilidades de status y estilos ---
function getStatusColor(status) {
    switch (status) {
        case "FINALIZADO":
            return "bg-blue-800 text-blue-100";
        case "ASIGNADO":
            return "bg-blue-100 text-blue-800";
        case "PROCESO":
            return "bg-yellow-100 text-yellow-800";
        case "PENDIENTE":
            return "bg-red-100 text-red-800";
        case "ATENDIDO":
            return "bg-green-100 text-green-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

function getRingClass(status) {
    switch (status) {
        case "FINALIZADO":
            return "ring-blue-600 dark:ring-blue-600 bg-blue-600";
        case "ASIGNADO":
            return "ring-blue-400 dark:ring-blue-400 bg-blue-400";
        case "PROCESO":
            return "ring-yellow-400 dark:ring-yellow-400 bg-yellow-400";
        case "PENDIENTE":
            return "ring-red-500 dark:ring-red-500 bg-red-500";
        case "ATENDIDO":
            return "ring-green-600 dark:ring-green-600 bg-green-600";
        default:
            return "ring-gray-400 dark:ring-gray-400 bg-gray-400";
    }
}

// --- Actualiza arrays globales de comida/break ---
function actualizarFoliosComidaBreak(data) {
    window.foliosComidaBreak = [];
    window.horasComidaBreak = [];
    data.forEach(asig => {
        if (asig.ComidaBreak && asig.TerminoComidaBreack) {
            window.foliosComidaBreak.push(asig.Folio);
            window.horasComidaBreak.push(asig.TerminoComidaBreack);
        }
    });
}

// --- Renderiza una tarjeta de asignación ---
function renderAsignacion(asig) {
    const imgUrl = asig.foto
        ? asig.foto
        : "http://128.150.102.45:8000/Intimark/" + asig.Num_Mecanico + ".jpg";
    const statusColor = getStatusColor(asig.Status);
    const ringClass = getRingClass(asig.Status);

    let comidaBreakHtml = "";
    if (asig.ComidaBreak && asig.TerminoComidaBreack) {
        comidaBreakHtml = `
            <div class="mt-2">
                <span class="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                    ${asig.ComidaBreak}
                    Regresa a las: ${new Date(asig.TerminoComidaBreack).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        `;
    }

    return `
    <div class="relative max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col" data-folio="${asig.Folio}">
        <div class="absolute -top-8 -left-8 z-10">
            <img class="w-20 h-20 rounded-full ring-4 ${ringClass} shadow-lg object-cover bg-white"
                src="${imgUrl}" alt="${asig.Num_Mecanico}"
                onerror="this.onerror=null; this.src='/default-avatar.jpg';">
        </div>
        <div class="p-5 pl-20">
            <div class="flex items-center justify-between">
                <span class="text-xs font-semibold px-2 py-1 rounded ${statusColor}">${asig.Status}</span>
                <span class="font-bold text-lg text-gray-800 dark:text-gray-100">Folio:<br>${asig.Folio}</span>
            </div>
            <div class="font-bold text-lg text-gray-800 dark:text-gray-100">Problema:<br>${asig.Problema}</div>
            <div class="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span>Módulo: <b>${asig.Modulo}</b></span>
                <span>Mecánico: <b>${asig.Mecanico}</b></span>
                <span>Supervisor: <b>${asig.Supervisor}</b></span>
                <span>Máquina: <b>${asig.Maquina}</b></span>
            </div>
            ${comidaBreakHtml}
            <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-gray-400">Creada: ${asig.created_at ? new Date(asig.created_at).toLocaleString() : ''}</span>
                <span class="text-xs text-gray-400">Últ. actualización: ${asig.updated_at ? new Date(asig.updated_at).toLocaleString() : ''}</span>
            </div>
        </div>
    </div>
    `;
}

// --- Renderiza y filtra asignaciones, actualiza barra de resumen y arrays globales ---
function renderAsignacionesFiltradas(data) {
    actualizarFoliosComidaBreak(data);

    const search = document.getElementById("search-ot")?.value?.toLowerCase() || "";
    const status = document.getElementById("filter-status")?.value || "";

    const statusOrder = ['ASIGNADO', 'PROCESO', 'PENDIENTE', 'ATENDIDO', 'FINALIZADO'];
    let filtered = data.filter(asig => asig.Status !== "AUTONOMO");

    filtered.sort((a, b) => {
        const idxA = statusOrder.indexOf(a.Status);
        const idxB = statusOrder.indexOf(b.Status);
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    if (search) {
        filtered = filtered.filter(
            (asig) =>
                (asig.Folio && asig.Folio.toLowerCase().includes(search)) ||
                (asig.Modulo && asig.Modulo.toLowerCase().includes(search)) ||
                (asig.Mecanico && asig.Mecanico.toLowerCase().includes(search)) ||
                (asig.Supervisor && asig.Supervisor.toLowerCase().includes(search)) ||
                (asig.Maquina && asig.Maquina.toLowerCase().includes(search)) ||
                (asig.Problema && asig.Problema.toLowerCase().includes(search))
        );
    }
    if (status) {
        filtered = filtered.filter((asig) => asig.Status === status);
    }

    // Contadores de status
    const counts = {
        PENDIENTE: 0,
        ASIGNADO: 0,
        PROCESO: 0,
        ATENDIDO: 0,
        FINALIZADO: 0,
        total: filtered.length,
    };
    filtered.forEach((asig) => {
        if (counts[asig.Status] !== undefined) counts[asig.Status]++;
    });
    if (document.getElementById("ot-pendientes"))
        document.getElementById("ot-pendientes").textContent = counts.PENDIENTE;
    if (document.getElementById("ot-asignadas"))
        document.getElementById("ot-asignadas").textContent = counts.ASIGNADO;
    if (document.getElementById("ot-proceso"))
        document.getElementById("ot-proceso").textContent = counts.PROCESO;
    if (document.getElementById("ot-atendidas"))
        document.getElementById("ot-atendidas").textContent = counts.ATENDIDO;
    if (document.getElementById("ot-finalizadas"))
        document.getElementById("ot-finalizadas").textContent = counts.FINALIZADO;
    if (document.getElementById("ot-total"))
        document.getElementById("ot-total").textContent = counts.total;

    // Render cards
    const cont = document.getElementById("asignaciones-container");
    cont.innerHTML = filtered.length
        ? filtered.map(renderAsignacion).join("")
        : `<div class="col-span-full text-center text-gray-400 py-8">No hay OTs para mostrar.</div>`;
}

// --- Recarga y renderiza asignaciones desde el backend ---
function recargarYRenderizarAsignaciones() {
    fetch("/asignaciones-ot")
        .then((res) => res.json())
        .then((data) => {
            renderAsignacionesFiltradas(data);
        });
}

// --- Revisa cada segundo si hay que limpiar ComidaBreak ---
function revisarYLimpiarComidaBreak() {
    const ahora = new Date();
    const vencidos = [];
    window.horasComidaBreak.forEach((hora, idx) => {
        const horaRegreso = new Date(hora);
        // Si la hora actual es igual o mayor a la hora de regreso
        if (
            ahora.getHours() > horaRegreso.getHours() ||
            (ahora.getHours() === horaRegreso.getHours() && ahora.getMinutes() >= horaRegreso.getMinutes())
        ) {
            vencidos.push(window.foliosComidaBreak[idx]);
        }
    });
    if (vencidos.length > 0) {
        fetch('/asignaciones-ot/limpiar-comida-break-masivo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({ folios: vencidos })
        });
    }
}

// --- Eventos DOM y Echo ---
document.addEventListener("DOMContentLoaded", function () {
    recargarYRenderizarAsignaciones();
    const searchInput = document.getElementById("search-ot");
    const filterSelect = document.getElementById("filter-status");
    if (searchInput)
        searchInput.addEventListener("input", recargarYRenderizarAsignaciones);
    if (filterSelect)
        filterSelect.addEventListener("change", recargarYRenderizarAsignaciones);
});

window.Echo.channel("asignaciones-ot")
    .listen("AsignacionOTCreated", () => recargarYRenderizarAsignaciones())
    .listen("AsignacionOTReasignada", () => recargarYRenderizarAsignaciones())
    .listen("StatusOTUpdated", () => recargarYRenderizarAsignaciones())
    .listen("ComidaBreakLimpiado", () => recargarYRenderizarAsignaciones()); // Nuevo evento

// --- Intervalo para revisar comida/break ---
setInterval(revisarYLimpiarComidaBreak, 1000);
