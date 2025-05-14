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
        return cvetra ? `http://128.150.102.45:8000/Intimark/${cvetra}.jpg` : '/default-avatar.jpg';
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

    // Modificar la función onAdd del Sortable
    function initializeSortable() {
        // Solo inicializar si ambos arrays tienen datos
        if (mecanicosData.length && supervisoresData.length) {
            // Configurar Sortable para mecánicos
            new Sortable(mecanicosList, {
                group: {
                    name: 'shared',
                    pull: 'clone',
                    put: false
                },
                sort: false,
                animation: 150,
                ghostClass: 'bg-blue-100'
            });

            // Configurar Sortable para supervisores
            new Sortable(supervisoresList, {
                group: {
                    name: 'shared',
                    pull: 'clone',
                    put: false
                },
                sort: false,
                animation: 150,
                ghostClass: 'bg-blue-100'
            });

            // Configurar Sortable para la tabla
            new Sortable(vinculacionTbody, {
                group: {
                    name: 'shared',
                    pull: false,
                    put: true
                },
                animation: 150,
                onAdd: function (evt) {
                    const item = evt.item;
                    const index = parseInt(item.getAttribute('data-index'));
                    let row = getEmptyRow();

                    if (item.classList.contains('draggable-mecanico')) {
                        const mecanico = mecanicosData[index];
                        if (mecanico) {
                            const mecanicoCell = row.querySelector('[name="mecanico"]');
                            mecanicoCell.querySelector('.mecanico-nombre').textContent = mecanico.nombre;
                            mecanicoCell.querySelector('img').src = getMecanicoImageUrl(mecanico.nombre);
                            mecanicoCell.querySelector('img').alt = mecanico.cvetra;
                            row.setAttribute('data-cvetra', mecanico.cvetra);
                        }
                    }
                    else if (item.classList.contains('draggable-supervisor')) {
                        const supervisor = supervisoresData[index];
                        if (supervisor) {
                            const cell = row.querySelector('[name="supervisor-modulo"]');
                            cell.innerHTML = `Mod: ${supervisor.Modulo}<br>Sup: ${supervisor.Nombre}`;
                            row.setAttribute('data-supervisor', supervisor.Nombre);
                            row.setAttribute('data-modulo', supervisor.Modulo);
                        }
                    }

                    item.remove();
                }
            });
        }
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
            ['00', '15', '30', '45'].forEach(minute => {
                if (hour !== 17 || (hour === 17 && minute <= '45')) {
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

    // Modificar la función getEmptyRow para una mejor validación
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
            vinculacionTbody.appendChild(row);
        }
        return row;
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

    // Modificar loadVinculaciones para incluir y remover el loading state
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
                // Reemplazar el loading state con los datos reales
                vinculacionTbody.innerHTML = data.map(vinculacion => `
                    <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700"
                        data-id="${vinculacion.id}"
                        data-modulo="${vinculacion.Modulo}"
                        data-supervisor="${vinculacion.Supervisor}"
                        data-cvetra="${vinculacion.Mecanico}">
                        <td name="supervisor-modulo" class="px-4 py-2">Mod:${vinculacion.Modulo}<br>Sup:<br>${vinculacion.Supervisor}</td>
                        <td name="mecanico" class="px-4 py-2 flex items-center gap-2">
                            <div class="flex-shrink-0">
                                <img class="w-10 h-10 rounded-full ring-2 ring-gray-300"
                                     src="${getMecanicoImageUrl(vinculacion.Mecanico)}"
                                     alt="${vinculacion.Mecanico}"/>
                            </div>
                            <span class="mecanico-nombre">${vinculacion.Mecanico}</span>
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
                            <button onclick="window.deleteVinculacion(this, ${vinculacion.id})" 
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

    // Función para guardar vinculaciones
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

        // Continuar con el guardado si todas las validaciones pasan
        const vinculaciones = rows.map(row => ({
            id: row.getAttribute('data-id'), // Agregamos el id si existe
            Supervisor: row.getAttribute('data-supervisor'),
            Modulo: row.getAttribute('data-modulo'),
            Mecanico: row.querySelector('[name="mecanico"] .mecanico-nombre').textContent.trim(),
            Hora_Comida_Inicio: row.querySelector('[name="comida"] select:first-child').value,
            Hora_Comida_Fin: row.querySelector('[name="comida"] select:last-child').value,
            Break_Lun_Jue_Inicio: row.querySelector('[name="break-lj"] select:first-child').value,
            Break_Lun_Jue_Fin: row.querySelector('[name="break-lj"] select:last-child').value,
            Break_Viernes_Inicio: row.querySelector('[name="break-v"] select:first-child').value,
            Break_Viernes_Fin: row.querySelector('[name="break-v"] select:last-child').value
        }));

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
