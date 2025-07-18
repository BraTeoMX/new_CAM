import Echo from "laravel-echo";
import Pusher from "pusher-js";

// --- VARIABLES GLOBALES ---
const COLORS = {
    ASIGNADO: 'bg-blue-100 text-blue-800',
    PROCESO: 'bg-yellow-100 text-yellow-800',
    PENDIENTE: 'bg-red-100 text-red-800',
    ATENDIDO: 'bg-green-100 text-green-800',
    AUTONOMO: 'bg-violet-200 text-violet-800',
    DEFAULT: 'bg-gray-100 text-gray-800'
};


const STATUS_LIST = [
    'PENDIENTE',
    'ASIGNADO',
    'PROCESO',
    'ATENDIDO',
    'AUTONOMO',
];

const STATUS_LABELS = {
    PENDIENTE: 'Pendiente',
    ASIGNADO: 'Asignado',
    PROCESO: 'En Proceso',
    ATENDIDO: 'Atendida',
    AUTONOMO: 'Autónoma',
};

// Mapas globales para OTs y seguimiento
const otMap = new Map(); // folio -> OT
const followAtentionMap = new Map(); // folio -> seguimiento
const activeTimers = new Map(); // folio -> timerId

// --- ECHO INIT ---
window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    encrypted: true,
});

// --- FUNCIONES DE UTILIDAD ---
function getStatusColor(status) {
    return COLORS[status] || COLORS.DEFAULT;
}

function getRingClass(status) {
    switch (status) {
        case "ASIGNADO":
            return "ring-blue-400 dark:ring-blue-400 bg-blue-400";
        case "PROCESO":
            return "ring-yellow-400 dark:ring-yellow-400 bg-yellow-400";
        case "PENDIENTE":
            return "ring-red-500 dark:ring-red-500 bg-red-500";
        case "ATENDIDO":
            return "ring-green-600 dark:ring-green-600 bg-green-600";
        case "AUTONOMO":
            return "ring-violet-600 dark:ring-violet-600 bg-violet-600";
        default:
            return "ring-gray-400 dark:ring-gray-400 bg-gray-400";
    }
}

function formatDateTime(dateStr) {
    return dateStr ? new Date(dateStr).toLocaleString() : '';
}

// Utilidad para convertir "H:i" o número a minutos
function parseEstimadoToMinutes(estimado) {
    if (!estimado) return 0;
    if (typeof estimado === 'number') return estimado;
    if (/^\d+$/.test(estimado)) return parseInt(estimado); // solo minutos
    if (/^\d{2}:\d{2}$/.test(estimado)) {
        const [h, m] = estimado.split(':').map(Number);
        return h * 60 + m;
    }
    return 0;
}

