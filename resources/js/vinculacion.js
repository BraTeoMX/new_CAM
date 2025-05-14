document.addEventListener('DOMContentLoaded', function() {
    // Configuración global de AJAX
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        error: function(xhr, status, error) {
            console.error('Error en la petición AJAX:', {
                status: xhr.status,
                statusText: xhr.statusText,
                responseText: xhr.responseText,
                error: error
            });
        }
    });

    // Función para mostrar loader
    function showLoader(element) {
        element.html(`
            <div class="animate-pulse">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
            </div>
        `);
    }

    // --- Sortable para paneles de mecánicos y supervisores ---
    // Panel de mecánicos
    const mecanicosList = $('#mecanicos-list');
    showLoader(mecanicosList);

    // Panel de supervisores
    const supervisoresList = $('#supervisores-list');
    showLoader(supervisoresList);

    // Panel de vinculaciones
    const vinculacionTbody = document.getElementById('vinculacion-tbody');

    // Cargar mecánicos
    $.get('/mecanicos')
        .done(function(data) {
            mecanicosList.empty();
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(mecanico => {
                    const imgSrc = `http://128.150.102.45:8000/Intimark/${mecanico.cvetra}.jpg`;
                    mecanicosList.append(`
                        <div class="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-move draggable-mecanico"
                             data-nombre="${mecanico.nombre || ''}"
                             data-cvetra="${mecanico.cvetra || ''}">
                            <img class="w-10 h-10 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500 object-cover"
                                src="${imgSrc}"
                                alt="${mecanico.cvetra}"
                                onerror="this.onerror=null;this.src='/default-avatar.jpg';"
                            />
                            <div class="flex-1 min-w-0">
                                <h3 class="text-sm font-medium text-gray-900 dark:text-white">${mecanico.nombre || 'Sin nombre'}</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400">${mecanico.cvetra || 'Sin ID'}</p>
                            </div>
                        </div>
                    `);
                });
            } else {
                mecanicosList.html('<p class="text-gray-500 dark:text-gray-400 text-center p-4">No se encontraron mecánicos</p>');
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Error AJAX mecánicos:', jqXHR, textStatus, errorThrown);
            mecanicosList.html(`
                <div class="text-red-500 dark:text-red-400 text-center p-4">
                    Error al cargar los mecánicos: ${errorThrown}
                </div>
            `);
        });

    // Cargar supervisores
    $.get('/supervisores')
        .done(function(data) {
            supervisoresList.empty();
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(supervisor => {
                    supervisoresList.append(`
                        <div class="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-move draggable-supervisor"
                             data-supervisor="${supervisor.Nombre || ''}"
                             data-modulo="${supervisor.Modulo || ''}">
                            <div class="flex-1">
                                <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                                    Módulo: ${supervisor.Modulo || 'Sin módulo'}
                                </h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400">
                                    Supervisor: ${supervisor.Nombre || 'Sin nombre'}
                                </p>
                            </div>
                        </div>
                    `);
                });
            } else {
                supervisoresList.html('<p class="text-gray-500 dark:text-gray-400 text-center p-4">No se encontraron supervisores</p>');
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Error AJAX supervisores:', jqXHR, textStatus, errorThrown);
            supervisoresList.html(`
                <div class="text-red-500 dark:text-red-400 text-center p-4">
                    Error al cargar los supervisores: ${errorThrown}
                </div>
            `);
        });

    // --- SortableJS para arrastrar a la tabla de vinculaciones ---
    // Mecanicos
    new Sortable(mecanicosList[0], {
        group: {
            name: 'mecanicos',
            pull: 'clone',
            put: false
        },
        sort: false,
        animation: 150
    });

    // Supervisores
    new Sortable(supervisoresList[0], {
        group: {
            name: 'supervisores',
            pull: 'clone',
            put: false
        },
        sort: false,
        animation: 150
    });

    // Vinculaciones (tabla)
    new Sortable(vinculacionTbody, {
        group: {
            name: 'vinculacion',
            put: ['mecanicos', 'supervisores']
        },
        animation: 150,
        onAdd: function (evt) {
            const item = evt.item;

            // Buscar la fila seleccionada (o la última si no hay selección)
            let tr = vinculacionTbody.querySelector('tr.selected');
            if (!tr) {
                // Si no hay fila seleccionada, usar la última fila existente
                tr = vinculacionTbody.querySelector('tr:last-child');
            }
            if (!tr) {
                // Si no hay filas, crear una nueva
                tr = document.createElement('tr');
                tr.className = "bg-white dark:bg-gray-800 border-b dark:border-gray-700 selected";
                tr.innerHTML = `
                    <td id="td-supervisor" name="supervisor" class="px-4 py-2"></td>
                    <td id="td-mecanico" name="mecanico" class="px-4 py-2"></td>
                    <td id="td-modulo" name="modulo" class="px-4 py-2"></td>
                    <td id="td-comida" name="comida" class="px-4 py-2" contenteditable="true"></td>
                    <td id="td-break-lj" name="break-lj" class="px-4 py-2" contenteditable="true"></td>
                    <td id="td-break-v" name="break-v" class="px-4 py-2" contenteditable="true"></td>
                    <td class="px-4 py-2">
                        <button class="text-red-500 hover:text-red-700" onclick="this.closest('tr').remove()">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </td>
                `;
                vinculacionTbody.appendChild(tr);
            }

            // Forzar la colocación en la columna correcta según el tipo
            if (item.classList.contains('draggable-mecanico')) {
                const nombre = item.getAttribute('data-nombre');
                // Solo colocar en columna Mecánico
                tr.querySelector('[name="mecanico"]').textContent = nombre;
            } else if (item.classList.contains('draggable-supervisor')) {
                const supervisor = item.getAttribute('data-supervisor');
                const modulo = item.getAttribute('data-modulo');
                // Solo colocar en columnas Supervisor y Módulo
                tr.querySelector('[name="supervisor"]').textContent = supervisor;
                tr.querySelector('[name="modulo"]').textContent = modulo;
            }

            // Quitar selección para el siguiente arrastre
            if (tr.classList.contains('selected')) {
                tr.classList.remove('selected');
            }

            // Remover el elemento arrastrado (clonado)
            item.remove();
        }
    });

    // Cargar vinculaciones existentes
    function cargarVinculaciones() {
        $.get('/vinculaciones', function(data) {
            const tbody = $('#vinculacion-tbody');
            tbody.empty();
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(v => {
                    tbody.append(`
                        <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 draggable-row" data-id="${v.id || ''}">
                            <td class="px-4 py-2">${v.Supervisor || ''}</td>
                            <td class="px-4 py-2">${v.Mecanico || ''}</td>
                            <td class="px-4 py-2">${v.Modulo || ''}</td>
                            <td class="px-4 py-2">${v.Hora_Comida || ''}</td>
                            <td class="px-4 py-2">${v.Break_Lun_Jue || ''}</td>
                            <td class="px-4 py-2">${v.Break_Viernes || ''}</td>
                            <td class="px-4 py-2"></td>
                        </tr>
                    `);
                });
            } else {
                tbody.html('<tr><td colspan="7" class="text-center text-gray-500 dark:text-gray-400 py-4">No hay vinculaciones registradas</td></tr>');
            }
        });
    }
    cargarVinculaciones();

    // Hacer las filas de la tabla drag & drop
    new Sortable(document.getElementById('vinculacion-tbody'), {
        animation: 150,
        handle: '.draggable-row',
        ghostClass: 'bg-blue-100 dark:bg-blue-900'
    });

    // Guardar vinculaciones (crear o actualizar)
    $('#guardar-vinculacion').on('click', function() {
        const vinculaciones = [];
        $('#vinculacion-tbody tr').each(function() {
            const tds = $(this).find('td');
            vinculaciones.push({
                id: $(this).data('id') || null,
                Supervisor: tds.eq(0).text().trim(),
                Mecanico: tds.eq(1).text().trim(),
                Modulo: tds.eq(2).text().trim(),
                Hora_Comida: tds.eq(3).text().trim(),
                Break_Lun_Jue: tds.eq(4).text().trim(),
                Break_Viernes: tds.eq(5).text().trim()
            });
        });

        $.ajax({
            url: '/vinculaciones',
            method: 'POST',
            data: JSON.stringify({ vinculaciones }),
            contentType: 'application/json',
            success: function(resp) {
                alert(resp.message || 'Vinculaciones guardadas correctamente');
                cargarVinculaciones();
            },
            error: function(xhr) {
                alert('Error al guardar vinculaciones');
                console.error(xhr);
            }
        });
    });
});
