import * as d3 from "d3";

/**
 * Módulo para la Línea de Tiempo de Atención (D3).
 * Implementa Lazy Loading y una estructura de renderizado más eficiente.
 * Versión 100% completa, con cálculo de tiempo restaurado.
 */
const TimelineModule = (function () {

    // --- ESTADO Y CONSTANTES PRIVADAS ---
    const state = {
        isInitialized: false,
        container: null,
        rawData: [],
        currentPage: 1,
        itemsPerPage: 5,
        filtroMecanico: '',
        filtroModulo: ''
    };

    // --- FUNCIONES DE UTILIDAD ---
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX') : 'N/A';
    const formatTime = (d) => d ? new Date(d).toLocaleTimeString('es-MX', { hour: "2-digit", minute: "2-digit" }) : 'N/A';

    // --- LÓGICA DE RENDERIZADO ---

    function renderShell() {
        state.container.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-medium tracking-tight text-gray-950 dark:text-white">Línea de tiempo de atención</h2>
            </div>
            <div id="timeline-filters" class="flex flex-wrap gap-4 mb-6 items-center"></div>
            <div id="timeline-content" class="space-y-8"></div>
            <div id="timeline-pagination" class="flex justify-center mt-6"></div>
        `;
    }

    function renderFilters() {
        const filterContainer = state.container.querySelector('#timeline-filters');
        if (!filterContainer) return;

        const mecanicos = [...new Set(state.rawData.map(item => item.Mecanico).filter(Boolean))].sort();
        const modulos = [...new Set(state.rawData.map(item => item.Modulo).filter(Boolean))].sort();

        filterContainer.innerHTML = `
            <div>
                <select id="timeline-mecanico-filter" class="border rounded px-2 py-1 bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500">
                    <option value="">Todos los Mecánicos</option>
                    ${mecanicos.map(m => `<option value="${m}">${m}</option>`).join('')}
                </select>
            </div>
            <div>
                <select id="timeline-modulo-filter" class="border rounded px-2 py-1 bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500">
                    <option value="">Todos los Módulos</option>
                    ${modulos.map(m => `<option value="${m}">${m}</option>`).join('')}
                </select>
            </div>
        `;

        state.container.querySelector('#timeline-mecanico-filter').addEventListener('change', (e) => {
            state.filtroMecanico = e.target.value;
            state.currentPage = 1;
            render();
        });
        state.container.querySelector('#timeline-modulo-filter').addEventListener('change', (e) => {
            state.filtroModulo = e.target.value;
            state.currentPage = 1;
            render();
        });
    }

    function render() {
        const { month, year, day } = getSelectedCalendarFilters();

        let filteredData = state.rawData.filter(item => {
            if (!item.created_at) return false;
            const date = new Date(item.created_at);
            if (date.getFullYear() !== year || date.getMonth() !== month) return false;
            if (day !== null && date.getDate() !== day) return false;
            return true;
        });
        if (state.filtroMecanico) {
            filteredData = filteredData.filter(item => item.Mecanico === state.filtroMecanico);
        }
        if (state.filtroModulo) {
            filteredData = filteredData.filter(item => item.Modulo === state.filtroModulo);
        }

        const totalPages = Math.ceil(filteredData.length / state.itemsPerPage);
        state.currentPage = Math.min(state.currentPage, totalPages || 1);
        const startIdx = (state.currentPage - 1) * state.itemsPerPage;
        const pageData = filteredData.slice(startIdx, startIdx + state.itemsPerPage);

        const contentDiv = state.container.querySelector('#timeline-content');
        contentDiv.innerHTML = '';

        if (pageData.length === 0) {
            contentDiv.innerHTML = `<div class="text-center text-gray-500 py-8">No hay registros que coincidan con los filtros seleccionados.</div>`;
        } else {
            pageData.forEach(item => {
                const wrapper = document.createElement('div');
                wrapper.className = "w-full";
                wrapper.innerHTML = `<div class="mb-2 text-sm font-semibold break-all text-left text-gray-800 dark:text-gray-100">Módulo: ${item.Modulo || 'N/A'} | Folio: ${item.Folio || 'N/A'}</div>`;

                const svg = createTimelineSVG(item);
                wrapper.appendChild(svg.node());

                // ==========================================================
                //  CÁLCULO DE TIEMPO TOTAL - RESTAURADO
                // ==========================================================
                if (typeof item.TiempoAtencionMin !== "undefined" && item.TiempoAtencionMin !== null) {
                    let min = parseInt(item.TiempoAtencionMin, 10);
                    const dias = Math.floor(min / 1440);
                    min %= 1440;
                    const horas = Math.floor(min / 60);
                    min %= 60;

                    let tiempoStr = [];
                    if (dias > 0) tiempoStr.push(`${dias} día${dias > 1 ? 's' : ''}`);
                    if (horas > 0) tiempoStr.push(`${horas} hora${horas > 1 ? 's' : ''}`);
                    if (min > 0 || tiempoStr.length === 0) tiempoStr.push(`${min} min`);

                    const tiempoDiv = document.createElement('div');
                    tiempoDiv.className = "mt-2 text-center text-sm font-bold text-gray-800 dark:text-gray-100";
                    tiempoDiv.innerText = `Tiempo completo: ${tiempoStr.join(' : ')}`;
                    wrapper.appendChild(tiempoDiv);
                }
                // ==========================================================

                contentDiv.appendChild(wrapper);
            });
        }

        renderPaginationControls(totalPages);
        setupTooltips();
    }

    function createTimelineSVG(item) {
        const start = item.AsignationCreated ? new Date(item.AsignationCreated) : null;
        const attention = item.FollowCreated ? new Date(item.FollowCreated) : null;
        const end = item.TimeFin ? new Date(item.TimeFin) : attention;

        if (!start || !attention || !end) return d3.create("svg");

        const total = end - start || 1;
        const width = 700, height = 44, margin = { left: 30, right: 30 };
        const svg = d3.create("svg").attr("width", "100%").attr("viewBox", `0 0 ${width} ${height}`).classed("block", true);

        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient").attr("id", "timeline-gradient").attr("x1", "0%").attr("x2", "100%");
        gradient.append("stop").attr("offset", "0%").attr("stop-color", "#ef4444");
        gradient.append("stop").attr("offset", "60%").attr("stop-color", "#f59e42");
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "#22c55e");

        svg.append("rect").attr("x", margin.left).attr("y", height / 2 - 4).attr("width", width - margin.left - margin.right).attr("height", 8).attr("rx", 4).attr("fill", "url(#timeline-gradient)");

        function drawPoint(pos, color, label, date, tooltipExtra) {
            if (pos === null || isNaN(pos) || !date) return;
            const x = margin.left + pos * (width - margin.left - margin.right);

            svg.append("circle")
                .attr("cx", x)
                .attr("cy", height / 2)
                .attr("r", 8)
                .attr("fill", color)
                .attr("stroke-width", 3)
                .attr("class", "timeline-point")
                .attr("data-tooltip", `
                    <div class='font-bold mb-1'>${label}</div>
                    <div class='text-xs mb-1'>
                        <span class='font-semibold'>Fecha:</span> ${formatDate(date)}<br>
                        <span class='font-semibold'>Hora:</span> ${formatTime(date)}
                    </div>
                    <div>${tooltipExtra}</div>
                `);

            svg.append("text")
                .attr("x", x)
                .attr("y", height / 2 + 18)
                .attr("text-anchor", "middle")
                .attr("class", "fill-current text-gray-600 dark:text-gray-300 text-xs")
                .text(formatTime(date));
        }

        const tooltipExtra = `
            <div class='text-xs mt-2 border-t border-gray-600 pt-1'>
              <div><span class='font-semibold'>Mecánico:</span> ${item.Mecanico || '-'}</div>
              <div><span class='font-semibold'>Problema:</span> ${item.Problema || '-'}</div>
            </div>`;

        drawPoint(0, "#ef4444", "Inicio", start, tooltipExtra);
        drawPoint(((attention - start) / total), "#3b82f6", "Atención", attention, tooltipExtra);
        drawPoint(1, "#22c55e", "Fin", end, tooltipExtra);

        if (item.TimeInicio) {
            const timeInicioDate = new Date(item.TimeInicio);
            if (!isNaN(timeInicioDate.getTime())) {
                const timeInicioPos = (timeInicioDate - start) / total;
                drawPoint(timeInicioPos, "#fde047", "TimeInicio", timeInicioDate, tooltipExtra);
            }
        }

        return svg;
    }

    function renderPaginationControls(totalPages) {
        const paginationDiv = state.container.querySelector('#timeline-pagination');
        paginationDiv.innerHTML = '';
        if (totalPages <= 1) return;

        const nav = document.createElement('nav');
        nav.setAttribute('aria-label', 'Paginación');
        nav.className = "flex items-center space-x-2";

        const prevBtn = document.createElement('button');
        prevBtn.className = `flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 ${state.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`;
        prevBtn.innerHTML = `Anterior`;
        prevBtn.disabled = state.currentPage === 1;
        prevBtn.onclick = () => { if (state.currentPage > 1) { state.currentPage--; render(); } };
        nav.appendChild(prevBtn);

        let startPage = Math.max(1, state.currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `px-3 py-2 text-sm font-medium border border-gray-300 ${i === state.currentPage ? 'bg-blue-600 text-white dark:bg-blue-500' : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700'}`;
            pageBtn.innerText = i;
            if (i === state.currentPage) pageBtn.setAttribute('aria-current', 'page');
            pageBtn.onclick = () => { state.currentPage = i; render(); };
            nav.appendChild(pageBtn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.className = `flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 ${state.currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`;
        nextBtn.innerHTML = `Siguiente`;
        nextBtn.disabled = state.currentPage === totalPages;
        nextBtn.onclick = () => { if (state.currentPage < totalPages) { state.currentPage++; render(); } };
        nav.appendChild(nextBtn);

        paginationDiv.appendChild(nav);
    }

    function setupTooltips() {
        d3.selectAll(".timeline-point")
            .on("mouseenter", function (event) {
                const tooltipHtml = this.getAttribute("data-tooltip");
                let tooltip = d3.select("#d3-timeline-tooltip");
                if (tooltip.empty()) {
                    tooltip = d3.select("body").append("div")
                        .attr("id", "d3-timeline-tooltip")
                        .attr("class", "z-50 fixed pointer-events-none px-4 py-2 rounded-lg shadow-lg bg-gray-900 text-white text-xs")
                        .style("opacity", 0);
                }
                tooltip.html(tooltipHtml)
                    .style("opacity", 1)
                    .style("left", (event.clientX + 15) + "px")
                    .style("top", (event.clientY) + "px");
            })
            .on("mousemove", function (event) {
                d3.select("#d3-timeline-tooltip")
                    .style("left", (event.clientX + 15) + "px")
                    .style("top", (event.clientY) + "px");
            })
            .on("mouseleave", function () {
                d3.select("#d3-timeline-tooltip").style("opacity", 0);
            });
    }

    function getSelectedCalendarFilters() {
        const monthSelect = document.getElementById('calendar-month');
        const yearSelect = document.getElementById('calendar-year');
        const daySelect = document.getElementById('calendar-day');
        const month = monthSelect ? parseInt(monthSelect.value, 10) : new Date().getMonth();
        const year = yearSelect ? parseInt(yearSelect.value, 10) : new Date().getFullYear();
        const day = daySelect && daySelect.value ? parseInt(daySelect.value, 10) : null;
        return { month, year, day };
    }

    async function initializeComponent() {
        if (state.isInitialized) return;
        state.isInitialized = true;

        state.container.innerHTML = `<div class="w-full min-h-[500px] flex items-center justify-center text-gray-400 animate-pulse">Cargando Línea de Tiempo...</div>`;

        try {
            state.rawData = await fetch('/dashboard/timeline-data').then(res => res.json());
        } catch (e) {
            console.error("Timeline: Error fetching data:", e);
            state.container.innerHTML = '<div class="p-4 text-center text-red-500">Error al cargar datos.</div>';
            return;
        }

        renderShell();
        renderFilters();
        render(); // Render inicial

        window.addEventListener('calendar:change', () => {
            state.currentPage = 1; // Resetear página en cambio de calendario
            render();
        });
    }

    function init() {
        state.container = document.getElementById('timeline-container');
        if (!state.container) return;
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initializeComponent();
                    observerInstance.unobserve(state.container);
                }
            });
        }, { threshold: 0.05 });
        observer.observe(state.container);
    }

    return {
        init: init
    };
})();
document.addEventListener('DOMContentLoaded', TimelineModule.init);
