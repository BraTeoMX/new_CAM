$(document).ready(function () {

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    // Variables para almacenar todos los datos cargados inicialmente
    // Variables globales para almacenar datos y la instancia de la tabla
    let todosLosSupervisores = [];
    let todosLosMecanicos = [];
    let tablaVinculaciones = null; // Variable para la instancia de DataTables

    // 1. Inicializar los Select2 (inicialmente vacíos y deshabilitados)
    const $selectSupervisor = $('#select-supervisor').select2({
        placeholder: 'Seleccione un area/módulo',
        allowClear: true
    });

    const $selectMecanico = $('#select-mecanico').select2({
        placeholder: 'Seleccione un mecánico',
        allowClear: true
    }).prop('disabled', true); // El de mecánicos empieza deshabilitado

    // Función para poblar el select de supervisores
    function poblarSupervisores(data) {
        // Transformar los datos para Select2
        const supervisoresParaSelect = $.map(data, function (item) {
            return {
                // El texto que se muestra en la opción
                text: `${item.modulo} - ${item.nombre}`,
                // El ID que se guarda como valor. Guardamos el objeto completo como un string JSON
                id: JSON.stringify(item)
            };
        });

        // Cargar los datos en el select
        $selectSupervisor.select2({
            placeholder: 'Seleccione un supervisor/módulo',
            allowClear: true,
            data: supervisoresParaSelect // Usar los datos locales
        });

        // Limpiar cualquier selección previa al cargar
        $selectSupervisor.val(null).trigger('change');
    }

    // 2. Cargar todos los datos desde el servidor al iniciar la página
    // Usamos $.when para ejecutar ambas peticiones en paralelo
    $.when(
        $.ajax({ url: '/vinculacion/obtenerSupervisores', dataType: 'json' }),
        $.ajax({ url: '/vinculacion/obtenerMecanicos', dataType: 'json' })
    ).done(function (supervisoresResponse, mecanicosResponse) {
        // $.when devuelve un arreglo [data, statusText, jqXHR] para cada petición
        todosLosSupervisores = supervisoresResponse[0];
        todosLosMecanicos = mecanicosResponse[0];

        // Una vez que tenemos los datos, poblamos el primer select
        poblarSupervisores(todosLosSupervisores);

    }).fail(function () {
        console.error("Error: No se pudieron cargar los datos iniciales de supervisores o mecánicos.");
        // Aquí podrías mostrar un mensaje de error al usuario
    });

    // 3. Lógica de dependencia y filtro local
    $selectSupervisor.on('change', function () {
        const supervisorSeleccionadoJSON = $(this).val();

        // Limpiar y deshabilitar mecánico si no hay supervisor
        $selectMecanico.val(null).trigger('change');
        $selectMecanico.empty(); // Vaciar las opciones anteriores

        if (!supervisorSeleccionadoJSON) {
            $selectMecanico.prop('disabled', true);
            return;
        }

        // Si hay un supervisor, filtramos los mecánicos localmente
        const supervisorData = JSON.parse(supervisorSeleccionadoJSON);
        const plantaSeleccionada = supervisorData.planta;

        // Filtrar el array de TODOS los mecánicos usando la planta del supervisor
        const mecanicosFiltrados = todosLosMecanicos.filter(mecanico => mecanico.planta === plantaSeleccionada);

        // Transformar los mecánicos filtrados al formato de Select2
        const mecanicosParaSelect = $.map(mecanicosFiltrados, function (item) {
            return {
                text: `${item.nombre} - ${item.numero_empleado}`,
                id: JSON.stringify(item)
            };
        });

        // Habilitar y poblar el select de mecánicos con los datos filtrados
        $selectMecanico.select2({
            placeholder: 'Seleccione un mecánico',
            allowClear: true,
            data: mecanicosParaSelect
        });

        $selectMecanico.prop('disabled', false);
        $selectMecanico.val(null).trigger('change'); // Asegurarse de que esté limpio
    });

    // 4. Habilitar el botón "Añadir" (misma lógica que ya tenías)
    $('#select-supervisor, #select-mecanico').on('change', function () {
        const supervisorOk = $('#select-supervisor').val();
        const mecanicoOk = $('#select-mecanico').val();

        $('#btn-anadir-vinculacion').prop('disabled', !(supervisorOk && mecanicoOk));
    });

    // 5. Lógica para el clic en el botón "Añadir" (sin cambios, ya era correcta)
    $('#btn-anadir-vinculacion').on('click', function () {
        const supervisorData = JSON.parse($selectSupervisor.val());
        const mecanicoData = JSON.parse($selectMecanico.val());

        const datosParaEnviar = {
            numero_empleado_supervisor: supervisorData.numero_empleado,
            nombre_supervisor: supervisorData.nombre,
            planta: supervisorData.planta,
            modulo: supervisorData.modulo,
            nombre_mecanico: mecanicoData.nombre,
            numero_empleado_mecanico: mecanicoData.numero_empleado
        };

        $.ajax({
            url: '/vinculacion/guardar',
            type: 'POST',
            data: datosParaEnviar,
            success: function (response) {
                // ✅ Notificación de éxito
                Swal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: response.message || 'La operación se completó exitosamente.',
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true
                });

                // Limpiar formulario y recargar tabla
                $selectSupervisor.val(null).trigger('change');
                cargarTablaVinculaciones();
            },
            error: function (xhr) {
                const error = xhr.responseJSON;

                if (xhr.status === 422 && error?.errors) {
                    // ⚠️ Errores de validación
                    let listaErrores = '<ul class="text-left">';
                    for (let campo in error.errors) {
                        error.errors[campo].forEach(mensaje => {
                            listaErrores += `<li>🔸 ${mensaje}</li>`;
                        });
                    }
                    listaErrores += '</ul>';

                    Swal.fire({
                        icon: 'warning',
                        title: 'Errores de validación',
                        html: listaErrores,
                        confirmButtonText: 'Revisar'
                    });

                } else {
                    // ❌ Error general del servidor (500, etc.)
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al guardar',
                        text: error?.message || 'No se pudo completar la operación.',
                        confirmButtonText: 'Entendido'
                    });
                }

                // Muestra detalles en consola para debugging
                console.error('Detalles del error:', error || xhr);
            }
        });
    });


    /**
     * Genera etiquetas <option> para un select de tiempo.
     * @param {string} startTime - Hora de inicio en formato "HH:mm".
     * @param {string} endTime - Hora de fin en formato "HH:mm".
     * @param {number} intervalMinutes - Intervalo entre opciones en minutos.
     * @param {string} selectedValue - El valor que debe aparecer seleccionado.
     * @returns {string} - El HTML de las opciones.
     */
    function generarOpcionesDeTiempo(startTime, endTime, intervalMinutes, selectedValue) {
        let options = '';
        let start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);

        while (start <= end) {
            const hours = String(start.getHours()).padStart(2, '0');
            const minutes = String(start.getMinutes()).padStart(2, '0');
            const timeValue = `${hours}:${minutes}`;
            // Marcar como 'selected' si coincide con el valor de la BD
            const normalizar = (hora) => {
                if (!hora) return '';
                const [h, m] = hora.split(':');
                return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
            };

            const selected = timeValue === normalizar(selectedValue) ? 'selected' : '';
            options += `<option value="${timeValue}" ${selected}>${timeValue}</option>`;
            start.setMinutes(start.getMinutes() + intervalMinutes);
        }
        return options;
    }

    /**
     * Calcula la hora de fin sumando una duración a la hora de inicio.
     * @param {string} startTime - Hora de inicio en formato "HH:mm".
     * @param {number} durationMinutes - Minutos a sumar.
     * @returns {string} - Hora de fin en formato "HH:mm".
     */
    function calcularHoraFin(startTime, durationMinutes) {
        if (!startTime || typeof startTime !== 'string') return ''; // Si no hay hora válida, devuelve vacío

        // Si viene con segundos (formato HH:mm:ss), lo recortamos a HH:mm
        const partes = startTime.split(':');
        if (partes.length >= 2) {
            startTime = `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
        } else {
            return ''; // Formato inválido
        }

        const time = new Date(`1970-01-01T${startTime}:00`);
        if (isNaN(time.getTime())) return ''; // Fecha inválida

        time.setMinutes(time.getMinutes() + durationMinutes);
        const hours = String(time.getHours()).padStart(2, '0');
        const minutes = String(time.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }


    function cargarTablaVinculaciones() {
        $.ajax({
            url: '/vinculacion/mostrarRegistros',
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                const tbody = $('#vinculacion-tbody');

                // Si DataTables ya está inicializada, la destruimos para poder recargarla
                if ($.fn.DataTable.isDataTable('#tabla-vinculacion')) {
                    tablaVinculaciones.destroy();
                }

                tbody.empty(); // Limpiar tabla

                response.forEach(function (vinculacion) {
                    // 1. Generar las opciones para cada select con el valor correcto seleccionado
                    const opcionesComida = generarOpcionesDeTiempo("08:00", "22:00", 30, vinculacion.hora_comida_inicio);
                    const opcionesBreakLJ = generarOpcionesDeTiempo("08:00", "19:00", 15, vinculacion.break_lunes_jueves_inicio);
                    const opcionesBreakV = generarOpcionesDeTiempo("08:00", "19:00", 15, vinculacion.break_viernes_inicio);

                    // 2. Calcular las horas de fin iniciales a partir de los datos de la BD
                    const horaComidaFin = calcularHoraFin(vinculacion.hora_comida_inicio, 30);
                    const breakLJFin = calcularHoraFin(vinculacion.break_lunes_jueves_inicio, 15);
                    const breakVFin = calcularHoraFin(vinculacion.break_viernes_inicio, 15);

                    // Convertimos los datos originales a un string JSON para el atributo data-*
                    const supervisorDataString = JSON.stringify(vinculacion.supervisor_original);
                    const mecanicoDataString = JSON.stringify(vinculacion.mecanico_original);

                    // 3. Construir la fila con los datos y las opciones generadas
                    const fila = `
                        <tr data-id="${vinculacion.id}" class="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                            <td class="px-4 py-2 border-b ...">${vinculacion.modulo}</td>
                            <td class="px-4 py-2 border-b ...">${vinculacion.nombre_mecanico}</td>
                            <td class="px-4 py-2 border-b ...">${vinculacion.planta}</td>
                            
                            <td class="px-4 py-2 border-b ...">
                                <div class="flex gap-2 w-full">
                                    <select name="hora_comida_inicio" class=" bg-transparent border-gray-300 dark:border-gray-700 w-[60%] border ... vinculacion-select" data-duration="30">
                                        <option value="">Seleccionar</option>
                                        ${opcionesComida}
                                    </select>
                                    <input name="hora_comida_fin" type="text" class="bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-700 w-[40%] " value="${horaComidaFin || ''}" readonly />
                                </div>
                            </td>

                            <td class="px-4 py-2 border-b ...">
                                <div class="flex gap-2 w-full">
                                    <select name="break_lunes_jueves_inicio" class="bg-transparent border-gray-300 dark:border-gray-700 w-[60%] border ... vinculacion-select" data-duration="15">
                                         <option value="">Seleccionar</option>
                                        ${opcionesBreakLJ}
                                    </select>
                                    <input name="break_lunes_jueves_fin" type="text" class="bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-700 w-[40%] " value="${breakLJFin || ''}" readonly />
                                </div>
                            </td>

                            <td class="px-4 py-2 border-b ...">
                                <div class="flex gap-2 w-full">
                                    <select name="break_viernes_inicio" class="bg-transparent border-gray-300 dark:border-gray-700 w-[60%] border ... vinculacion-select" data-duration="15">
                                         <option value="">Seleccionar</option>
                                        ${opcionesBreakV}
                                    </select>
                                    <input name="break_viernes_fin" type="text" class="bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-700 w-[40%] " value="${breakVFin || ''}" readonly />
                                </div>
                            </td>
                            <td class="text-center">
                            <div class="flex justify-center gap-2">
                                <button 
                                    class="btn-editar bg-orange-700 hover:bg-orange-900 text-white font-bold py-1 px-3 rounded shadow-lg"
                                    data-id="${vinculacion.id}"
                                    data-supervisor='${supervisorDataString}'
                                    data-mecanico='${mecanicoDataString}'>
                                    Editar
                                </button>
                                <button 
                                    class="btn-eliminar bg-red-800 hover:bg-red-950 text-white font-bold py-1 px-3 rounded shadow-lg"
                                    data-id="${vinculacion.id}">
                                    Eliminar
                                </button>
                            </div>
                        </td>
                        </tr>`;
                    tbody.append(fila);
                });

                // Inicializamos DataTables DESPUÉS de haber agregado todas las filas
                tablaVinculaciones = $('#tabla-vinculacion').DataTable({
                    "language": {
                        "processing": "Procesando...",
                        "lengthMenu": "Mostrar _MENU_ registros",
                        "zeroRecords": "No se encontraron resultados",
                        "emptyTable": "Ningún dato disponible en esta tabla",
                        "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                        "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                        "infoFiltered": "(filtrado de un total de _MAX_ registros)",
                        "search": "Buscar:",
                        "loadingRecords": "Cargando...",
                        "paginate": {
                            "first": "Primero",
                            "last": "Último",
                            "next": "Siguiente",
                            "previous": "Anterior"
                        },
                        "aria": {
                            "sortAscending": ": Activar para ordenar la columna de manera ascendente",
                            "sortDescending": ": Activar para ordenar la columna de manera descendente"
                        }
                    },
                    "destroy": true, // Asegura que se pueda reinicializar
                    "lengthChange": false, // ✅ Oculta el selector "Mostrar X registros"
                    "pageLength": 50,
                    initComplete: function () {
                        this.api().columns([0, 1, 2]).every(function () {
                            var column = this;
                            var title = $(column.footer()).text();
                            var input = $('<input type="text" placeholder="Buscar..." class="w-full border-gray-300 rounded-md shadow-sm text-sm" />')
                                .appendTo($(column.footer()).empty())
                                .on('keyup change clear', function () {
                                    if (column.search() !== this.value) {
                                        column.search(this.value).draw();
                                    }
                                });
                        });
                    }
                });
            },
            error: function (xhr) {
                console.error("Error al obtener los registros:", xhr.responseText);
                $('#vinculacion-tbody').html('<tr><td colspan="7" class="text-center text-red-500 py-4">Error al cargar los datos.</td></tr>');
            }
        });
    }

    // --- MANEJADOR DE EVENTOS PARA ACTUALIZACIÓN AUTOMÁTICA ---

    // Se usa delegación de eventos: un solo listener en el tbody para todos los selects.
    $('#vinculacion-tbody').on('change', '.vinculacion-select', function () {
        const select = $(this);
        const selectedTime = select.val();
        const duration = parseInt(select.data('duration'), 10);

        // Encuentra el input de 'fin' que está justo al lado
        const finInput = select.siblings('input[type="text"]');

        // Calcula la nueva hora de fin y actualiza el input
        const endTime = calcularHoraFin(selectedTime, duration);
        finInput.val(endTime);
    });

    $('#guardar-vinculacion').on('click', function () {
        const vinculacionesAActualizar = [];

        // 1. Recorrer cada fila <tr> de la tabla
        $('#vinculacion-tbody tr').each(function () {
            const fila = $(this);
            const id = fila.data('id'); // Obtener el ID de la vinculación

            // 2. Obtener los valores de los selects de esa fila usando su atributo 'name'
            const horaComidaInicio = fila.find('select[name="hora_comida_inicio"]').val();
            const breakLJInicio = fila.find('select[name="break_lunes_jueves_inicio"]').val();
            const breakVInicio = fila.find('select[name="break_viernes_inicio"]').val();
            const horaComidaFin = fila.find('input[name="hora_comida_fin"]').val();
            const breakLJFin = fila.find('input[name="break_lunes_jueves_fin"]').val();
            const breakVFin = fila.find('input[name="break_viernes_fin"]').val();

            // 3. Crear un objeto con los datos de la fila
            vinculacionesAActualizar.push({
                id: id,
                hora_comida_inicio: horaComidaInicio,
                hora_comida_fin: horaComidaFin,
                break_lunes_jueves_inicio: breakLJInicio,
                break_lunes_jueves_fin: breakLJFin,
                break_viernes_inicio: breakVInicio,
                break_viernes_fin: breakVFin
            });
        });

        // 4. Enviar los datos al servidor mediante AJAX
        $.ajax({
            url: '/vinculacion/actualizarMasivo',
            type: 'POST',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            contentType: 'application/json',
            data: JSON.stringify({ vinculaciones: vinculacionesAActualizar }),

            success: function (response) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualización completada!',
                    text: response.message || 'Se actualizaron los registros correctamente.',
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true
                });

                // Opcional: recargar la tabla
                cargarTablaVinculaciones();
            },

            error: function (xhr) {
                const error = xhr.responseJSON;

                if (xhr.status === 422 && error?.errors) {
                    let listaErrores = '<ul class="text-left">';
                    for (let campo in error.errors) {
                        error.errors[campo].forEach(msg => {
                            listaErrores += `<li>🔸 ${msg}</li>`;
                        });
                    }
                    listaErrores += '</ul>';

                    Swal.fire({
                        icon: 'warning',
                        title: 'Errores de validación',
                        html: listaErrores,
                        confirmButtonText: 'Corregir'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error en la actualización',
                        text: error?.message || 'Ocurrió un error inesperado.',
                        confirmButtonText: 'Entendido'
                    });
                }
                console.error("Error al guardar:", error || xhr);
            }
        });
    });

    $('#tabla-vinculacion tbody').on('click', '.btn-editar', function () {
        const vinculacionId = $(this).data('id');
        const supervisorActual = $(this).data('supervisor');

        Swal.fire({
            title: 'Editar Vinculación',
            html: `
                <div class="space-y-4 text-left p-4">
                    <div>
                        <label for="swal-select-supervisor" class="block font-medium mb-1">Nuevo Area/Modulo</label>
                        <select id="swal-select-supervisor" class="swal2-select w-full"></select>
                    </div>
                    <div>
                        <label for="swal-select-mecanico" class="block font-medium mb-1">Nuevo Mecánico</label>
                        <select id="swal-select-mecanico" class="swal2-select w-full" disabled></select>
                    </div>
                </div>`,
            confirmButtonText: 'Guardar Cambios',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            didOpen: () => {
                const $swalSupervisor = $('#swal-select-supervisor').select2({
                    placeholder: 'Seleccione un area/módulo',
                    dropdownParent: $('.swal2-popup'), // MUY IMPORTANTE
                    allowClear: true
                });
                const $swalMecanico = $('#swal-select-mecanico').select2({
                    placeholder: 'Seleccione un mecánico',
                    dropdownParent: $('.swal2-popup'), // MUY IMPORTANTE
                    allowClear: true
                });

                const supervisoresParaSelect = todosLosSupervisores.map(item => ({
                    text: `${item.modulo} - ${item.nombre}`,
                    id: JSON.stringify(item)
                }));

                $swalSupervisor.select2({
                    placeholder: 'Seleccione un supervisor/módulo',
                    allowClear: true,
                    dropdownParent: $('.swal2-popup'),
                    data: supervisoresParaSelect
                }).val(JSON.stringify(supervisorActual)).trigger('change');

                $swalSupervisor.on('change', function () {
                    const supervisorJSON = $(this).val();
                    $swalMecanico.val(null).trigger('change').empty();

                    if (!supervisorJSON) {
                        $swalMecanico.prop('disabled', true);
                        return;
                    }

                    const supervisorData = JSON.parse(supervisorJSON);
                    const mecanicosFiltrados = todosLosMecanicos.filter(m => m.planta === supervisorData.planta);
                    const mecanicosParaSelect = mecanicosFiltrados.map(item => ({
                        text: `${item.nombre} - ${item.numero_empleado}`,
                        id: JSON.stringify(item)
                    }));

                    $swalMecanico.select2({
                        placeholder: 'Seleccione un mecánico',
                        allowClear: true,
                        dropdownParent: $('.swal2-popup'),
                        data: mecanicosParaSelect
                    });
                    $swalMecanico.prop('disabled', false).val(null).trigger('change');
                });

                // Disparamos el 'change' inicial para poblar los mecánicos
                $swalSupervisor.trigger('change');
            },
            preConfirm: () => {
                const supervisorJSON = $('#swal-select-supervisor').val();
                const mecanicoJSON = $('#swal-select-mecanico').val();

                if (!supervisorJSON || !mecanicoJSON) {
                    Swal.showValidationMessage('Ambos campos son obligatorios');
                    return false;
                }
                return {
                    supervisor: JSON.parse(supervisorJSON),
                    mecanico: JSON.parse(mecanicoJSON)
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const supervisor = result.value.supervisor;
                const mecanico = result.value.mecanico;

                const datosParaActualizar = {
                    numero_empleado_supervisor: supervisor.numero_empleado,
                    nombre_supervisor: supervisor.nombre,
                    planta: supervisor.planta,
                    modulo: supervisor.modulo,
                    nombre_mecanico: mecanico.nombre,
                    numero_empleado_mecanico: mecanico.numero_empleado
                };

                $.ajax({
                    url: `/vinculacion/actualizar/${vinculacionId}`,
                    type: 'PUT', // Usamos PUT directamente
                    contentType: 'application/json',
                    data: JSON.stringify(datosParaActualizar),
                    success: function (response) {
                        Swal.fire('¡Actualizado!', response.message, 'success');
                        cargarTablaVinculaciones();
                    },
                    error: function (xhr) {
                        const errorMsg = xhr.responseJSON?.message || 'No se pudo completar la operación.';
                        Swal.fire('Error', errorMsg, 'error');
                    }
                });
            }
        });
    });

    $('#tabla-vinculacion tbody').on('click', '.btn-eliminar', function () {
        const vinculacionId = $(this).data('id'); // Obtener el ID del botón

        // 1. Mostrar alerta de confirmación
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            // 2. Si el usuario confirma, realizar la petición AJAX
            if (result.isConfirmed) {
                $.ajax({
                    url: `/vinculacion/eliminar/${vinculacionId}`,
                    type: 'DELETE', // Usamos el método HTTP DELETE
                    success: function (response) {
                        // 3. Si la petición es exitosa, mostrar alerta de éxito
                        Swal.fire(
                            '¡Eliminado!',
                            response.message,
                            'success'
                        );

                        // 4. Recargar la tabla para reflejar el cambio
                        cargarTablaVinculaciones();
                    },
                    error: function (xhr) {
                        // 5. Si hay un error, mostrarlo
                        const errorMsg = xhr.responseJSON?.message || 'No se pudo completar la operación.';
                        Swal.fire(
                            'Error',
                            errorMsg,
                            'error'
                        );
                    }
                });
            }
        });
    });

    cargarTablaVinculaciones();
});