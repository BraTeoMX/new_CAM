<x-guest-layout>
    <div class="w-full px-4 py-5 sm:px-6 lg:px-8">
        <div class="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <div class="flex flex-wrap items-center gap-2">
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-3xl">
                        Monitor operativo de atenciones
                    </h1>
                    <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800">
                        <span class="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
                        En vivo
                    </span>
                </div>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Prioridades del día para iniciar, atender y concluir tickets asignados.
                </p>
            </div>

            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span class="h-2 w-2 rounded-full bg-slate-400"></span>
                <span>Actualizado:</span>
                <span id="monitor-last-update" class="font-semibold text-gray-800 dark:text-gray-200">--</span>
            </div>
        </div>

        <div id="monitor-error" class="mb-4 hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"></div>

        <section aria-label="Indicadores principales" class="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <article class="rounded-xl border border-red-200 bg-white p-4 shadow-sm dark:border-red-900/70 dark:bg-gray-800">
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <p class="text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400">Tickets rojos</p>
                        <p id="kpi-rojos" class="mt-1 text-3xl font-black text-gray-900 dark:text-white">0</p>
                    </div>
                    <span class="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-300">+40 min</span>
                </div>
                <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Requieren intervención inmediata</p>
            </article>

            <article class="rounded-xl border border-orange-200 bg-white p-4 shadow-sm dark:border-orange-900/70 dark:bg-gray-800">
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <p class="text-xs font-bold uppercase tracking-wide text-orange-600 dark:text-orange-400">Sin iniciar críticos</p>
                        <p id="kpi-sin-iniciar-criticos" class="mt-1 text-3xl font-black text-gray-900 dark:text-white">0</p>
                    </div>
                    <span class="rounded-lg bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300">Prioridad</span>
                </div>
                <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Tickets naranjas o rojos sin atención</p>
            </article>

            <article class="rounded-xl border border-amber-200 bg-white p-4 shadow-sm dark:border-amber-900/70 dark:bg-gray-800">
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">Mayor concentración</p>
                        <p id="kpi-mecanico" class="mt-2 truncate text-base font-black text-gray-900 dark:text-white">N/A</p>
                    </div>
                    <span id="kpi-mecanico-total" class="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">0 tickets</span>
                </div>
                <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Mecánico con más tickets en riesgo</p>
            </article>

            <article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-gray-800">
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Mayor demora</p>
                        <p id="kpi-mayor-folio" class="mt-2 truncate text-base font-black text-gray-900 dark:text-white">N/A</p>
                    </div>
                    <span id="kpi-mayor-tiempo" class="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">0m</span>
                </div>
                <p id="kpi-mayor-contexto" class="mt-2 truncate text-xs text-gray-500 dark:text-gray-400">Sin tickets activos</p>
            </article>
        </section>

        <section class="mb-4">
            <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h2 class="font-bold text-gray-900 dark:text-gray-100">Distribución del semáforo</h2>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Panorama general de los tickets activos</p>
                    </div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Total: <strong id="count-total" class="text-gray-900 dark:text-white">0</strong>
                    </p>
                </div>

                <div id="severity-bar" class="flex h-4 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700" aria-label="Distribución por severidad"></div>

                <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div class="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 dark:bg-green-950/30">
                        <span class="flex items-center gap-2 text-xs font-semibold text-green-800 dark:text-green-300">
                            <span class="h-2.5 w-2.5 rounded-full bg-green-500"></span>Verdes
                        </span>
                        <strong id="severity-verde" class="text-sm text-green-900 dark:text-green-200">0</strong>
                    </div>
                    <div class="flex items-center justify-between rounded-lg bg-yellow-50 px-3 py-2 dark:bg-yellow-950/30">
                        <span class="flex items-center gap-2 text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                            <span class="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>Amarillos
                        </span>
                        <strong id="severity-amarillo" class="text-sm text-yellow-900 dark:text-yellow-200">0</strong>
                    </div>
                    <div class="flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2 dark:bg-orange-950/30">
                        <span class="flex items-center gap-2 text-xs font-semibold text-orange-800 dark:text-orange-300">
                            <span class="h-2.5 w-2.5 rounded-full bg-orange-500"></span>Naranjas
                        </span>
                        <strong id="severity-naranja" class="text-sm text-orange-900 dark:text-orange-200">0</strong>
                    </div>
                    <div class="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950/30">
                        <span class="flex items-center gap-2 text-xs font-semibold text-red-800 dark:text-red-300">
                            <span class="h-2.5 w-2.5 rounded-full bg-red-600"></span>Rojos
                        </span>
                        <strong id="severity-rojo" class="text-sm text-red-900 dark:text-red-200">0</strong>
                    </div>
                </div>

                <div class="mt-3 grid grid-cols-1 gap-2 border-t border-gray-100 pt-3 sm:grid-cols-3 dark:border-gray-700">
                    <div class="rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-700">
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">En atención</span>
                            <strong id="summary-en-atencion" class="text-sm text-gray-900 dark:text-white">0</strong>
                        </div>
                        <p id="summary-en-atencion-risk" class="mt-1 text-[10px] text-gray-500 dark:text-gray-400">0 en riesgo</p>
                    </div>
                    <div class="rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-700">
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">Sin iniciar</span>
                            <strong id="summary-sin-iniciar" class="text-sm text-gray-900 dark:text-white">0</strong>
                        </div>
                        <p id="summary-sin-iniciar-risk" class="mt-1 text-[10px] text-gray-500 dark:text-gray-400">0 en riesgo</p>
                    </div>
                    <div class="rounded-lg border border-green-100 bg-green-50/50 px-3 py-2 dark:border-green-900 dark:bg-green-950/20">
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-xs font-semibold text-green-700 dark:text-green-300">Cumplimiento verde</span>
                            <strong id="summary-green-rate" class="text-sm text-green-800 dark:text-green-200">0%</strong>
                        </div>
                        <p class="mt-1 text-[10px] text-green-700/70 dark:text-green-400">Tickets dentro del primer umbral</p>
                    </div>
                </div>
            </article>
        </section>

        <section class="mb-4">
            <div class="mb-2">
                <h2 class="font-bold text-gray-900 dark:text-gray-100">Foco operativo</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                    Top 3 de concentraciones para dirigir la atención del área.
                </p>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div class="mb-3 flex items-center justify-between gap-2">
                        <div>
                            <h3 class="font-bold text-gray-900 dark:text-gray-100">Por mecánico</h3>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Tickets naranjas o rojos asignados</p>
                        </div>
                        <span class="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700 dark:bg-red-950 dark:text-red-300">Riesgo</span>
                    </div>
                    <div id="focus-mechanics" class="space-y-1.5">
                        <p class="py-3 text-center text-sm text-gray-500">Cargando...</p>
                    </div>
                </article>

                <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div class="mb-3 flex items-center justify-between gap-2">
                        <div>
                            <h3 class="font-bold text-gray-900 dark:text-gray-100">Por módulo</h3>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Áreas con mayor concentración en riesgo</p>
                        </div>
                        <span class="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:bg-blue-950 dark:text-blue-300">Área</span>
                    </div>
                    <div id="focus-modules" class="space-y-1.5">
                        <p class="py-3 text-center text-sm text-gray-500">Cargando...</p>
                    </div>
                </article>

                <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:col-span-2 xl:col-span-1">
                    <div class="mb-3 flex items-center justify-between gap-2">
                        <div>
                            <h3 class="font-bold text-gray-900 dark:text-gray-100">Por máquina</h3>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Equipos con más tickets activos</p>
                        </div>
                        <span class="rounded-lg bg-violet-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700 dark:bg-violet-950 dark:text-violet-300">Equipo</span>
                    </div>
                    <div id="focus-machines" class="space-y-1.5">
                        <p class="py-3 text-center text-sm text-gray-500">Cargando...</p>
                    </div>
                </article>
            </div>
        </section>

        <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <section class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div class="mb-3 flex items-center justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-700">
                    <div>
                        <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Deben concluir o actualizar</h2>
                        <p class="text-xs text-gray-500 dark:text-gray-400">En atención, ordenados por mayor tiempo activo</p>
                    </div>
                    <span id="count-en-atencion" class="rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">0</span>
                </div>
                <div id="tickets-en-atencion" class="space-y-2">
                    <p class="py-8 text-center text-gray-500">Cargando...</p>
                </div>
            </section>

            <section class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div class="mb-3 flex items-center justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-700">
                    <div>
                        <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Deben iniciar atención</h2>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Asignados, ordenados por mayor tiempo de espera</p>
                    </div>
                    <span id="count-sin-iniciar" class="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">0</span>
                </div>
                <div id="tickets-sin-iniciar" class="space-y-2">
                    <p class="py-8 text-center text-gray-500">Cargando...</p>
                </div>
            </section>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const endpoint = @json(route('FollowOTV2.monitor.data'));
            const refreshMs = 30000;
            let openAccordionId = null;

            const containers = {
                enAtencion: document.getElementById('tickets-en-atencion'),
                sinIniciar: document.getElementById('tickets-sin-iniciar'),
                countEnAtencion: document.getElementById('count-en-atencion'),
                countSinIniciar: document.getElementById('count-sin-iniciar'),
                countTotal: document.getElementById('count-total'),
                lastUpdate: document.getElementById('monitor-last-update'),
                error: document.getElementById('monitor-error'),
                severityBar: document.getElementById('severity-bar'),
                focusMechanics: document.getElementById('focus-mechanics'),
                focusModules: document.getElementById('focus-modules'),
                focusMachines: document.getElementById('focus-machines'),
                summaryEnAtencion: document.getElementById('summary-en-atencion'),
                summaryEnAtencionRisk: document.getElementById('summary-en-atencion-risk'),
                summarySinIniciar: document.getElementById('summary-sin-iniciar'),
                summarySinIniciarRisk: document.getElementById('summary-sin-iniciar-risk'),
                summaryGreenRate: document.getElementById('summary-green-rate'),
                kpiRojos: document.getElementById('kpi-rojos'),
                kpiSinIniciarCriticos: document.getElementById('kpi-sin-iniciar-criticos'),
                kpiMecanico: document.getElementById('kpi-mecanico'),
                kpiMecanicoTotal: document.getElementById('kpi-mecanico-total'),
                kpiMayorFolio: document.getElementById('kpi-mayor-folio'),
                kpiMayorTiempo: document.getElementById('kpi-mayor-tiempo'),
                kpiMayorContexto: document.getElementById('kpi-mayor-contexto'),
            };

            const severityClasses = {
                rojo: {
                    card: 'border-red-300 bg-red-50/70 dark:border-red-800 dark:bg-red-950/30',
                    badge: 'bg-red-700 text-white dark:bg-red-600',
                    dot: 'bg-red-600',
                    label: 'Crítico',
                },
                naranja: {
                    card: 'border-orange-300 bg-orange-50/70 dark:border-orange-800 dark:bg-orange-950/30',
                    badge: 'bg-orange-500 text-white',
                    dot: 'bg-orange-500',
                    label: 'Atención',
                },
                amarillo: {
                    card: 'border-yellow-300 bg-yellow-50/60 dark:border-yellow-800 dark:bg-yellow-950/20',
                    badge: 'bg-yellow-200 text-yellow-950 dark:bg-yellow-500 dark:text-yellow-950',
                    dot: 'bg-yellow-400',
                    label: 'Preventivo',
                },
                verde: {
                    card: 'border-green-200 bg-white dark:border-green-900 dark:bg-gray-800',
                    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                    dot: 'bg-green-500',
                    label: 'En tiempo',
                },
            };

            const severityOrder = { rojo: 4, naranja: 3, amarillo: 2, verde: 1 };

            function escapeHtml(value) {
                return String(value ?? 'N/A')
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            }

            function normalizedValue(value) {
                return value === null || value === undefined || value === '' ? 'N/A' : value;
            }

            function renderBahia(ticket) {
                const bahia = ticket.tiempo_bahia || {};

                if (!bahia.registrado) {
                    return '';
                }

                const classes = bahia.activo
                    ? 'bg-violet-600 text-white'
                    : 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200';
                const label = bahia.activo ? 'Bahía activa' : 'Tiempo en bahía';
                const motivo = bahia.activo && bahia.motivo_activo && bahia.motivo_activo !== 'N/A'
                    ? ` · ${escapeHtml(bahia.motivo_activo)}`
                    : '';

                return `
                    <span class="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-bold ${classes}">
                        ${label}: ${escapeHtml(bahia.total_formateado)}${motivo}
                    </span>
                `;
            }

            function detailItem(label, value) {
                return `
                    <div class="rounded-lg bg-white/70 px-3 py-2 dark:bg-gray-900/40">
                        <dt class="text-[10px] font-bold uppercase tracking-wide text-gray-400">${escapeHtml(label)}</dt>
                        <dd class="mt-0.5 text-xs font-medium text-gray-700 dark:text-gray-200">${escapeHtml(normalizedValue(value))}</dd>
                    </div>
                `;
            }

            function renderTicket(ticket, tipo) {
                const severity = severityClasses[ticket.severidad] || severityClasses.verde;
                const timeLabel = tipo === 'atencion' ? 'En atención' : 'Sin iniciar';
                const accordionId = `ticket-monitor-${tipo}-${ticket.id}`;
                const isOpen = openAccordionId === accordionId;
                const moduleName = normalizedValue(ticket.modulo || ticket.area);
                const machineName = normalizedValue(ticket.maquina);

                return `
                    <article class="monitor-ticket overflow-hidden rounded-lg border-l-4 border-y border-r ${severity.card}">
                        <button type="button"
                            class="monitor-ticket-toggle w-full px-3 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400"
                            data-target="${accordionId}"
                            aria-expanded="${isOpen}"
                            aria-controls="${accordionId}">
                            <div class="flex items-center gap-3">
                                <span class="h-2.5 w-2.5 shrink-0 rounded-full ${severity.dot}"></span>

                                <div class="min-w-0 flex-1">
                                    <div class="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                        <p class="truncate text-sm font-black text-gray-900 dark:text-gray-100">
                                            ${escapeHtml(moduleName)}
                                        </p>
                                        <span class="hidden text-gray-300 sm:inline">·</span>
                                        <p class="truncate text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            ${escapeHtml(ticket.mecanico)}
                                        </p>
                                    </div>
                                    <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                                        <span class="font-bold text-gray-800 dark:text-gray-200">${escapeHtml(ticket.folio)}</span>
                                        <span>Máquina: ${escapeHtml(machineName)}</span>
                                        <span class="hidden sm:inline">${escapeHtml(normalizedValue(ticket.tipo_falla))}</span>
                                        ${renderBahia(ticket)}
                                    </div>
                                </div>

                                <div class="shrink-0 text-right">
                                    <span class="inline-flex min-w-[70px] justify-center rounded-md px-2.5 py-1 text-sm font-black ${severity.badge}">
                                        ${escapeHtml(ticket.tiempo_transcurrido_formateado)}
                                    </span>
                                    <p class="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        ${timeLabel}
                                    </p>
                                </div>

                                <svg class="monitor-chevron h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </button>

                        <div id="${accordionId}" class="monitor-ticket-details ${isOpen ? '' : 'hidden'} border-t border-gray-200/80 px-3 pb-3 pt-2.5 dark:border-gray-700">
                            <div class="mb-2 flex flex-wrap items-center gap-2">
                                <span class="rounded-full bg-gray-900 px-2 py-1 text-[11px] font-bold text-white dark:bg-gray-100 dark:text-gray-900">
                                    ${escapeHtml(severity.label)}
                                </span>
                                <span class="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                    ${escapeHtml(ticket.estado)}
                                </span>
                                <span class="text-[11px] text-gray-500 dark:text-gray-400">
                                    Empleado: ${escapeHtml(ticket.numero_empleado)}
                                </span>
                            </div>

                            <dl class="grid grid-cols-2 gap-2 lg:grid-cols-4">
                                ${detailItem('Planta', ticket.planta)}
                                ${detailItem('Supervisor', ticket.supervisor)}
                                ${detailItem('Asignación', ticket.fecha_asignacion)}
                                ${detailItem('Inicio', ticket.fecha_inicio_atencion)}
                                ${detailItem('Clase de máquina', ticket.clase_maquina)}
                                ${detailItem('No. de máquina', ticket.numero_maquina)}
                                ${detailItem('Tiempo estimado', ticket.tiempo_estimado_formateado)}
                                ${detailItem('Tiempo de bahía', ticket.tiempo_bahia?.registrado ? ticket.tiempo_bahia.total_formateado : 'N/A')}
                            </dl>

                            <div class="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
                                <div class="rounded-lg bg-white/70 px-3 py-2 text-xs text-gray-700 dark:bg-gray-900/40 dark:text-gray-200">
                                    <p><strong>Problema reportado:</strong> ${escapeHtml(normalizedValue(ticket.descripcion))}</p>
                                    <p class="mt-1"><strong>Falla:</strong> ${escapeHtml(normalizedValue(ticket.falla))}</p>
                                    <p class="mt-1"><strong>Causa:</strong> ${escapeHtml(normalizedValue(ticket.causa))}</p>
                                </div>
                                <div class="rounded-lg bg-white/70 px-3 py-2 text-xs text-gray-700 dark:bg-gray-900/40 dark:text-gray-200">
                                    <p><strong>Acción correctiva:</strong> ${escapeHtml(normalizedValue(ticket.accion_correctiva))}</p>
                                    <p class="mt-1"><strong>Comentarios:</strong> ${escapeHtml(normalizedValue(ticket.comentarios))}</p>
                                    <p class="mt-1"><strong>Creación:</strong> ${escapeHtml(normalizedValue(ticket.fecha_creacion))}</p>
                                </div>
                            </div>
                        </div>
                    </article>
                `;
            }

            function calculateSummary(tickets) {
                const summary = { verde: 0, amarillo: 0, naranja: 0, rojo: 0 };

                tickets.forEach(ticket => {
                    if (Object.prototype.hasOwnProperty.call(summary, ticket.severidad)) {
                        summary[ticket.severidad]++;
                    }
                });

                return summary;
            }

            function groupTickets(tickets, field) {
                const groups = new Map();

                tickets.forEach(ticket => {
                    const name = normalizedValue(ticket[field]);
                    const current = groups.get(name) || {
                        name,
                        total: 0,
                        red: 0,
                        orange: 0,
                        maxMinutes: 0,
                    };

                    current.total++;
                    current.red += ticket.severidad === 'rojo' ? 1 : 0;
                    current.orange += ticket.severidad === 'naranja' ? 1 : 0;
                    current.maxMinutes = Math.max(current.maxMinutes, Number(ticket.tiempo_transcurrido_minutos) || 0);
                    groups.set(name, current);
                });

                return [...groups.values()].sort((a, b) =>
                    b.red - a.red ||
                    b.orange - a.orange ||
                    b.maxMinutes - a.maxMinutes ||
                    b.total - a.total
                );
            }

            function renderSeveritySummary(summary) {
                const total = Object.values(summary).reduce((sum, value) => sum + value, 0);
                const colors = {
                    verde: 'bg-green-500',
                    amarillo: 'bg-yellow-400',
                    naranja: 'bg-orange-500',
                    rojo: 'bg-red-600',
                };

                containers.countTotal.textContent = total;

                Object.entries(summary).forEach(([severity, count]) => {
                    const counter = document.getElementById(`severity-${severity}`);
                    const percentage = total > 0 ? (count / total) * 100 : 0;

                    counter.textContent = count;
                    if (count > 0) {
                        const segment = document.createElement('div');
                        segment.className = `${colors[severity]} h-full transition-all duration-500`;
                        segment.style.width = `${percentage}%`;
                        segment.title = `${severity}: ${count} (${percentage.toFixed(0)}%)`;
                        containers.severityBar.appendChild(segment);
                    }
                });

                if (total === 0) {
                    containers.severityBar.innerHTML = '<div class="h-full w-full bg-gray-200 dark:bg-gray-700"></div>';
                }
            }

            function renderRanking(container, groups, options = {}) {
                const {
                    emptyTitle = 'Sin datos para clasificar',
                    emptyText = 'No hay registros disponibles.',
                    countLabel = 'tickets',
                    showSeverity = true,
                } = options;

                if (!groups.length) {
                    container.innerHTML = `
                        <div class="rounded-lg bg-green-50 px-3 py-4 text-center dark:bg-green-950/30">
                            <p class="text-sm font-bold text-green-800 dark:text-green-300">${emptyTitle}</p>
                            <p class="mt-1 text-xs text-green-700 dark:text-green-400">${emptyText}</p>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = groups.map((group, index) => `
                    <div class="flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-2 dark:bg-gray-900/40">
                        <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${index === 0 ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'} text-xs font-black">
                            ${index + 1}
                        </span>
                        <div class="min-w-0 flex-1">
                            <p class="truncate text-xs font-bold text-gray-800 dark:text-gray-100" title="${escapeHtml(group.name)}">
                                ${escapeHtml(group.name)}
                            </p>
                            <p class="text-[10px] text-gray-500 dark:text-gray-400">
                                ${group.total} ${countLabel} · Máximo ${group.maxMinutes} min
                            </p>
                        </div>
                        ${showSeverity ? `
                            <div class="flex shrink-0 gap-1 text-[10px] font-bold">
                                ${group.red ? `<span class="rounded bg-red-100 px-1.5 py-0.5 text-red-700 dark:bg-red-950 dark:text-red-300">${group.red} R</span>` : ''}
                                ${group.orange ? `<span class="rounded bg-orange-100 px-1.5 py-0.5 text-orange-700 dark:bg-orange-950 dark:text-orange-300">${group.orange} N</span>` : ''}
                            </div>
                        ` : ''}
                    </div>
                `).join('');
            }

            function renderOperationalFocus(tickets) {
                const riskyTickets = tickets.filter(ticket => ['rojo', 'naranja'].includes(ticket.severidad));
                const ticketsWithMachine = tickets.filter(ticket => {
                    const machine = String(ticket.maquina ?? '').trim().toUpperCase();

                    return machine !== '' && machine !== 'N/A' && machine !== 'NA' && machine !== 'SIN DATO';
                });

                renderRanking(
                    containers.focusMechanics,
                    groupTickets(riskyTickets, 'mecanico').slice(0, 3),
                    {
                        emptyTitle: 'Sin mecánicos en riesgo',
                        emptyText: 'No hay tickets naranjas o rojos asignados.',
                    }
                );

                renderRanking(
                    containers.focusModules,
                    groupTickets(riskyTickets, 'modulo').slice(0, 3),
                    {
                        emptyTitle: 'Sin módulos en riesgo',
                        emptyText: 'No hay concentración naranja o roja por área.',
                    }
                );

                renderRanking(
                    containers.focusMachines,
                    groupTickets(ticketsWithMachine, 'maquina').slice(0, 3),
                    {
                        emptyTitle: 'Sin máquinas identificadas',
                        emptyText: 'Los tickets activos no contienen una máquina válida.',
                    }
                );
            }

            function renderKpis(allTickets, ticketsSinIniciar) {
                const redTickets = allTickets.filter(ticket => ticket.severidad === 'rojo');
                const criticalNotStarted = ticketsSinIniciar.filter(ticket => ['rojo', 'naranja'].includes(ticket.severidad));
                const riskyTickets = allTickets.filter(ticket => ['rojo', 'naranja'].includes(ticket.severidad));
                const topMechanic = groupTickets(riskyTickets, 'mecanico')[0];
                const oldestTicket = [...allTickets].sort((a, b) =>
                    (Number(b.tiempo_transcurrido_minutos) || 0) - (Number(a.tiempo_transcurrido_minutos) || 0)
                )[0];

                containers.kpiRojos.textContent = redTickets.length;
                containers.kpiSinIniciarCriticos.textContent = criticalNotStarted.length;
                containers.kpiMecanico.textContent = topMechanic?.name || 'Sin concentración';
                containers.kpiMecanico.title = topMechanic?.name || '';
                containers.kpiMecanicoTotal.textContent = `${topMechanic?.total || 0} tickets`;
                containers.kpiMayorFolio.textContent = oldestTicket?.folio || 'N/A';
                containers.kpiMayorTiempo.textContent = oldestTicket?.tiempo_transcurrido_formateado || '0m';
                containers.kpiMayorContexto.textContent = oldestTicket
                    ? `${normalizedValue(oldestTicket.modulo)} · ${normalizedValue(oldestTicket.mecanico)}`
                    : 'Sin tickets activos';
            }

            function renderWorkflowSummary(allTickets, ticketsEnAtencion, ticketsSinIniciar) {
                const enAtencionRisk = ticketsEnAtencion.filter(ticket => ['rojo', 'naranja'].includes(ticket.severidad)).length;
                const sinIniciarRisk = ticketsSinIniciar.filter(ticket => ['rojo', 'naranja'].includes(ticket.severidad)).length;
                const greenTickets = allTickets.filter(ticket => ticket.severidad === 'verde').length;
                const greenRate = allTickets.length > 0 ? Math.round((greenTickets / allTickets.length) * 100) : 0;

                containers.summaryEnAtencion.textContent = ticketsEnAtencion.length;
                containers.summaryEnAtencionRisk.textContent = `${enAtencionRisk} en riesgo`;
                containers.summarySinIniciar.textContent = ticketsSinIniciar.length;
                containers.summarySinIniciarRisk.textContent = `${sinIniciarRisk} en riesgo`;
                containers.summaryGreenRate.textContent = `${greenRate}%`;
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
                        toggle.querySelector('.monitor-chevron')?.classList.remove('rotate-180');
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
                toggle.querySelector('.monitor-chevron')?.classList.toggle('rotate-180', willOpen);
                openAccordionId = willOpen ? targetId : null;
            }

            function renderList(container, tickets, tipo, emptyText) {
                if (!tickets.length) {
                    container.innerHTML = `
                        <div class="rounded-lg border border-dashed border-gray-200 py-8 text-center dark:border-gray-700">
                            <p class="text-sm font-semibold text-gray-600 dark:text-gray-300">${emptyText}</p>
                        </div>
                    `;
                    return;
                }

                const sortedTickets = [...tickets].sort((a, b) =>
                    (severityOrder[b.severidad] || 0) - (severityOrder[a.severidad] || 0) ||
                    (Number(b.tiempo_transcurrido_minutos) || 0) - (Number(a.tiempo_transcurrido_minutos) || 0)
                );

                container.innerHTML = sortedTickets.map(ticket => renderTicket(ticket, tipo)).join('');
            }

            async function loadMonitorData() {
                try {
                    const response = await fetch(endpoint, {
                        headers: { 'Accept': 'application/json' },
                        cache: 'no-store',
                    });
                    const data = await response.json();

                    if (!response.ok || !data.success) {
                        throw new Error(data.message || 'No se pudieron cargar los datos del monitor.');
                    }

                    const ticketsEnAtencion = Array.isArray(data.tickets_en_atencion) ? data.tickets_en_atencion : [];
                    const ticketsSinIniciar = Array.isArray(data.tickets_sin_iniciar) ? data.tickets_sin_iniciar : [];
                    const allTickets = [...ticketsEnAtencion, ...ticketsSinIniciar];
                    const summary = calculateSummary(allTickets);

                    containers.error.classList.add('hidden');
                    containers.lastUpdate.textContent = data.actualizado_en || new Date().toLocaleString();
                    containers.countEnAtencion.textContent = ticketsEnAtencion.length;
                    containers.countSinIniciar.textContent = ticketsSinIniciar.length;
                    containers.severityBar.innerHTML = '';

                    renderKpis(allTickets, ticketsSinIniciar);
                    renderWorkflowSummary(allTickets, ticketsEnAtencion, ticketsSinIniciar);
                    renderSeveritySummary(summary);
                    renderOperationalFocus(allTickets);
                    renderList(containers.enAtencion, ticketsEnAtencion, 'atencion', 'No hay tickets en atención.');
                    renderList(containers.sinIniciar, ticketsSinIniciar, 'asignado', 'No hay tickets asignados sin iniciar.');
                } catch (error) {
                    containers.error.textContent = error.message;
                    containers.error.classList.remove('hidden');
                }
            }

            containers.enAtencion.addEventListener('click', handleAccordionClick);
            containers.sinIniciar.addEventListener('click', handleAccordionClick);
            loadMonitorData();
            setInterval(loadMonitorData, refreshMs);
        });
    </script>
</x-guest-layout>
