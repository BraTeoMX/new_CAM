$(document).ready(function() {
    
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    // Variables para almacenar todos los datos cargados inicialmente
    let todosLosSupervisores = [];
    let todosLosMecanicos = [];

    // 1. Inicializar los Select2 (inicialmente vacíos y deshabilitados)
    const $selectSupervisor = $('#select-supervisor').select2({
        placeholder: 'Seleccione un supervisor/módulo',
        allowClear: true
    });

    const $selectMecanico = $('#select-mecanico').select2({
        placeholder: 'Seleccione un mecánico',
        allowClear: true
    }).prop('disabled', true); // El de mecánicos empieza deshabilitado

    // Función para poblar el select de supervisores
    function poblarSupervisores(data) {
        // Transformar los datos para Select2
        const supervisoresParaSelect = $.map(data, function(item) {
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
    ).done(function(supervisoresResponse, mecanicosResponse) {
        // $.when devuelve un arreglo [data, statusText, jqXHR] para cada petición
        todosLosSupervisores = supervisoresResponse[0];
        todosLosMecanicos = mecanicosResponse[0];

        // Una vez que tenemos los datos, poblamos el primer select
        poblarSupervisores(todosLosSupervisores);

    }).fail(function() {
        console.error("Error: No se pudieron cargar los datos iniciales de supervisores o mecánicos.");
        // Aquí podrías mostrar un mensaje de error al usuario
    });

    // 3. Lógica de dependencia y filtro local
    $selectSupervisor.on('change', function() {
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
        const mecanicosParaSelect = $.map(mecanicosFiltrados, function(item) {
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
    $('#select-supervisor, #select-mecanico').on('change', function() {
        const supervisorOk = $('#select-supervisor').val();
        const mecanicoOk = $('#select-mecanico').val();

        $('#btn-anadir-vinculacion').prop('disabled', !(supervisorOk && mecanicoOk));
    });

    // 5. Lógica para el clic en el botón "Añadir" (sin cambios, ya era correcta)
    $('#btn-anadir-vinculacion').on('click', function() {
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
            success: function(response) {
                // ✅ Notificación de éxito
                Swal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: response.message,
                    timer: 2000, // La alerta se cierra automáticamente después de 2 segundos
                    showConfirmButton: false, // Ocultamos el botón de "Ok"
                    timerProgressBar: true
                });

                // Limpiar formulario para una nueva vinculación
                $selectSupervisor.val(null).trigger('change');
                cargarTablaVinculaciones();
            },
            error: function(xhr) {
                // ❌ Notificación de error
                const error = xhr.responseJSON;
                
                Swal.fire({
                    icon: 'error',
                    title: 'Error al Guardar',
                    // Usamos el mensaje de error del servidor, o uno genérico si no está disponible
                    text: error ? error.message : 'No se pudo completar la operación. Revisa los datos e intenta de nuevo.',
                    confirmButtonText: 'Entendido'
                });

                // Mantenemos el error en consola para depuración
                console.error('Detalles del error:', error ? error.error : xhr);
            }
        });
    });

    function cargarTablaVinculaciones() {
        $.ajax({
            url: '/vinculacion/mostrarRegistros',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                const tbody = $('#vinculacion-tbody');
                tbody.empty(); // 1. Limpiar la tabla antes de llenarla

                // 2. Iterar sobre cada vinculación recibida
                response.forEach(function(vinculacion) {
                    // 3. Crear el HTML para cada fila
                    // NOTA: Asegúrate que los nombres (ej. vinculacion.nombre_mecanico)
                    // coincidan con las columnas de tu tabla 'vinculaciones' en la base de datos.
                    const fila = `
                        <tr data-id="${vinculacion.id}">
                            <td class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                ${vinculacion.modulo} - ${vinculacion.nombre_supervisor}
                            </td>
                            <td class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                ${vinculacion.nombre_mecanico}
                            </td>
                            <td class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                ${vinculacion.planta}
                            </td>
                            <td class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                <div class="flex gap-2 w-full">
                                    <select class="w-[60%] border border-gray-300 rounded px-2 py-1">
                                        <option selected>${vinculacion.hora_comida_inicio || ''}</option>
                                    </select>
                                    <input type="text" class="w-[40%] border border-gray-300 rounded px-2 py-1" 
                                        value="${vinculacion.hora_comida_fin || ''}" readonly />
                                </div>
                            </td>
                            <td class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                <div class="flex gap-2 w-full">
                                    <select class="w-[60%] border border-gray-300 rounded px-2 py-1">
                                        <option selected>${vinculacion.break_lunes_jueves_inicio || ''}</option>
                                    </select>
                                    <input type="text" class="w-[40%] border border-gray-300 rounded px-2 py-1" 
                                        value="${vinculacion.break_lunes_jueves_fin || ''}" readonly />
                                </div>
                            </td>
                            <td class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                <div class="flex gap-2 w-full">
                                    <select class="w-[60%] border border-gray-300 rounded px-2 py-1">
                                        <option selected>${vinculacion.break_viernes_inicio || ''}</option>
                                    </select>
                                    <input type="text" class="w-[40%] border border-gray-300 rounded px-2 py-1" 
                                        value="${vinculacion.break_viernes_fin || ''}" readonly />
                                </div>
                            </td>
                        </tr>
                    `;
                    // 4. Añadir la fila a la tabla
                    tbody.append(fila);
                });
            },
            error: function(xhr) {
                console.error("Error al obtener los registros:", xhr.responseText);
                // Opcional: Mostrar un mensaje de error en la tabla
                $('#vinculacion-tbody').html('<tr><td colspan="6" class="text-center text-red-500 py-4">Error al cargar los datos.</td></tr>');
            }
        });
    }
    cargarTablaVinculaciones();

});