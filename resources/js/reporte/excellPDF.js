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
//import ExcelJS from 'exceljs';

export async function saveTableAsExcel(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const ExcelJS = (await import('exceljs')).default;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('OT Mecánicos');

    // Agregar segunda hoja para KPIs
    const kpiWorksheet = workbook.addWorksheet('KPIs Resumen');

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

    // --- Agregar datos KPI a la segunda hoja ---
    const kpiTable = document.getElementById('kpiTable');
    if (kpiTable) {
        // Encabezado KPI
        const fecha = new Date();
        const fechaStr = fecha.toLocaleDateString('es-MX');
        const dateRangeElement = document.getElementById('kpi-date-range');
        const dateRange = dateRangeElement ? dateRangeElement.textContent : '';

        kpiWorksheet.mergeCells('A1:D1');
        const kpiTitleCell = kpiWorksheet.getCell('A1');
        kpiTitleCell.value = `RESUMEN DE KPIs - ${dateRange}`;
        kpiTitleCell.font = { size: 16, bold: true, color: { argb: '16A34A' } };
        kpiTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        kpiWorksheet.mergeCells('A2:D2');
        const kpiFechaCell = kpiWorksheet.getCell('A2');
        kpiFechaCell.value = `FECHA DE DESCARGA: ${fechaStr}`;
        kpiFechaCell.font = { bold: true, color: { argb: '374151' } };
        kpiFechaCell.alignment = { vertical: 'middle', horizontal: 'center' };

        // Leer encabezados KPI
        const kpiHeaderRow = kpiTable.querySelector('thead tr');
        const kpiHeaders = [];
        kpiHeaderRow.querySelectorAll('th').forEach(th => {
            kpiHeaders.push(th.innerText.trim());
        });
        kpiWorksheet.insertRow(4, kpiHeaders);

        // Aplicar estilos a encabezados KPI
        kpiWorksheet.getRow(4).eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '16A34A' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin', color: { argb: '16A34A' } },
                left: { style: 'thin', color: { argb: '16A34A' } },
                bottom: { style: 'thin', color: { argb: '16A34A' } },
                right: { style: 'thin', color: { argb: '16A34A' } }
            };
        });

        // Leer filas de datos KPI
        let kpiRowIdx = 5;
        kpiTable.querySelectorAll('tbody tr').forEach(tr => {
            const rowData = [];
            tr.querySelectorAll('td').forEach(td => {
                rowData.push(td.innerText.trim());
            });
            kpiWorksheet.insertRow(kpiRowIdx, rowData);
            kpiRowIdx++;
        });

        // Aplicar estilos a filas de datos KPI
        for (let i = 5; i < kpiRowIdx; i++) {
            kpiWorksheet.getRow(i).eachCell(cell => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'CCCCCC' } },
                    left: { style: 'thin', color: { argb: 'CCCCCC' } },
                    bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
                    right: { style: 'thin', color: { argb: 'CCCCCC' } }
                };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0FDF4' } };
                cell.alignment = { vertical: 'middle' };
            });
        }

        // Ajustar ancho de columnas KPI
        kpiWorksheet.columns.forEach((column, colIdx) => {
            let maxLength = 15;
            column.eachCell({ includeEmpty: true }, cell => {
                let cellValue = cell.value ? cell.value.toString() : '';
                cellValue.split('\n').forEach(line => {
                    if (line.length > maxLength) maxLength = line.length;
                });
            });
            column.width = Math.min(maxLength + 2, 50);
        });
    }

    // Descarga el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "OT_Mecanicos_Completo.xlsx";
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

    import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js').then(() => {
        // Crear PDF con múltiples páginas
        const pdf = new window.jspdf.jsPDF({
            orientation: 'landscape',
            unit: 'pt',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Función auxiliar para agregar tabla al PDF
        const addTableToPDF = (tableElement, title) => {
            return new Promise((resolve) => {
                const clone = tableElement.cloneNode(true);
                clone.querySelectorAll('input').forEach(input => input.remove());

                // Agregar título
                const titleDiv = document.createElement('div');
                titleDiv.style.fontSize = '18px';
                titleDiv.style.fontWeight = 'bold';
                titleDiv.style.textAlign = 'center';
                titleDiv.style.marginBottom = '20px';
                titleDiv.style.color = '#16A34A';
                titleDiv.textContent = title;

                const tempDiv = document.createElement('div');
                tempDiv.style.position = 'absolute';
                tempDiv.style.left = '-9999px';
                tempDiv.style.backgroundColor = 'white';
                tempDiv.style.padding = '20px';
                tempDiv.appendChild(titleDiv);
                tempDiv.appendChild(clone);
                document.body.appendChild(tempDiv);

                html2canvas(tempDiv, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = pageWidth - 40;
                    const imgHeight = canvas.height * imgWidth / canvas.width;

                    // Si la imagen es más alta que la página, ajustar
                    const maxHeight = pageHeight - 40;
                    let finalImgHeight = imgHeight;
                    let finalImgWidth = imgWidth;

                    if (imgHeight > maxHeight) {
                        finalImgHeight = maxHeight;
                        finalImgWidth = canvas.width * maxHeight / canvas.height;
                    }

                    pdf.addImage(imgData, 'PNG', (pageWidth - finalImgWidth) / 2, 20, finalImgWidth, finalImgHeight);
                    document.body.removeChild(tempDiv);
                    resolve();
                }).catch(() => {
                    document.body.removeChild(tempDiv);
                    resolve();
                });
            });
        };

        // Agregar tabla de detalle
        addTableToPDF(table, 'ORDEN DE TRABAJO PARA MECÁNICOS').then(() => {
            // Agregar tabla KPI en nueva página
            const kpiTable = document.getElementById('kpiTable');
            if (kpiTable) {
                pdf.addPage();
                const dateRangeElement = document.getElementById('kpi-date-range');
                const dateRange = dateRangeElement ? dateRangeElement.textContent : '';
                addTableToPDF(kpiTable, `RESUMEN DE KPIs - ${dateRange}`).then(() => {
                    pdf.save('OT_Mecanicos_Completo.pdf');
                });
            } else {
                pdf.save('OT_Mecanicos.pdf');
            }
        });
    });
}