// --- DATOS DE SEGUIMIENTO ---
async function fetchAndStoreFollowAtention(folio) {
    if (followAtentionMap.has(folio)) return followAtentionMap.get(folio);
    try {
        const response = await fetch(`/api/follow-atention/${encodeURIComponent(folio)}`, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        if (!response.ok) throw new Error('No se pudo obtener el registro');
        const data = await response.json();
        if (data.success) {
            followAtentionMap.set(folio, data.data);

            // Extra: Si ya existe la tarjeta en pantalla, vuelve a renderizar solo esa tarjeta y reinicia su temporizador
            const timerDiv = document.querySelector(`.timer-countdown[data-folio="${folio}"]`);
            if (timerDiv) {
                // Busca la OT en el mapa global
                const ot = otMap.get(folio);
                if (ot) {
                    // Renderiza solo la tarjeta de esa OT
                    const container = timerDiv.closest('.bg-white, .dark\\:bg-gray-800');
                    if (container) {
                        container.outerHTML = renderOTCard(ot);
                        // Re-inicializa los temporizadores solo para esa tarjeta
                        setTimeout(() => {
                            initializeTimers();
                        }, 10);
                    }
                }
            }

            return data.data;
        }
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

// --- RENDERIZADO DE CARDS ---
function renderOTCard(ot) {
    const statusColor = getStatusColor(ot.Status);
    let timerHtml = '';
    let followData = followAtentionMap.get(ot.Folio) || {};

    // --- NUEVO: Mostrar mensaje de comida/break si aplica ---
    let comidaBreakHtml = '';
    if (ot.ComidaBreak && ot.TerminoComidaBreack) {
        comidaBreakHtml = `
            <div class="mt-2">
                <span class="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                    ${ot.ComidaBreak}
                    Regresa a las: ${new Date(ot.TerminoComidaBreack).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        `;
    }

    let timeInicio = '';
    let timeEstimado = '';
    let timerLabel = 'Tiempo restante:';
    let timerValue = '';
    let timerClass = 'timer-countdown';


    if (ot.Status === 'PROCESO') {
        timeInicio = followData.TimeInicio || '';
        timeEstimado = parseEstimadoToMinutes(followData.TimeEstimado);
    }

    // --- Mostrar SIEMPRE el tiempo de atención en ATENDIDO, aunque sea 0 o null ---
    if (ot.Status === 'ATENDIDO') {
        timerLabel = 'Tiempo total de atención:';
        // Si no tenemos el dato, lo consultamos por AJAX y actualizamos la card
        let minutos = 0;
        if (
            typeof followData.TimeEjecucion !== 'undefined' &&
            followData.TimeEjecucion !== null &&
            followData.TimeEjecucion !== ''
        ) {
            minutos = parseInt(followData.TimeEjecucion, 10);
            if (isNaN(minutos)) minutos = 0;
        } else {
            // AJAX para obtener el dato si no está en el array global
            fetch(`/api/follow-atention/${encodeURIComponent(ot.Folio)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data && data.data.TimeEjecucion != null) {
                        followAtentionMap.set(ot.Folio, data.data);
                        // Vuelve a renderizar solo esta card
                        const card = document.querySelector(`[data-folio-card="${ot.Folio}"]`);
                        if (card) {
                            card.outerHTML = renderOTCard(ot);
                        }
                    }
                });
        }
        timerValue = `${minutos} minutos`;
        timerClass = 'timer-finalizado';
        timerHtml = `
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${timerLabel}</span>
                </div>
                <div class="font-mono text-2xl font-bold text-blue-700 ${timerClass}">
                    ${timerValue}
                </div>
            </div>
        `;
    } else if (ot.Status === 'PROCESO') {
        timerHtml = `
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${timerLabel}</span>
                </div>
                <div class="font-mono text-2xl font-bold timer-countdown"
                     data-folio="${ot.Folio}"
                     data-inicio="${timeInicio}"
                     data-estimado="${timeEstimado}">
                    <span class="text-gray-400">Cargando...</span>
                </div>
                <div class="text-sm text-gray-500">
                    Tiempo estimado: ${timeEstimado ? timeEstimado : '...'} minutos
                </div>
            </div>
        `;
    }

    let finalizarBtn = '';
    let bahiaBtn = '';
    let bahiaTimerHtml = '';
    let mostrarBahiaBtn = true;
    let pulsaciones = 0;

    // Obtener pulsaciones desde memoria local
    if (window.bahiaTimers[ot.Folio] && typeof window.bahiaTimers[ot.Folio].pulsaciones !== 'undefined') {
        pulsaciones = window.bahiaTimers[ot.Folio].pulsaciones;
    }

    // Si ya llegó a 4 pulsaciones, no mostrar el botón
    if (pulsaciones >= 4) {
        mostrarBahiaBtn = false;
    }

    if (ot.Status === 'PROCESO') {
        // Botón para iniciar o finalizar Bahía según estado global
        const bahiaRunning = isBahiaRunning(ot.Folio);
        if (mostrarBahiaBtn) {
            bahiaBtn = `
                <button class="bahia-btn text-white ${bahiaRunning ? 'bg-red-700 hover:bg-red-800' : 'bg-violet-700 hover:bg-violet-800'} focus:ring-4 focus:ring-violet-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 ml-2 dark:${bahiaRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-600 hover:bg-violet-700'} focus:outline-none dark:focus:ring-violet-800"
                    type="button"
                    data-folio="${ot.Folio}">
                    ${bahiaRunning ? 'Fin Bahía' : 'Inicio Bahía'}
                </button>
            `;
        } else {
            bahiaBtn = '';
        }

        // Timer Bahía siempre visible si hay tiempo registrado o está corriendo
        const bahiaVisible = window.bahiaTimers[ot.Folio] && (window.bahiaTimers[ot.Folio].elapsed > 0 || window.bahiaTimers[ot.Folio].running);
        bahiaTimerHtml = `
            <div class="mt-2 text-center bahia-timer-container" data-folio="${ot.Folio}" style="${bahiaVisible ? '' : 'display:none;'}">
                <div class="text-xs text-gray-500 mb-1">Tiempo Bahía:</div>
                <div class="font-mono text-xl font-bold text-violet-700 timer-bahia" data-folio="${ot.Folio}">00:00:00</div>
            </div>
        `;

        finalizarBtn = `
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <button class="finalizar-proceso-btn text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    type="button"
                    data-folio="${ot.Folio}"
                    data-inicio="${followData.TimeInicio || ''}"
                    data-estimado="${parseEstimadoToMinutes(followData.TimeEstimado)}">
                    Finalizar Atención
                </button>
                ${bahiaBtn}
            </div>
        `;
    }

    // --- Mostrar SIEMPRE el tiempo de atención en ATENDIDO, aunque sea 0 o null ---
    if (ot.Status === 'ATENDIDO') {
        timerLabel = 'Tiempo total de atención:';
        // Si no tenemos el dato, lo consultamos por AJAX y actualizamos la card
        let minutos = 0;
        if (
            typeof followData.TimeEjecucion !== 'undefined' &&
            followData.TimeEjecucion !== null &&
            followData.TimeEjecucion !== ''
        ) {
            minutos = parseInt(followData.TimeEjecucion, 10);
            if (isNaN(minutos)) minutos = 0;
        } else {
            // AJAX para obtener el dato si no está en el array global
            fetch(`/api/follow-atention/${encodeURIComponent(ot.Folio)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data && data.data.TimeEjecucion != null) {
                        followAtentionMap.set(ot.Folio, data.data);
                        // Vuelve a renderizar solo esta card
                        const card = document.querySelector(`[data-folio-card="${ot.Folio}"]`);
                        if (card) {
                            card.outerHTML = renderOTCard(ot);
                        }
                    }
                });
        }
        timerValue = `${minutos} minutos`;
        timerClass = 'timer-finalizado';
        timerHtml = `
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${timerLabel}</span>
                </div>
                <div class="font-mono text-2xl font-bold text-blue-700 ${timerClass}">
                    ${timerValue}
                </div>
            </div>
        `;
    } else if (ot.Status === 'PROCESO') {
        timerHtml = `
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${timerLabel}</span>
                </div>
                <div class="font-mono text-2xl font-bold timer-countdown"
                     data-folio="${ot.Folio}"
                     data-inicio="${followData.TimeInicio || ''}"
                     data-estimado="${parseEstimadoToMinutes(followData.TimeEstimado)}">
                    <span class="text-gray-400">Cargando...</span>
                </div>
                <div class="text-sm text-gray-500">
                    Tiempo estimado: ${parseEstimadoToMinutes(followData.TimeEstimado) ? parseEstimadoToMinutes(followData.TimeEstimado) : '...'} minutos
                </div>
                ${bahiaTimerHtml}
            </div>
        `;
    }

    const footer = ot.Status === 'ASIGNADO' ? `
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button class="iniciar-atencion-btn w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                    data-folio="${ot.Folio}"
                    data-maquina="${ot.Maquina}">
                Iniciar Atención
            </button>
        </div>
    ` : '';
    const ringClass = getRingClass(ot.Status);

    const imgUrl = ot.Status === "AUTONOMO" ?
        "/images/Avatar.webp" // Reemplaza con la ruta correcta
        :
        "http://128.150.102.45:8000/Intimark/" + ot.Num_Mecanico + ".jpg";
    // --- Agrega un data-folio-card para poder actualizar solo esta card ---
    return `
    <div class="relative max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col" data-folio-card="${ot.Folio}">
         <div class="absolute -top-8 -left-8 z-10">
            <img class="w-20 h-20 rounded-full ring-4 ${ringClass} shadow-lg object-cover bg-white"
                src="${imgUrl}" alt="${ot.Num_Mecanico}"
                onerror="this.onerror=null; this.src='/default-avatar.jpg';">
        </div>
        <div class="p-5 pl-20">
        <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 text-sm font-semibold rounded ${statusColor}">${ot.Status}</span>
                <span class="text-lg font-bold text-gray-800 dark:text-gray-100">Folio: ${ot.Folio}</span>
            </div>
            <div class="space-y-3">
                <p class="font-bold text-gray-800 dark:text-gray-100">${ot.Problema}</p>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>Módulo: <span class="font-semibold">${ot.Modulo}</span></div>
                    <div>Operario: <span class="font-semibold">${ot.Operario}</span></div>
                    <div>Nombre Operario: <span class="font-semibold">${ot.NombreOperario}</span></div>
                    <div>Máquina: <span class="font-semibold">${ot.Maquina}</span></div>
                    <div>Mecánico: <span class="font-semibold">${ot.Mecanico}</span></div>
                    <div>Supervisor: <span class="font-semibold">${ot.Supervisor}</span></div>
                </div>
                <div class="text-xs text-gray-500 flex justify-between">
                    <span>Creada: ${formatDateTime(ot.created_at)}</span>
                    <span>Actualizada: ${formatDateTime(ot.updated_at)}</span>
                </div>
                ${comidaBreakHtml}
            </div>
            ${timerHtml}
            ${finalizarBtn}
            ${footer}
            </div>
        </div>
    `;
}

// Utilidad para convertir minutos a "H:i"
function minutosAHoraMinutos(mins) {
    mins = parseInt(mins) || 0;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}:${m.toString().padStart(2, '0')}`;
}

// --- DRAWER HTML (agrega esto una sola vez al final del body de tu HTML principal) ---
if (!document.getElementById('drawer-form-finalizar')) {
    const drawerHtml = `
    <div id="drawer-form-finalizar" class="fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto transition-transform -translate-x-full bg-white w-80 dark:bg-gray-800" tabindex="-1" aria-labelledby="drawer-form-label">
        <h5 class="inline-flex items-center mb-6 text-base font-semibold text-gray-500 uppercase dark:text-gray-400">
            <span class="material-symbols-outlined mr-2">assignment_turned_in</span>Finalizar Atención
        </h5>
        <button type="button" data-drawer-hide="drawer-form-finalizar" aria-controls="drawer-form-finalizar" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" >
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span class="sr-only">Close menu</span>
        </button>
        <form id="finalizar-atencion-form" class="mb-6">
            <div class="mb-6">
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleccione que falla tenía:</label>
                <select id="falla-select" class="swal2-select w-full"></select>
            </div>
            <div class="mb-6">
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleccione la causa de la falla:</label>
                <select id="causa-select" class="swal2-select w-full"></select>
            </div>
            <div class="mb-6">
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleccione la acción que implementó:</label>
                <select id="accion-select" class="swal2-select w-full"></select>
            </div>
            <div class="mb-6">
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Comentarios adicionales (opcional):</label>
                <textarea id="comentarios-finalizar" rows="3" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></textarea>
            </div>
            <button type="submit" class="text-white justify-center flex items-center bg-blue-700 hover:bg-blue-800 w-full focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                Finalizar Atención
            </button>
        </form>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHtml);
}

