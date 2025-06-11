import Echo from "laravel-echo";
import Pusher from "pusher-js";
import * as d3 from "d3";

// --- Configuración de Echo/Pusher ---
window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    encrypted: true,
});

/**
 * Módulo para la gráfica de barras de Status de Tickets (D3).
 * Implementa Lazy Loading y contiene todas las funcionalidades visuales.
 */
const StatusChartModule = (function () {

    // --- ESTADO Y CONFIGURACIÓN PRIVADOS ---
    const state = {
        isInitialized: false,
        container: null,
        rawData: [],
    };

    const STATUS_LIST = ['PENDIENTE', 'ASIGNADO', 'PROCESO', 'ATENDIDO', 'AUTONOMO', 'CANCELADO', 'FINALIZADO'];
    const STATUS_CONFIG = {
        'PENDIENTE': { icon: '<span class="material-symbols-outlined text-red-800 text-3xl">pending_actions</span>', color: "from-red-300 to-red-400" },
        'ASIGNADO': { icon: '<span class="material-symbols-outlined text-blue-400 text-3xl">assignment_ind</span>', color: "from-blue-300 to-blue-400" },
        'PROCESO': { icon: '<span class="material-symbols-outlined text-yellow-800 text-3xl">av_timer</span>', color: "from-yellow-300 to-yellow-400" },
        'ATENDIDO': { icon: '<span class="material-symbols-outlined text-green-800 text-3xl">preliminary</span>', color: "from-green-300 to-green-400" },
        'AUTONOMO': { icon: '<span class="material-symbols-outlined text-violet-800 text-3xl">smart_toy</span>', color: "from-violet-300 to-violet-400" },
        'CANCELADO': { icon: '<span class="material-symbols-outlined text-orange-800 text-3xl">dangerous</span>', color: "from-orange-300 to-orange-400" },
        'FINALIZADO': { icon: '<span class="material-symbols-outlined text-blue-800 text-3xl">fact_check</span>', color: "from-blue-300 to-blue-400" },
    };

    // --- FUNCIONES INTERNAS ---

    function getSelectedFilters() {
        const monthSelect = document.getElementById('calendar-month');
        const yearSelect = document.getElementById('calendar-year');
        const daySelect = document.getElementById('calendar-day');
        const month = monthSelect ? parseInt(monthSelect.value, 10) : new Date().getMonth();
        const year = yearSelect ? parseInt(yearSelect.value, 10) : new Date().getFullYear();
        const day = daySelect && daySelect.value ? parseInt(daySelect.value, 10) : null;
        return { month, year, day };
    }

    function filterDataByDate(data, year, month, day) {
        return data.filter(item => {
            if (!item.created_at) return false;
            const date = new Date(item.created_at);
            if (date.getFullYear() !== year || date.getMonth() !== month) return false;
            if (day !== null && date.getDate() !== day) return false;
            return true;
        });
    }

    function renderBarChart(data) {
        if (!state.container) return;

        const statusCounts = {};
        STATUS_LIST.forEach(status => statusCounts[status] = 0);
        data.forEach(item => {
            const status = (item.Status || "").toUpperCase();
            if (STATUS_LIST.includes(status)) statusCounts[status]++;
        });

        const chartData = Object.entries(statusCounts)
            .map(([key, value]) => ({ key, value, ...STATUS_CONFIG[key] }))
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value);

        const totalTickets = chartData.reduce((sum, d) => sum + d.value, 0);
        const maxValue = Math.max(...chartData.map(d => d.value), 1);
        const yScale = d3.scaleBand().domain(chartData.map(d => d.key)).range([0, 100]).padding(0.25);
        const xScale = d3.scaleLinear().domain([0, maxValue]).range([0, 100]);

        state.container.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-medium tracking-tight text-gray-950 dark:text-white">Conteo de Status de Tickets</h2>
                <div class="text-base text-gray-500 dark:text-gray-400">Total: <span class="font-bold text-gray-800 dark:text-gray-200">${totalTickets}</span></div>
            </div>
            <div class="relative w-full h-72" style="--marginTop:0px;--marginRight:0px;--marginBottom:16px;--marginLeft:60px;">
                <div id="bar-chart-area" class="absolute inset-0 z-10 h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[calc(100%-var(--marginLeft)-var(--marginRight))] translate-x-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible"></div>
                <div id="bar-chart-yaxis" class="h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible"></div>
            </div>`;

        const chartArea = state.container.querySelector("#bar-chart-area");
        const yAxisArea = state.container.querySelector("#bar-chart-yaxis");

        chartData.forEach(entry => {
            const y = yScale(entry.key) + yScale.bandwidth() / 2;
            const labelDiv = document.createElement("div");
            labelDiv.className = "absolute flex items-center gap-1 text-xs text-gray-400 -translate-y-1/2 w-full text-right";
            labelDiv.style.top = `${y}%`;
            labelDiv.style.left = "-8px";
            labelDiv.innerHTML = `<span>${entry.icon}</span><span class="font-semibold">${entry.key}</span>`;
            yAxisArea.appendChild(labelDiv);
        });

        chartData.forEach(d => {
            const barWidth = xScale(d.value);
            const barHeight = yScale.bandwidth();
            const y = yScale(d.key);
            const bar = document.createElement("div");
            bar.className = `absolute bg-gradient-to-r ${d.color} group cursor-pointer transition-all duration-300 hover:brightness-110`;
            bar.style.left = "0";
            bar.style.top = `${y}%`;
            bar.style.width = `${barWidth}%`;
            bar.style.height = `${barHeight}%`;
            bar.style.borderRadius = "0 4px 4px 0";
            chartArea.appendChild(bar);

            const valueLabel = document.createElement("span");
            valueLabel.className = "absolute text-xs font-bold text-white pointer-events-none";
            valueLabel.style.top = `${y + barHeight / 2}%`;
            valueLabel.style.left = `calc(${barWidth}% - 22px)`;
            valueLabel.style.transform = "translateY(-50%)";
            valueLabel.innerText = d.value;
            chartArea.appendChild(valueLabel);

            // --- LÓGICA DE TOOLTIPS RESTAURADA ---
            bar.addEventListener("mouseenter", function (e) {
                let tooltip = document.getElementById("bar-tooltip");
                if (!tooltip) {
                    tooltip = document.createElement("div");
                    tooltip.id = "bar-tooltip";
                    tooltip.className = "fixed z-50 px-4 py-2 rounded-lg shadow-lg bg-gray-900 text-white text-xs pointer-events-none transition-opacity duration-200 opacity-0";
                    document.body.appendChild(tooltip);
                }
                tooltip.innerHTML = `<div class="flex items-center gap-2 mb-1">${d.icon}<span class="font-bold">${d.key}</span></div><div class="text-gray-300 text-sm">Total: <span class="font-bold">${d.value}</span></div>`;
                tooltip.style.left = (e.clientX + 15) + "px";
                tooltip.style.top = (e.clientY) + "px";
                setTimeout(() => tooltip.style.opacity = '1', 10);
            });
            bar.addEventListener("mousemove", function (e) {
                const tooltip = document.getElementById("bar-tooltip");
                if (tooltip) {
                    tooltip.style.left = (e.clientX + 15) + "px";
                    tooltip.style.top = (e.clientY) + "px";
                }
            });
            bar.addEventListener("mouseleave", function () {
                const tooltip = document.getElementById("bar-tooltip");
                if (tooltip) tooltip.style.opacity = '0';
            });
        });

        // --- LÓGICA DE LÍNEAS GUÍA (GRID) RESTAURADA ---
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "absolute top-0 left-0 h-full w-full pointer-events-none");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("preserveAspectRatio", "none");

        xScale.ticks(5).forEach((tick) => {
            if (tick === 0) return;
            const x = xScale(tick);
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x);
            line.setAttribute("x2", x);
            line.setAttribute("y1", "0");
            line.setAttribute("y2", "100");
            line.setAttribute("stroke", "#e5e7eb"); // Color para tema claro
            if (document.documentElement.classList.contains('dark')) {
                line.setAttribute("stroke", "#3f3f46"); // Color para tema oscuro
            }
            line.setAttribute("stroke-dasharray", "2,4");
            line.setAttribute("stroke-width", "0.5");
            svg.appendChild(line);
        });
        chartArea.appendChild(svg);

        xScale.ticks(5).forEach((value) => {
             const x = xScale(value);
             const label = document.createElement("div");
             label.className = "absolute text-xs -translate-x-1/2 tabular-nums text-gray-400 dark:text-zinc-500";
             label.style.left = `${x}%`;
             label.style.top = "100%";
             label.style.marginTop = "4px";
             label.innerText = value;
             chartArea.appendChild(label);
        });
    }

    async function fetchAndRender() {
        if (state.rawData.length === 0) {
            try {
                state.rawData = await window.getCardsAteOTsData();
            } catch (e) {
                console.error("StatusChart: Error fetching data:", e);
                state.container.innerHTML = '<div class="p-4 text-center text-red-500">Error al cargar los datos del gráfico.</div>';
                return;
            }
        }
        const filters = getSelectedFilters();
        const filteredData = filterDataByDate(state.rawData, filters.year, filters.month, filters.day);
        renderBarChart(filteredData);
    }

    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    async function initializeComponent() {
        if (state.isInitialized) return;
        state.isInitialized = true;

        state.container.innerHTML = `<div class="w-full min-h-[400px] flex items-center justify-center text-gray-400 animate-pulse">Cargando Gráfico...</div>`;

        window.addEventListener('calendar:change', fetchAndRender);
        window.addEventListener('resize', debounce(fetchAndRender, 200));

        if (window.Echo) {
            window.Echo.channel("asignaciones-ot")
                .listen("StatusOTUpdated", () => {
                    state.rawData = []; // Forzar refetch en la siguiente acción
                    fetchAndRender();
                });
        }

        await fetchAndRender();
    }

    function init() {
        state.container = document.getElementById('dashboard-elemento1');
        if (!state.container) {
            console.error("StatusChart: Container #dashboard-elemento1 not found.");
            return;
        }
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

// --- PUNTO DE ENTRADA ÚNICO ---
document.addEventListener('DOMContentLoaded', StatusChartModule.init);
