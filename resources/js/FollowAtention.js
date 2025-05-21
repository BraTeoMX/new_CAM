import Echo from "laravel-echo";
import Pusher from "pusher-js";

// --- VARIABLES GLOBALES ---
const COLORS = {
    FINALIZADO: 'bg-blue-100 text-blue-800',
    ASIGNADO: 'bg-green-100 text-green-800',
    PROCESO: 'bg-yellow-100 text-yellow-800',
    PENDIENTE: 'bg-orange-100 text-orange-800',
    ATENDIDO: 'bg-red-100 text-red-800',
    AUTONOMO: 'bg-violet-200 text-violet-800',
    DEFAULT: 'bg-gray-100 text-gray-800'
};

const STATUS_LIST = [
    'PENDIENTE',
    'ASIGNADO',
    'PROCESO',
    'ATENDIDO',
    'AUTONOMO',
    'FINALIZADO'
];

const STATUS_LABELS = {
    PENDIENTE: 'Pendiente',
    ASIGNADO: 'Asignado',
    PROCESO: 'En Proceso',
    ATENDIDO: 'Atendida',
    AUTONOMO: 'Autónoma',
    FINALIZADO: 'Finalizada'
};

const activeTimers = new Map();
// Nuevo: almacena datos de seguimiento por folio
const followAtentionMap = new Map();

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

function formatDateTime(dateStr) {
    return dateStr ? new Date(dateStr).toLocaleString() : '';
}

// Obtener datos de FollowAtention por folio (AJAX GET) y guardar en el mapa global
async function fetchAndStoreFollowAtention(folio) {
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
            return data.data;
        }
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