// --- EVENTO PARA ABRIR EL DRAWER Y CARGAR CATALOGOS ---
document.addEventListener('click', async function(e) {
    if (e.target && e.target.classList.contains('finalizar-proceso-btn')) {
        const folio = e.target.getAttribute('data-folio');
        const timeInicio = e.target.getAttribute('data-inicio');
        const timeEstimado = e.target.getAttribute('data-estimado');
        // Guarda en variable global para usar al enviar
        window.finalizarAtencionFolio = folio;
        window.finalizarAtencionTimeInicio = timeInicio;
        window.finalizarAtencionTimeEstimado = timeEstimado;

        // Cargar catálogos
        await cargarCatalogoSelect2('/api/fallas', '#falla-select', 'Fallas');
        await cargarCatalogoSelect2('/api/causas', '#causa-select', 'Causa');
        await cargarCatalogoSelect2('/api/acciones', '#accion-select', 'Accion');

        // Abre el drawer
        window.dispatchEvent(new CustomEvent('open-drawer', { detail: { id: 'drawer-form-finalizar' } }));
        document.getElementById('drawer-form-finalizar').classList.remove('-translate-x-full');
    }
});

// --- FUNCION PARA CARGAR CATALOGOS EN SELECT2 ---
async function cargarCatalogoSelect2(url, selector, textKey) {
    const res = await fetch(url);
    const data = await res.json();
    const select = document.querySelector(selector);
    select.innerHTML = `<option value="">Seleccione una opción</option>` + data.map(item => `<option value="${item[textKey]}">${item[textKey]}</option>`).join('');
    $(select).val('').trigger('change');
    $(select).select2({ dropdownParent: $('#drawer-form-finalizar'), width: '100%' });
}

