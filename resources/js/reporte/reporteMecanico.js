import { copyTableToClipboard, saveTableAsExcel, saveTableAsPDF } from './excellPDF';

// =================================================================================
// SECCIÓN 1: VARIABLES GLOBALES Y ELEMENTOS DEL DOM
// =================================================================================

let dataArray = []; // Almacenará los datos de la API (del array 'global')
const tableId = 'ordenTrabajoTable';

// --- PAGINACIÓN ---
const ROWS_PER_PAGE = 10;
let currentPage = 1;
let paginatedData = [];

// --- FILTRO Y ORDENAMIENTO ---
let filterValues = {
    planta: '',       // NUEVO: Filtro para la columna planta
    folio: '',
    modulo: '',
    supervisor: '',
    op: '',
    nombre: '',
    problema: '',
    hora_paro: '',
    hora_termino: '',
    total_min: '',
    id_maquina: '',
    tipo_maquina: '',
    mecanico: '',
    codigo_falla: '',
    causa: '',
    accion: ''
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
 * MODIFICADO: Realiza una petición a la API con un rango de fechas específico.
 * @param {string} startDate - Fecha de inicio en formato YYYY-MM-DD
 * @param {string} endDate - Fecha de fin en formato YYYY-MM-DD
 */
const fetchData = async (startDate, endDate) => {
    try {
        // MODIFICADO: La URL ahora incluye los parámetros de fecha dinámicamente.
        const url = `/reportesMecanicos/obtenerDetallesTickets?startDate=${startDate}&endDate=${endDate}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // MODIFICADO: Extraemos el array 'global' de la respuesta de la API.
        dataArray = data.global || [];

        // Refrescamos la tabla completa con los nuevos datos.
        currentPage = 1; // Reiniciamos a la primera página.
        const filtered = getFilteredSortedData();
        displayDataInTable(filtered);
        renderPagination(filtered.length, currentPage);

    } catch (error) {
        console.error('Error fetching data:', error);
        alert('No se pudieron cargar los datos. Por favor, revisa la consola para más detalles.');
        dataArray = []; // Limpiamos los datos en caso de error.
        displayDataInTable([]); // Mostramos la tabla vacía.
        renderPagination(0, 1);
    }
};

/**
 * NUEVO: Devuelve las clases de color de Tailwind CSS según el valor de la encuesta.
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
 * NUEVO: Maneja los eventos de cambio en los inputs de fecha y aplica validaciones.
 */
const handleDateChange = () => {
    const startDate = fechaInicioInput.value;
    const endDate = fechaFinInput.value;

    // Validación 1: Ambas fechas deben estar seleccionadas.
    if (!startDate || !endDate) {
        return;
    }

    // Validación 2: La fecha de inicio no puede ser mayor a la de fin.
    if (startDate > endDate) {
        alert('Error: La fecha de inicio no puede ser posterior a la fecha de fin.');
        // Opcional: Corregir automáticamente la fecha de inicio.
        fechaInicioInput.value = endDate;
        return;
    }

    // Si todo es válido, llamamos a fetchData con las nuevas fechas.
    fetchData(startDate, endDate);
};


// =================================================================================
// SECCIÓN 3: CÓDIGO ELIMINADO (SIMPLIFICACIÓN)
// =================================================================================

// ELIMINADO: Ya no se necesita 'localStorage' porque los datos se cargan dinámicamente.
// const saveDataToLocalStorage = (data) => { ... };
// const getDataFromLocalStorage = () => { ... };

// ELIMINADO: El cálculo de minutos ahora viene del backend ('tiempo_neto_formateado').
// const calculateTotalMinutes = (createdAt, updatedAt) => { ... };
// const parseTimeEstimadoToMinutes = (timeEstimado) => { ... };
// const calculateRealStopTime = (createdAt, timeAutReal) => { ... };


// =================================================================================
// SECCIÓN 4: MANEJO DE LA TABLA (FILTRAR, ORDENAR, MOSTRAR)
// =================================================================================

/**
 * MODIFICADO: Obtiene el valor para ordenar directamente del objeto 'item'.
 * Ya no necesita el objeto anidado 'follow_atention'.
 */
const getSortValue = (item, col) => {
    switch (col) {
        case 'planta': return item.planta ?? '';
        case 'folio': return item.folio ?? '';
        case 'modulo': return item.modulo ?? '';
        case 'supervisor': return item.supervisor ?? '';
        case 'op': return item.operario_num_empleado ?? '';
        case 'mecanico': return item.mecanico_nombre ?? '';
        case 'total_min': return item.minutos_netos ?? 0; // Usamos el valor numérico para ordenar.
        
        // Las siguientes columnas no vienen en la API, retornan vacío.
        case 'nombre':
        case 'problema':
        case 'hora_paro':
        case 'hora_termino':
        case 'id_maquina':
        case 'tipo_maquina':
        case 'codigo_falla':
        case 'causa':
        case 'accion':
        default:
            return '';
    }
};

/**
 * MODIFICADO: Filtra los datos usando las propiedades directas del objeto 'item'.
 */
const getFilteredSortedData = () => {
    let filtered = dataArray.filter(item => {
        // Mapeo de los valores de filtro a las propiedades del objeto 'item'
        const matchesPlanta = !filterValues.planta || (item.planta ?? '').toLowerCase().includes(filterValues.planta.toLowerCase());
        const matchesFolio = !filterValues.folio || (item.folio ?? '').toString().toLowerCase().includes(filterValues.folio.toLowerCase());
        const matchesModulo = !filterValues.modulo || (item.modulo ?? '').toLowerCase().includes(filterValues.modulo.toLowerCase());
        const matchesSupervisor = !filterValues.supervisor || (item.supervisor ?? '').toLowerCase().includes(filterValues.supervisor.toLowerCase());
        const matchesOp = !filterValues.op || (item.operario_num_empleado ?? '').toLowerCase().includes(filterValues.op.toLowerCase());
        const matchesNombre = !filterValues.nombre || (item.nombre_operario ?? '').toLowerCase().includes(filterValues.nombre.toLowerCase());
        const matchesProblema = !filterValues.problema || (item.tipo_problema ?? '').toLowerCase().includes(filterValues.problema.toLowerCase());
        const matchesHoraParo = !filterValues.hora_paro || (item.hora_inicio_diagnostico ?? '').toLowerCase().includes(filterValues.hora_paro.toLowerCase());
        const matchesHoraTermino = !filterValues.hora_termino || (item.hora_final_diagnostico ?? '').toLowerCase().includes(filterValues.hora_termino.toLowerCase());
        const matchesTotalMin = !filterValues.total_min || (item.tiempo_neto_formateado ?? '').toString().includes(filterValues.total_min);
        const matchesIdMaquina = !filterValues.id_maquina || (item.numero_maquina ?? '').toLowerCase().includes(filterValues.id_maquina.toLowerCase());
        const matchesTipoMaquina = !filterValues.tipo_maquina || (item.clase_maquina ?? '').toLowerCase().includes(filterValues.tipo_maquina.toLowerCase());
        const matchesMecanico = !filterValues.mecanico || (item.mecanico_nombre ?? '').toLowerCase().includes(filterValues.mecanico.toLowerCase());
        const matchesCodigoFalla = !filterValues.codigo_falla || (item.falla ?? '').toLowerCase().includes(filterValues.codigo_falla.toLowerCase());
        const matchesCausa = !filterValues.causa || (item.causa ?? '').toLowerCase().includes(filterValues.causa.toLowerCase());
        const matchesAccion = !filterValues.accion || (item.accion ?? '').toLowerCase().includes(filterValues.accion.toLowerCase());
        const matchesEncuesta = !filterValues.encuesta || (item.encuesta ?? '').toLowerCase().includes(filterValues.encuesta.toLowerCase());

        return matchesPlanta && matchesFolio && matchesModulo && matchesSupervisor &&
               matchesOp && matchesNombre && matchesProblema && matchesHoraParo &&
               matchesHoraTermino && matchesTotalMin && matchesIdMaquina &&
               matchesTipoMaquina && matchesMecanico && matchesCodigoFalla &&
               matchesCausa && matchesAccion && matchesEncuesta;
    });

    if (sortColumn) {
        filtered.sort((a, b) => {
            let va = getSortValue(a, sortColumn);
            let vb = getSortValue(b, sortColumn);
            
            if (typeof va === 'number' && typeof vb === 'number') {
                return sortDirection === 'asc' ? va - vb : vb - va;
            }

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
 * MODIFICADO: Muestra los datos en la tabla usando las propiedades directas del objeto 'item'.
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

        // MODIFICADO: El HTML se genera con los datos de 'item', no de 'item.follow_atention'.
        // Las celdas para datos que no vienen de la API se dejan vacías.
        row.innerHTML = `
            <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${item.planta ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${item.folio ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.modulo ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.supervisor ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.operario_num_empleado ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.nombre_operario ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.tipo_problema ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-bold text-purple-700 dark:text-purple-400">${item.hora_inicio_diagnostico ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-green-700 dark:text-green-400">${item.hora_final_diagnostico ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-orange-100">${item.tiempo_total ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-orange-100">${item.tiempo_neto_formateado ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-orange-100">${item.tiempo_total_bahia_formateado ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.clase_maquina ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.numero_maquina ?? ''}</td>
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
    displayDataInTable(paginatedData); // Usa `paginatedData` que ya está filtrada y ordenada.
    renderPagination(paginatedData.length, currentPage);
};

// La función renderPagination no necesita cambios.
const renderPagination = (totalRows, currentPage) => { /* ...código sin cambios... */ };

// =================================================================================
// SECCIÓN 5: EVENT LISTENERS
// =================================================================================

// Eventos de los botones de acción (copiar, guardar, etc.)
if (copyBtn) { copyBtn.addEventListener('click', () => copyTableToClipboard(tableId)); }
if (saveBtn) { saveBtn.addEventListener('click', () => { if (saveModal) saveModal.classList.remove('hidden'); }); }
if (closeModalBtn) { closeModalBtn.addEventListener('click', () => { if (saveModal) saveModal.classList.add('hidden'); }); }
if (downloadExcelBtn) { downloadExcelBtn.addEventListener('click', () => { saveTableAsExcel(tableId); if (saveModal) saveModal.classList.add('hidden'); }); }
if (downloadPdfBtn) { downloadPdfBtn.addEventListener('click', () => { saveTableAsPDF(tableId); if (saveModal) saveModal.classList.add('hidden'); }); }

// Eventos de los inputs de filtro
const filterIds = [
    'planta', 'folio', 'modulo', 'supervisor', 'op', 'nombre', 'problema',
    'hora_paro', 'hora_termino', 'total_min', 'id_maquina', 'tipo_maquina',
    'mecanico', 'codigo_falla', 'causa', 'accion', 'encuesta'
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
        });
    }
});

// MODIFICADO: El mapa de encabezados debe coincidir con el orden real de las columnas en el HTML
const headerMap = [
    { id: 'planta', idx: 0 },
    { id: 'folio', idx: 1 },
    { id: 'modulo', idx: 2 },
    { id: 'supervisor', idx: 3 },
    { id: 'op', idx: 4 },
    { id: 'nombre', idx: 5 },
    { id: 'problema', idx: 6 },
    { id: 'hora_paro', idx: 7 },
    { id: 'hora_termino', idx: 8 },
    { id: 'total_min', idx: 9 },
    { id: 'id_maquina', idx: 10 },
    { id: 'tipo_maquina', idx: 11 },
    { id: 'mecanico', idx: 12 },
    { id: 'codigo_falla', idx: 13 },
    { id: 'causa', idx: 14 },
    { id: 'accion', idx: 15 }
];

const addSortEvents = () => {
    const table = document.getElementById(tableId);
    if (!table) return;
    const ths = table.querySelectorAll('thead tr:first-child th');
    
    headerMap.forEach((col) => {
        const th = ths[col.idx];
        if (th && getSortValue({} , col.id) !== undefined) { // Solo añadir evento si la columna es ordenable
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

/**
 * NUEVO: La función principal se ejecuta al cargar el DOM.
 */
const main = () => {
    // 1. Inicializar las fechas al día actual.
    const hoy = new Date().toISOString().split('T')[0];
    fechaInicioInput.value = hoy;
    fechaFinInput.value = hoy;

    // 2. Establecer la fecha máxima para evitar seleccionar días futuros.
    fechaInicioInput.max = hoy;
    fechaFinInput.max = hoy;

    // 3. Añadir los listeners para detectar cambios en las fechas.
    fechaInicioInput.addEventListener('change', handleDateChange);
    fechaFinInput.addEventListener('change', handleDateChange);

    // 4. Cargar los datos iniciales correspondientes al día de hoy.
    fetchData(hoy, hoy);

    // 5. Añadir eventos de ordenamiento a la tabla.
    addSortEvents();
};

// Ejecutar la función principal cuando el DOM esté completamente cargado.
document.addEventListener('DOMContentLoaded', main);