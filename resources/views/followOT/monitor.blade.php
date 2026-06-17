<x-guest-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-6 w-full max-w-7xl mx-auto">
        <div class="sm:flex sm:justify-between sm:items-center mb-6 gap-4">
            <div>
                <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                    Monitor operativo de atenciones
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Tickets asignados a mecanicos durante el dia actual.
                </p>
            </div>
            <div class="mt-4 sm:mt-0 text-sm text-gray-500 dark:text-gray-400">
                <span>Actualizado: </span>
                <span id="monitor-last-update" class="font-semibold text-gray-700 dark:text-gray-200">--</span>
            </div>
        </div>

        <div id="monitor-error" class="hidden mb-4 rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm"></div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <section class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100">Tickets en atencion</h2>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Ordenados por mayor tiempo activo</p>
                    </div>
                    <span id="count-en-atencion" class="text-sm font-bold bg-yellow-100 text-yellow-800 rounded-full px-3 py-1">0</span>
                </div>
                <div id="tickets-en-atencion" class="space-y-4">
                    <p class="text-center text-gray-500 py-8">Cargando...</p>
                </div>
            </section>

            <section class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100">Asignados sin iniciar</h2>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Ordenados por mayor tiempo de espera</p>
                    </div>
                    <span id="count-sin-iniciar" class="text-sm font-bold bg-blue-100 text-blue-800 rounded-full px-3 py-1">0</span>
                </div>
                <div id="tickets-sin-iniciar" class="space-y-4">
                    <p class="text-center text-gray-500 py-8">Cargando...</p>
                </div>
            </section>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const endpoint = @json(route('FollowOTV2.monitor.data'));
            const refreshMs = 30000;
            const containers = {
                enAtencion: document.getElementById('tickets-en-atencion'),
                sinIniciar: document.getElementById('tickets-sin-iniciar'),
                countEnAtencion: document.getElementById('count-en-atencion'),
                countSinIniciar: document.getElementById('count-sin-iniciar'),
                lastUpdate: document.getElementById('monitor-last-update'),
                error: document.getElementById('monitor-error'),
            };

            const severityClasses = {
                rojo: {
                    card: 'border-red-700 bg-red-100 ring-1 ring-red-200 dark:border-red-400 dark:bg-red-950/50 dark:ring-red-800/60',
                    badge: 'bg-red-700 text-white dark:bg-red-500 dark:text-white',
                    dot: 'bg-red-700 dark:bg-red-400',
                },
                naranja: {
                    card: 'border-orange-600 bg-orange-100 dark:border-orange-400 dark:bg-orange-950/40',
                    badge: 'bg-orange-500 text-white dark:bg-orange-500 dark:text-white',
                    dot: 'bg-orange-600 dark:bg-orange-400',
                },
                amarillo: {
                    card: 'border-yellow-500 bg-yellow-50 dark:border-yellow-400 dark:bg-yellow-950/30',
                    badge: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-400 dark:text-yellow-950',
                    dot: 'bg-yellow-500 dark:bg-yellow-300',
                },
                verde: {
                    card: 'border-green-500 bg-green-50 dark:bg-green-950/30',
                    badge: 'bg-green-100 text-green-800',
                    dot: 'bg-green-500',
                },
            };

            function escapeHtml(value) {
                return String(value ?? 'N/A')
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            }

            function renderBahia(ticket) {
                const bahia = ticket.tiempo_bahia || {};

                if (!bahia.registrado) {
                    return '';
                }

                const label = bahia.activo ? 'Bahia activa' : 'Bahia registrada';
                const classes = bahia.activo
                    ? 'bg-violet-100 text-violet-800'
                    : 'bg-gray-100 text-gray-700';

                return `
                    <span class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${classes}">
                        ${label}: ${escapeHtml(bahia.total_formateado)}
                    </span>
                `;
            }

            function renderTicket(ticket, tipo) {
                const severity = severityClasses[ticket.severidad] || severityClasses.verde;
                const timeLabel = tipo === 'atencion' ? 'En atencion' : 'Sin iniciar';
                const accordionId = `ticket-monitor-${tipo}-${ticket.id}`;
                const fechaAsignacion = ticket.fecha_asignacion
                    ? `Asignado: ${escapeHtml(ticket.fecha_asignacion)}`
                    : 'Asignado: N/A';
                const fechaInicio = ticket.fecha_inicio_atencion
                    ? `Inicio: ${escapeHtml(ticket.fecha_inicio_atencion)}`
                    : 'Inicio: N/A';

                return `
                    <article class="monitor-ticket border-l-4 ${severity.card} rounded-lg shadow-sm overflow-hidden">
                        <button type="button"
                            class="monitor-ticket-toggle w-full text-left px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            data-target="${accordionId}"
                            aria-expanded="false"
                            aria-controls="${accordionId}">
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <span class="w-2.5 h-2.5 rounded-full ${severity.dot} shrink-0"></span>
                                        <p class="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                            ${escapeHtml(ticket.mecanico)}
                                        </p>
                                    </div>
                                    <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                        <span class="font-bold text-gray-800 dark:text-gray-200">${escapeHtml(ticket.folio)}</span>
                                        <span>${fechaAsignacion}</span>
                                        <span>${fechaInicio}</span>
                                    </div>
                                </div>
                                <div class="text-right shrink-0">
                                    <span class="inline-flex rounded-full px-3 py-1 text-sm font-bold ${severity.badge}">
                                        ${escapeHtml(ticket.tiempo_transcurrido_formateado)}
                                    </span>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${timeLabel}</p>
                                </div>
                            </div>
                        </button>

                        <div id="${accordionId}" class="monitor-ticket-details hidden border-t border-gray-200 dark:border-gray-700 px-4 pb-4 pt-3">
                            <div class="flex flex-wrap items-center gap-2 mb-3">
                                <span class="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">${escapeHtml(ticket.estado)}</span>
                                <span class="text-xs text-gray-500 dark:text-gray-400">Empleado: ${escapeHtml(ticket.numero_empleado)}</span>
                                ${renderBahia(ticket)}
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
                                <p><strong>Area/Modulo:</strong> ${escapeHtml(ticket.modulo || ticket.area)}</p>
                                <p><strong>Maquina:</strong> ${escapeHtml(ticket.maquina)}</p>
                                <p><strong>Planta:</strong> ${escapeHtml(ticket.planta)}</p>
                                <p><strong>Tipo:</strong> ${escapeHtml(ticket.tipo_falla)}</p>
                            </div>

                            <p class="text-xs text-gray-600 dark:text-gray-300 mt-3" title="${escapeHtml(ticket.descripcion)}">
                                ${escapeHtml(ticket.descripcion)}
                            </p>
                        </div>
                    </article>
                `;
            }

            function closeAllAccordions(exceptTarget = null) {
                document.querySelectorAll('.monitor-ticket-details').forEach(detail => {
                    if (detail.id !== exceptTarget) {
                        detail.classList.add('hidden');
                    }
                });

                document.querySelectorAll('.monitor-ticket-toggle').forEach(toggle => {
                    if (toggle.dataset.target !== exceptTarget) {
                        toggle.setAttribute('aria-expanded', 'false');
                    }
                });
            }

            function handleAccordionClick(event) {
                const toggle = event.target.closest('.monitor-ticket-toggle');

                if (!toggle) {
                    return;
                }

                const targetId = toggle.dataset.target;
                const detail = document.getElementById(targetId);

                if (!detail) {
                    return;
                }

                const willOpen = detail.classList.contains('hidden');
                closeAllAccordions(willOpen ? targetId : null);

                detail.classList.toggle('hidden', !willOpen);
                toggle.setAttribute('aria-expanded', String(willOpen));
            }

            function renderList(container, tickets, tipo, emptyText) {
                if (!tickets.length) {
                    container.innerHTML = `<p class="text-center text-gray-500 py-8">${emptyText}</p>`;
                    return;
                }

                container.innerHTML = tickets.map(ticket => renderTicket(ticket, tipo)).join('');
            }

            async function loadMonitorData() {
                try {
                    const response = await fetch(endpoint, { headers: { 'Accept': 'application/json' } });
                    const data = await response.json();

                    if (!response.ok || !data.success) {
                        throw new Error(data.message || 'No se pudieron cargar los datos del monitor.');
                    }

                    containers.error.classList.add('hidden');
                    containers.lastUpdate.textContent = data.actualizado_en || new Date().toLocaleString();
                    containers.countEnAtencion.textContent = data.tickets_en_atencion.length;
                    containers.countSinIniciar.textContent = data.tickets_sin_iniciar.length;

                    renderList(containers.enAtencion, data.tickets_en_atencion, 'atencion', 'No hay tickets en atencion.');
                    renderList(containers.sinIniciar, data.tickets_sin_iniciar, 'asignado', 'No hay tickets asignados sin iniciar.');
                } catch (error) {
                    containers.error.textContent = error.message;
                    containers.error.classList.remove('hidden');
                }
            }

            loadMonitorData();
            containers.enAtencion.addEventListener('click', handleAccordionClick);
            containers.sinIniciar.addEventListener('click', handleAccordionClick);
            setInterval(loadMonitorData, refreshMs);
        });
    </script>
</x-guest-layout>
