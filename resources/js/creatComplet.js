import { CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement } from 'chart.js';
Chart.register(CategoryScale, LinearScale, LineController, LineElement, PointElement);

// Variables globales para almacenar datos y estado
let chartInstance = null;
let globalData = [];
let globalLabels = [];
let globalCreadas = [];
let globalCompletadas = [];
let globalFilters = { year: null, month: null, day: null };
let initialized = false;

// Función para limpiar y preparar el contenedor
function prepareContainer(container) {
    container.innerHTML = "";
    container.classList.add(
        "p-2", "rounded-lg", "bg-white", "dark:bg-zinc-900", "shadow", "border", "border-zinc-100", "dark:border-zinc-800"
    );
    container.style.minHeight = "280px"; // <-- Aumenta la altura mínima
    container.style.height = "auto";
    container.insertAdjacentHTML("beforeend", `<canvas id="creatCompletChart" height="290" style="max-height:350px;"></canvas>`); // <-- Aumenta el alto del canvas
}

// Función para renderizar los KPIs
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
        </div>
    `;
    container.insertAdjacentHTML("afterbegin", kpiHtml);
}

// Función para renderizar la gráfica
function renderChart() {
    const container = document.querySelector("#creatComplet-container .creatComplet-container");
    if (!container) return;

    prepareContainer(container);

    // Calcula los totales
    const totalCreadas = globalCreadas.reduce((a, b) => a + b, 0);
    const totalCompletadas = globalCompletadas.reduce((a, b) => a + b, 0);
    const indice = totalCreadas > 0 ? ((totalCompletadas / totalCreadas) * 100).toFixed(2) : "0.00";

    renderKPIs(container, totalCreadas, totalCompletadas, indice);

    const ctx = document.getElementById('creatCompletChart').getContext('2d');
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: globalLabels,
            datasets: [
                {
                    label: 'Creadas',
                    data: globalCreadas,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37,99,235,0.08)',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 6,
                    borderWidth: 2,
                    pointBackgroundColor: '#18181b',
                    pointBorderColor: '#a5b4fc',
                    pointHoverRadius: 8,
                },
                {
                    label: 'Completadas',
                    data: globalCompletadas,
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34,197,94,0.08)',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 6,
                    borderWidth: 2,
                    pointBackgroundColor: '#18181b',
                    pointBorderColor: '#6ee7b7',
                    pointHoverRadius: 8,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false },
                // Plugin para mostrar los valores en los puntos
                datalabels: false // Si tienes chartjs-plugin-datalabels, puedes poner true y configurar aquí
            },
            layout: {
                padding: { left: 0, right: 0, top: 0, bottom: 0 }
            },
            scales: {
                x: {
                    display: true,
                    title: { display: false },
                    ticks: { font: { size: 10 }, color: "#a1a1aa" },
                    grid: { display: false }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    ticks: { font: { size: 10 }, color: "#a1a1aa", stepSize: 1 },
                    grid: { display: false }
                }
            }
        },
        plugins: [{
            // Plugin para dibujar los valores sobre los puntos
            afterDatasetsDraw: function(chart) {
                const ctx = chart.ctx;
                chart.data.datasets.forEach(function(dataset, i) {
                    const meta = chart.getDatasetMeta(i);
                    meta.data.forEach(function(point, index) {
                        const value = dataset.data[index];
                        if (value !== undefined && value !== null) {
                            ctx.save();
                            ctx.font = 'bold 12px sans-serif';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = (i === 0) ? '#a5b4fc' : '#6ee7b7'; // color acorde a la línea
                            ctx.strokeStyle = '#18181b';
                            ctx.lineWidth = 3;
                            // Dibuja un círculo blanco de fondo para el texto
                            ctx.beginPath();
                            ctx.arc(point.x, point.y, 13, 0, 2 * Math.PI);
                            ctx.fillStyle = '#18181b';
                            ctx.fill();
                            ctx.strokeStyle = (i === 0) ? '#a5b4fc' : '#6ee7b7';
                            ctx.lineWidth = 2;
                            ctx.stroke();
                            // Dibuja el valor encima
                            ctx.fillStyle = (i === 0) ? '#a5b4fc' : '#6ee7b7';
                            ctx.font = 'bold 13px sans-serif';
                            ctx.fillText(value, point.x, point.y);
                            ctx.restore();
                        }
                    });
                });
            }
        }]
    });
}

// Helper para generar una clave única de cache según los filtros
function getCacheKey(filters) {
    return `creatComplet_${filters.year}_${filters.month}_${filters.day}`;
}

// Helper para guardar en cache con timestamp (usa localStorage)
function setCache(key, data) {
    localStorage.setItem(key, JSON.stringify({
        data,
        ts: Date.now()
    }));
}

// Helper para obtener del cache y validar tiempo (ej: 5 minutos)
function getCache(key, maxAgeMs = 5 * 60 * 1000) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
        const obj = JSON.parse(raw);
        if (Date.now() - obj.ts < maxAgeMs) {
            return obj.data;
        }
    } catch { }
    return null;
}

// Modifica fetchAndSetData para usar cache
async function fetchAndSetData(filters) {
    const cacheKey = getCacheKey(filters);
    let data = getCache(cacheKey);
    if (data) {
        globalData = data;
        globalLabels = data.map(d => d.date);
        globalCreadas = data.map(d => d.creadas);
        globalCompletadas = data.map(d => d.completadas);
        return;
    }

    let params = [];
    if (filters.year) params.push(`year=${filters.year}`);
    if (filters.month !== undefined && filters.month !== null && filters.month !== '') params.push(`month=${filters.month}`);
    if (filters.day !== undefined && filters.day !== null && filters.day !== '') params.push(`day=${filters.day}`);
    let url = '/api/dashboard/creadas-vs-completadas' + (params.length ? `?${params.join('&')}` : '');

    try {
        let res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("Error al obtener datos");
        data = await res.json();

        // Actualiza los arrays globales
        globalData = data;
        globalLabels = data.map(d => d.date);
        globalCreadas = data.map(d => d.creadas);
        globalCompletadas = data.map(d => d.completadas);

        // Guarda en cache
        setCache(cacheKey, data);
    } catch (e) {
        globalData = [];
        globalLabels = [];
        globalCreadas = [];
        globalCompletadas = [];
    }
}

// Inicialización: solo una vez al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    if (initialized) return;
    initialized = true;

    // Por defecto: mes y año actual
    const now = new Date();
    globalFilters.year = now.getFullYear();
    globalFilters.month = now.getMonth();
    globalFilters.day = null;

    await fetchAndSetData(globalFilters);
    renderChart();
});

// Solo escucha el evento de calendar:change después de la carga inicial
window.addEventListener('calendar:change', async (e) => {
    const { year, month, day } = e.detail;
    globalFilters.year = year;
    globalFilters.month = month;
    globalFilters.day = day;
    await fetchAndSetData(globalFilters);
    renderChart();
});
