import { CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement } from 'chart.js';
Chart.register(CategoryScale, LinearScale, LineController, LineElement, PointElement);

// Variables globales (sin cambios)
let chartInstance = null;
let globalData = [];
let globalLabels = [];
let globalCreadas = [];
let globalCompletadas = [];
let globalFilters = { year: null, month: null, day: null };
let initialized = false; // Esta variable es CRUCIAL para cargar solo una vez

// --- Toda tu lógica de renderizado y fetch se mantiene igual ---
// ... (las funciones prepareContainer, renderKPIs, renderChart, getCacheKey, setCache, etc. no necesitan cambios)

// Función para limpiar y preparar el contenedor
function prepareContainer(container) {
    container.innerHTML = "";
    container.classList.add(
        "p-2", "rounded-lg", "bg-white", "dark:bg-zinc-900", "shadow", "border", "border-zinc-100", "dark:border-zinc-800"
    );
    container.style.minHeight = "280px";
    container.style.height = "auto";
    container.insertAdjacentHTML("beforeend", `<canvas id="creatCompletChart" height="290" style="max-height:350px;"></canvas>`);
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
                datalabels: false
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
                            ctx.fillStyle = (i === 0) ? '#a5b4fc' : '#6ee7b7';
                            ctx.strokeStyle = '#18181b';
                            ctx.lineWidth = 3;
                            ctx.beginPath();
                            ctx.arc(point.x, point.y, 13, 0, 2 * Math.PI);
                            ctx.fillStyle = '#18181b';
                            ctx.fill();
                            ctx.strokeStyle = (i === 0) ? '#a5b4fc' : '#6ee7b7';
                            ctx.lineWidth = 2;
                            ctx.stroke();
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

// Helper para guardar SIEMPRE los datos del mes corriente/reciente en una clave fija
function setCurrentMonthCache(data) {
    localStorage.setItem('creatComplet_current', JSON.stringify({
        data,
        ts: Date.now()
    }));
}

// Helper para obtener SIEMPRE los datos del mes corriente/reciente de la clave fija
function getCurrentMonthCache() {
    const raw = localStorage.getItem('creatComplet_current');
    if (!raw) return null;
    try {
        const obj = JSON.parse(raw);
        return obj.data;
    } catch { }
    return null;
}

// Función para obtener los filtros actuales del calendario
function getCurrentCalendarFilters() {
    const saved = localStorage.getItem('calendar_last_selection');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Modifica fetchAndSetData para sincronizar con el calendario
async function fetchAndSetData(filters) {
    filters = {
        year: filters.year || new Date().getFullYear(),
        month: filters.month !== undefined ? filters.month : new Date().getMonth(),
        day: filters.day || null
    };

    const cacheKey = getCacheKey(filters);
    let data = getCache(cacheKey);

    if (!data || filters.day !== null) {
        try {
            let params = [];
            if (filters.year) params.push(`year=${filters.year}`);
            if (filters.month !== undefined && filters.month !== null) params.push(`month=${filters.month}`);
            if (filters.day !== undefined && filters.day !== null) params.push(`day=${filters.day}`);
            let url = '/api/dashboard/creadas-vs-completadas' + (params.length ? `?${params.join('&')}` : '');

            let res = await fetch(url, { cache: "no-store" });
            if (!res.ok) throw new Error("Error al obtener datos");
            data = await res.json();

            if (Array.isArray(data) && data.length > 0) {
                if (!filters.day) {
                    setCache(cacheKey, data);
                    setCurrentMonthCache(data);
                }
            } else {
                throw new Error("No data received");
            }
        } catch (e) {
            console.error('Error fetching data:', e);
            if (!filters.day) {
                data = getCurrentMonthCache();
            }
        }
    }

    if (data && Array.isArray(data) && data.length > 0) {
        globalData = data;
        globalLabels = data.map(d => d.date);
        globalCreadas = data.map(d => d.creadas);
        globalCompletadas = data.map(d => d.completadas);
    } else {
        globalData = [];
        globalLabels = [];
        globalCreadas = [];
        globalCompletadas = [];
    }
}

// ===================================================================
// NUEVA LÓGICA DE INICIALIZACIÓN (LAZY LOADING)
// ===================================================================

/**
 * Esta función encapsula toda la lógica de inicialización y renderizado.
 * Se llamará solo cuando la gráfica sea visible.
 */
async function initializeAndRenderChart() {
    if (initialized) return; // Previene reinicialización
    initialized = true;

    // 1. Obtiene filtros iniciales
    const calendarFilters = getCurrentCalendarFilters();
    if (calendarFilters) {
        globalFilters = calendarFilters;
    } else {
        const now = new Date();
        globalFilters = {
            year: now.getFullYear(),
            month: now.getMonth(),
            day: null
        };
    }

    // 2. Carga los datos y renderiza la gráfica
    await fetchAndSetData(globalFilters);
    renderChart();

    // 3. Empieza a escuchar cambios del calendario SÓLO después de la inicialización
    window.addEventListener('calendar:change', async (e) => {
        const { year, month, day } = e.detail;
        globalFilters = { year, month, day };
        await fetchAndSetData(globalFilters);
        renderChart();
    });
}

// Evento principal que configura el Intersection Observer
document.addEventListener("DOMContentLoaded", () => {
    const chartContainer = document.querySelector("#creatComplet-container");

    // Si el contenedor no existe, no hacemos nada
    if (!chartContainer) {
        return;
    }

    // Opciones para el observer: se activará cuando el 10% del elemento sea visible
    const options = {
        root: null, // usa el viewport principal
        rootMargin: '0px',
        threshold: 0.1
    };

    // Creamos el observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Si el elemento está intersectando (es visible)
            if (entry.isIntersecting) {
                console.log("Chart container is visible, initializing chart...");
                // Llama a nuestra función de inicialización
                initializeAndRenderChart();
                // Una vez inicializado, deja de observar el elemento para ahorrar recursos
                observer.unobserve(chartContainer);
            }
        });
    }, options);

    // Ponemos al observer a vigilar nuestro contenedor
    observer.observe(chartContainer);
});
