import Echo from "laravel-echo";
import Pusher from "pusher-js";

// --- Configuración de Echo/Pusher ---
window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    encrypted: true,
});


import * as d3 from "d3";

let elemento1Data = [];

async function cargarElemento1() {
    try {
        elemento1Data = await window.getCardsAteOTsData();
        // ...usa elemento1Data para renderizar tu componente...
        // Ejemplo: renderElemento1(elemento1Data);
    } catch (e) {
        console.error('Error cargando datos para elemento1:', e);
    }
}

document.addEventListener('DOMContentLoaded', cargarElemento1);

// Si necesitas actualizar por filtro, escucha el evento calendar:change
window.addEventListener('calendar:change', async (e) => {
    await cargarElemento1();
});

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

    // Gradientes tailwind para cada status
    const STATUS_CONFIG = {
        'PENDIENTE': {
            icon: '<span class="material-symbols-outlined text-red-800 text-3xl">pending_actions</span>',
            color: "from-red-300 to-red-400"
        },
        'ASIGNADO': {
            icon: '<span class="material-symbols-outlined text-blue-400 text-3xl">assignment_ind</span>',
            color: "from-blue-300 to-blue-400"
        },
        'PROCESO': {
            icon: '<span class="material-symbols-outlined text-yellow-800 text-3xl">av_timer</span>',
            color: "from-yellow-300 to-yellow-400"
        },
        'ATENDIDO': {
            icon: '<span class="material-symbols-outlined text-green-800 text-3xl">preliminary</span>',
            color: "from-green-300 to-green-400"
        },
        'AUTONOMO': {
            icon: '<span class="material-symbols-outlined text-violet-800 text-3xl">smart_toy</span>',
            color: "from-violet-300 to-violet-400"
        },
        'CANCELADO': {
            icon: '<span class="material-symbols-outlined text-orange-800 text-3xl">dangerous</span>',
            color: "from-orange-300 to-orange-400"
        },
        'FINALIZADO': {
            icon: '<span class="material-symbols-outlined text-blue-800 text-3xl">fact_check</span>',
            color: "from-blue-300 to-blue-400"
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

        // Escalas
        const maxValue = Math.max(...chartData.map(d => d.value), 1);
        const yScale = d3.scaleBand()
            .domain(chartData.map(d => d.key))
            .range([0, 100])
            .padding(0.175);

        const xScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([0, 100]);

        // Limpiar contenedor
        container.innerHTML = `
         <div class="flex text-2xl font-medium tracking-tight text-gray-950 dark:text-white">Conteo de status
                        de
                        tickets</div>
            <div class="relative w-full h-72"
                style="--marginTop:0px;--marginRight:0px;--marginBottom:16px;--marginLeft:60px;">
                <div class="absolute inset-0 z-10 h-[calc(100%-var(--marginTop)-var(--marginBottom))]
                    translate-y-[var(--marginTop)] w-[calc(100%-var(--marginLeft)-var(--marginRight))]
                    translate-x-[var(--marginLeft)] overflow-visible" id="bar-chart-area"></div>
                <div class="h-[calc(100%-var(--marginTop)-var(--marginBottom))]
                    w-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible" id="bar-chart-yaxis"></div>
            </div>
        `;

        const chartArea = container.querySelector("#bar-chart-area");
        const yAxisArea = container.querySelector("#bar-chart-yaxis");

        // Render Y axis (icon + label)
        chartData.forEach((entry, i) => {
            const y = yScale(entry.key) + yScale.bandwidth() / 2;
            const labelDiv = document.createElement("div");
            labelDiv.className = "absolute flex items-center gap-1 text-xs text-gray-400 -translate-y-1/2 w-full text-right";
            labelDiv.style.top = `${y}%`;
            labelDiv.style.left = "-8px";
            labelDiv.innerHTML = `<span>${entry.icon}</span><span>${entry.key}</span>`;
            yAxisArea.appendChild(labelDiv);
        });

        // Render bars
        chartData.forEach((d, index) => {
            const barWidth = xScale(d.value);
            const barHeight = yScale.bandwidth();
            const y = yScale(d.key);

            // Barra
            const bar = document.createElement("div");
            bar.className = `absolute bg-gradient-to-b ${d.color} group cursor-pointer transition-all duration-300`;
            bar.style.left = "0";
            bar.style.top = `${y}%`;
            bar.style.width = `${barWidth}%`;
            bar.style.height = `${barHeight}%`;
            bar.style.borderRadius = "0 8px 8px 0";

            // Tooltip
            bar.addEventListener("mouseenter", function (e) {
                let tooltip = document.getElementById("bar-tooltip");
                if (!tooltip) {
                    tooltip = document.createElement("div");
                    tooltip.id = "bar-tooltip";
                    tooltip.className = "fixed z-50 px-4 py-2 rounded-lg shadow-lg bg-gray-900 text-white text-xs pointer-events-none";
                    document.body.appendChild(tooltip);
                }
                tooltip.innerHTML = `
                    <div class="flex items-center gap-2 mb-1">${d.icon}<span class="font-bold">${d.key}</span></div>
                    <div class="text-gray-300 text-sm">Total: <span class="font-bold">${d.value}</span></div>
                `;
                tooltip.style.opacity = 1;
                tooltip.style.left = (e.clientX + 10) + "px";
                tooltip.style.top = (e.clientY - 10) + "px";
            });
            bar.addEventListener("mousemove", function (e) {
                const tooltip = document.getElementById("bar-tooltip");
                if (tooltip) {
                    tooltip.style.left = (e.clientX + 10) + "px";
                    tooltip.style.top = (e.clientY - 10) + "px";
                }
            });
            bar.addEventListener("mouseleave", function () {
                const tooltip = document.getElementById("bar-tooltip");
                if (tooltip) tooltip.style.opacity = 0;
            });

            chartArea.appendChild(bar);

            // Valor numérico al final de la barra
            const valueLabel = document.createElement("span");
            valueLabel.className = "absolute right-2 text-sm font-bold text-gray-900 dark:text-white";
            valueLabel.style.top = `${y + barHeight / 2}%`;
            valueLabel.style.transform = "translateY(-50%)";
            valueLabel.style.left = `${barWidth}%`;
            valueLabel.innerText = d.value;
            chartArea.appendChild(valueLabel);
        });

        // Render grid lines (SVG)
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "absolute h-full w-full pointer-events-none");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("preserveAspectRatio", "none");
        xScale.ticks(8).forEach((tick) => {
            const x = xScale(tick);
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x);
            line.setAttribute("x2", x);
            line.setAttribute("y1", "0");
            line.setAttribute("y2", "100");
            line.setAttribute("stroke", "#d1d5db");
            line.setAttribute("stroke-dasharray", "6,5");
            line.setAttribute("stroke-width", "0.5");
            svg.appendChild(line);
        });
        chartArea.appendChild(svg);

        // Render X axis values
        xScale.ticks(4).forEach((value) => {
            const x = xScale(value);
            const label = document.createElement("div");
            label.className = "absolute text-xs -translate-x-1/2 tabular-nums text-gray-400";
            label.style.left = `${x}%`;
            label.style.top = "100%";
            label.innerText = value;
            chartArea.appendChild(label);
        });
    }

    // --- FILTRO MES/AÑO/DÍA ---
    function getSelectedMonthYearDay() {
        const monthSelect = document.getElementById('calendar-month');
        const yearSelect = document.getElementById('calendar-year');
        const daySelect = document.getElementById('calendar-day');
        const month = monthSelect ? parseInt(monthSelect.value, 10) : (new Date()).getMonth();
        const year = yearSelect ? parseInt(yearSelect.value, 10) : (new Date()).getFullYear();
        const day = daySelect && daySelect.value ? parseInt(daySelect.value, 10) : null;
        return { month, year, day };
    }

    function filterByMonthYearDay(data, year, month, day) {
        return data.filter(item => {
            if (!item.created_at) return false;
            const date = new Date(item.created_at);
            if (date.getFullYear() !== year || date.getMonth() !== month) return false;
            if (day !== null && date.getDate() !== day) return false;
            return true;
        });
    }

    let dashboardData = null;
    function fetchAndRender() {
        window.getCardsAteOTsData()
            .then((data) => {
                dashboardData = data;
                const { month, year, day } = getSelectedMonthYearDay();
                const filtered = filterByMonthYearDay(dashboardData, year, month, day);
                renderBarChart(filtered);
            })
            .catch(() => {
                container.innerHTML = '<div class="text-red-500 p-4">No se pudo cargar el dashboard.</div>';
            });
    }

    fetchAndRender();

    // --- Escuchar eventos de Echo para actualizar el dashboard ---
    if (window.Echo) {
        window.Echo.channel("asignaciones-ot")
            .listen("AsignacionOTCreated", (e) => {
                // Forzar actualización y mapear SIN_ASIGNAR a ASIGNADO
                window.getCardsAteOTsData()
                    .then((data) => {
                        // Mapear status SIN_ASIGNAR a ASIGNADO
                        const mapped = data.map(item => {
                            if ((item.Status || item.status) === "SIN_ASIGNAR") {
                                return { ...item, Status: "ASIGNADO" };
                            }
                            return item;
                        });
                        dashboardData = mapped;
                        const { month, year, day } = getSelectedMonthYearDay();
                        const filtered = filterByMonthYearDay(dashboardData, year, month, day);
                        renderBarChart(filtered);
                    })
                    .catch(() => {
                        container.innerHTML = '<div class="text-red-500 p-4">No se pudo cargar el dashboard.</div>';
                    });
            })
            .listen("StatusOTUpdated", () => fetchAndRender());
    }

    window.addEventListener('calendar:change', () => {
        if (dashboardData) {
            const { month, year, day } = getSelectedMonthYearDay();
            const filtered = filterByMonthYearDay(dashboardData, year, month, day);
            renderBarChart(filtered);
        }
    });

    window.addEventListener("resize", () => {
        if (dashboardData) {
            const { month, year, day } = getSelectedMonthYearDay();
            const filtered = filterByMonthYearDay(dashboardData, year, month, day);
            renderBarChart(filtered);
        }
    });
});