// --- SUBMIT FINALIZAR ATENCION ---
document.getElementById('finalizar-atencion-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    // --- Mostrar spinner de carga ---
    let spinnerDiv = document.createElement('div');
    spinnerDiv.id = 'finalizar-atencion-spinner';
    spinnerDiv.className = 'flex justify-center items-center my-4';
    spinnerDiv.innerHTML = `
        <div role="status">
          <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
          <span class="sr-only">Cargando...</span>
        </div>
    `;
    // Insertar spinner al principio del drawer
    const drawer = document.getElementById('drawer-form-finalizar');
    if (drawer) drawer.prepend(spinnerDiv);

    try {
        const folio = window.finalizarAtencionFolio;
        const falla = $('#falla-select').val();
        const causa = $('#causa-select').val();
        const accion = $('#accion-select').val();
        const comentarios = $('#comentarios-finalizar').val();

        if (!falla || !causa || !accion) {
            Swal.fire('Error', 'Debe seleccionar una opción en cada catálogo.', 'error');
            return;
        }

        // Tiempos
        const now = new Date();
        const timeFinal = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        const timerDiv = document.querySelector(`.timer-countdown[data-folio="${folio}"], .timer-finalizado[data-folio="${folio}"]`);
        let timeReal = '00:00';
        if (timerDiv) {
            timeReal = timerDiv.textContent.replace('-', '').trim();
        }
        const followData = followAtentionMap.get(folio);
        let timeInicio = (followData && followData.TimeInicio) ? followData.TimeInicio : (window.finalizarAtencionTimeInicio || '');
        let timeEstimado = parseEstimadoToMinutes((followData && followData.TimeEstimado) ? followData.TimeEstimado : (window.finalizarAtencionTimeEstimado || ''));
        let timeEjecucion = 0;
        if (timeInicio && timeFinal) {
            const [h1, m1] = timeInicio.split(':').map(Number);
            const [h2, m2] = timeFinal.split(':').map(Number);
            timeEjecucion = (h2 * 60 + m2) - (h1 * 60 + m1);
            if (timeEjecucion < 0) timeEjecucion += 24 * 60;
        }

        // --- Detener el cronómetro de inmediato y actualizar el valor en la variable global ---
        if (activeTimers.has(folio)) {
            clearInterval(activeTimers.get(folio));
            activeTimers.delete(folio);
        }
        if (followData) {
            followData.TimeEjecucion = timeEjecucion;
        }

        // --- LIBERAR LOCALSTORAGE DEL BAHIA SI EXISTE ---
        if (window.bahiaTimers[folio]) {
            delete window.bahiaTimers[folio];
            saveBahiaTimers();
        }

        // --- Mostrar el valor de TimeEjecucion en el cronómetro y cambiar el label ---
        if (timerDiv) {
            const labelSpan = timerDiv.parentElement && timerDiv.parentElement.previousElementSibling ? timerDiv.parentElement.previousElementSibling.querySelector('span.text-gray-800') : null;
            if (labelSpan) labelSpan.textContent = 'Tiempo total de atención:';
            timerDiv.classList.remove('text-green-600', 'text-orange-500', 'text-red-600', 'timer-countdown');
            timerDiv.classList.add('text-blue-700', 'timer-finalizado');
            timerDiv.textContent = minutosAHoraMinutos(timeEjecucion);
        }

        // Enviar datos al backend
        const res = await fetch('/api/finalizar-atencion', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                folio,
                falla,
                causa,
                accion,
                comentarios,
                time_final: timeFinal,
                time_real: timeReal,
                time_ejecucion: timeEjecucion
            })
        });
        const data = await res.json();
        if (data.success) {
            // Cambia status a ATENDIDO usando la ruta correcta y activa Echo
            // Necesita el id de la OT (asignation_ots.id)
            let otId = null;
            if (otMap.has(folio)) {
                otId = otMap.get(folio).id;
                otMap.get(folio).Status = 'ATENDIDO';
            }
            if (otId) {
                await fetch('/broadcast-status-ot', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: JSON.stringify({
                        id: otId,
                        status: 'ATENDIDO'
                    })
                });
            }
            // Forzar recarga de la lista para reflejar el cambio y detener cualquier cronómetro remanente
            const modulo = document.getElementById('modulo-select').value;
            if (modulo) await cargarSeguimientoOTs(modulo);
            Swal.fire('¡Éxito!', 'Atención finalizada correctamente', 'success').then(async() => {
                // --- NUEVO: Encuesta de satisfacción con iconos ---
                const encuestaHtml = `
                    <div style="text-align:left;">
                        <label style="display:flex;align-items:center;margin-bottom:10px;cursor:pointer;">
                            <input type="radio" name="satisfaccion" value="Excelente" style="margin-right:8px;">
                            <span style="font-size:1.5em;margin-right:8px;">🌟</span>
                            <span>Excelente</span>
                        </label>
                        <label style="display:flex;align-items:center;margin-bottom:10px;cursor:pointer;">
                            <input type="radio" name="satisfaccion" value="Bueno" style="margin-right:8px;">
                            <span style="font-size:1.5em;margin-right:8px;">👍</span>
                            <span>Bueno</span>
                        </label>
                        <label style="display:flex;align-items:center;margin-bottom:10px;cursor:pointer;">
                            <input type="radio" name="satisfaccion" value="Regular" style="margin-right:8px;">
                            <span style="font-size:1.5em;margin-right:8px;">😐</span>
                            <span>Regular</span>
                        </label>
                        <label style="display:flex;align-items:center;cursor:pointer;">
                            <input type="radio" name="satisfaccion" value="Malo" style="margin-right:8px;">
                            <span style="font-size:1.5em;margin-right:8px;">👎</span>
                            <span>Malo</span>
                        </label>
                    </div>
                `;
                const { value: satisfaccion } = await Swal.fire({
                    title: 'Califica que tan buena fue la atención',
                    html: encuestaHtml,
                    focusConfirm: false,
                    preConfirm: () => {
                        const selected = document.querySelector('input[name="satisfaccion"]:checked');
                        if (!selected) {
                            Swal.showValidationMessage('Debes seleccionar una opción');
                            return false;
                        }
                        return selected.value;
                    },
                    confirmButtonText: 'Enviar',
                    showCancelButton: false,
                    customClass: {
                        htmlContainer: 'swal2-radio-group'
                    }
                });
                if (satisfaccion) {
                    await fetch('/api/encuesta-satisfaccion', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify({
                            folio: folio,
                            encuesta: satisfaccion
                        })
                    });
                    Swal.fire('¡Gracias!', 'Tu opinión ha sido registrada.', 'success');
                }
            });
            document.getElementById('drawer-form-finalizar').classList.add('-translate-x-full');
        } else {
            Swal.fire('Error', 'No se pudo finalizar la atención', 'error');
        }
    } finally {
        // Remover spinner después de terminar
        if (spinnerDiv && spinnerDiv.parentNode) spinnerDiv.parentNode.removeChild(spinnerDiv);
    }
});

