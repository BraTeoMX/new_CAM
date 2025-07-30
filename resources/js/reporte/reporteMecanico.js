import { copyTableToClipboard, saveTableAsExcel, saveTableAsPDF } from './excellPDF';

// Global variables
let dataArray = [];
const tableId = 'ordenTrabajoTable';

// Function to save data to local storage
const saveDataToLocalStorage = (data) => {
    localStorage.setItem('ordenTrabajoData', JSON.stringify(data));
};

// Function to get data from local storage
const getDataFromLocalStorage = () => {
    const storedData = localStorage.getItem('ordenTrabajoData');
    return storedData ? JSON.parse(storedData) : [];
};

// Function to fetch data from the server
const fetchData = async () => {
    try {
        const response = await fetch('/form-ot-data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        dataArray = data;
        saveDataToLocalStorage(dataArray);
        return dataArray;
    } catch (error) {
        console.error('Error fetching data:', error);
        // If there's an error, try to get data from local storage
        dataArray = getDataFromLocalStorage();
        return dataArray;
    }
};

// Function to calculate the real stop time
const calculateRealStopTime = (createdAt, timeAutReal) => {
    const createdDate = new Date(createdAt);
    if (!timeAutReal) return createdDate;

    let minutes = 0, seconds = 0;
    const parts = timeAutReal.split(':').map(Number);

    if (parts.length === 2) {
        // formato minutos:segundos
        [minutes, seconds] = parts;
    } else if (parts.length === 1) {
        // solo segundos
        seconds = parts[0];
    }
    const msToSubtract = ((minutes * 60) + seconds) * 1000;
    return new Date(createdDate.getTime() - msToSubtract);
};

// Function to calculate total minutes using only follow_atention's created_at and updated_at
const calculateTotalMinutes = (createdAt, updatedAt) => {
    const start = new Date(createdAt);
    const end = new Date(updatedAt);
    const difference = end.getTime() - start.getTime();
    return Math.round(difference / 60000);
};

// Function to parse TimeEstimado (HH:mm or mm) to minutes
const parseTimeEstimadoToMinutes = (timeEstimado) => {
    if (!timeEstimado) return null;
    const parts = timeEstimado.split(':').map(Number);
    if (parts.length === 2) {
        // HH:mm or mm:ss, treat as hours:minutes
        return (parts[0] * 60) + parts[1];
    } else if (parts.length === 1) {
        // Only minutes
        return parts[0];
    }
    return null;
};

// --- PAGINACIÓN ---
const ROWS_PER_PAGE = 10;
let currentPage = 1;
let paginatedData = [];

const renderPagination = (totalRows, currentPage) => {
    const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
    if (totalPages <= 1) {
        document.getElementById('pagination-container').innerHTML = '';
        return;
    }
    let html = `
    <nav class="flex justify-center mt-4" aria-label="Table navigation">
      <ul class="inline-flex -space-x-px text-sm">
        <li>
          <button class="pagination-btn px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
            Anterior
          </button>
        </li>
    `;
    for (let i = 1; i <= totalPages; i++) {
        html += `
        <li>
          <button class="pagination-btn px-3 py-2 leading-tight border border-gray-300 ${i === currentPage ? 'bg-blue-700 text-white dark:bg-blue-600' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}"
            data-page="${i}">
            ${i}
          </button>
        </li>
        `;
    }
    html += `
        <li>
          <button class="pagination-btn px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
            Siguiente
          </button>
        </li>
      </ul>
    </nav>
    `;
    document.getElementById('pagination-container').innerHTML = html;
    // Eventos
    document.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = parseInt(btn.getAttribute('data-page'));
            if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
                setPage(page);
            }
        });
    });
};

const setPage = (page) => {
    currentPage = page;
    displayDataInTable(paginatedData);
    renderPagination(paginatedData.length, currentPage);
};

// Botones de acción
const copyBtn = document.getElementById('copy-table-btn');
const saveBtn = document.getElementById('save-table-btn');
const saveModal = document.getElementById('save-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const downloadExcelBtn = document.getElementById('download-excel-btn');
const downloadPdfBtn = document.getElementById('download-pdf-btn');

if (copyBtn) {
    copyBtn.addEventListener('click', () => copyTableToClipboard(tableId));
}
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        if (saveModal) saveModal.classList.remove('hidden');
    });
}
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        if (saveModal) saveModal.classList.add('hidden');
    });
}
if (downloadExcelBtn) {
    downloadExcelBtn.addEventListener('click', () => {
        saveTableAsExcel(tableId);
        if (saveModal) saveModal.classList.add('hidden');
    });
}
if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
        saveTableAsPDF(tableId);
        if (saveModal) saveModal.classList.add('hidden');
    });
}

