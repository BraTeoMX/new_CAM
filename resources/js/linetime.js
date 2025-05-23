import * as d3 from "d3";

// Renderiza la línea de tiempo usando D3 y tooltips bonitos estilo Tailwind
function renderTimelineBarJS(data) {
    const container = document.getElementById('timeline-container');
    if (!container) return;
    container.innerHTML = '';

    // Helper para formatear fecha/hora
    const formatDate = (d) => new Date(d).toLocaleDateString();
    const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // --- NUEVO: Selects para filtrar ---
    // Obtener valores únicos de Mecanico y Modulo
    const mecanicos = [...new Set(data.map(item => item.Mecanico).filter(Boolean))];
    const modulos = [...new Set(data.map(item => item.Modulo).filter(Boolean))];

    // Crear contenedor de filtros si no existe
    let filterDiv = document.getElementById('timeline-filters');
    if (!filterDiv) {
        filterDiv = document.createElement('div');
        filterDiv.id = 'timeline-filters';
        filterDiv.className = "flex flex-wrap gap-4 mb-6 items-center";
        container.appendChild(filterDiv);
    } else {
        filterDiv.innerHTML = '';
    }

    // Select de Mecanico
    const selectMecanico = document.createElement('select');
    selectMecanico.className = "select2-mecanico border rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100";
    selectMecanico.innerHTML = `<option value="">Todos los Mecánicos</option>` +
        mecanicos.map(m => `<option value="${m}">${m}</option>`).join('');
    filterDiv.appendChild(selectMecanico);

    // Select de Modulo
    const selectModulo = document.createElement('select');
    selectModulo.className = "select2-modulo border rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100";
    selectModulo.innerHTML = `<option value="">Todos los Módulos</option>` +
        modulos.map(m => `<option value="${m}">${m}</option>`).join('');
    filterDiv.appendChild(selectModulo);

    // --- FIN NUEVO ---

    // Función para renderizar la línea de tiempo filtrada
    function renderFilteredTimeline() {
        // Limpiar todo menos los filtros
        container.querySelectorAll('.w-full.mb-8').forEach(el => el.remove());

        const filtroMecanico = selectMecanico.value;
        const filtroModulo = selectModulo.value;

        let filteredData = data;
        if (filtroMecanico) {
            filteredData = filteredData.filter(item => item.Mecanico === filtroMecanico);
        }
        if (filtroModulo) {
            filteredData = filteredData.filter(item => item.Modulo === filtroModulo);
        }

        // Definir helpers aquí para que estén disponibles en el scope de renderFilteredTimeline
        const formatDate = (d) => new Date(d).toLocaleDateString();
        const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        filteredData.forEach((item, idx) => {
            const start = new Date(item.AsignationCreated);
            const attention = new Date(item.FollowCreated);
            const end = item.TimeFin ? new Date(item.TimeFin) : attention;
            const total = end - start || 1;

            // TimeInicio
            let timeInicioDate = null;
            let timeInicioPos = null;
            if (item.TimeInicio) {
                const baseDate = new Date(item.FollowCreated);
                const [h, m] = item.TimeInicio.split(":");
                timeInicioDate = new Date(baseDate);
                timeInicioDate.setHours(Number(h), Number(m), 0, 0);
                timeInicioPos = ((timeInicioDate - start) / total);
            }

            const posStart = 0;
            const posAttention = ((attention - start) / total);
            const posEnd = 1;

            // SVG dimensions
            const width = 700;
            const height = 44; // antes 60, ahora más pequeño
            const margin = { left: 30, right: 30, top: 20, bottom: 20 }; // menos margen

            // Create wrapper div
            const wrapper = document.createElement('div');
            wrapper.className = "w-full mb-8";
            wrapper.innerHTML = `<div class="mb-2 text-sm font-semibold break-all text-left text-gray-800 dark:text-gray-100">Modulo: ${item.Modulo}</div>`;
            container.appendChild(wrapper);

            // Create SVG
            const svg = d3.create("svg")
                .attr("width", "100%")
                .attr("viewBox", `0 0 ${width} ${height}`)
                .classed("block", true);

            // Gradient bar
            svg.append("rect")
                .attr("x", margin.left)
                .attr("y", height / 2 - 4) // antes -6, ahora -4
                .attr("width", width - margin.left - margin.right)
                .attr("height", 8) // antes 12, ahora 8
                .attr("rx", 4) // antes 6, ahora 4
                .attr("fill", "url(#timeline-gradient)");

            // Define gradient: verde -> naranja -> rojo
            const defs = svg.append("defs");
            const gradient = defs.append("linearGradient")
                .attr("id", "timeline-gradient")
                .attr("x1", "0%").attr("x2", "100%")
                .attr("y1", "0%").attr("y2", "0%");
            gradient.append("stop").attr("offset", "0%").attr("stop-color", "#22c55e");   // verde
            gradient.append("stop").attr("offset", "60%").attr("stop-color", "#f59e42");  // naranja
            gradient.append("stop").attr("offset", "100%").attr("stop-color", "#ef4444"); // rojo

            // Helper for points
            function drawPoint(pos, color, label, date, tooltipExtra = "") {
                const x = margin.left + pos * (width - margin.left - margin.right);
                // Punto principal
                svg.append("circle")
                    .attr("cx", x)
                    .attr("cy", height / 2)
                    .attr("r", 8) // antes 12, ahora 8
                    .attr("fill", color)
                    .attr("stroke", "#374151")
                    .attr("stroke-width", 3) // antes 4, ahora 3
                    .attr("class", "timeline-point")
                    .attr("data-tooltip", `
                        <div class='font-bold mb-1 text-gray-800 dark:text-gray-100'>${label}</div>
                        <div class='text-xs mb-1 text-gray-800 dark:text-gray-100'>
                            <span class='font-semibold'>Fecha:</span> ${formatDate(date)}<br>
                            <span class='font-semibold'>Hora:</span> ${formatTime(date)}
                        </div>
                        <div class='text-gray-800 dark:text-gray-100'>${tooltipExtra}</div>
                    `);

                // Etiqueta de hora debajo
                svg.append("text")
                    .attr("x", x)
                    .attr("y", height / 2 + 18) // antes +30, ahora +18
                    .attr("text-anchor", "middle")
                    .attr("class", "fill-gray-800 dark:fill-gray-100 text-xs")
                    .text(formatTime(date));
            }

            // Tooltip extra info
            const tooltipExtra = `
                <div><span class='font-semibold'>Folio:</span> ${item.Folio}</div>
                <div><span class='font-semibold'>Módulo:</span> ${item.Modulo}</div>
                <div><span class='font-semibold'>Problema:</span> ${item.Problema}</div>
                <div><span class='font-semibold'>Máquina:</span> ${item.Maquina}</div>
                <div><span class='font-semibold'>Mecánico:</span> ${item.Mecanico}</div>
            `;

            // Draw points
            drawPoint(posStart, "#22c55e", "Inicio", item.AsignationCreated, tooltipExtra);

            // Nuevo: marca para la hora de inicio de atención (created_at de FollowAtention)
            // Calcula la posición relativa de la marca de inicio de atención
            const attentionMarkDate = item.TimeInicio ? new Date(item.TimeInicio) : null;
            let attentionMarkPos = null;
            if (item.TimeInicio) {
                // Si TimeInicio es una fecha/hora válida, calcula la posición
                attentionMarkPos = ((attentionMarkDate - start) / total);
                // Dibuja el punto de inicio de atención (puedes ajustar el color y label)
                drawPoint(attentionMarkPos, "#f59e42", "Inicio Atención", attentionMarkDate, tooltipExtra);
            }

            drawPoint(posAttention, "#3b82f6", "Atención", item.FollowCreated, tooltipExtra);
            if (timeInicioPos !== null && !isNaN(timeInicioPos)) {
                drawPoint(timeInicioPos, "#fde047", "TimeInicio", timeInicioDate, tooltipExtra);
            }
            drawPoint(posEnd, "#ef4444", "Fin", item.TimeFin ? item.TimeFin : item.FollowCreated, tooltipExtra);

            // Add SVG to wrapper
            wrapper.appendChild(svg.node());

            // Etiquetas de texto
            const labelDiv = document.createElement('div');
            labelDiv.className = "flex justify-between w-full min-w-[340px] mt-2 text-xs font-semibold text-gray-800 dark:text-gray-100";
            labelDiv.innerHTML = `
                <span>Inicio</span>
                <span>Fin</span>
            `;
            wrapper.appendChild(labelDiv);

            // Mostrar tiempo completo calculado
            if (typeof item.TiempoAtencionMin !== "undefined" && item.TiempoAtencionMin !== null) {
                let min = item.TiempoAtencionMin;
                let dias = Math.floor(min / 1440);
                min = min % 1440;
                let horas = Math.floor(min / 60);
                min = min % 60;
                let tiempoStr = [];
                if (dias > 0) tiempoStr.push(`${dias} día${dias > 1 ? 's' : ''}`);
                if (horas > 0) tiempoStr.push(`${horas} hora${horas > 1 ? 's' : ''}`);
                if (min > 0 || tiempoStr.length === 0) tiempoStr.push(`${min} min`);
                const tiempoDiv = document.createElement('div');
                tiempoDiv.className = "mt-2 text-center text-sm font-bold text-gray-800 dark:text-gray-100";
                tiempoDiv.innerText = `Tiempo completo: ${tiempoStr.join(' : ')}`;
                wrapper.appendChild(tiempoDiv);
            }
        });

        // Tooltips con D3 y Tailwind
        d3.selectAll(".timeline-point")
            .on("mouseenter", function (event) {
                const tooltipHtml = this.getAttribute("data-tooltip");
                let tooltip = d3.select("#d3-timeline-tooltip");
                if (tooltip.empty()) {
                    tooltip = d3.select("body").append("div")
                        .attr("id", "d3-timeline-tooltip")
                        .attr("class", "z-50 fixed pointer-events-none px-4 py-2 rounded-lg shadow-lg bg-gray-900 text-white text-xs")
                        .style("opacity", 0);
                }
                tooltip.html(tooltipHtml)
                    .style("opacity", 1)
                    .style("left", (event.clientX + 10) + "px")
                    .style("top", (event.clientY - 10) + "px");
            })
            .on("mousemove", function (event) {
                d3.select("#d3-timeline-tooltip")
                    .style("left", (event.clientX + 10) + "px")
                    .style("top", (event.clientY - 10) + "px");
            })
            .on("mouseleave", function () {
                d3.select("#d3-timeline-tooltip").style("opacity", 0);
            });
    }

    // Listeners para los filtros
    selectMecanico.addEventListener('change', renderFilteredTimeline);
    selectModulo.addEventListener('change', renderFilteredTimeline);

    // Render inicial
    renderFilteredTimeline();
}

// Reemplaza el renderizado anterior por el nuevo
async function fetchTimelineData() {
    try {
        const response = await fetch('/dashboard/timeline-data');
        const data = await response.json();
        renderTimelineBarJS(data);
    } catch (error) {
        console.error('Error al obtener la línea de tiempo:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchTimelineData);
