/**
 * Módulo para el Gauge de Efectividad del Dashboard.
 * Implementa Lazy Loading y una inicialización robusta anti-condiciones de carrera.
 */
const EfectividadGaugeModule = (function () {

    // --- ESTADO Y CONSTANTES PRIVADAS DEL MÓDULO ---
    const state = {
        isInitialized: false,
        container: null,
        gaugeDiv: null,
        infoDiv: null,
        efectividad: 0,
        total: 0,
        efectivos: 0,
    };

    // --- FUNCIONES DE UTILIDAD Y RENDERIZADO (PRIVADAS) ---
    function prepareContainers() {
        if (!state.container) return false;

        state.container.innerHTML = ''; // Limpia el contenedor de cualquier placeholder

        state.gaugeDiv = document.createElement('div');
        state.gaugeDiv.id = 'efectividad-gauge-inner';
        state.gaugeDiv.className = 'w-full';
        state.container.appendChild(state.gaugeDiv);

        state.infoDiv = document.createElement('div');
        state.infoDiv.id = 'efectividad-info-inner';
        state.infoDiv.className = 'text-center mt-4 text-base font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg py-2 px-4 shadow border border-gray-200 dark:border-gray-700';
        state.container.appendChild(state.infoDiv);

        return true;
    }

    function renderGauge() {
        if (typeof Highcharts === 'undefined') {
            if (state.container) {
                state.container.innerHTML = `<div class="text-center p-4 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 shadow"><span class="font-bold">Error:</span> Highcharts no está cargado.</div>`;
            }
            return;
        }

        if (!state.gaugeDiv || !state.infoDiv) return;

        const isDark = document.documentElement.classList.contains('dark');
        const chartBg = isDark ? '#1f2937' : '#ffffff'; // bg-gray-800 or bg-white
        const textColor = isDark ? '#f9fafb' : '#111827'; // text-gray-50 or text-gray-900

        Highcharts.chart(state.gaugeDiv.id, {
            chart: { type: 'gauge', plotBackgroundColor: null, plotBackgroundImage: null, plotBorderWidth: 0, plotShadow: false, height: '80%', backgroundColor: chartBg },
            title: { text: 'Efectividad de Atención', style: { color: textColor, fontWeight: 'bold' } },
            pane: { startAngle: -90, endAngle: 89.9, background: null, center: ['50%', '75%'], size: '110%' },
            yAxis: {
                min: 0, max: 100, tickPixelInterval: 72, tickPosition: 'inside',
                tickColor: chartBg, tickLength: 20, tickWidth: 2, minorTickInterval: null,
                labels: { distance: 20, style: { fontSize: '14px', color: textColor } },
                lineWidth: 0,
                plotBands: [
                    { from: 0, to: 70, color: '#DF5353', thickness: 20, borderRadius: '50%' },
                    { from: 70, to: 90, color: '#DDDF0D', thickness: 20 },
                    { from: 90, to: 100, color: '#55BF3B', thickness: 20, borderRadius: '50%' }
                ]
            },
            series: [{
                name: 'Efectividad',
                data: [state.efectividad],
                tooltip: { valueSuffix: ' %' },
                dataLabels: { format: '{y} %', borderWidth: 0, style: { fontSize: '16px', color: textColor } },
                dial: { radius: '80%', backgroundColor: isDark ? '#64748b' : 'gray', baseWidth: 12, baseLength: '0%', rearLength: '0%' },
                pivot: { backgroundColor: isDark ? '#64748b' : 'gray', radius: 6 }
            }],
            credits: { enabled: false }
        });

        state.infoDiv.innerHTML = `
            <span class="text-gray-600 dark:text-gray-300">Asignaciones efectivas:</span>
            <b class="text-emerald-600 dark:text-emerald-400">${state.efectivos}</b>
            <span class="text-gray-400 dark:text-gray-500">/</span>
            <b class="text-blue-600 dark:text-blue-400">${state.total}</b>`;
    }

    async function fetchAndUpdateEfectividad(params) {
        state.efectividad = 0; state.total = 0; state.efectivos = 0;
        renderGauge();

        try {
            const urlParams = new URLSearchParams();
            if (params.year) urlParams.append('year', params.year);
            if (params.month !== undefined && params.month !== null) urlParams.append('month', params.month);
            if (params.day) urlParams.append('day', params.day);

            const res = await fetch(`/dashboardV2/efectividad?${urlParams.toString()}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (!res.ok) throw new Error('Respuesta de red no fue exitosa');
            const data = await res.json();

            state.efectividad = Number(data.efectividad) || 0;
            state.total = Number(data.total) || 0;
            state.efectivos = Number(data.efectivos) || 0;

            renderGauge();
        } catch (err) {
            console.error("Efectividad Gauge: Failed to fetch data", err);
            if (state.container) {
                state.container.innerHTML = `<div class="text-center p-4 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 shadow"><span class="font-bold">Error:</span> No se pudo cargar la efectividad.</div>`;
            }
        }
    }

    // --- LÓGICA DE INICIALIZACIÓN (LAZY) ---
    async function initializeComponent() {
        if (state.isInitialized) return;
        state.isInitialized = true;

        if (!prepareContainers()) return;
        
        // --- INICIO DE LA LÓGICA CORREGIDA ---

        // 1. Nos suscribimos a futuros cambios de mes, por si el usuario interactúa.
        window.addEventListener('monthChanged', (e) => {
            const detail = e.detail || {};
            const selectedMonth = detail.month; // mes 1-12
            const monthForQuery = Number(selectedMonth) - 1; // mes 0-11
            
            fetchAndUpdateEfectividad({
                year: new Date().getFullYear(),
                month: monthForQuery,
            });
        });

        // 2. Buscamos el <select> para obtener el valor inicial directamente.
        //    Esto resuelve la condición de carrera.
        const monthSelect = document.getElementById('month-select');
        let initialMonth;

        if (monthSelect) {
            // Si encontramos el <select>, usamos su valor actual.
            initialMonth = monthSelect.value;
        } else {
            // Si no, como fallback, usamos el mes actual del sistema.
            initialMonth = new Date().getMonth() + 1; 
        }

        // 3. Realizamos la primera carga de datos con el valor obtenido.
        fetchAndUpdateEfectividad({
            year: new Date().getFullYear(),
            month: Number(initialMonth) - 1 // Convertir a 0-11 para la consulta
        });

        // 4. El listener para el cambio de tema (dark/light) se mantiene igual.
        new MutationObserver(() => {
            if (state.isInitialized) {
                renderGauge();
            }
        }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        
        // --- FIN DE LA LÓGICA CORREGIDA ---
    }

    // --- FUNCIÓN PÚBLICA DE INICIALIZACIÓN ---
    function init() {
        // Asegúrate que este es el ID del div que contiene tu gauge
        state.container = document.getElementById('dashboard-tops');
        if (!state.container) return;

        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initializeComponent();
                    observerInstance.unobserve(state.container);
                }
            });
        }, { threshold: 0.1 });
        observer.observe(state.container);
    }

    return {
        init: init
    };
})();

// --- PUNTO DE ENTRADA ÚNICO ---
document.addEventListener('DOMContentLoaded', EfectividadGaugeModule.init);