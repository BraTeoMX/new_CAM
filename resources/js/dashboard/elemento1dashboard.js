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
 * Refactorizado para ser robusto, eficiente y con actualizaciones animadas.
 */
const StatusChartModule = (function () {

    // --- ESTADO Y CONFIGURACIÓN PRIVADOS ---
    const state = {
        isInitialized: false,
        container: null,
        chartArea: null,
        yAxisArea: null,
        totalTicketsSpan: null,
    };

    // --- CAMBIO 1: Añadir la propiedad 'iconColor' a la configuración ---
    const STATUS_CONFIG = {
        'PENDIENTE': { icon: 'pending_actions', color: "from-red-300 to-red-400", iconColor: "text-red-800" },
        'ASIGNADO': { icon: 'assignment_ind', color: "from-blue-300 to-blue-400", iconColor: "text-blue-400" },
        'EN PROCESO': { icon: 'av_timer', color: "from-yellow-300 to-yellow-400", iconColor: "text-yellow-800" },
        'ATENDIDO': { icon: 'preliminary', color: "from-green-300 to-green-400", iconColor: "text-green-800" },
        'AUTONOMO': { icon: 'smart_toy', color: "from-violet-300 to-violet-400", iconColor: "text-violet-800" },
        'CANCELADO': { icon: 'dangerous', color: "from-orange-300 to-orange-400", iconColor: "text-orange-800" },
        'SIN ASIGNACION': { icon: 'fact_check', color: "from-blue-300 to-blue-400", iconColor: "text-blue-800" },
    };

    // --- LÓGICA DE DATOS ---
    async function fetchChartData(params) {
        const urlParams = new URLSearchParams();
        if (params.year) urlParams.append('year', params.year);
        if (params.month) urlParams.append('month', params.month);

        const url = `/dashboardV2/obtenerEstatus?${urlParams.toString()}`;
        console.log(`StatusChart 🚀: Pidiendo datos a ${url}`);

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
        return response.json();
    }

    // --- LÓGICA DE RENDERIZADO Y ACTUALIZACIÓN ---

    function createChartShell() {
        state.container.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-medium tracking-tight text-gray-950 dark:text-white">Conteo de Status de Tickets</h2>
                <div class="text-base text-gray-500 dark:text-gray-400">Total: <span id="total-tickets-value" class="font-bold text-gray-800 dark:text-gray-200">0</span></div>
            </div>
            <div class="relative w-full h-72">
                <div id="chart-area" class="absolute inset-0 z-10 h-full w-[calc(100%-100px)] translate-x-[100px] overflow-visible"></div>
                <div id="y-axis-area" class="absolute top-0 left-0 h-full w-[100px] overflow-visible"></div>
            </div>`;

        state.chartArea = d3.select(state.container.querySelector("#chart-area"));
        state.yAxisArea = d3.select(state.container.querySelector("#y-axis-area"));
        state.totalTicketsSpan = d3.select(state.container.querySelector("#total-tickets-value"));
    }

    function updateChart(apiData) {
        const chartData = apiData
            .map(d => ({
                key: d.Status,
                value: d.total,
                ...STATUS_CONFIG[d.Status.toUpperCase()]
            }))
            .sort((a, b) => b.value - a.value);

        const totalTickets = chartData.reduce((sum, d) => sum + d.value, 0);
        const maxValue = Math.max(...chartData.map(d => d.value), 1);
        
        state.totalTicketsSpan.text(totalTickets);

        const yScale = d3.scaleBand().domain(chartData.map(d => d.key)).range([0, 288]).padding(0.25);
        const xScale = d3.scaleLinear().domain([0, maxValue]).range([0, 100]);
        
        const t = d3.transition().duration(750);

        // --- ACTUALIZAR EJE Y (ETIQUETAS) ---
        state.yAxisArea.selectAll("div.y-axis-label")
            .data(chartData, d => d.key)
            .join(
                enter => enter.append("div")
                    .attr("class", "y-axis-label absolute flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 text-right w-[92px]")
                    .style("top", d => `${yScale(d.key) + yScale.bandwidth() / 2 - 12}px`)
                    .style("opacity", 0)
                    // --- CAMBIO 2: Usar la nueva propiedad 'iconColor' aquí ---
                    .html(d => `<span class="material-symbols-outlined text-xl ${d.iconColor}">${d.icon}</span><span class="font-semibold">${d.key}</span>`)
                    .call(enter => enter.transition(t).style("opacity", 1)),
                update => update
                    // También actualizamos el html en la actualización por si la configuración cambiara dinámicamente
                    .html(d => `<span class="material-symbols-outlined text-xl ${d.iconColor}">${d.icon}</span><span class="font-semibold">${d.key}</span>`)
                    .call(update => update.transition(t)
                        .style("top", d => `${yScale(d.key) + yScale.bandwidth() / 2 - 12}px`)),
                exit => exit
                    .call(exit => exit.transition(t)
                        .style("opacity", 0)
                        .remove())
            );
            
        // --- ACTUALIZAR BARRAS ---
        state.chartArea.selectAll("div.bar")
            .data(chartData, d => d.key)
            .join(
                enter => enter.append("div")
                    .attr("class", d => `bar absolute bg-gradient-to-r ${d.color} group cursor-pointer`)
                    .style("left", 0)
                    .style("top", d => `${yScale(d.key)}px`)
                    .style("height", `${yScale.bandwidth()}px`)
                    .style("width", 0)
                    .style("border-radius", "0 4px 4px 0")
                    .call(enter => enter.transition(t).style("width", d => `${xScale(d.value)}%`)),
                update => update
                    .call(update => update.transition(t)
                        .style("top", d => `${yScale(d.key)}px`)
                        .style("width", d => `${xScale(d.value)}%`)),
                exit => exit
                    .call(exit => exit.transition(t)
                        .style("width", 0)
                        .remove())
            );

        // --- ACTUALIZAR ETIQUETAS DE VALOR (SOBRE LAS BARRAS) ---
        state.chartArea.selectAll("span.bar-value-label")
            .data(chartData, d => d.key)
            .join(
                enter => enter.append("span")
                    .attr("class", "bar-value-label absolute text-xs font-bold text-white pointer-events-none")
                    .style("top", d => `${yScale(d.key) + yScale.bandwidth() / 2}px`)
                    .style("left", "5px")
                    .style("transform", "translateY(-50%)")
                    .style("opacity", 0)
                    .text(d => d.value)
                    .call(enter => enter.transition(t)
                        .style("left", d => `calc(${xScale(d.value)}% - 25px)`)
                        .style("opacity", 1)
                    ),
                update => update
                    .text(d => d.value)
                    .call(update => update.transition(t)
                        .style("top", d => `${yScale(d.key) + yScale.bandwidth() / 2}px`)
                        .style("left", d => `calc(${xScale(d.value)}% - 25px)`)
                    ),
                exit => exit
                    .call(exit => exit.transition(t)
                        .style("opacity", 0)
                        .remove())
            );
    }
    
    async function updateDataAndRender(params) {
        try {
            const apiData = await fetchChartData(params);
            updateChart(apiData);
        } catch (e) {
            console.error("StatusChart: Error al actualizar datos:", e);
            state.container.innerHTML = '<div class="p-4 text-center text-red-500">Error al cargar datos del gráfico.</div>';
        }
    }

    async function initializeComponent() {
        if (state.isInitialized) return;
        state.isInitialized = true;

        createChartShell();

        const triggerUpdate = (month) => {
            const params = {
                year: new Date().getFullYear(),
                month: month
            };
            updateDataAndRender(params);
        };

        window.addEventListener('monthChanged', (e) => triggerUpdate(e.detail.month));

        if (window.Echo) {
            window.Echo.channel("asignaciones-ot")
                .listen("StatusOTUpdated", () => {
                    console.log("StatusChart ⚡: Recibido evento de Pusher. Actualizando...");
                    const monthSelect = document.getElementById('month-select');
                    const currentMonth = monthSelect ? monthSelect.value : new Date().getMonth() + 1;
                    triggerUpdate(currentMonth);
                });
        }

        const monthSelect = document.getElementById('month-select');
        const initialMonth = monthSelect ? monthSelect.value : new Date().getMonth() + 1;
        triggerUpdate(initialMonth);
    }

    function init() {
        state.container = document.getElementById('dashboard-elemento1');
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

    return { init };
})();

document.addEventListener('DOMContentLoaded', StatusChartModule.init);