import * as d3 from "d3";

document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("dashboard-elemento1");
    if (!container) return;

    const STATUS_LIST = [
        'PENDIENTE',
        'ASIGNADO',
        'PROCESO',
        'ATENDIDO',
        'AUTONOMO',
        'CANCELADO',
        'FINALIZADO',
    ];

    const STATUS_CONFIG = {
        'PENDIENTE': {
            icon: '<span class="material-symbols-outlined text-orange-800 text-3xl">pending_actions</span>',
            color: "bg-orange-400 dark:bg-orange-500"
        },
        'ASIGNADO': {
            icon: '<span class="material-symbols-outlined text-blue-400 text-3xl">assignment_ind</span>',
            color: "bg-blue-400 dark:bg-blue-400"
        },
        'PROCESO': {
            icon: '<span class="material-symbols-outlined text-blue-800 text-3xl">av_timer</span>',
            color: "bg-blue-400 dark:bg-blue-500"
        },
        'ATENDIDO': {
            icon: '<span class="material-symbols-outlined text-indigo-800 text-3xl">preliminary</span>',
            color: "bg-indigo-400 dark:bg-indigo-500"
        },
        'AUTONOMO': {
            icon: '<span class="material-symbols-outlined text-green-800 text-3xl">smart_toy</span>',
            color: "bg-green-400 dark:bg-green-500"
        },
        'CANCELADO': {
            icon: '<span class="material-symbols-outlined text-red-800 text-3xl">dangerous</span>',
            color: "bg-red-400 dark:bg-red-500"
        },
        'FINALIZADO': {
            icon: '<span class="material-symbols-outlined text-cyan-800 text-3xl">fact_check</span>',
            color: "bg-cyan-400 dark:bg-cyan-500"
        }
    };

    function renderBarChart(data) {
        // Procesar datos
        const statusCounts = {};
        STATUS_LIST.forEach(status => statusCounts[status] = 0);
        data.forEach(item => {
            const status = (item.Status || "").toUpperCase();
            if (STATUS_LIST.includes(status)) {
                statusCounts[status]++;
            }
        });

        // Convertir a formato para el gráfico
        const chartData = Object.entries(statusCounts)
            .map(([key, value]) => ({
                key,
                value,
                color: STATUS_CONFIG[key].color,
                icon: STATUS_CONFIG[key].icon
            }))
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value);

        // Limpiar contenedor
        container.innerHTML = `
            <div class="relative w-full h-[400px]"
                 style="--marginTop: 10px; --marginRight: 35px; --marginBottom: 10px; --marginLeft: 45px;">
                <div class="absolute inset-0
                           h-[calc(100%-var(--marginTop)-var(--marginBottom))]
                           translate-y-[var(--marginTop)]
                           left-[var(--marginLeft)]
                           right-[var(--marginRight)]">
                    ${generateBars(chartData)}
                </div>
            </div>
        `;
    }

    function generateBars(data) {
        const height = 100;
        const barHeight = (height / data.length) * 0.85; // Slightly taller bars
        const gap = (height / data.length) * 0.15; // Smaller gaps

        const maxValue = Math.max(...data.map(d => d.value));
        const scale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([0, 100]);

        return data.map((d, i) => `
            <div class="absolute flex items-center w-full group"
                 style="top: ${i * (barHeight + gap)}%; height: ${barHeight}%">
                <div class="flex items-center justify-center w-8 h-8 -ml-10">
                    ${STATUS_CONFIG[d.key].icon}
                </div>
                <div class="relative flex items-center w-full h-full">
                    <div class="${STATUS_CONFIG[d.key].color} h-full rounded-r-lg transition-all duration-500 opacity-90 group-hover:opacity-100"
                         style="width: ${scale(d.value)}%">
                    </div>
                    <div class="absolute left-2 flex items-center gap-2">
                        <span class="text-xs font-medium text-white drop-shadow-sm">${d.key}</span>
                    </div>
                    <span class="absolute right-2 text-sm font-bold text-gray-700 dark:text-white">${d.value}</span>
                </div>
            </div>
        `).join('');
    }

    let dashboardData = null;
    function fetchAndRender() {
        fetch("/cardsAteOTs")
            .then((res) => res.json())
            .then((data) => {
                dashboardData = data;
                renderBarChart(dashboardData);
            })
            .catch(() => {
                container.innerHTML = '<div class="text-red-500 p-4">No se pudo cargar el dashboard.</div>';
            });
    }

    fetchAndRender();

    window.addEventListener("resize", () => {
        if (dashboardData) renderBarChart(dashboardData);
    });
});
