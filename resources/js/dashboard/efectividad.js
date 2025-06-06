// Variables globales para mantener el estado
window.EfectividadState = {
    efectividad: 0,
    total: 0,
    efectivos: 0,
    lastParams: { year: null, month: null, day: null }
};

// Utilidad para obtener el contenedor principal y subcontenedores
function getDashboardContainers() {
    const topsDiv = document.getElementById('dashboard-tops');
    if (!topsDiv) return {};
    // Limpia el contenedor antes de agregar los subelementos para evitar espacios/residuos
    topsDiv.innerHTML = '';
    let gaugeDiv = document.createElement('div');
    gaugeDiv.id = 'efectividad-gauge';
    gaugeDiv.className = 'w-full';
    topsDiv.appendChild(gaugeDiv);

    let infoDiv = document.createElement('div');
    infoDiv.id = 'efectividad-info';
    infoDiv.className = 'text-center mt-4 text-base font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg py-2 px-4 shadow border border-gray-200 dark:border-gray-700';
    topsDiv.appendChild(infoDiv);

    return { topsDiv, gaugeDiv, infoDiv };
}

// Renderiza el gauge y la información de efectividad
function renderGaugeEfectividad() {
    if (typeof Highcharts === 'undefined') {
        const { topsDiv } = getDashboardContainers();
        if (topsDiv) {
            topsDiv.innerHTML = `
                <div class="text-center p-4 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 shadow">
                    <span class="font-bold">Error:</span> Highcharts no está cargado.<br>
                    <span class="text-sm">Asegúrate de incluir la librería Highcharts antes de este script.</span>
                </div>
            `;
        }
        return;
    }

    const { gaugeDiv, infoDiv } = getDashboardContainers();
    if (!gaugeDiv || !infoDiv) return;

    // Limpia solo el gauge antes de renderizar
    gaugeDiv.innerHTML = '';

    // Tema dark/light
    const isDark = document.documentElement.classList.contains('dark');
    const chartBg = isDark ? '#1e293b' : '#fff';
    const textColor = isDark ? '#f1f5f9' : '#1e293b';

    Highcharts.chart(gaugeDiv.id, {
        chart: {
            type: 'gauge',
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false,
            height: '80%',
            backgroundColor: chartBg
        },
        title: {
            text: 'Efectividad de Atención',
            style: {
                color: textColor,
                fontWeight: 'bold'
            }
        },
        pane: {
            startAngle: -90,
            endAngle: 89.9,
            background: null,
            center: ['50%', '75%'],
            size: '110%'
        },
        yAxis: {
            min: 0,
            max: 100,
            tickPixelInterval: 72,
            tickPosition: 'inside',
            tickColor: chartBg,
            tickLength: 20,
            tickWidth: 2,
            minorTickInterval: null,
            labels: {
                distance: 20,
                style: {
                    fontSize: '14px',
                    color: textColor
                }
            },
            lineWidth: 0,
            plotBands: [{
                    from: 0,
                    to: 70,
                    color: '#DF5353',
                    thickness: 20,
                    borderRadius: '50%'
                },
                {
                    from: 70,
                    to: 90,
                    color: '#DDDF0D',
                    thickness: 20
                },
                {
                    from: 90,
                    to: 100,
                    color: '#55BF3B',
                    thickness: 20,
                    borderRadius: '50%'
                }
            ]
        },
        series: [{
            name: 'Efectividad',
            data: [window.EfectividadState.efectividad],
            tooltip: {
                valueSuffix: ' %'
            },
            dataLabels: {
                format: '{y} %',
                borderWidth: 0,
                color: textColor,
                style: {
                    fontSize: '16px',
                    color: textColor
                }
            },
            dial: {
                radius: '80%',
                backgroundColor: isDark ? '#64748b' : 'gray',
                baseWidth: 12,
                baseLength: '0%',
                rearLength: '0%'
            },
            pivot: {
                backgroundColor: isDark ? '#64748b' : 'gray',
                radius: 6
            }
        }],
        credits: {
            enabled: false
        }
    });

    // Actualiza solo la info
    infoDiv.innerHTML = `
        <span class="text-gray-600 dark:text-gray-300">Tickets efectivos:</span>
        <b class="text-emerald-600 dark:text-emerald-400">${window.EfectividadState.efectivos}</b>
        <span class="text-gray-400 dark:text-gray-500">/</span>
        <b class="text-blue-600 dark:text-blue-400">${window.EfectividadState.total}</b>
    `;
}

// Obtiene y actualiza la efectividad desde el backend
async function fetchAndUpdateEfectividad(params) {
    console.log('[Efectividad] fetchAndUpdateEfectividad params:', params);
    // Limpiar el estado previo antes de pedir nuevos datos
    window.EfectividadState.efectividad = 0;
    window.EfectividadState.total = 0;
    window.EfectividadState.efectivos = 0;
    window.EfectividadState.lastParams = {...params };
    renderGaugeEfectividad(); // Limpia el gauge mientras carga

    try {
        const urlParams = new URLSearchParams();
        if (params.year) urlParams.append('year', params.year);
        if (params.month !== undefined && params.month !== null) urlParams.append('month', params.month);
        if (params.day) urlParams.append('day', params.day);

        const res = await fetch(`/dashboard/efectividad?${urlParams.toString()}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error('Error al obtener datos de efectividad');
        const data = await res.json();

        // Actualiza el estado global
        window.EfectividadState.efectividad = Number(data.efectividad) || 0;
        window.EfectividadState.total = Number(data.total) || 0;
        window.EfectividadState.efectivos = Number(data.efectivos) || 0;

        renderGaugeEfectividad();
    } catch (err) {
        const { topsDiv } = getDashboardContainers();
        if (topsDiv) {
            topsDiv.innerHTML = `
                <div class="text-center p-4 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 shadow">
                    <span class="font-bold">Error:</span> No se pudo cargar la efectividad.<br>
                    <span class="text-sm">${err.message}</span>
                </div>
            `;
        }
    }
}

// Escucha el evento de cambio de calendario y actualiza la efectividad
window.addEventListener('calendar:change', (e) => {
    const detail = e.detail || {};
    console.log('[Efectividad] calendar:change', detail);
    fetchAndUpdateEfectividad({
        year: detail.year,
        month: detail.month,
        day: detail.day || null
    });
});

// Render inicial al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    fetchAndUpdateEfectividad({
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        day: null
    });
});