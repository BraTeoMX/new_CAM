// Asegúrate de que Highcharts esté cargado globalmente

function renderGaugeEfectividad(efectividad, total, efectivos) {
    if (typeof Highcharts === 'undefined') {
        // Mostrar mensaje de error en el dashboard con estilos Tailwind y soporte dark
        const topsDiv = document.getElementById('dashboard-tops');
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

    // Detectar si el tema es dark usando Tailwind (clase 'dark' en <html>)
    const isDark = document.documentElement.classList.contains('dark');
    const chartBg = isDark ? '#1e293b' : '#fff'; // slate-800 para dark, blanco para light
    const textColor = isDark ? '#f1f5f9' : '#1e293b'; // slate-100 para dark, slate-800 para light

    Highcharts.chart('dashboard-tops', {
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
            plotBands: [
                {
                    from: 0,
                    to: 70,
                    color: '#DF5353', // rojo
                    thickness: 20,
                    borderRadius: '50%'
                },
                {
                    from: 70,
                    to: 90,
                    color: '#DDDF0D', // amarillo
                    thickness: 20
                },
                {
                    from: 90,
                    to: 100,
                    color: '#55BF3B', // verde
                    thickness: 20,
                    borderRadius: '50%'
                }
            ]
        },
        series: [{
            name: 'Efectividad',
            data: [efectividad],
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
                backgroundColor: isDark ? '#64748b' : 'gray', // slate-400 para dark
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

    // Puedes mostrar info adicional debajo del gauge si lo deseas
    const topsDiv = document.getElementById('dashboard-tops');
    let info = document.getElementById('efectividad-info');
    if (!info) {
        info = document.createElement('div');
        info.id = 'efectividad-info';
        info.className = 'text-center mt-4 text-base font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg py-2 px-4 shadow border border-gray-200 dark:border-gray-700';
        topsDiv.appendChild(info);
    }
    info.innerHTML = `
        <span class="text-gray-600 dark:text-gray-300">Tickets efectivos:</span>
        <b class="text-emerald-600 dark:text-emerald-400">${efectivos}</b>
        <span class="text-gray-400 dark:text-gray-500">/</span>
        <b class="text-blue-600 dark:text-blue-400">${total}</b>
    `;
}

async function fetchAndRenderEfectividad({ year, month, day }) {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month !== undefined && month !== null) params.append('month', month);
    if (day) params.append('day', day);

    const res = await fetch(`/dashboard/efectividad?${params.toString()}`);
    const data = await res.json();
    renderGaugeEfectividad(data.efectividad, data.total, data.efectivos);
}

// Escuchar el evento de filtros
window.addEventListener('calendar:change', (e) => {
    const detail = e.detail || {};
    fetchAndRenderEfectividad(detail);
});

// Render inicial por si acaso
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderEfectividad({
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        day: null
    });
});