// --- DRAWER FLOWBITE CONTROL ---
window.addEventListener('open-drawer', function(e) {
    const id = e.detail.id;
    document.getElementById(id).classList.remove('-translate-x-full');
});
document.querySelectorAll('[data-drawer-hide]').forEach(btn => {
    btn.addEventListener('click', function() {
        const id = btn.getAttribute('aria-controls');
        document.getElementById(id).classList.add('-translate-x-full');
    });
});

// --- TIMER BAHIA LOGIC ---
// Array global para controlar el estado de los timers Bahía y pulsaciones
window.bahiaTimers = window.bahiaTimers || {}; // { folio: { start, elapsed, running, pulsaciones } }

// Cargar estado de timers Bahía desde localStorage al iniciar
function loadBahiaTimers() {
    const data = localStorage.getItem('bahiaTimers');
    if (data) {
        try {
            window.bahiaTimers = JSON.parse(data);
        } catch (e) {
            window.bahiaTimers = {};
        }
    }
}

function saveBahiaTimers() {
    localStorage.setItem('bahiaTimers', JSON.stringify(window.bahiaTimers));
}
loadBahiaTimers();

// Iniciar timer Bahía (reinicia si es segundo ciclo)
function startBahiaTimer(folio, pulsaciones) {
    if (!window.bahiaTimers[folio]) {
        window.bahiaTimers[folio] = { start: Date.now(), elapsed: 0, running: true, pulsaciones: pulsaciones || 1 };
    } else {
        window.bahiaTimers[folio].start = Date.now();
        window.bahiaTimers[folio].elapsed = 0;
        window.bahiaTimers[folio].running = true;
        window.bahiaTimers[folio].pulsaciones = pulsaciones || window.bahiaTimers[folio].pulsaciones || 1;
    }
    saveBahiaTimers();
}

// Parar timer Bahía y sumar tiempo
function stopBahiaTimer(folio) {
    const t = window.bahiaTimers[folio];
    if (t && t.running) {
        t.elapsed += Math.floor((Date.now() - t.start) / 1000);
        t.running = false;
        saveBahiaTimers();
    }
}

// Obtener segundos totales del timer Bahía
function getBahiaElapsed(folio) {
    const t = window.bahiaTimers[folio];
    if (!t) return 0;
    if (t.running) {
        return t.elapsed + Math.floor((Date.now() - t.start) / 1000);
    }
    return t.elapsed;
}

// Saber si el timer Bahía está corriendo
function isBahiaRunning(folio) {
    return !!(window.bahiaTimers[folio] && window.bahiaTimers[folio].running);
}

// --- AJAX para guardar inicio/fin/inicio1/fin1 de Bahía en backend y obtener pulsaciones ---
async function guardarBahiaEnBackend(folio, tipo) {
    try {
        const res = await fetch('/api/bahia', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                folio,
                tipo
            })
        });
        const data = await res.json();
        if (!data.success) {
            Swal.fire('Error', data.message || 'No se pudo guardar el tiempo de Bahía', 'error');
        }
        return data;
    } catch (e) {
        Swal.fire('Error', 'No se pudo guardar el tiempo de Bahía', 'error');
        return null;
    }
}

