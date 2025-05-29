const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

document.addEventListener('DOMContentLoaded', function () {
    // Variables globales para mecánicos
    let mecanicosData = [];
    let supervisoresData = [];
    let mecanicoMap = new Map(); // Mapa para búsqueda rápida de mecánicos por nombre

    const mecanicosList = document.getElementById('mecanicos-list');
    const supervisoresList = document.getElementById('supervisores-list');
    const vinculacionTbody = document.getElementById('vinculacion-tbody');

    // Función auxiliar para obtener cvetra por nombre
    function getCvetraByNombre(nombre) {
        return mecanicoMap.get(nombre)?.cvetra || '';
    }

    // Función para obtener URL de imagen
    function getMecanicoImageUrl(nombre) {
        const cvetra = getCvetraByNombre(nombre);
        return cvetra ? `http://128.150.102.45:8000/Intimark/Fotos%20Credenciales/${cvetra}.jpg` : '/default-avatar.jpg';
    }

    // Modificar loadMecanicos para crear el mapa
    function loadMecanicos() {
        fetch('/mecanicos')
            .then(response => response.json())
            .then(data => {
                mecanicosData = data;
                // Crear mapa de mecánicos por nombre
                mecanicoMap.clear();
                mecanicosData.forEach(mecanico => {
                    mecanicoMap.set(mecanico.nombre, mecanico);
                });
                mecanicosList.innerHTML = mecanicosData.map(mecanico => `
                    <div class="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-move draggable-mecanico"
                         data-nombre="${mecanico.nombre || ''}"
                         data-cvetra="${mecanico.cvetra || ''}"
                         data-index="${mecanicosData.indexOf(mecanico)}">
                        <img class="w-10 h-10 rounded-full ring-2 ring-gray-300"
                             src="${getMecanicoImageUrl(mecanico.nombre)}"
                             alt="${mecanico.cvetra}"/>
                        <div>
                            <h3 class="font-medium">${mecanico.nombre}</h3>
                            <p class="text-sm text-gray-500">${mecanico.cvetra}</p>
                        </div>
                    </div>
                `).join('');
                initializeSortable();
            });
    }

    // Función para cargar supervisores
    function loadSupervisores() {
        fetch('/supervisores')
            .then(response => response.json())
            .then(data => {
                supervisoresData = data; // Guardamos los datos en el array
                supervisoresList.innerHTML = supervisoresData.map(supervisor => `
                    <div class="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-move draggable-supervisor"
                         data-supervisor="${supervisor.Nombre || ''}"
                         data-modulo="${supervisor.Modulo || ''}"
                         data-index="${supervisoresData.indexOf(supervisor)}">
                        <div>
                            <h3 class="font-medium">Módulo: ${supervisor.Modulo}</h3>
                            <p class="text-sm text-gray-500">Supervisor: ${supervisor.Nombre}</p>
                        </div>
                    </div>
                `).join('');
                initializeSortable();
            });
    }

    // Modificar la función getEmptyRow para insertar al inicio
    function getEmptyRow() {
        let row = Array.from(vinculacionTbody.getElementsByTagName('tr')).find(row => {
            const mecanicoNombre = row.querySelector('[name="mecanico"] .mecanico-nombre')?.textContent.trim();
            const supervisorModulo = row.querySelector('[name="supervisor-modulo"]')?.textContent.trim();
            return !mecanicoNombre || !supervisorModulo || mecanicoNombre === '' || supervisorModulo === '';
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
                <td name="comida" class="px-4 py-2">${createTimeSelect()}</td>
                <td name="break-lj" class="px-4 py-2">${createTimeSelect()}</td>
                <td name="break-v" class="px-4 py-2">${createTimeSelect()}</td>
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

    // Modificar la función initializeSortable para optimizar el rendimiento
    function initializeSortable() {
        if (mecanicosData.length && supervisoresData.length) {
            // Optimizar las opciones de Sortable
            const commonOptions = {
                animation: 150,
                forceFallback: false, // Usar HTML5 DnD cuando sea posible
                delayOnTouchOnly: true,
                delay: 100, // Pequeño retraso para táctil
                touchStartThreshold: 5,
                fallbackTolerance: 3,
                ghostClass: 'bg-blue-100'
            };

            // Configurar Sortable para mecánicos con opciones optimizadas
            new Sortable(mecanicosList, {
                ...commonOptions,
                group: {
                    name: 'shared',
                    pull: 'clone',
                    put: false
                },
                sort: false,
                onClone: (evt) => {
                    requestAnimationFrame(() => {
                        evt.item.style.transform = 'translate3d(0, 0, 0)';
                    });
                }
            });

            // Configurar Sortable para supervisores
            new Sortable(supervisoresList, {
                ...commonOptions,
                group: {
                    name: 'shared',
                    pull: 'clone',
                    put: false
                },
                sort: false
            });

            // Configurar Sortable para la tabla con opciones de rendimiento
            new Sortable(vinculacionTbody, {
                ...commonOptions,
                group: {
                    name: 'shared',
                    pull: false,
                    put: true
                },
                onAdd: function (evt) {
                    requestAnimationFrame(() => {
                        const item = evt.item;
                        const index = parseInt(item.getAttribute('data-index'));
                        let row = getEmptyRow();

                        if (row !== vinculacionTbody.firstChild) {
                            vinculacionTbody.insertBefore(row, vinculacionTbody.firstChild);
                        }

                        if (item.classList.contains('draggable-mecanico')) {
                            const mecanico = mecanicosData[index];
                            if (mecanico) {
                                updateMecanicoCell(row, mecanico);
                            }
                        } else if (item.classList.contains('draggable-supervisor')) {
                            const supervisor = supervisoresData[index];
                            if (supervisor) {
                                updateSupervisorCell(row, supervisor);
                            }
                        }

                        item.remove();
                    });
                }
            });
        }
    }

    // Separar la actualización de celdas en funciones independientes
    function updateMecanicoCell(row, mecanico) {
        const mecanicoCell = row.querySelector('[name="mecanico"]');
        const img = mecanicoCell.querySelector('img');
        img.src = getMecanicoImageUrl(mecanico.nombre);
        img.alt = mecanico.cvetra;
        mecanicoCell.querySelector('.mecanico-nombre').textContent = mecanico.nombre;
        row.setAttribute('data-cvetra', mecanico.cvetra);
    }

    function updateSupervisorCell(row, supervisor) {
        const cell = row.querySelector('[name="supervisor-modulo"]');
        cell.innerHTML = `Mod: ${supervisor.Modulo}<br>Sup: ${supervisor.Nombre}`;
        row.setAttribute('data-supervisor', supervisor.Nombre);
        row.setAttribute('data-modulo', supervisor.Modulo);
    }

    // Hacer la función validateTimeRange accesible globalmente
    window.validateTimeRange = function (select) {
        const container = select.closest('div');
        const startSelect = container.querySelector('select:first-child');
        const endSelect = container.querySelector('select:last-child');
        const columnName = select.closest('td').getAttribute('name').replace('-', ' ');

        const startTime = startSelect.value;
        const endTime = endSelect.value;

        if (startTime && endTime) {
            if (startTime >= endTime) {
                Swal.fire({
                    title: 'Error en horario',
                    text: `La hora de fin debe ser mayor a la hora de inicio en ${columnName}`,
                    icon: 'warning',
                    confirmButtonColor: '#d33'
                }).then(() => {
                    select.value = '';
                });
                return false;
            }
        }
        return true;
    }

    function createTimeSelect(startValue = '', endValue = '') {
        const times = [];
        for (let hour = 8; hour <= 17; hour++) {
            ['00', '10', '15', '20', '25', '30', '35', '40', '45', '50'].forEach(minute => {
                if (hour !== 17 || (hour === 17 && minute <= '50')) {
                    times.push(`${String(hour).padStart(2, '0')}:${minute}`);
                }
            });
        }

        return `<div class="flex items-center gap-1">
            <select class="bg-transparent border-gray-300 dark:border-gray-700 rounded w-1/2"
                    onchange="validateTimeRange(this)">
                <option value="">Inicio</option>
                ${times.map(time =>
            `<option value="${time}" ${time === startValue ? 'selected' : ''}>${time}</option>`
        ).join('')}
            </select>
            <select class="bg-transparent border-gray-300 dark:border-gray-700 rounded w-1/2"
                    onchange="validateTimeRange(this)">
                <option value="">Fin</option>
                ${times.map(time =>
            `<option value="${time}" ${time === endValue ? 'selected' : ''}>${time}</option>`
        ).join('')}
            </select>
        </div>`;
    }

    // Iniciar carga de datos
    loadMecanicos();
    loadSupervisores();

    // Hacer la función deleteVinculacion accesible globalmente
    window.deleteVinculacion = function (button, id) {
        Swal.fire({
            title: '¿Está seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/vinculaciones/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire(
                                'Eliminado',
                                'El registro ha sido eliminado.',
                                'success'
                            );
                            button.closest('tr').remove();
                        } else {
                            throw new Error(data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire(
                            'Error',
                            'No se pudo eliminar el registro',
                            'error'
                        );
                    });
            }
        });
    }

    // Modificar la función loadVinculaciones para incluir los IDs al agrupar
    function loadVinculaciones() {
        // Mostrar estado de carga
        vinculacionTbody.innerHTML = `
            <tr class="animate-pulse bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <td class="px-4 py-2"><div class="h-6 bg-gray-200 rounded"></div></td>
                <td class="px-4 py-2">
                    <div class="flex items-center gap-2">
                        <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div class="h-6 bg-gray-200 rounded w-32"></div></td>
                    </div>
                </td>
                <td class="px-4 py-2"><div class="h-8 bg-gray-200 rounded"></div></td>
                <td class="px-4 py-2"><div class="h-8 bg-gray-200 rounded"></div></td>
                <td class="px-4 py-2"><div class="h-8 bg-gray-200 rounded"></div></td>
                <td class="px-4 py-2"><div class="h-6 w-6 bg-gray-200 rounded"></div></td>
            </tr>
            <tr class="animate-pulse bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <td class="px-4 py-2"><div class="h-6 bg-gray-200 rounded"></div></td>
                <td class="px-4 py-2">
                    <div class="flex items-center gap-2">
                        <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div class="h-6 bg-gray-200 rounded w-32"></div>
                    </div>
                </td>
                <td class="px-4 py-2"><div class="h-8 bg-gray-200 rounded"></div></td>
                <td class="px-4 py-2"><div class="h-8 bg-gray-200 rounded"></div></td>
                <td class="px-4 py-2"><div class="h-8 bg-gray-200 rounded"></div></td>
                <td class="px-4 py-2"><div class="h-6 w-6 bg-gray-200 rounded"></div></td>
            </tr>`;

        fetch('/vinculaciones')
            .then(response => response.json())
            .then(data => {
                // Agrupar vinculaciones por horarios y supervisor
                const grouped = data.reduce((acc, curr) => {
                    const key = `${curr.Supervisor}-${curr.Modulo}-${curr.Hora_Comida_Inicio}-${curr.Hora_Comida_Fin}-${curr.Break_Lun_Jue_Inicio}-${curr.Break_Lun_Jue_Fin}-${curr.Break_Viernes_Inicio}-${curr.Break_Viernes_Fin}`;

                    if (!acc[key]) {
                        acc[key] = {
                            ...curr,
                            mecanicos: [{
                                id: curr.id,
                                nombre: curr.Mecanico,
                                cvetra: curr.Mecanico
                            }]
                        };
                    } else {
                        acc[key].mecanicos.push({
                            id: curr.id,
                            nombre: curr.Mecanico,
                            cvetra: curr.Mecanico
                        });
                    }
                    return acc;
                }, {});

                vinculacionTbody.innerHTML = Object.values(grouped).map(vinculacion => `
                    <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700"
                        data-ids="${vinculacion.mecanicos.map(m => m.id).join(',')}"
                        data-modulo="${vinculacion.Modulo}"
                        data-supervisor="${vinculacion.Supervisor}">
                        <td name="supervisor-modulo" class="px-4 py-2">
                            Mod: ${vinculacion.Modulo}<br>Sup: ${vinculacion.Supervisor}
                        </td>
                        <td name="mecanico" class="px-4 py-2">
                            <div class="flex flex-col gap-2">
                                ${vinculacion.mecanicos.map(mec => `
                                    <div class="flex items-center gap-2">
                                        <div class="flex-shrink-0">
                                            <img class="w-10 h-10 rounded-full ring-2 ring-gray-300"
                                                 src="${getMecanicoImageUrl(mec.nombre)}"
                                                 alt="${mec.nombre}"/>
                                        </div>
                                        <span class="mecanico-nombre">${mec.nombre}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </td>
                        <td name="comida" class="px-4 py-2">
                            ${createTimeSelect(vinculacion.Hora_Comida_Inicio, vinculacion.Hora_Comida_Fin)}
                        </td>
                        <td name="break-lj" class="px-4 py-2">
                            ${createTimeSelect(vinculacion.Break_Lun_Jue_Inicio, vinculacion.Break_Lun_Jue_Fin)}
                        </td>
                        <td name="break-v" class="px-4 py-2">
                            ${createTimeSelect(vinculacion.Break_Viernes_Inicio, vinculacion.Break_Viernes_Fin)}
                        </td>
                        <td class="px-4 py-2">
                            <button onclick="deleteGroupedVinculaciones(this, '${vinculacion.mecanicos.map(m => m.id).join(',')}')"
                                    class="text-red-500 hover:text-red-700">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </td>
                    </tr>
                `).join('');
            })
            .catch(error => {
                console.error('Error al cargar vinculaciones:', error);
                // Mostrar mensaje de error en la tabla
                vinculacionTbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="px-4 py-2 text-center text-red-500">
                            Error al cargar los datos
                        </td>
                    </tr>
                `;
            });
    }

    // Nueva función para eliminar grupo de vinculaciones
    window.deleteGroupedVinculaciones = function (button, ids) {
        Swal.fire({
            title: '¿Está seguro?',
            text: "Se eliminarán todas las vinculaciones de este grupo",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const idArray = ids.split(',');
                Promise.all(idArray.map(id =>
                    fetch(`/vinculaciones/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken
                        }
                    }).then(response => response.json())
                ))
                    .then(() => {
                        Swal.fire(
                            'Eliminado',
                            'Los registros han sido eliminados.',
                            'success'
                        );
                        button.closest('tr').remove();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire(
                            'Error',
                            'No se pudieron eliminar los registros',
                            'error'
                        );
                    });
            }
        });
    }

    // Modificar la función que mapea las vinculaciones para guardar
    document.getElementById('guardar-vinculacion').addEventListener('click', function () {
        // Validar todos los horarios antes de proceder
        const rows = Array.from(vinculacionTbody.children);
        let isValid = true;

        for (const row of rows) {
            const timeColumns = ['comida', 'break-lj', 'break-v'];
            for (const column of timeColumns) {
                const container = row.querySelector(`[name="${column}"]`);
                const startSelect = container.querySelector('select:first-child');
                const endSelect = container.querySelector('select:last-child');

                if (!startSelect.value || !endSelect.value) {
                    Swal.fire({
                        title: 'Campos incompletos',
                        text: `Por favor complete los horarios de ${column.replace('-', ' ')}`,
                        icon: 'warning',
                        confirmButtonColor: '#3085d6'
                    });
                    isValid = false;
                    return;
                }

                if (startSelect.value >= endSelect.value) {
                    Swal.fire({
                        title: 'Error en horarios',
                        text: `La hora de fin debe ser mayor a la hora de inicio en ${column.replace('-', ' ')}`,
                        icon: 'warning',
                        confirmButtonColor: '#d33'
                    });
                    isValid = false;
                    return;
                }
            }
        }

        if (!isValid) return;

        // Modificar cómo se obtienen los datos para enviar
        const vinculaciones = Array.from(vinculacionTbody.children).flatMap(row => {
            const ids = row.getAttribute('data-ids')?.split(',') || [];
            const mecanicosElements = row.querySelectorAll('[name="mecanico"] .mecanico-nombre');
            const supervisor = row.getAttribute('data-supervisor');
            const modulo = row.getAttribute('data-modulo');
            const horarios = {
                Hora_Comida_Inicio: row.querySelector('[name="comida"] select:first-child').value,
                Hora_Comida_Fin: row.querySelector('[name="comida"] select:last-child').value,
                Break_Lun_Jue_Inicio: row.querySelector('[name="break-lj"] select:first-child').value,
                Break_Lun_Jue_Fin: row.querySelector('[name="break-lj"] select:last-child').value,
                Break_Viernes_Inicio: row.querySelector('[name="break-v"] select:first-child').value,
                Break_Viernes_Fin: row.querySelector('[name="break-v"] select:last-child').value
            };

            // Obtener los cvetra de los mecanicos de la fila
            const cvetras = [];
            row.querySelectorAll('[name="mecanico"] .mecanico-nombre').forEach(mecElement => {
                const nombre = mecElement.textContent.trim();
                const cvetra = mecanicoMap.get(nombre)?.cvetra || '';
                cvetras.push(cvetra);
            });

            return Array.from(mecanicosElements).map((mecElement, index) => ({
                id: ids[index] || null,
                Supervisor: supervisor,
                Modulo: modulo,
                Mecanico: mecElement.textContent.trim(),
                Num_Mecanico: cvetras[index] || '', // <-- Agrega el número del mecánico aquí
                ...horarios
            }));
        });

        Swal.fire({
            title: '¿Desea guardar la información?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/vinculaciones', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify({ vinculaciones })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire({
                                title: 'Éxito',
                                text: data.message || 'Vinculaciones guardadas correctamente',
                                icon: 'success',
                                confirmButtonColor: '#3085d6'
                            }).then(() => {
                                loadVinculaciones();
                            });
                        } else {
                            throw new Error(data.message || 'Error al guardar');
                        }
                    })
                    .catch(error => {
                        console.error('Error al guardar vinculaciones:', error);
                        Swal.fire({
                            title: 'Error',
                            text: 'Error al guardar las vinculaciones',
                            icon: 'error',
                            confirmButtonColor: '#d33'
                        });
                    });
            }
        });
    });

    // Cargar vinculaciones iniciales
    loadVinculaciones();
});
