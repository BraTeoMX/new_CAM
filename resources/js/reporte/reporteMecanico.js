import { copyTableToClipboard, saveTableAsExcel, saveTableAsPDF } from './excellPDF';

// =================================================================================
// SECCIÓN 1: VARIABLES GLOBALES Y ELEMENTOS DEL DOM
// =================================================================================

let dataArray = []; // Almacenará los datos de la API (del array 'global')
let currentDateRange = { start: '', end: '' }; // Para mostrar en KPIs
const tableId = 'ordenTrabajoTable';
const kpiTableId = 'kpiTable';

// --- PAGINACIÓN ---
const ROWS_PER_PAGE = 100;
let currentPage = 1;
let paginatedData = [];

// --- FILTRO Y ORDENAMIENTO ---
// CORREGIDO: Se ajustan los nombres para coincidir con los IDs únicos del HTML
let filterValues = {
    planta: '',
    folio: '',
    modulo: '',
    supervisor: '',
    op: '',
    nombre: '',
    problema: '',
    fecha_creacion: '',
    hora_paro: '',
    hora_termino: '',
    total_min: '',
    minutos_reales: '', // NUEVO
    minutos_bahia: '',  // NUEVO
    id_maquina: '',
    tipo_maquina: '',
    mecanico: '',
    codigo_falla: '',
    causa: '',
    accion: '',
    encuesta: ''
};
let sortColumn = null;
let sortDirection = 'asc';