// --- FILTRO Y ORDENAMIENTO ---
let filterValues = {
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

// Devuelve el valor de una columna para ordenar
const getSortValue = (item, col) => {
    const fa = item.follow_atention || {};
    switch (col) {
        case 'folio': return fa.Folio ?? '';
        case 'modulo': return fa.Modulo ?? '';
        case 'supervisor': return fa.Supervisor ?? '';
        case 'op': return fa.Operario ?? '';
        case 'nombre': return fa.NombreOperario ?? '';
        case 'problema': return fa.Problema ?? '';
        case 'hora_paro': return fa.created_at ?? '';
        case 'hora_termino': return fa.updated_at ?? '';
        case 'total_min':
            if (fa.created_at && fa.updated_at) {
                return calculateTotalMinutes(fa.created_at, fa.updated_at);
            }
            return '';
        case 'id_maquina': return fa.NumMach ?? '';
        case 'tipo_maquina': return fa.Maquina ?? '';
        case 'mecanico': return fa.Mecanico ?? '';
        case 'codigo_falla': return fa.Falla ?? '';
        case 'causa': return fa.Causa ?? '';
        case 'accion': return fa.Accion ?? '';
        default: return '';
    }
};

// Aplica filtros y ordenamiento
const getFilteredSortedData = () => {
    let filtered = dataArray.filter(item => {
        const fa = item.follow_atention || {};
        return (!filterValues.folio || (fa.Folio ?? '').toString().toLowerCase().includes(filterValues.folio.toLowerCase()))
            && (!filterValues.modulo || (fa.Modulo ?? '').toLowerCase().includes(filterValues.modulo.toLowerCase()))
            && (!filterValues.supervisor || (fa.Supervisor ?? '').toLowerCase().includes(filterValues.supervisor.toLowerCase()))
            && (!filterValues.op || (fa.Operario ?? '').toLowerCase().includes(filterValues.op.toLowerCase()))
            && (!filterValues.nombre || (fa.NombreOperario ?? '').toLowerCase().includes(filterValues.nombre.toLowerCase()))
            && (!filterValues.problema || (fa.Problema ?? '').toLowerCase().includes(filterValues.problema.toLowerCase()))
            && (!filterValues.hora_paro || (fa.created_at ?? '').toLowerCase().includes(filterValues.hora_paro.toLowerCase()))
            && (!filterValues.hora_termino || (fa.updated_at ?? '').toLowerCase().includes(filterValues.hora_termino.toLowerCase()))
            && (!filterValues.total_min || (
                fa.created_at && fa.updated_at &&
                calculateTotalMinutes(fa.created_at, fa.updated_at).toString().includes(filterValues.total_min)
            ))
            && (!filterValues.id_maquina || (fa.NumMach ?? '').toLowerCase().includes(filterValues.id_maquina.toLowerCase()))
            && (!filterValues.tipo_maquina || (fa.Maquina ?? '').toLowerCase().includes(filterValues.tipo_maquina.toLowerCase()))
            && (!filterValues.mecanico || (fa.Mecanico ?? '').toLowerCase().includes(filterValues.mecanico.toLowerCase()))
            && (!filterValues.codigo_falla || (fa.Falla ?? '').toLowerCase().includes(filterValues.codigo_falla.toLowerCase()))
            && (!filterValues.causa || (fa.Causa ?? '').toLowerCase().includes(filterValues.causa.toLowerCase()))
            && (!filterValues.accion || (fa.Accion ?? '').toLowerCase().includes(filterValues.accion.toLowerCase()));
    });

    if (sortColumn) {
        filtered.sort((a, b) => {
            let va = getSortValue(a, sortColumn);
            let vb = getSortValue(b, sortColumn);
            // Si es fecha, convertir a Date
            if (sortColumn === 'hora_paro' || sortColumn === 'hora_termino') {
                va = va ? new Date(va) : new Date(0);
                vb = vb ? new Date(vb) : new Date(0);
            }
            if (typeof va === 'number' && typeof vb === 'number') {
                return sortDirection === 'asc' ? va - vb : vb - va;
            }
            if (!isNaN(va) && !isNaN(vb)) {
                va = Number(va); vb = Number(vb);
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

// Modifica displayDataInTable para usar los datos filtrados y ordenados
const displayDataInTable = (data) => {
    paginatedData = data;
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
    const endIdx = startIdx + ROWS_PER_PAGE;
    const pageData = data.slice(startIdx, endIdx);

    pageData.forEach((item, idx) => {

        const row = document.createElement('tr');
        row.className = "bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors";

        // Calcular total minutos solo con follow_atention
        let totalMinutes = '';
        let totalMinutesColor = 'text-purple-700 dark:text-purple-400';
        let timeEstimadoMin = null;
        if (item.follow_atention && item.follow_atention.created_at && item.follow_atention.updated_at) {
            totalMinutes = calculateTotalMinutes(item.follow_atention.created_at, item.follow_atention.updated_at);
            timeEstimadoMin = parseTimeEstimadoToMinutes(item.follow_atention.TimeEstimado);
            if (timeEstimadoMin !== null && totalMinutes !== '') {
                if (totalMinutes > timeEstimadoMin) {
                    totalMinutesColor = 'text-red-700 dark:text-red-400 font-bold';
                } else {
                    totalMinutesColor = 'text-green-700 dark:text-green-400 font-bold';
                }
            }
        }

        row.innerHTML = `
            <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${item.follow_atention.Folio ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${item.follow_atention.Modulo ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.follow_atention.Supervisor ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.follow_atention.Operario ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.follow_atention.NombreOperario ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.follow_atention.Problema ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-blue-700 dark:text-blue-400">${item.follow_atention.created_at ? new Date(item.follow_atention.created_at).toLocaleString() : ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-green-700 dark:text-green-400">${item.follow_atention.updated_at ? new Date(item.follow_atention.updated_at).toLocaleString() : ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm ${totalMinutesColor}">${totalMinutes !== '' ? totalMinutes + ' min' : ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.follow_atention.NumMach ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.follow_atention.Maquina ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.follow_atention.Mecanico ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-red-700 dark:text-red-400">${item.follow_atention.Falla ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-yellow-700 dark:text-yellow-400">${item.follow_atention.Causa ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.follow_atention.Accion ?? ''}</td>
        `;
        tbody.appendChild(row);
    });
};

// --- EVENTOS DE FILTRO ---
const filterIds = [
    'folio', 'modulo', 'supervisor', 'op', 'nombre', 'problema', 'hora_paro', 'hora_termino', 'total_min',
    'id_maquina', 'tipo_maquina', 'mecanico', 'codigo_falla', 'causa', 'accion'
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

// --- EVENTOS DE ORDENAMIENTO ---
const headerMap = [
    { id: 'folio', idx: 0 },
    { id: 'modulo', idx: 1 },
    { id: 'supervisor', idx: 2 },
    { id: 'op', idx: 3 },
    { id: 'nombre', idx: 4 },
    { id: 'problema', idx: 5 },
    { id: 'hora_paro', idx: 6 },
    { id: 'hora_termino', idx: 7 },
    { id: 'total_min', idx: 8 },
    { id: 'id_maquina', idx: 9 },
    { id: 'tipo_maquina', idx: 10 },
    { id: 'mecanico', idx: 11 },
    { id: 'codigo_falla', idx: 12 },
    { id: 'causa', idx: 13 },
    { id: 'accion', idx: 14 }
];

const addSortEvents = () => {
    const table = document.getElementById(tableId);
    if (!table) return;
    const ths = table.querySelectorAll('thead tr:first-child th');
    headerMap.forEach((col, i) => {
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
                // Visual feedback
                ths.forEach((t, idx) => {
                    t.classList.remove('text-blue-700', 'dark:text-blue-400');
                    if (idx === col.idx) t.classList.add('text-blue-700', 'dark:text-blue-400');
                });
            });
        }
    });
};

// Main function
const main = async () => {
    let data = await fetchData();
    dataArray = data;
    currentPage = 1;
    const filtered = getFilteredSortedData();
    displayDataInTable(filtered);
    // Agrega el contenedor de paginación si no existe
    if (!document.getElementById('pagination-container')) {
        const pagDiv = document.createElement('div');
        pagDiv.id = 'pagination-container';
        pagDiv.className = 'mt-4 flex justify-center';
        table.parentNode.appendChild(pagDiv);
    }
    renderPagination(filtered.length, currentPage);
    addSortEvents();
};

// Run the main function when the page loads
document.addEventListener('DOMContentLoaded', main);
