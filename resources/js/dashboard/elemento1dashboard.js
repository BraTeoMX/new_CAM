import Echo from "laravel-echo";
import Pusher from "pusher-js";
import * as d3 from "d3";

// --- Configuración de Echo/Pusher (sin cambios) ---
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
 * Refactorizado para usar un endpoint eficiente y responder a eventos.
 */
const StatusChartModule = (function () {

    // --- ESTADO Y CONFIGURACIÓN PRIVADOS ---
    const state = {
        isInitialized: false,
        container: null,
    };

    // La configuración de los status se mantiene, es útil para la visualización
    const STATUS_CONFIG = {
        'PENDIENTE': { icon: '<span class="material-symbols-outlined text-red-800 text-3xl">pending_actions</span>', color: "from-red-300 to-red-400" },
        'ASIGNADO': { icon: '<span class="material-symbols-outlined text-blue-400 text-3xl">assignment_ind</span>', color: "from-blue-300 to-blue-400" },
        'EN PROCESO': { icon: '<span class="material-symbols-outlined text-yellow-800 text-3xl">av_timer</span>', color: "from-yellow-300 to-yellow-400" },
        'ATENDIDO': { icon: '<span class="material-symbols-outlined text-green-800 text-3xl">preliminary</span>', color: "from-green-300 to-green-400" },
        'AUTONOMO': { icon: '<span class="material-symbols-outlined text-violet-800 text-3xl">smart_toy</span>', color: "from-violet-300 to-violet-400" },
        'CANCELADO': { icon: '<span class="material-symbols-outlined text-orange-800 text-3xl">dangerous</span>', color: "from-orange-300 to-orange-400" },
        'SIN ASIGNACION': { icon: '<span class="material-symbols-outlined text-blue-800 text-3xl">fact_check</span>', color: "from-blue-300 to-blue-400" },
    };

    // --- NUEVA FUNCIÓN PARA OBTENER DATOS DEL SERVIDOR ---
    async function fetchChartData(params) {
        const urlParams = new URLSearchParams();
        if (params.year) urlParams.append('year', params.year);
        if (params.month) urlParams.append('month', params.month);

        const url = `/dashboardV2/obtenerEstatus?${urlParams.toString()}`;
        console.log(`StatusChart 🚀: Pidiendo datos a ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        return response.json(); // Devuelve ej: [{Status: "ATENDIDO", total: 42}, ...]
    }

    // --- FUNCIÓN DE RENDERIZADO (Adaptada para recibir datos pre-contados) ---
    function renderBarChart(apiData) {
        if (!state.container) return;

        // El conteo y filtrado ya no se hacen aquí, vienen del backend.

        // 1. Unir datos de la API con la configuración de colores/íconos
        // y responder a tu pregunta sobre el orden:
        const chartData = apiData
            .map(d => ({
                key: d.Status,
                value: d.total,
                ...STATUS_CONFIG[d.Status.toUpperCase()] // Unir con la config de íconos/colores
            }))
            // RESPUESTA A TU PREGUNTA: Sí, podemos ordenar.
            // Esta línea asegura que la gráfica siempre se muestre de mayor a menor.
            .sort((a, b) => b.value - a.value);

        const totalTickets = chartData.reduce((sum, d) => sum + d.value, 0);
        const maxValue = Math.max(...chartData.map(d => d.value), 1);

        // --- El resto de la lógica de D3 y renderizado de HTML es la misma ---
        // (La pego completa para que no tengas que unir partes)

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

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "absolute top-0 left-0 h-full w-full pointer-events-none");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("preserveAspectRatio", "none");

        xScale.ticks(5).forEach((tick) => {
            if (tick === 0) return;
            const x = xScale(tick);
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x); line.setAttribute("x2", x); line.setAttribute("y1", "0"); line.setAttribute("y2", "100");
            line.setAttribute("stroke", document.documentElement.classList.contains('dark') ? "#3f3f46" : "#e5e7eb");
            line.setAttribute("stroke-dasharray", "2,4"); line.setAttribute("stroke-width", "0.5");
            svg.appendChild(line);
        });
        chartArea.appendChild(svg);

        xScale.ticks(5).forEach((value) => {
             const x = xScale(value);
             const label = document.createElement("div");
             label.className = "absolute text-xs -translate-x-1/2 tabular-nums text-gray-400 dark:text-zinc-500";
             label.style.left = `${x}%`; label.style.top = "100%"; label.style.marginTop = "4px";
             label.innerText = value;
             chartArea.appendChild(label);
        });
    }

    // --- LÓGICA PRINCIPAL DE ORQUESTACIÓN ---
    async function fetchAndRender() {
        if (!state.container) return;
        state.container.innerHTML = `<div class="w-full min-h-[400px] flex items-center justify-center text-gray-400 animate-pulse">Actualizando Gráfico...</div>`;
        
        try {
            const monthSelect = document.getElementById('month-select');
            const params = {
                year: new Date().getFullYear(),
                month: monthSelect ? parseInt(monthSelect.value, 10) : new Date().getMonth() + 1
            };
            const apiData = await fetchChartData(params);
            renderBarChart(apiData);
        } catch (e) {
            console.error("StatusChart: Error en fetchAndRender:", e);
            state.container.innerHTML = '<div class="p-4 text-center text-red-500">Error al cargar datos del gráfico.</div>';
        }
    }

    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // --- FUNCIÓN DE INICIALIZACIÓN (LAZY) ---
    async function initializeComponent() {
        if (state.isInitialized) return;
        state.isInitialized = true;

        // Escuchar el evento 'monthChanged' de los otros módulos
        window.addEventListener('monthChanged', fetchAndRender);
        window.addEventListener('resize', debounce(renderBarChart, 200)); // Considera si necesitas recargar o solo re-renderizar

        // Configurar el listener de Pusher para actualizaciones en tiempo real
        if (window.Echo) {
            window.Echo.channel("asignaciones-ot")
                .listen("StatusOTUpdated", () => {
                    console.log("StatusChart ⚡: Recibido evento de Pusher. Actualizando...");
                    fetchAndRender(); // Simplemente vuelve a cargar los datos
                });
        }

        // Carga inicial de datos
        await fetchAndRender();
    }

    // --- FUNCIÓN PÚBLICA DE INICIALIZACIÓN ---
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