// --- Obtener info de bahía desde backend (incluye Pulsaciones) ---
async function obtenerBahiaInfo(folio) {
    try {
        const res = await fetch(`/api/bahia-info/${encodeURIComponent(folio)}`, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        const data = await res.json();
        return data.bahia || null;
    } catch (e) {
        return null;
    }
}

// --- EVENTOS PARA BOTÓN BAHÍA (delegación) ---
document.addEventListener('click', async function(e) {
    if (e.target && e.target.classList.contains('bahia-btn')) {
        const folio = e.target.getAttribute('data-folio');
        // Obtener info actual del backend antes de cualquier acción
        const bahiaInfo = await obtenerBahiaInfo(folio);
        let pulsaciones = bahiaInfo && bahiaInfo.Pulsaciones ? parseInt(bahiaInfo.Pulsaciones) : 0;

        // Si ya llegó a 4 pulsaciones, no hacer nada
        if (pulsaciones >= 4) return;

        // Lógica de pulsaciones y tipos
        let tipo = '';
        if (isBahiaRunning(folio)) {
            // Fin Bahía
            if (pulsaciones === 1) tipo = 'fin';
            else if (pulsaciones === 3) tipo = 'fin1';
            else return; // Solo permite fin en los ciclos correctos
            stopBahiaTimer(folio);
        } else {
            // Inicio Bahía
            if (pulsaciones === 0) tipo = 'inicio';
            else if (pulsaciones === 2) tipo = 'inicio1';
            else return; // Solo permite inicio en los ciclos correctos
            startBahiaTimer(folio, pulsaciones + 1);
        }

        // Guardar en backend y actualizar pulsaciones en memoria
        const data = await guardarBahiaEnBackend(folio, tipo);
        if (data && data.bahia) {
            pulsaciones = data.bahia.Pulsaciones ? parseInt(data.bahia.Pulsaciones) : (pulsaciones + 1);
            window.bahiaTimers[folio] = window.bahiaTimers[folio] || {};
            window.bahiaTimers[folio].pulsaciones = pulsaciones;
            // Si ya terminó el segundo ciclo (pulsaciones >= 4), detener timer y eliminar del localStorage
            if (pulsaciones >= 4) {
                delete window.bahiaTimers[folio];
                saveBahiaTimers();
            } else {
                saveBahiaTimers();
            }
        }

        // Forzar re-render de la card para actualizar botón y timer
        const card = document.querySelector(`[data-folio-card="${folio}"]`);
        if (card && otMap.has(folio)) {
            card.outerHTML = renderOTCard(otMap.get(folio));
            setTimeout(() => initializeTimers(), 10);
        }
    }
});

// --- TEMPORIZADORES ---
function clearAllTimers() {
    for (const timerId of activeTimers.values()) {
        clearInterval(timerId);
    }
    activeTimers.clear();
}

function initializeTimers() {
    clearAllTimers();
    document.querySelectorAll('.timer-countdown').forEach(timer => {
        const folio = timer.dataset.folio;
        let inicio = timer.dataset.inicio;
        let estimado = timer.dataset.estimado;

        estimado = parseEstimadoToMinutes(estimado);
        if (!inicio || !estimado) return;

        // Si el formato es H:i, conviértelo a hoy
        let startTime;
        if (/^\d{2}:\d{2}$/.test(inicio)) {
            const [h, m] = inicio.split(':');
            startTime = new Date();
            startTime.setHours(parseInt(h), parseInt(m), 0, 0);
        } else {
            startTime = new Date(inicio);
        }
        const endTime = startTime.getTime() + (estimado * 60 * 1000);
        let alertShown = false;

        // --- NUEVO: variables para alertas cada minuto y para WhatsApp ---
        let lastMinuteAlert = null;
        let whatsappSent = false;

        function updateTimer() {
            const now = new Date().getTime();
            const timeLeft = endTime - now;

            let minutes, seconds;
            let isNegative = false;

            if (timeLeft < 4) {
                isNegative = true;
                const timePassed = Math.abs(timeLeft);
                minutes = Math.floor(timePassed / (1000 * 60));
                seconds = Math.floor((timePassed % (1000 * 60)) / 1000);

                // --- ALERTA CADA MINUTO DESPUÉS DE 0 ---
                if (minutes !== lastMinuteAlert) {
                    lastMinuteAlert = minutes;
                    if (document.visibilityState === 'visible') {
                        Swal.fire({
                            title: '¡Atención!',
                            text: `Se ha terminado el tiempo de atención para la OT ${folio}. Han pasado ${minutes} minuto(s) extra.`,
                            icon: 'error',
                            timer: 4000
                        });
                    }
                }
            } else {
                minutes = Math.floor(timeLeft / (1000 * 60));
                seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                if (timeLeft <= 300000 && !alertShown) {
                    alertShown = true;
                    if (document.visibilityState === 'visible') {
                        Swal.fire({
                            title: '¡Atención!',
                            text: `Quedan 5 minutos para la OT ${folio}`,
                            icon: 'warning',
                            timer: 5000
                        });
                    }
                }
            }

            const timeString = `${isNegative ? '-' : ''}${minutes}:${seconds.toString().padStart(2, '0')}`;

            // Cambiar color según el tiempo restante
            timer.classList.remove('text-green-600', 'text-orange-500', 'text-red-600');
            if (isNegative) {
                timer.classList.add('text-red-600');
            } else if (timeLeft <= estimado * 60 * 1000 * 0.25) {
                timer.classList.add('text-red-600');
            } else if (timeLeft <= estimado * 60 * 1000 * 0.5) {
                timer.classList.add('text-orange-500');
            } else {
                timer.classList.add('text-green-600');
            }

            timer.textContent = timeString;
        }

        const timerId = setInterval(updateTimer, 1000);
        activeTimers.set(folio, timerId);
        updateTimer();
    });

    // --- TIMER BAHIA ---
    document.querySelectorAll('.bahia-timer-container').forEach(container => {
        const folio = container.dataset.folio;
        const timerBahia = container.querySelector('.timer-bahia');
        const t = window.bahiaTimers[folio];
        if (t && (t.running || t.elapsed > 0)) {
            container.style.display = '';

            function updateBahia() {
                let diff = getBahiaElapsed(folio);
                const h = Math.floor(diff / 3600);
                const m = Math.floor((diff % 3600) / 60);
                const s = diff % 60;
                timerBahia.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            }
            updateBahia();
            const timerId = setInterval(updateBahia, 1000);
            activeTimers.set(`bahia_${folio}`, timerId);
        } else {
            container.style.display = 'none';
        }
    });
}

// --- RENDER Y FILTRO PRINCIPAL ---
async function renderAndFilterOTs(data) {
    otMap.clear();
    // --- FILTRAR OTs CANCELADAS DESDE EL INICIO ---
    data = data.filter(ot => ot.Status !== "CANCELADO" && ot.Status !== "FINALIZADO");
    data.forEach(ot => otMap.set(ot.Folio, ot));

    const searchElem = document.getElementById('search-ot');
    const search = searchElem && searchElem.value ? searchElem.value.toLowerCase() : '';
    const filterElem = document.getElementById('filter-status');
    const status = filterElem && filterElem.value ? filterElem.value : '';
    let filtered = data.slice(); // copia

    // --- Orden personalizado de status ---
    const statusOrder = ['AUTONOMO', 'ASIGNADO', 'PROCESO', 'PENDIENTE', 'ATENDIDO'];
    filtered.sort((a, b) => {
        const idxA = statusOrder.indexOf(a.Status);
        const idxB = statusOrder.indexOf(b.Status);
        // Si no está en la lista, lo manda al final
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    // Filtros
    if (search) {
        filtered = filtered.filter(ot =>
            (ot.Folio && ot.Folio.toLowerCase().includes(search)) ||
            (ot.Modulo && ot.Modulo.toLowerCase().includes(search)) ||
            (ot.Mecanico && ot.Mecanico.toLowerCase().includes(search)) ||
            (ot.Supervisor && ot.Supervisor.toLowerCase().includes(search)) ||
            (ot.Maquina && ot.Maquina.toLowerCase().includes(search)) ||
            (ot.Problema && ot.Problema.toLowerCase().includes(search))
        );
    }
    if (status) {
        filtered = filtered.filter(ot => ot.Status === status);
    }

    // --- ESPERAR a que TODOS los datos de seguimiento estén cargados antes de renderizar ---
    const procesos = filtered.filter(ot => ot.Status === 'PROCESO');
    const fetchPromises = procesos.map(ot => fetchAndStoreFollowAtention(ot.Folio));
    await Promise.all(fetchPromises);

    // Contadores
    const counts = {};
    STATUS_LIST.forEach(st => counts[st] = 0);
    counts.total = data.filter(ot => ot.Status !== "FINALIZADO" && ot.Status !== "CANCELADO").length;
    data.forEach(ot => {
        if (counts[ot.Status] !== undefined) counts[ot.Status]++;
    });

    // Actualizar resumen
    if (document.getElementById("ot-pendientes")) document.getElementById("ot-pendientes").textContent = counts.PENDIENTE;
    if (document.getElementById("ot-asignadas")) document.getElementById("ot-asignadas").textContent = counts.ASIGNADO;
    if (document.getElementById("ot-proceso")) document.getElementById("ot-proceso").textContent = counts.PROCESO;
    if (document.getElementById("ot-atendidas")) document.getElementById("ot-atendidas").textContent = counts.ATENDIDO;
    if (document.getElementById("ot-autonomas")) document.getElementById("ot-autonomas").textContent = counts.AUTONOMO;
    if (document.getElementById("ot-total")) document.getElementById("ot-total").textContent = counts.total;

    // Render cards (ya ordenadas)
    const cont = document.getElementById('seguimiento-ot-container');
    cont.innerHTML = filtered.length ?
        filtered.map(renderOTCard).join('') :
        `<div class="col-span-full text-center text-gray-400 py-8">No hay OTs para mostrar.</div>`;

    // Inicializa los temporizadores después de renderizar
    initializeTimers();
}

// --- CARGA DE OTs ---
function cargarSeguimientoOTs(modulo) {
    return fetch('/cardsAteOTs')
        .then(res => res.json())
        .then(data => {
            let filtered = data.filter(ot => ot.Modulo === modulo);
            return renderAndFilterOTs(filtered);
        });
}
window.cargarSeguimientoOTs = cargarSeguimientoOTs;

// --- EVENTOS Y LISTENERS ---
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Select2
    $('#modulo-select').select2({
        placeholder: "Selecciona tu módulo de atención",
        width: '100%'
    });

    // Cargar módulos
    axios.get('/obtener-modulos')
        .then(res => {
            const select = document.getElementById('modulo-select');
            res.data.forEach(mod => {
                let value = mod.Modulo || mod.moduleid || mod.MODULEID || mod.value || mod;
                let text = mod.Modulo || mod.moduleid || mod.MODULEID || mod.value || mod;
                if (value && text) {
                    let option = document.createElement('option');
                    option.value = value;
                    option.textContent = text;
                    select.appendChild(option);
                }
            });
            $('#modulo-select').trigger('change');
        });

    // Al seleccionar módulo, cargar OTs y mostrar filtros/resumen
    $('#modulo-select').on('change', function() {
        const modulo = this.value;
        if (modulo) {
            document.getElementById('resumen-bar').classList.remove('hidden');
            document.getElementById('filtros-bar').classList.remove('hidden');
            cargarSeguimientoOTs(modulo);
        } else {
            document.getElementById('resumen-bar').classList.add('hidden');
            document.getElementById('filtros-bar').classList.add('hidden');
            document.getElementById('seguimiento-ot-container').innerHTML = '';
        }
    });

    // Filtros
    const searchInput = document.getElementById('search-ot');
    const filterSelect = document.getElementById('filter-status');

    function triggerIfModuloSelected() {
        const modulo = document.getElementById('modulo-select').value;
        if (modulo) cargarSeguimientoOTs(modulo);
    }
    if (searchInput) searchInput.addEventListener('input', triggerIfModuloSelected);
    if (filterSelect) filterSelect.addEventListener('change', triggerIfModuloSelected);

    // NUEVO: Selección automática de módulo por query param
    function getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Selección automática de módulo si viene en la URL
    const moduloParam = getQueryParam('modulo');
    if (moduloParam) {
        const select = document.getElementById('modulo-select');
        // Esperar a que se llenen las opciones
        const trySelectModulo = () => {
            const option = Array.from(select.options).find(opt => opt.value === moduloParam);
            if (option) {
                select.value = moduloParam;
                $('#modulo-select').trigger('change');
            } else {
                setTimeout(trySelectModulo, 100);
            }
        };
        trySelectModulo();
    }
});

// Delegación de eventos para el botón "Iniciar Atención"
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('iniciar-atencion-btn')) {
        const folio = e.target.getAttribute('data-folio');
        const maquina = e.target.getAttribute('data-maquina');
        // --- Mostrar modal spinner centrado ---
        let modalSpinner = document.createElement('div');
        modalSpinner.id = 'modal-iniciar-atencion-spinner';
        modalSpinner.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40';
        modalSpinner.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col items-center px-8 py-6">
                <svg aria-hidden="true" class="w-12 h-12 mb-3 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span class="text-lg font-semibold text-gray-700 dark:text-gray-100">Cargando...</span>
            </div>
        `;
        document.body.appendChild(modalSpinner);

        mostrarSelectorClase(folio, maquina).finally(() => {
            // Remover modal spinner después de terminar
            if (modalSpinner && modalSpinner.parentNode) modalSpinner.parentNode.removeChild(modalSpinner);
        });
    }
});

// Función para mostrar el selector de clase
async function mostrarSelectorClase(folio, maquina) {
    try {
        const response = await fetch(`/api/clases-maquina/${encodeURIComponent(maquina)}`, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) throw new TypeError("La respuesta no es JSON!");
        const data = await response.json();
        // data: { clases: [...], numeroMaquina: [...] }
        const clases = data.clases || [];
        const numeroMaquina = data.numeroMaquina || [];

        const { value: formValues } = await Swal.fire({
                    title: 'Seleccionar Clase y Número de Máquina',
                    html: `
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Clase de Máquina:</label>
                <select id="clase-select" class="swal2-select" style="width: 100%">
                    <option></option>
                    ${clases.map(c => `
                        <option value="${c.class}" data-tiempo="${c.TimeEstimado}">
                            ${c.class} (${c.TimeEstimado} min)
                        </option>
                    `).join('')}
                </select>
                <label class="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">Número de Máquina:</label>
                <select id="numero-maquina-select" class="swal2-select" style="width: 100%">
                    <option></option>
                    ${numeroMaquina.map(nm => `
                        <option value="${nm.Remplacad}">
                            ${nm.Remplacad}
                        </option>
                    `).join('')}
                </select>
            `,
            didOpen: () => {
                $('#clase-select').select2({
                    dropdownParent: $('.swal2-container'),
                    placeholder: 'Selecciona una clase',
                    width: '100%'
                });
                $('#numero-maquina-select').select2({
                    dropdownParent: $('.swal2-container'),
                    placeholder: 'Selecciona el número de máquina',
                    width: '100%'
                });
            },
            preConfirm: () => {
                const claseSelect = document.getElementById('clase-select');
                const claseOption = claseSelect.options[claseSelect.selectedIndex];
                const numeroMaquinaSelect = document.getElementById('numero-maquina-select');
                if (!claseSelect.value) {
                    Swal.showValidationMessage('Debes seleccionar una clase');
                    return false;
                }
                if (!numeroMaquinaSelect.value) {
                    Swal.showValidationMessage('Debes seleccionar el número de máquina');
                    return false;
                }
                return {
                    clase: claseSelect.value,
                    tiempo_estimado: claseOption.dataset.tiempo,
                    numero_maquina: numeroMaquinaSelect.value
                };
            }
        });

        if (formValues) {
            // Si necesitas enviar el número de máquina al backend, pásalo aquí
            await iniciarAtencion(folio, formValues.clase, formValues.tiempo_estimado , formValues.numero_maquina);
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudieron cargar las clases de máquina', 'error');
    }
}

// Función para iniciar la atención
async function iniciarAtencion(folio, clase, tiempo_estimado, numero_maquina) {
    try {
        const timeInicio = new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const response = await fetch('/api/iniciar-atencion', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                folio,
                clase,
                numero_maquina,
                tiempo_estimado,
                time_inicio: timeInicio
            })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) throw new TypeError("La respuesta no es JSON!");
        const data = await response.json();

        if (data.success) {
            await fetch('/broadcast-status-ot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    id: data.ot.id,
                    status: 'PROCESO'
                })
            });

            // Esperar a que el usuario cierre el SweetAlert antes de recargar las OTs
            await Swal.fire('¡Éxito!', 'Atención iniciada correctamente', 'success');
            const modulo = document.getElementById('modulo-select').value;
            if (modulo) await cargarSeguimientoOTs(modulo);
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudo iniciar la atención', 'error');
    }
}
// Solicitar permisos para notificaciones y configurar visibilitychange
if (Notification.permission === "default") {
    Notification.requestPermission();
}

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        const modulo = document.getElementById('modulo-select').value;
        if (modulo) cargarSeguimientoOTs(modulo);
    }
});

// Escucha el evento de Echo para actualizar en tiempo real y mostrar el temporizador inmediatamente
window.Echo.channel("asignaciones-ot")
    .listen("AsignacionOTCreated", (e) => {
        // --- NO ACTUALIZAR SI LA OT ES CANCELADA ---
        if (e && e.Status === "CANCELADO") return;
        const modulo = document.getElementById('modulo-select')?.value;
        if (modulo) cargarSeguimientoOTs(modulo);
    })
    .listen("AsignacionOTReasignada", (e) => {
        if (e && e.Status === "CANCELADO") return;
        const modulo = document.getElementById('modulo-select')?.value;
        if (modulo) cargarSeguimientoOTs(modulo);
    })
    .listen("StatusOTUpdated", (e) => {
        if (e && e.Status === "CANCELADO") return;
        const modulo = document.getElementById('modulo-select')?.value;
        if (modulo) cargarSeguimientoOTs(modulo);
    })
    .listen("ComidaBreakLimpiado", (e) => {
        const modulo = document.getElementById('modulo-select')?.value;
        if (modulo) cargarSeguimientoOTs(modulo);
    });