// --- RENDERIZADO DE CARDS ---
// Ahora toma los datos de seguimiento del mapa global si existen
function renderOTCard(ot) {
    const statusColor = getStatusColor(ot.Status);
    let timerHtml = '';

    let followData = followAtentionMap.get(ot.Folio);

    // Si la OT está en PROCESO, intenta usar los datos de seguimiento reales
    if (ot.Status === 'PROCESO' && followData) {
        timerHtml = `
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold timer-countdown"
                     data-folio="${ot.Folio}"
                     data-inicio="${followData.TimeInicio || ''}"
                     data-estimado="${followData.TimeEstimado || ''}">
                </div>
                <div class="text-sm text-gray-500">
                    Tiempo estimado: ${followData.TimeEstimado || ''} minutos
                </div>
            </div>
        `;
    } else if (ot.Status === 'PROCESO') {
        // Si no hay datos aún, deja el temporizador vacío (se actualizará después)
        timerHtml = `
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold timer-countdown"
                     data-folio="${ot.Folio}"
                     data-inicio=""
                     data-estimado="">
                </div>
                <div class="text-sm text-gray-500">
                    Tiempo estimado: ... minutos
                </div>
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

    return `
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-5">
            <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 text-sm font-semibold rounded ${statusColor}">${ot.Status}</span>
                <span class="text-lg font-bold">Folio: ${ot.Folio}</span>
            </div>
            <div class="space-y-3">
                <p class="font-medium">${ot.Problema}</p>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>Módulo: <span class="font-semibold">${ot.Modulo}</span></div>
                    <div>Máquina: <span class="font-semibold">${ot.Maquina}</span></div>
                    <div>Mecánico: <span class="font-semibold">${ot.Mecanico}</span></div>
                    <div>Supervisor: <span class="font-semibold">${ot.Supervisor}</span></div>
                </div>
                <div class="text-xs text-gray-500 flex justify-between">
                    <span>Creada: ${formatDateTime(ot.created_at)}</span>
                    <span>Actualizada: ${formatDateTime(ot.updated_at)}</span>
                </div>
            </div>
            ${timerHtml}
            ${footer}
        </div>
    `;
}

// --- TEMPORIZADORES ---
function initializeTimers() {
    activeTimers.forEach(timerId => clearInterval(timerId));
    activeTimers.clear();

    document.querySelectorAll('.timer-countdown').forEach(timer => {
        const folio = timer.dataset.folio;
        let inicio = timer.dataset.inicio;
        let estimado = timer.dataset.estimado;

        // Si no hay datos, intenta obtenerlos del mapa global
        if ((!inicio || !estimado) && folio && followAtentionMap.has(folio)) {
            const followData = followAtentionMap.get(folio);
            inicio = followData.TimeInicio;
            estimado = followData.TimeEstimado;
            timer.dataset.inicio = inicio;
            timer.dataset.estimado = estimado;
        }

        estimado = parseInt(estimado);
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

        function updateTimer() {
            const now = new Date().getTime();
            const timeLeft = endTime - now;

            let minutes, seconds;
            let isNegative = false;

            if (timeLeft < 0) {
                isNegative = true;
                const timePassed = Math.abs(timeLeft);
                minutes = Math.floor(timePassed / (1000 * 60));
                seconds = Math.floor((timePassed % (1000 * 60)) / 1000);
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
            if (isNegative) {
                timer.classList.remove('text-green-600', 'text-orange-500');
                timer.classList.add('text-red-600');
            } else if (timeLeft <= estimado * 60 * 1000 * 0.25) {
                timer.classList.remove('text-green-600', 'text-orange-500');
                timer.classList.add('text-red-600');
            } else if (timeLeft <= estimado * 60 * 1000 * 0.5) {
                timer.classList.remove('text-green-600', 'text-red-600');
                timer.classList.add('text-orange-500');
            } else {
                timer.classList.remove('text-orange-500', 'text-red-600');
                timer.classList.add('text-green-600');
            }

            timer.textContent = timeString;
        }

        const timerId = setInterval(updateTimer, 1000);
        activeTimers.set(folio, timerId);
        updateTimer();
    });
}

// --- RENDER Y FILTRO PRINCIPAL ---
// Ahora espera a que todos los datos de seguimiento estén cargados antes de renderizar
async function renderAndFilterOTs(data) {
    const search = document.getElementById('search-ot')?.value?.toLowerCase() || '';
    const status = document.getElementById('filter-status')?.value || '';
    let filtered = data.filter(ot => ot.Status !== "FINALIZADO");

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

    // Cargar datos de seguimiento para todas las OTs en PROCESO
    const fetchPromises = filtered
        .filter(ot => ot.Status === 'PROCESO')
        .map(ot => followAtentionMap.has(ot.Folio) ? null : fetchAndStoreFollowAtention(ot.Folio));
    await Promise.all(fetchPromises);

    // Contadores
    const counts = {};
    STATUS_LIST.forEach(st => counts[st] = 0);
    counts.total = data.filter(ot => ot.Status !== "AUTONOMO").length;
    data.forEach(ot => {
        if (counts[ot.Status] !== undefined) counts[ot.Status]++;
    });

    // Actualizar resumen
    if (document.getElementById("ot-pendientes")) document.getElementById("ot-pendientes").textContent = counts.PENDIENTE;
    if (document.getElementById("ot-asignadas")) document.getElementById("ot-asignadas").textContent = counts.ASIGNADO;
    if (document.getElementById("ot-proceso")) document.getElementById("ot-proceso").textContent = counts.PROCESO;
    if (document.getElementById("ot-atendidas")) document.getElementById("ot-atendidas").textContent = counts.ATENDIDO;
    if (document.getElementById("ot-autonomas")) document.getElementById("ot-autonomas").textContent = counts.AUTONOMO;
    if (document.getElementById("ot-finalizadas")) document.getElementById("ot-finalizadas").textContent = counts.FINALIZADO;
    if (document.getElementById("ot-total")) document.getElementById("ot-total").textContent = counts.total;

    // Render cards
    const cont = document.getElementById('seguimiento-ot-container');
    cont.innerHTML = filtered.length ?
        filtered.map(renderOTCard).join('') :
        `<div class="col-span-full text-center text-gray-400 py-8">No hay OTs para mostrar.</div>`;

    // Siempre inicializa los temporizadores después de renderizar
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
});

// Delegación de eventos para el botón "Iniciar Atención"
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('iniciar-atencion-btn')) {
        const folio = e.target.getAttribute('data-folio');
        const maquina = e.target.getAttribute('data-maquina');
        mostrarSelectorClase(folio, maquina);
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
        const clases = await response.json();

        const { value: formValues } = await Swal.fire({
            title: 'Seleccionar Clase de Máquina',
            html: `
                <select id="clase-select" class="swal2-select" style="width: 100%">
                    <option></option>
                    ${clases.map(c => `
                        <option value="${c.class}"
                                data-tiempo="${c.TimeEstimado}">
                            ${c.class} (${c.TimeEstimado} min)
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
            },
            preConfirm: () => {
                const select = document.getElementById('clase-select');
                const selectedOption = select.options[select.selectedIndex];
                if (!select.value) {
                    Swal.showValidationMessage('Debes seleccionar una clase');
                    return false;
                }
                return {
                    clase: select.value,
                    tiempo_estimado: selectedOption.dataset.tiempo
                };
            }
        });

        if (formValues) {
            await iniciarAtencion(folio, formValues.clase, formValues.tiempo_estimado);
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudieron cargar las clases de máquina', 'error');
    }
}

// Función para iniciar la atención
async function iniciarAtencion(folio, clase, tiempo_estimado) {
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

// Obtener datos de FollowAtention por folio (AJAX GET)
async function getFollowAtentionData(folio) {
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
            return data.data; // Aquí tienes TimeEstimado, TimeInicio, etc.
        }
        return null;
    } catch (e) {
        console.error(e);
        return null;
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
        const modulo = document.getElementById('modulo-select')?.value;
        if (modulo) cargarSeguimientoOTs(modulo);
    })
    .listen("AsignacionOTReasignada", (e) => {
        const modulo = document.getElementById('modulo-select')?.value;
        if (modulo) cargarSeguimientoOTs(modulo);
    })
    .listen("StatusOTUpdated", (e) => {
        const modulo = document.getElementById('modulo-select')?.value;
        if (modulo) cargarSeguimientoOTs(modulo);
    });