// --- ELEMENTOS DEL DOM ---
const fechaInicioInput = document.getElementById('fecha_inicio');
const fechaFinInput = document.getElementById('fecha_fin');
const copyBtn = document.getElementById('copy-table-btn');
const saveBtn = document.getElementById('save-table-btn');
const saveModal = document.getElementById('save-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const downloadExcelBtn = document.getElementById('download-excel-btn');
const downloadPdfBtn = document.getElementById('download-pdf-btn');

// =================================================================================
// SECCIÓN 2: LÓGICA DE FECHAS Y PETICIÓN A LA API (fetchData)
// =================================================================================

/**
 * Realiza una petición a la API con un rango de fechas específico.
 * @param {string} startDate - Fecha de inicio en formato YYYY-MM-DD
 * @param {string} endDate - Fecha de fin en formato YYYY-MM-DD
 */
const fetchData = async (startDate, endDate) => {
    try {
        const url = `/reportesMecanicos/obtenerDetallesTickets?startDate=${startDate}&endDate=${endDate}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        dataArray = data.global || [];

        // Actualizar rango de fechas actual
        currentDateRange = { start: startDate, end: endDate };

        currentPage = 1;
        const filtered = getFilteredSortedData();
        displayDataInTable(filtered);
        renderPagination(filtered.length, currentPage);

        // Calcular y mostrar KPIs
        const kpis = calculateKPIs(filtered);
        displayKPITable(kpis);

    } catch (error) {
        console.error('Error fetching data:', error);
        alert('No se pudieron cargar los datos. Por favor, revisa la consola para más detalles.');
        dataArray = [];
        displayDataInTable([]);
        renderPagination(0, 1);
    }
};

/**
 * Devuelve las clases de color de Tailwind CSS según el valor de la encuesta.
 * @param {number} valor - El valor numérico de la encuesta (1, 2, 3, 4).
 * @returns {string} Las clases de CSS para el color del texto.
 */
const getColorForEncuesta = (valor) => {
    switch (valor) {
        case 4:
            return 'text-green-700 dark:text-green-400'; // Excelente
        case 3:
            return 'text-blue-700 dark:text-blue-400';   // Bueno
        case 2:
            return 'text-yellow-700 dark:text-yellow-400';// Regular
        case 1:
            return 'text-red-700 dark:text-red-400';     // Malo
        default:
            return 'text-gray-500 dark:text-gray-300'; // No calificado
    }
};

/**
 * Calcula los KPIs basados en los datos filtrados
 * @param {Array} data - Datos filtrados
 * @returns {Object} KPIs calculados por planta y globales
 */
const calculateKPIs = (data) => {
    try {
        if (!data || data.length === 0) {
            return {
                ixtlahuaca: getEmptyKPIs(),
                sanBartolo: getEmptyKPIs(),
                global: getEmptyKPIs()
            };
        }

        // Separar datos por planta
        const ixtlahuacaData = data.filter(item => item.planta === 'Ixtlahuaca');
        const sanBartoloData = data.filter(item => item.planta === 'San Bartolo');

        return {
            ixtlahuaca: calculatePlantKPIs(ixtlahuacaData),
            sanBartolo: calculatePlantKPIs(sanBartoloData),
            global: calculatePlantKPIs(data)
        };
    } catch (error) {
        console.error('Error calculating KPIs:', error);
        return {
            ixtlahuaca: getEmptyKPIs(),
            sanBartolo: getEmptyKPIs(),
            global: getEmptyKPIs()
        };
    }
};

/**
 * Calcula KPIs para una planta específica
 * @param {Array} plantData - Datos de una planta
 * @returns {Object} KPIs calculados
 */
const calculatePlantKPIs = (plantData) => {
    if (!plantData || plantData.length === 0) {
        return getEmptyKPIs();
    }

    const totalTickets = plantData.length;

    // Calcular tiempos
    const tiemposNetos = plantData.map(item => parseFloat(item.minutos_netos_decimal) || 0);
    const tiemposTotales = plantData.map(item => {
        const tiempoTotal = item.tiempo_total || '';
        const match = tiempoTotal.match(/(\d+)\s*min\s*(\d+)\s*seg/);
        return match ? parseInt(match[1]) + (parseInt(match[2]) / 60) : 0;
    });

    const totalTiempoNeto = tiemposNetos.reduce((sum, tiempo) => sum + tiempo, 0);
    const totalTiempoTotal = tiemposTotales.reduce((sum, tiempo) => sum + tiempo, 0);

    const promedioTiempoNeto = totalTickets > 0 ? totalTiempoNeto / totalTickets : 0;
    const promedioTiempoTotal = totalTickets > 0 ? totalTiempoTotal / totalTickets : 0;

    // Eficiencia (tiempo neto vs total)
    const eficiencia = totalTiempoTotal > 0 ? (totalTiempoNeto / totalTiempoTotal) * 100 : 0;

    // Tasa de satisfacción
    const encuestasValidas = plantData.filter(item => item.valor_encuesta && item.valor_encuesta >= 1 && item.valor_encuesta <= 4);
    const promedioEncuesta = encuestasValidas.length > 0
        ? encuestasValidas.reduce((sum, item) => sum + item.valor_encuesta, 0) / encuestasValidas.length
        : 0;
    const tasaSatisfaccion = promedioEncuesta > 0 ? (promedioEncuesta / 4) * 100 : 0;

    // Mecánicos únicos
    const mecanicosUnicos = new Set(plantData.map(item => item.mecanico_nombre).filter(Boolean));
    const totalMecanicos = mecanicosUnicos.size;

    // Máquinas únicas
    const maquinasUnicas = new Set(plantData.map(item => item.numero_maquina).filter(Boolean));
    const totalMaquinas = maquinasUnicas.size;

    // Fallas más comunes (top 3)
    const fallasCount = {};
    plantData.forEach(item => {
        const falla = item.falla || 'Sin especificar';
        fallasCount[falla] = (fallasCount[falla] || 0) + 1;
    });
    const topFallas = Object.entries(fallasCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([falla, count]) => `• ${falla} (${count})`)
        .join('\n');

    return {
        totalTickets,
        promedioTiempoNeto: Math.round(promedioTiempoNeto * 100) / 100,
        promedioTiempoTotal: Math.round(promedioTiempoTotal * 100) / 100,
        eficiencia: Math.round(eficiencia * 100) / 100,
        tasaSatisfaccion: Math.round(tasaSatisfaccion * 100) / 100,
        totalMecanicos,
        totalMaquinas,
        topFallas: topFallas || 'Sin datos'
    };
};

/**
 * Retorna KPIs vacíos para casos sin datos
 * @returns {Object} KPIs con valores por defecto
 */
const getEmptyKPIs = () => ({
    totalTickets: 0,
    promedioTiempoNeto: 0,
    promedioTiempoTotal: 0,
    eficiencia: 0,
    tasaSatisfaccion: 0,
    totalMecanicos: 0,
    totalMaquinas: 0,
    topFallas: 'Sin datos'
});

/**
 * Maneja los eventos de cambio en los inputs de fecha y aplica validaciones.
 */
const handleDateChange = () => {
    const startDate = fechaInicioInput.value;
    const endDate = fechaFinInput.value;

    if (!startDate || !endDate) {
        return;
    }

    if (startDate > endDate) {
        alert('Error: La fecha de inicio no puede ser posterior a la fecha de fin.');
        fechaInicioInput.value = endDate;
        return;
    }

    fetchData(startDate, endDate);
};

const getSortValue = (item, col) => {
    switch (col) {
        case 'planta': return item.planta ?? '';
        case 'folio': return item.folio ?? '';
        case 'modulo': return item.modulo ?? '';
        case 'supervisor': return item.supervisor ?? '';
        case 'op': return item.operario_num_empleado ?? '';
        case 'nombre': return item.nombre_operario ?? '';
        case 'problema': return item.tipo_problema ?? '';
        case 'fecha_creacion': return item.fecha_creacion ?? '';
        case 'hora_paro': return item.hora_inicio_diagnostico ?? '';
        case 'hora_termino': return item.hora_final_diagnostico ?? '';
        case 'total_min': return item.tiempo_total ?? '';
        case 'minutos_reales': return item.tiempo_neto_formateado ?? '';
        case 'minutos_bahia': return item.tiempo_total_bahia_formateado ?? '';
        case 'id_maquina': return item.numero_maquina ?? '';
        case 'tipo_maquina': return item.clase_maquina ?? '';
        case 'mecanico': return item.mecanico_nombre ?? '';
        case 'codigo_falla': return item.falla ?? '';
        case 'causa': return item.causa ?? '';
        case 'accion': return item.accion ?? '';
        case 'encuesta': return item.encuesta ?? '';
        default:
            return (item[col] ?? '').toString();
    }
};

/**
 * Filtra y ordena los datos basándose en los valores de los filtros y la columna de ordenamiento.
 */
const getFilteredSortedData = () => {
    let filtered = dataArray.filter(item => {
        // SOLUCIÓN PUNTO 1: Filtro de Hora Paro y Hora Término (string includes)
        // Esta lógica permite buscar cualquier parte de la hora, ej: "14:", ":30", o "14:30:15"
        const matchesHoraParo = !filterValues.hora_paro || (item.hora_inicio_diagnostico ?? '').includes(filterValues.hora_paro);
        const matchesHoraTermino = !filterValues.hora_termino || (item.hora_final_diagnostico ?? '').includes(filterValues.hora_termino);

        // SOLUCIÓN PUNTO 2: Filtro numérico para minutos
        // Compara el inicio del valor numérico, permitiendo buscar "1" y encontrar "10", "15", etc.
        const matchesTotalMin = !filterValues.total_min ||
            (item.tiempo_total ?? '').toLowerCase().includes(filterValues.total_min.toLowerCase());

        const matchesMinutosReales = !filterValues.minutos_reales ||
            (item.tiempo_neto_formateado ?? '').toLowerCase().includes(filterValues.minutos_reales.toLowerCase());

        const matchesMinutosBahia = !filterValues.minutos_bahia ||
            (item.tiempo_total_bahia_formateado ?? '').toLowerCase().includes(filterValues.minutos_bahia.toLowerCase());

        // SOLUCIÓN PUNTO 3: La lógica de filtro aquí siempre fue correcta. El problema estaba en el display.
        const matchesIdMaquina = !filterValues.id_maquina || (item.numero_maquina ?? '').toLowerCase().includes(filterValues.id_maquina.toLowerCase());
        const matchesTipoMaquina = !filterValues.tipo_maquina || (item.clase_maquina ?? '').toLowerCase().includes(filterValues.tipo_maquina.toLowerCase());

        // Otros filtros existentes
        const matchesPlanta = !filterValues.planta || (item.planta ?? '').toLowerCase().includes(filterValues.planta.toLowerCase());
        const matchesFolio = !filterValues.folio || (item.folio ?? '').toString().toLowerCase().includes(filterValues.folio.toLowerCase());
        const matchesModulo = !filterValues.modulo || (item.modulo ?? '').toLowerCase().includes(filterValues.modulo.toLowerCase());
        const matchesSupervisor = !filterValues.supervisor || (item.supervisor ?? '').toLowerCase().includes(filterValues.supervisor.toLowerCase());
        const matchesOp = !filterValues.op || (item.operario_num_empleado ?? '').toLowerCase().includes(filterValues.op.toLowerCase());
        const matchesNombre = !filterValues.nombre || (item.nombre_operario ?? '').toLowerCase().includes(filterValues.nombre.toLowerCase());
        const matchesProblema = !filterValues.problema || (item.tipo_problema ?? '').toLowerCase().includes(filterValues.problema.toLowerCase());
        const matchesFechaCreacion = !filterValues.fecha_creacion || (item.fecha_creacion ?? '').includes(filterValues.fecha_creacion);
        const matchesMecanico = !filterValues.mecanico || (item.mecanico_nombre ?? '').toLowerCase().includes(filterValues.mecanico.toLowerCase());
        const matchesCodigoFalla = !filterValues.codigo_falla || (item.falla ?? '').toLowerCase().includes(filterValues.codigo_falla.toLowerCase());
        const matchesCausa = !filterValues.causa || (item.causa ?? '').toLowerCase().includes(filterValues.causa.toLowerCase());
        const matchesAccion = !filterValues.accion || (item.accion ?? '').toLowerCase().includes(filterValues.accion.toLowerCase());
        const matchesEncuesta = !filterValues.encuesta || (item.encuesta ?? '').toLowerCase().includes(filterValues.encuesta.toLowerCase());

        return matchesPlanta && matchesFolio && matchesModulo && matchesSupervisor &&
            matchesOp && matchesNombre && matchesProblema && matchesFechaCreacion && matchesHoraParo &&
            matchesHoraTermino && matchesTotalMin && matchesMinutosReales && matchesMinutosBahia &&
            matchesIdMaquina && matchesTipoMaquina && matchesMecanico &&
            matchesCodigoFalla && matchesCausa && matchesAccion && matchesEncuesta;
    });

    if (sortColumn) {
        filtered.sort((a, b) => {
            let va = getSortValue(a, sortColumn);
            let vb = getSortValue(b, sortColumn);

            // Handle numeric sorting for time fields
            if (sortColumn === 'total_min' || sortColumn === 'minutos_reales' || sortColumn === 'minutos_bahia') {
                const numA = parseFloat(va.toString().replace(/[^\d.]/g, '')) || 0;
                const numB = parseFloat(vb.toString().replace(/[^\d.]/g, '')) || 0;
                return sortDirection === 'asc' ? numA - numB : numB - numA;
            }

            // Handle date-time sorting
            if (sortColumn === 'hora_paro' || sortColumn === 'hora_termino' || sortColumn === 'fecha_creacion') {
                const dateA = new Date(va.toString().replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'));
                const dateB = new Date(vb.toString().replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'));
                if (!isNaN(dateA) && !isNaN(dateB)) {
                    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
                }
            }

            // Default string sorting
            va = (va ?? '').toString().toLowerCase();
            vb = (vb ?? '').toString().toLowerCase();

            if (va < vb) return sortDirection === 'asc' ? -1 : 1;
            if (va > vb) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }
    return filtered;
};

/**
 * Muestra los datos en la tabla.
 */
const displayDataInTable = (data) => {
    paginatedData = data;
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
    const endIdx = startIdx + ROWS_PER_PAGE;
    const pageData = data.slice(startIdx, endIdx);

    pageData.forEach((item) => {
        const row = document.createElement('tr');
        row.className = "bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors";
        const encuestaColorClass = getColorForEncuesta(item.valor_encuesta);

        // SOLUCIÓN PUNTO 3: Se invirtieron las propiedades 'item.numero_maquina' y 'item.clase_maquina'
        // para que coincidan con el orden de los encabezados de la tabla (ID Máquina, luego Tipo Máquina).
        row.innerHTML = `
            <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${item.planta ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${item.folio ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.modulo ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.supervisor ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.operario_num_empleado ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.nombre_operario ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.tipo_problema ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-bold text-blue-700 dark:text-blue-400">${item.fecha_creacion ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-bold text-purple-700 dark:text-purple-400">${item.hora_inicio_diagnostico ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-green-700 dark:text-green-400">${item.hora_final_diagnostico ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-300">${item.tiempo_total ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-300">${item.tiempo_neto_formateado ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-300">${item.tiempo_total_bahia_formateado ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.numero_maquina ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.clase_maquina ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.mecanico_nombre ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-red-700 dark:text-red-400">${item.falla ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-yellow-700 dark:text-yellow-400">${item.causa ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.accion ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-bold ${encuestaColorClass}">
                ${item.encuesta ?? ''}
            </td>
        `;
        tbody.appendChild(row);
    });
};


const setPage = (page) => {
    currentPage = page;
    displayDataInTable(paginatedData);
    renderPagination(paginatedData.length, currentPage);
};

const renderPagination = (totalRows, page) => {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = `px-4 py-2 mx-1 rounded-md text-sm font-medium transition-colors ${i === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`;
        button.onclick = () => setPage(i);
        paginationContainer.appendChild(button);
    }
};

/**
 * Muestra la tabla de KPIs
 * @param {Object} kpis - KPIs calculados
 */
const displayKPITable = (kpis) => {
    try {
        const table = document.getElementById(kpiTableId);
        if (!table) return;

        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Actualizar rango de fechas en el título
        const dateRangeElement = document.getElementById('kpi-date-range');
        if (dateRangeElement) {
            const startFormatted = formatDateForDisplay(currentDateRange.start);
            const endFormatted = formatDateForDisplay(currentDateRange.end);
            dateRangeElement.textContent = `${startFormatted} - ${endFormatted}`;
        }

        // Definir las métricas a mostrar
        const metrics = [
            { key: 'totalTickets', label: 'Total de Tickets', format: 'number' },
            { key: 'promedioTiempoNeto', label: 'Tiempo Promedio Neto (min)', format: 'decimal' },
            { key: 'promedioTiempoTotal', label: 'Tiempo Promedio Total (min)', format: 'decimal' },
            { key: 'eficiencia', label: 'Eficiencia (%)', format: 'percentage' },
            { key: 'tasaSatisfaccion', label: 'Satisfacción (%)', format: 'percentage' },
            { key: 'totalMecanicos', label: 'Mecánicos Activos', format: 'number' },
            { key: 'totalMaquinas', label: 'Máquinas Atendidas', format: 'number' },
            { key: 'topFallas', label: 'Top 3 Fallas', format: 'text' }
        ];

        // Crear filas para cada métrica
        metrics.forEach(metric => {
            const row = document.createElement('tr');
            row.className = "bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors";

            const ixtValue = formatKPIValue(kpis.ixtlahuaca[metric.key], metric.format);
            const sanValue = formatKPIValue(kpis.sanBartolo[metric.key], metric.format);
            const globalValue = formatKPIValue(kpis.global[metric.key], metric.format);

            row.innerHTML = `
                <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white text-center">
                    ${metric.label}
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 text-center ${getKPIColorClass(metric.key, kpis.ixtlahuaca[metric.key])} ${metric.key === 'topFallas' ? 'whitespace-pre-line' : 'whitespace-nowrap'}">
                    ${ixtValue}
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 text-center ${getKPIColorClass(metric.key, kpis.sanBartolo[metric.key])} ${metric.key === 'topFallas' ? 'whitespace-pre-line' : 'whitespace-nowrap'}">
                    ${sanValue}
                </td>
                <td class="px-4 py-3 text-sm font-bold text-green-700 dark:text-green-400 text-center ${metric.key === 'topFallas' ? 'whitespace-pre-line' : 'whitespace-nowrap'}">
                    ${globalValue}
                </td>
            `;

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error displaying KPI table:', error);
    }
};

/**
 * Formatea valores KPI según el tipo
 * @param {*} value - Valor a formatear
 * @param {string} format - Tipo de formato
 * @returns {string} Valor formateado
 */
const formatKPIValue = (value, format) => {
    if (value === null || value === undefined || value === '') {
        return '0';
    }

    switch (format) {
        case 'number':
            return Number(value).toLocaleString();
        case 'decimal':
            return Number(value).toFixed(2);
        case 'percentage':
            return `${Number(value).toFixed(1)}%`;
        case 'text':
        default:
            return String(value);
    }
};

/**
 * Retorna clases de color para KPIs según su valor
 * @param {string} key - Clave de la métrica
 * @param {*} value - Valor de la métrica
 * @returns {string} Clases CSS
 */
const getKPIColorClass = (key, value) => {
    if (value === null || value === undefined || value === 0) {
        return 'text-gray-400';
    }

    switch (key) {
        case 'eficiencia':
        case 'tasaSatisfaccion':
            if (value >= 80) return 'text-green-600 dark:text-green-400';
            if (value >= 60) return 'text-yellow-600 dark:text-yellow-400';
            return 'text-red-600 dark:text-red-400';
        case 'promedioTiempoNeto':
        case 'promedioTiempoTotal':
            if (value < 20) return 'text-green-600 dark:text-green-400';
            if (value <= 25) return 'text-yellow-600 dark:text-yellow-400';
            return 'text-red-600 dark:text-red-400';
        default:
            return 'text-gray-700 dark:text-gray-200';
    }
};

/**
 * Formatea fecha para mostrar en el título KPI
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha formateada
 */
const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
        // Parsear manualmente para evitar problemas de zona horaria
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    } catch (error) {
        return dateString;
    }
};

// =================================================================================
// SECCIÓN 5: EVENT LISTENERS
// =================================================================================

if (copyBtn) { copyBtn.addEventListener('click', () => copyTableToClipboard(tableId)); }
if (saveBtn) { saveBtn.addEventListener('click', () => { if (saveModal) saveModal.classList.remove('hidden'); }); }
if (closeModalBtn) { closeModalBtn.addEventListener('click', () => { if (saveModal) saveModal.classList.add('hidden'); }); }
if (downloadExcelBtn) { downloadExcelBtn.addEventListener('click', () => { saveTableAsExcel(tableId, 'Reporte_Mecanicos'); if (saveModal) saveModal.classList.add('hidden'); }); }
if (downloadPdfBtn) { downloadPdfBtn.addEventListener('click', () => { saveTableAsPDF(tableId, 'Reporte_Mecanicos'); if (saveModal) saveModal.classList.add('hidden'); }); }

// CORREGIDO: Se añaden los nuevos IDs de los filtros de minutos
const filterIds = [
    'planta', 'folio', 'modulo', 'supervisor', 'op', 'nombre', 'problema',
    'fecha_creacion', 'hora_paro', 'hora_termino', 'total_min', 'minutos_reales', 'minutos_bahia',
    'id_maquina', 'tipo_maquina', 'mecanico', 'codigo_falla', 'causa', 'accion', 'encuesta'
];

filterIds.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('input', () => {
            filterValues[id] = input.value;
            currentPage = 1;
            const filtered = getFilteredSortedData();
            displayDataInTable(filtered);
            renderPagination(filtered.length, currentPage);

            // Actualizar KPIs en tiempo real con filtros aplicados
            const kpis = calculateKPIs(filtered);
            displayKPITable(kpis);
        });
    }
});

// El mapa de encabezados debe coincidir con el orden real de las columnas en el HTML
const headerMap = [
    { id: 'planta', idx: 0 },
    { id: 'folio', idx: 1 },
    { id: 'modulo', idx: 2 },
    { id: 'supervisor', idx: 3 },
    { id: 'op', idx: 4 },
    { id: 'nombre', idx: 5 },
    { id: 'problema', idx: 6 },
    { id: 'fecha_creacion', idx: 7 },
    { id: 'hora_paro', idx: 8 },
    { id: 'hora_termino', idx: 9 },
    { id: 'total_min', idx: 10 },
    { id: 'minutos_reales', idx: 11 },
    { id: 'minutos_bahia', idx: 12 },
    { id: 'id_maquina', idx: 13 },
    { id: 'tipo_maquina', idx: 14 },
    { id: 'mecanico', idx: 15 },
    { id: 'codigo_falla', idx: 16 },
    { id: 'causa', idx: 17 },
    { id: 'accion', idx: 18 },
    { id: 'encuesta', idx: 19 }
];


const addSortEvents = () => {
    const table = document.getElementById(tableId);
    if (!table) return;
    const ths = table.querySelectorAll('thead tr:first-child th');

    headerMap.forEach((col) => {
        const th = ths[col.idx];
        if (th) {
            th.classList.add('cursor-pointer', 'select-none');
            th.addEventListener('click', () => {
                if (sortColumn === col.id) {
                    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    sortColumn = col.id;
                    sortDirection = 'asc';
                }
                currentPage = 1;
                const filtered = getFilteredSortedData();
                displayDataInTable(filtered);
                renderPagination(filtered.length, currentPage);
            });
        }
    });
};

// =================================================================================
// SECCIÓN 6: FUNCIÓN PRINCIPAL Y EJECUCIÓN INICIAL
// =================================================================================

const main = () => {
    const hoy = new Date().toISOString().split('T')[0];
    fechaInicioInput.value = hoy;
    fechaFinInput.value = hoy;

    fechaInicioInput.max = hoy;
    fechaFinInput.max = hoy;

    fechaInicioInput.addEventListener('change', handleDateChange);
    fechaFinInput.addEventListener('change', handleDateChange);

    fetchData(hoy, hoy);
    addSortEvents();
};

document.addEventListener('DOMContentLoaded', main);