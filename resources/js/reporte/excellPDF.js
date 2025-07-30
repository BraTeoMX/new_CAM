// Copiar tabla con formato y estilos
export function copyTableToClipboard(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    // Clona la tabla para no afectar el DOM
    const clone = table.cloneNode(true);
    clone.querySelectorAll('input').forEach(input => input.remove());
    // Crea un contenedor temporal y lo agrega al DOM
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.appendChild(clone);
    document.body.appendChild(tempDiv);
    // Copia como HTML
    const range = document.createRange();
    range.selectNode(tempDiv);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    try {
        document.execCommand('copy');
    } catch (err) {
        navigator.clipboard.writeText(tempDiv.innerHTML);
    }
    window.getSelection().removeAllRanges();
    document.body.removeChild(tempDiv);

    // SweetAlert2 en vez de alert
    if (window.Swal) {
        Swal.fire({
            icon: 'success',
            title: '¡Copiado!',
            text: 'Tabla copiada al portapapeles',
            timer: 1500,
            showConfirmButton: false
        });
    }
}

// Usa ExcelJS para exportar con estilos avanzados
// Instala primero: npm install exceljs
import ExcelJS from 'exceljs';

export async function saveTableAsExcel(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('OT Mecánicos');

    // --- Agrega imagen/logo ---
    // Descarga la imagen como base64
    const imageUrl = '/images/intimark.webp'; // Ajusta si tu ruta es diferente
    const imageBase64 = await fetch(imageUrl)
        .then(res => res.blob())
        .then(blob => new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
        }));

    const imageId = workbook.addImage({
        base64: imageBase64,
        extension: 'webp'
    });

    // Ajusta el tamaño y posición de la imagen
    worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 120, height: 60 }
    });

    // --- Encabezado grande ---
    worksheet.mergeCells('C1:H2');
    const titleCell = worksheet.getCell('C1');
    titleCell.value = 'ORDEN DE TRABAJO PARA MECÁNICOS';
    titleCell.font = { size: 18, bold: true, color: { argb: '2563EB' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // --- Fecha de descarga ---
    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString('es-MX');
    worksheet.mergeCells('C3:E3');
    const fechaCell = worksheet.getCell('O4');
    fechaCell.value = `FECHA DE DESCARGA: ${fechaStr}`;
    fechaCell.font = { bold: true, color: { argb: 'FF374151' } }; // gris-700
    fechaCell.alignment = { vertical: 'middle', horizontal: 'left' };

    // --- Espacio antes de la tabla ---
    let startRow = 5;

    // Lee encabezados
    const headerRow = table.querySelector('thead tr');
    const headers = [];
    headerRow.querySelectorAll('th').forEach(th => {
        if (th.colSpan === 1) headers.push(th.innerText.trim());
    });
    worksheet.insertRow(startRow, headers);

    // Aplica estilos a encabezados
    worksheet.getRow(startRow).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin', color: { argb: '2563EB' } },
            left: { style: 'thin', color: { argb: '2563EB' } },
            bottom: { style: 'thin', color: { argb: '2563EB' } },
            right: { style: 'thin', color: { argb: '2563EB' } }
        };
    });

    // Lee filas de datos
    let rowIdx = startRow + 1;
    table.querySelectorAll('tbody tr').forEach(tr => {
        const rowData = [];
        tr.querySelectorAll('td').forEach(td => {
            rowData.push(td.innerText.trim());
        });
        worksheet.insertRow(rowIdx, rowData);
        rowIdx++;
    });

    // Aplica estilos a filas de datos
    for (let i = startRow + 1; i < rowIdx; i++) {
        worksheet.getRow(i).eachCell(cell => {
            cell.border = {
                top: { style: 'thin', color: { argb: 'CCCCCC' } },
                left: { style: 'thin', color: { argb: 'CCCCCC' } },
                bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
                right: { style: 'thin', color: { argb: 'CCCCCC' } }
            };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
            cell.alignment = { vertical: 'middle' };
        });
    }

    // Ajusta el ancho de columnas automáticamente (mejorado)
    worksheet.columns.forEach((column, colIdx) => {
        let maxLength = 10;
        column.eachCell({ includeEmpty: true }, cell => {
            let cellValue = cell.value ? cell.value.toString() : '';
            cellValue.split('\n').forEach(line => {
                if (line.length > maxLength) maxLength = line.length;
            });
        });
        column.width = Math.min(maxLength + 2, 40);
    });

    // Descarga el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "OT_Mecanicos.xlsx";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

// Descargar tabla como PDF
export function saveTableAsPDF(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    const clone = table.cloneNode(true);
    clone.querySelectorAll('input').forEach(input => input.remove());
    // Agrega el clone temporalmente al DOM para html2canvas
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.appendChild(clone);
    document.body.appendChild(tempDiv);

    import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js').then(() => {
        html2canvas(clone).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new window.jspdf.jsPDF({
                orientation: 'landscape',
                unit: 'pt',
                format: 'a4'
            });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const imgWidth = pageWidth - 40;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
            pdf.save('OT_Mecanicos.pdf');
            document.body.removeChild(tempDiv);
        }).catch(() => {
            document.body.removeChild(tempDiv);
        });
    });
}
