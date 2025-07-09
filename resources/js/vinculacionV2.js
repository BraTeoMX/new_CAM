const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

document.addEventListener('DOMContentLoaded', function () {
    // Variables globales
    let mecanicosData = [];
    let supervisoresData = [];
    let mecanicoMap = new Map(); // Mapa para búsqueda rápida de mecánicos

    const mecanicosList = document.getElementById('mecanicos-list');
    const supervisoresList = document.getElementById('supervisores-list');
    const vinculacionTbody = document.getElementById('vinculacion-tbody');

    // Función auxiliar para obtener numero_empleado por nombre
    function getCvetraByNombre(nombre) {
        return mecanicoMap.get(nombre)?.numero_empleado || '';
    }

    function getMecanicoImageUrl(nombre) {
        const numero_empleado = getCvetraByNombre(nombre);
        return numero_empleado ? `/fotos-usuarios/${numero_empleado}.webp` : '/fotos-usuarios/default-avatar.webp';
    }

    // Carga de mecánicos y creación del mapa
    function loadMecanicos() {
        fetch('/vinculacion/obtenerMecanicos')
            .then(response => response.json())
            .then(data => {
                mecanicosData = data;
                mecanicoMap.clear();
                mecanicosData.forEach(mecanico => {
                    mecanicoMap.set(mecanico.nombre, mecanico);
                });
                mecanicosList.innerHTML = mecanicosData.map(mecanico => `
                    <div class="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-move draggable-mecanico"
                         data-nombre="${mecanico.nombre || ''}"
                         data-numero_empleado="${mecanico.numero_empleado || ''}"
                         data-index="${mecanicosData.indexOf(mecanico)}">
                        <img class="w-10 h-10 rounded-full ring-2 ring-gray-300"
                             src="${getMecanicoImageUrl(mecanico.nombre)}"
                             onerror="this.onerror=null; this.src='/fotos-usuarios/default-avatar.webp';"
                             alt="${mecanico.numero_empleado}"/>
                        <div>
                            <h3 class="font-medium">${mecanico.nombre}</h3>
                            <p class="text-sm text-gray-500">${mecanico.numero_empleado}</p>
                        </div>
                    </div>
                `).join('');
                initializeSortable();
            });
    }

    // Carga de supervisores
    function loadSupervisores() {
        fetch('/vinculacion/obtenerSupervisores')
            .then(response => response.json())
            .then(data => {
                supervisoresData = data;
                supervisoresList.innerHTML = supervisoresData.map(supervisor => `
                    <div class="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-move draggable-supervisor"
                         data-supervisor="${supervisor.nombre || ''}"
                         data-modulo="${supervisor.modulo || ''}"
                         data-index="${supervisoresData.indexOf(supervisor)}">
                        <div>
                            <h3 class="font-medium">Módulo: ${supervisor.modulo}</h3>
                            <p class="text-sm text-gray-500">Supervisor: ${supervisor.nombre}</p>
                        </div>
                    </div>
                `).join('');
                initializeSortable();
            });
    }

    // Función para obtener una fila vacía
    function getEmptyRow() {
        let row = Array.from(vinculacionTbody.getElementsByTagName('tr')).find(r => {
            const mecanicoNombre = r.querySelector('[name="mecanico"] .mecanico-nombre')?.textContent.trim();
            const supervisorModulo = r.querySelector('[name="supervisor-modulo"]')?.textContent.trim();
            return !mecanicoNombre || !supervisorModulo;
        });

        if (!row) {
            row = document.createElement('tr');
            row.className = "bg-white dark:bg-gray-800 border-b dark:border-gray-700";
            row.innerHTML = `
                <td name="supervisor-modulo" class="px-4 py-2"></td>
                <td name="mecanico" class="px-4 py-2 flex items-center gap-2">
                    <div class="flex-shrink-0">
                        <img class="w-10 h-10 rounded-full ring-2 ring-gray-300" alt=""/>
                    </div>
                    <span class="mecanico-nombre"></span>
                </td>
                <td name="comida" class="px-4 py-2">${createTimeSelect('', '', 'comida')}</td>
                <td name="break-lj" class="px-4 py-2">${createTimeSelect('', '', 'break-lj')}</td>
                <td name="break-v" class="px-4 py-2">${createTimeSelect('', '', 'break-v')}</td>
                <td class="px-4 py-2">
                    <button onclick="this.closest('tr').remove()" class="text-red-500 hover:text-red-700">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </td>
            `;
            vinculacionTbody.insertBefore(row, vinculacionTbody.firstChild);
        }
        return row;
    }
    
    // Configuración de SortableJS
    function initializeSortable() {
        if (!mecanicosData.length || !supervisoresData.length) return;

        const commonOptions = {
            animation: 150,
            ghostClass: 'bg-blue-100'
        };

        new Sortable(mecanicosList, {
            ...commonOptions,
            group: { name: 'shared', pull: 'clone', put: false },
            sort: false,
        });

        new Sortable(supervisoresList, {
            ...commonOptions,
            group: { name: 'shared', pull: 'clone', put: false },
            sort: false
        });

        new Sortable(vinculacionTbody, {
            ...commonOptions,
            group: { name: 'shared', pull: false, put: true },
            onAdd: function (evt) {
                const item = evt.item;
                const index = parseInt(item.getAttribute('data-index'));
                let row = getEmptyRow();

                if (item.classList.contains('draggable-mecanico')) {
                    const mecanico = mecanicosData[index];
                    if (mecanico) updateMecanicoCell(row, mecanico);
                } else if (item.classList.contains('draggable-supervisor')) {
                    const supervisor = supervisoresData[index];
                    if (supervisor) updateSupervisorCell(row, supervisor);
                }
                item.remove();
            }
        });
    }

    // Funciones de actualización de celdas
    function updateMecanicoCell(row, mecanico) {
        const mecanicoCell = row.querySelector('[name="mecanico"]');
        const img = mecanicoCell.querySelector('img');
        img.onerror = function () { this.src = '/fotos-usuarios/default-avatar.webp'; };
        img.src = getMecanicoImageUrl(mecanico.nombre);
        img.alt = mecanico.numero_empleado;
        mecanicoCell.querySelector('.mecanico-nombre').textContent = mecanico.nombre;
        row.setAttribute('data-numero_empleado', mecanico.numero_empleado);
    }

    function updateSupervisorCell(row, supervisor) {
        const cell = row.querySelector('[name="supervisor-modulo"]');
        cell.innerHTML = `Mod: ${supervisor.Modulo}<br>Sup: ${supervisor.Nombre}`;
        row.setAttribute('data-supervisor', supervisor.Nombre);
        row.setAttribute('data-modulo', supervisor.Modulo);
    }
    
    /**
     * ## Nueva función: updateEndTime
     * Se activa al cambiar el select de hora de inicio.
     * Calcula la hora final y la establece en el campo de solo lectura.
     */
    window.updateEndTime = function(select) {
        const startTime = select.value;
        const container = select.closest('div');
        const endInput = container.querySelector('input[readonly]');
        const columnName = select.closest('td').getAttribute('name');
    
        if (!startTime) {
            endInput.value = '';
            return;
        }

        const durationMinutes = (columnName === 'comida') ? 30 : 15;
        
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
        startDate.setMinutes(startDate.getMinutes() + durationMinutes);

        const endHours = String(startDate.getHours()).padStart(2, '0');
        const endMinutes = String(startDate.getMinutes()).padStart(2, '0');
        
        endInput.value = `${endHours}:${endMinutes}`;
    }

    /**
     * ## Función modificada: createTimeSelect
     * Ahora genera un <select> para el inicio y un <input readonly> para el fin.
     * El 'onchange' del select llama a la nueva función `updateEndTime`.
     */
    function createTimeSelect(startValue = '', endValue = '', columnName = '') {
        const times = [];
        for (let hour = 8; hour <= 17; hour++) {
            ['00', '10', '15', '20', '25', '30', '35', '40', '45', '50'].forEach(minute => {
                if (hour < 18) {
                    times.push(`${String(hour).padStart(2, '0')}:${minute}`);
                }
            });
        }
        
        return `<div class="flex flex-col sm:flex-row items-center gap-1">
            <select class="bg-transparent border-gray-300 dark:border-gray-700 rounded w-full sm:w-[58%]" 
                    onchange="updateEndTime(this)">
                <option value="">Inicio</option>
                ${times.map(time => 
                    `<option value="${time}" ${time === startValue ? 'selected' : ''}>${time}</option>`
                ).join('')}
            </select>
            <input type="text" value="${endValue}" readonly 
                class="bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-700 rounded w-full sm:w-[42%] text-center">
        </div>`;
    }

    // Cargar datos iniciales
    loadMecanicos();
    loadSupervisores();
    loadVinculaciones();

    // Función de eliminación (sin cambios, pero se mantiene)
    window.deleteGroupedVinculaciones = function (button, ids) {
        Swal.fire({
            title: '¿Está seguro?', text: "Se eliminarán todas las vinculaciones de este grupo",
            icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6', confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const idArray = ids.split(',');
                Promise.all(idArray.map(id =>
                    fetch(`/vinculaciones/${id}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken }
                    }).then(response => response.json())
                ))
                .then(() => {
                    Swal.fire('Eliminado', 'Los registros han sido eliminados.', 'success');
                    button.closest('tr').remove();
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire('Error', 'No se pudieron eliminar los registros', 'error');
                });
            }
        });
    }

    /**
     * ## Función de Carga Modificada: loadVinculaciones
     * Se ajusta para pasar el nombre de la columna a `createTimeSelect`.
     */
    function loadVinculaciones() {
        const loadingSkeleton = `...`; // El esqueleto de carga no necesita cambios
        vinculacionTbody.innerHTML = loadingSkeleton; // (re-usando tu esqueleto)
    
        fetch('/vinculaciones')
            .then(response => response.json())
            .then(data => {
                const grouped = data.reduce((acc, curr) => {
                    const key = `${curr.Supervisor}-${curr.Modulo}-${curr.Hora_Comida_Inicio}-${curr.Hora_Comida_Fin}-${curr.Break_Lun_Jue_Inicio}-${curr.Break_Lun_Jue_Fin}-${curr.Break_Viernes_Inicio}-${curr.Break_Viernes_Fin}`;
                    if (!acc[key]) {
                        acc[key] = { ...curr, mecanicos: [{ id: curr.id, nombre: curr.Mecanico, Num_Mecanico: curr.Mecanico }] };
                    } else {
                        acc[key].mecanicos.push({ id: curr.id, nombre: curr.Mecanico, Num_Mecanico: curr.Mecanico });
                    }
                    return acc;
                }, {});

                vinculacionTbody.innerHTML = Object.values(grouped).map(v => `
                    <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700"
                        data-ids="${v.mecanicos.map(m => m.id).join(',')}"
                        data-modulo="${v.Modulo}" data-supervisor="${v.Supervisor}">
                        <td name="supervisor-modulo" class="px-4 py-2">Mod: ${v.Modulo}<br>Sup: ${v.Supervisor}</td>
                        <td name="mecanico" class="px-4 py-2">
                            <div class="flex flex-col gap-2">
                                ${v.mecanicos.map(mec => `
                                    <div class="flex items-center gap-2">
                                        <div class="flex-shrink-0">
                                            <img class="w-10 h-10 rounded-full ring-2 ring-gray-300"
                                                 src="${getMecanicoImageUrl(mec.nombre)}"
                                                 onerror="this.onerror=null; this.src='/fotos-usuarios/default-avatar.webp';"
                                                 alt="${mec.nombre}"/>
                                        </div>
                                        <span class="mecanico-nombre">${mec.nombre}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </td>
                        <td name="comida" class="px-4 py-2">${createTimeSelect(v.Hora_Comida_Inicio, v.Hora_Comida_Fin, 'comida')}</td>
                        <td name="break-lj" class="px-4 py-2">${createTimeSelect(v.Break_Lun_Jue_Inicio, v.Break_Lun_Jue_Fin, 'break-lj')}</td>
                        <td name="break-v" class="px-4 py-2">${createTimeSelect(v.Break_Viernes_Inicio, v.Break_Viernes_Fin, 'break-v')}</td>
                        <td class="px-4 py-2">
                            <button onclick="deleteGroupedVinculaciones(this, '${v.mecanicos.map(m => m.id).join(',')}')"
                                    class="text-red-500 hover:text-red-700">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }).catch(error => {
                console.error('Error al cargar vinculaciones:', error);
                vinculacionTbody.innerHTML = `<tr><td colspan="6" class="px-4 py-2 text-center text-red-500">Error al cargar los datos</td></tr>`;
            });
    }

    /**
     * ## Listener del Botón Guardar Modificado
     * Ajustado para leer valores del 'select' de inicio y del 'input' de fin.
     * La validación de rango (inicio >= fin) se ha eliminado por ser redundante.
     */
    document.getElementById('guardar-vinculacion').addEventListener('click', function () {
        const rows = Array.from(vinculacionTbody.children);
        
        // Validar campos incompletos
        for (const row of rows) {
            const timeColumns = ['comida', 'break-lj', 'break-v'];
            for (const column of timeColumns) {
                const container = row.querySelector(`[name="${column}"]`);
                const startSelect = container.querySelector('select');
                const endInput = container.querySelector('input');

                if (!startSelect.value || !endInput.value) {
                    Swal.fire('Campos incompletos', `Por favor complete los horarios de ${column.replace('-', ' ')}`, 'warning');
                    return; // Detener el proceso
                }
            }
        }

        const vinculaciones = Array.from(vinculacionTbody.children).flatMap(row => {
            const ids = row.getAttribute('data-ids')?.split(',') || [];
            const mecanicosElements = row.querySelectorAll('[name="mecanico"] .mecanico-nombre');
            const supervisor = row.getAttribute('data-supervisor');
            const modulo = row.getAttribute('data-modulo');
            
            const horarios = {
                Hora_Comida_Inicio: row.querySelector('[name="comida"] select').value,
                Hora_Comida_Fin: row.querySelector('[name="comida"] input').value,
                Break_Lun_Jue_Inicio: row.querySelector('[name="break-lj"] select').value,
                Break_Lun_Jue_Fin: row.querySelector('[name="break-lj"] input').value,
                Break_Viernes_Inicio: row.querySelector('[name="break-v"] select').value,
                Break_Viernes_Fin: row.querySelector('[name="break-v"] input').value
            };

            const cvetras = Array.from(mecanicosElements).map(mecElement => {
                const nombre = mecElement.textContent.trim();
                return mecanicoMap.get(nombre)?.numero_empleado || '';
            });

            return Array.from(mecanicosElements).map((mecElement, index) => ({
                id: ids[index] || null,
                Supervisor: supervisor,
                Modulo: modulo,
                Mecanico: mecElement.textContent.trim(),
                Num_Mecanico: cvetras[index] || '',
                ...horarios
            }));
        });

        if (vinculaciones.length === 0) {
            Swal.fire('Nada que guardar', 'No hay vinculaciones en la tabla.', 'info');
            return;
        }

        Swal.fire({
            title: '¿Desea guardar la información?', icon: 'question', showCancelButton: true,
            confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Guardar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/vinculaciones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                    body: JSON.stringify({ vinculaciones })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('Éxito', data.message || 'Vinculaciones guardadas', 'success')
                             .then(() => loadVinculaciones());
                    } else {
                        throw new Error(data.message || 'Error al guardar');
                    }
                })
                .catch(error => {
                    console.error('Error al guardar vinculaciones:', error);
                    Swal.fire('Error', 'No se pudieron guardar las vinculaciones', 'error');
                });
            }
        });
    });

    // Cargar vinculaciones iniciales
    loadVinculaciones();
});