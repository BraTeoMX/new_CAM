import { CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement } from 'chart.js';
Chart.register(CategoryScale, LinearScale, LineController, LineElement, PointElement);

/**
 * Módulo para la gráfica de Creados vs Completados (Chart.js).
 * Refactorizado para usar un endpoint eficiente y responder a eventos.
 */
const CreatCompletChartModule = (function() {

    // --- ESTADO Y VARIABLES GLOBALES ---
    let chartInstance = null;
    let state = {
        isInitialized: false,
        container: null,
        labels: [],
        creadas: [],
        completadas: [],
    };

    // --- FUNCIONES DE RENDERIZADO (Adaptadas para usar el estado del módulo) ---
    
    function prepareContainer(container) {
        container.innerHTML = "";
        container.classList.add("p-2", "rounded-lg", "bg-white", "dark:bg-zinc-900", "shadow", "border", "border-zinc-100", "dark:border-zinc-800");
        container.style.minHeight = "280px";
        container.style.height = "auto";
        container.insertAdjacentHTML("beforeend", `<canvas id="creatCompletChart" height="290" style="max-height:350px;"></canvas>`);
    }

    function renderKPIs(container, totalCreadas, totalCompletadas, indice) {
        const kpiHtml = `
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
            <div class="text-base sm:text-lg md:text-xl lg:text-2xl font-medium tracking-tight text-gray-950 dark:text-white">Tickets Creados Vs Completados</div>
        </div>
        <div class="flex justify-between items-center mb-1 gap-2 w-full">
            <div class="flex flex-col items-center flex-1">
                <span class="text-lg font-bold text-blue-700 dark:text-blue-300">${totalCreadas}</span>
                <span class="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs border border-blue-300">Creadas</span>
            </div>
            <div class="flex flex-col items-center flex-1">
                <span class="text-lg font-bold text-green-700 dark:text-green-300">${totalCompletadas}</span>
                <span class="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs border border-green-300">Completadas</span>
            </div>
            <div class="flex flex-col items-center flex-1">
                <span class="text-lg font-bold text-zinc-700 dark:text-zinc-200">${indice}%</span>
                <span class="text-[10px] text-zinc-400 dark:text-zinc-500">Índice completadas</span>
            </div>
        </div>`;
        container.insertAdjacentHTML("afterbegin", kpiHtml);
    }

    function renderChart() {
        if (!state.container) return;
        
        // El contenedor interno para la gráfica
        const chartInnerContainer = state.container.querySelector(".creatComplet-container");
        if (!chartInnerContainer) return;
        
        prepareContainer(chartInnerContainer);

        const totalCreadas = state.creadas.reduce((a, b) => a + b, 0);
        const totalCompletadas = state.completadas.reduce((a, b) => a + b, 0);
        const indice = totalCreadas > 0 ? ((totalCompletadas / totalCreadas) * 100).toFixed(2) : "0.00";

        renderKPIs(chartInnerContainer, totalCreadas, totalCompletadas, indice);

        const ctx = document.getElementById('creatCompletChart').getContext('2d');
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: state.labels,
                datasets: [
                    {
                        label: 'Creadas', data: state.creadas, borderColor: '#2563eb',
                        backgroundColor: 'rgba(37,99,235,0.08)', fill: false, tension: 0.4,
                        pointRadius: 6, borderWidth: 2, pointBackgroundColor: '#18181b',
                        pointBorderColor: '#a5b4fc', pointHoverRadius: 8,
                    },
                    {
                        label: 'Completadas', data: state.completadas, borderColor: '#22c55e',
                        backgroundColor: 'rgba(34,197,94,0.08)', fill: false, tension: 0.4,
                        pointRadius: 6, borderWidth: 2, pointBackgroundColor: '#18181b',
                        pointBorderColor: '#6ee7b7', pointHoverRadius: 8,
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false }, datalabels: false },
                layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
                scales: {
                    x: {
                        display: true, title: { display: false },
                        ticks: { font: { size: 10 }, color: "#a1a1aa" },
                        grid: { display: false }
                    },
                    y: {
                        display: true, beginAtZero: true,
                        ticks: { font: { size: 10 }, color: "#a1a1aa", stepSize: 1 },
                        grid: { display: false }
                    }
                }
            },
            plugins: [{
                afterDatasetsDraw: function(chart) {
                    const ctx = chart.ctx;
                    chart.data.datasets.forEach(function(dataset, i) {
                        const meta = chart.getDatasetMeta(i);
                        meta.data.forEach(function(point, index) {
                            const value = dataset.data[index];
                            if (value !== undefined && value !== null) {
                                ctx.save();
                                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                                ctx.strokeStyle = '#18181b'; ctx.lineWidth = 3;
                                ctx.beginPath(); ctx.arc(point.x, point.y, 13, 0, 2 * Math.PI);
                                ctx.fillStyle = '#18181b'; ctx.fill();
                                ctx.strokeStyle = (i === 0) ? '#a5b4fc' : '#6ee7b7'; ctx.lineWidth = 2;
                                ctx.stroke();
                                ctx.fillStyle = (i === 0) ? '#a5b4fc' : '#6ee7b7'; ctx.font = 'bold 13px sans-serif';
                                ctx.fillText(value, point.x, point.y);
                                ctx.restore();
                            }
                        });
                    });
                }
            }]
        });
    }

    // --- LÓGICA DE DATOS Y ORQUESTACIÓN ---
    async function fetchAndRender(params) {
        if (!state.container) return;

        const chartInnerContainer = state.container.querySelector(".creatComplet-container");
        if (chartInnerContainer) {
            chartInnerContainer.innerHTML = `<div class="min-h-[280px] flex items-center justify-center"><div class="animate-pulse text-gray-400">Actualizando...</div></div>`;
        }

        try {
            const monthSelect = document.getElementById('month-select');
            const params = {
                year: new Date().getFullYear(), // O de donde obtengas el año
                month: monthSelect ? parseInt(monthSelect.value, 10) : new Date().getMonth() + 1
            };

            const urlParams = new URLSearchParams();
            // Usar los parámetros que acabamos de obtener
            if (params.year) urlParams.append('year', params.year); 
            if (params.month) urlParams.append('month', params.month);


            // CAMBIO: Apuntar a la nueva ruta
            const url = `/dashboardV2/obtenerCreadosCompletados?${urlParams.toString()}`;
            console.log(`CreatVsComplet 🚀: Pidiendo datos a ${url}`);

            const response = await fetch(url);
            if (!response.ok) throw new Error("Error al obtener datos");
            
            const data = await response.json();

            // CAMBIO: Filtrar los datos para excluir los días sin actividad
            const filteredData = data.filter(d => d.creadas > 0 || d.completadas > 0);

            // Ahora, mapear desde los datos YA filtrados
            state.labels = filteredData.map(d => d.date);
            state.creadas = filteredData.map(d => d.creadas);
            state.completadas = filteredData.map(d => d.completadas);

            // Renderizar la gráfica con los nuevos datos
            renderChart();

        } catch (e) {
            console.error('Error fetching chart data:', e);
            if (chartInnerContainer) {
                chartInnerContainer.innerHTML = `<div class="min-h-[280px] flex items-center justify-center text-red-500">Error al cargar datos.</div>`;
            }
        }
    }

    // --- INICIALIZACIÓN (LAZY LOADING) ---
    function initialize() {
        if (state.isInitialized) return;
        state.isInitialized = true;

        console.log("CreatVsComplet Chart: Component is visible, initializing...");

        // CAMBIO: Escuchar el evento 'monthChanged'
        window.addEventListener('monthChanged', (e) => {
            const params = {
                year: new Date().getFullYear(),
                month: e.detail.month // El evento ya envía el mes como 1-12
            };
            fetchAndRender(params);
        });
        
        // Carga inicial de datos al hacerse visible por primera vez
        const initialParams = {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1 // Mes actual como 1-12
        };
        fetchAndRender(initialParams);
    }

    function init() {
        state.container = document.getElementById("creatComplet-container");
        if (!state.container) return;

        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initialize();
                    observerInstance.unobserve(state.container);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(state.container);
    }

    return { init };
})();

// Punto de entrada
document.addEventListener("DOMContentLoaded", CreatCompletChartModule.init);