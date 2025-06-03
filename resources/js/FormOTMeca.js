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
        console.log('Datos recibidos del backend:', data); // LOG
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

// Function to display data in the table
const displayDataInTable = (data) => {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = ''; // Clear existing data

    data.forEach((item, idx) => {
        console.log(`Fila ${idx}:`, item); // LOG por fila

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

// Copy table with formatting
const copyTableToClipboard = () => {
    const table = document.getElementById(tableId);
    if (!table) return;
    // Clona la tabla para no afectar el DOM
    const clone = table.cloneNode(true);
    // Elimina los inputs de filtros si existen
    clone.querySelectorAll('input').forEach(input => input.remove());
    // Crea un contenedor temporal
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(clone);
    // Copia como HTML
    const range = document.createRange();
    range.selectNode(tempDiv);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    try {
        document.execCommand('copy');
    } catch (err) {
        // fallback
        navigator.clipboard.writeText(tempDiv.innerHTML);
    }
    window.getSelection().removeAllRanges();
    // Opcional: feedback visual
    alert('Tabla copiada al portapapeles');
};

// Save table as Excel
const saveTableAsExcel = () => {
    const table = document.getElementById(tableId);
    if (!table) return;
    // Elimina los inputs de filtros si existen
    const clone = table.cloneNode(true);
    clone.querySelectorAll('input').forEach(input => input.remove());
    // Convierte la tabla a hoja de cálculo
    const wb = XLSX.utils.table_to_book(clone, {sheet: "OT Mecánicos"});
    XLSX.writeFile(wb, "OT_Mecanicos.xlsx");
};

// Save table as PDF
const saveTableAsPDF = () => {
    const table = document.getElementById(tableId);
    if (!table) return;
    // Elimina los inputs de filtros si existen
    const clone = table.cloneNode(true);
    clone.querySelectorAll('input').forEach(input => input.remove());
    // Usa html2canvas + jsPDF para mejor resultado
    import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js').then(() => {
        html2canvas(clone).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new window.jspdf.jsPDF({
                orientation: 'landscape',
                unit: 'pt',
                format: 'a4'
            });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth - 40;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
            pdf.save('OT_Mecanicos.pdf');
        });
    });
};

// Modal logic
const saveModal = document.getElementById('save-modal');
const saveBtn = document.getElementById('save-table-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const downloadExcelBtn = document.getElementById('download-excel-btn');
const downloadPdfBtn = document.getElementById('download-pdf-btn');

if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        saveModal.classList.remove('hidden');
    });
}
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        saveModal.classList.add('hidden');
    });
}
if (downloadExcelBtn) {
    downloadExcelBtn.addEventListener('click', () => {
        saveTableAsExcel();
        saveModal.classList.add('hidden');
    });
}
if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
        saveTableAsPDF();
        saveModal.classList.add('hidden');
    });
}

// Copy button logic
const copyBtn = document.getElementById('copy-table-btn');
if (copyBtn) {
    copyBtn.addEventListener('click', copyTableToClipboard);
}

// Main function
const main = async () => {
    let data = await fetchData();
    displayDataInTable(data);
};

// Run the main function when the page loads
document.addEventListener('DOMContentLoaded', main);
