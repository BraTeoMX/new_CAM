$(document).ready(function() {

        // Token CSRF para las peticiones POST en Laravel
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });

        // 1. Inicializar Select2 para Supervisores/Módulos
        const $selectSupervisor = $('#select-supervisor').select2({
            placeholder: 'Seleccione un supervisor/módulo',
            allowClear: true,
            ajax: {
                url: '/vinculacion/obtenerSupervisores',
                dataType: 'json',
                delay: 250, // Espera 250ms después de escribir antes de buscar
                processResults: function(data) {
                    // Transforma los datos recibidos al formato que Select2 necesita
                    return {
                        results: $.map(data, function(item) {
                            return {
                                // El texto que se muestra en la opción
                                text: `${item.modulo} - ${item.nombre}`,
                                // El ID que se guarda como valor. Guardamos todos los datos como un string JSON
                                id: JSON.stringify({
                                    numero_empleado: item.numero_empleado,
                                    planta: item.planta,
                                    nombre: item.nombre,
                                    modulo: item.modulo
                                })
                            };
                        })
                    };
                },
                cache: true
            }
        });

        // 2. Inicializar Select2 para Mecánicos (inicialmente deshabilitado)
        const $selectMecanico = $('#select-mecanico').select2({
            placeholder: 'Seleccione un mecánico',
            allowClear: true,
            ajax: {
                url: '/vinculacion/obtenerMecanicos',
                dataType: 'json',
                delay: 250,
                data: function(params) {
                    // Antes de hacer la petición de mecánicos, obtenemos la planta del supervisor
                    const supervisorData = JSON.parse($selectSupervisor.val());
                    return {
                        planta: supervisorData.planta, // Enviamos la planta como parámetro
                        q: params.term // término de búsqueda
                    };
                },
                processResults: function(data) {
                    return {
                        results: $.map(data, function(item) {
                            return {
                                text: `${item.nombre} - ${item.numero_empleado}`,
                                id: JSON.stringify({
                                    nombre: item.nombre,
                                    numero_empleado: item.numero_empleado
                                })
                            };
                        })
                    };
                },
                cache: true
            }
        });

        // 3. Lógica de dependencia y habilitación de botones
        $selectSupervisor.on('change', function() {
            const supervisorSeleccionado = $(this).val();

            // Limpiar y deshabilitar mecánico si no hay supervisor
            if (!supervisorSeleccionado) {
                $selectMecanico.val(null).trigger('change');
                $selectMecanico.prop('disabled', true);
                return;
            }

            // Habilitar el select de mecánico y limpiarlo para una nueva selección
            $selectMecanico.prop('disabled', false);
            $selectMecanico.val(null).trigger('change');
        });
        
        // Habilitar el botón "Añadir" solo cuando ambos selects tengan un valor
        $('#select-supervisor, #select-mecanico').on('change', function() {
             const supervisorOk = $('#select-supervisor').val();
             const mecanicoOk = $('#select-mecanico').val();
             
             if (supervisorOk && mecanicoOk) {
                 $('#btn-anadir-vinculacion').prop('disabled', false);
             } else {
                 $('#btn-anadir-vinculacion').prop('disabled', true);
             }
        });


        // 4. Lógica para el clic en el botón "Añadir a lista"
        $('#btn-anadir-vinculacion').on('click', function() {
            // Obtenemos los datos parseando los strings JSON de los valores de los selects
            const supervisorData = JSON.parse($selectSupervisor.val());
            const mecanicoData = JSON.parse($selectMecanico.val());

            // Creamos el objeto con los datos a enviar, mapeando a las columnas de la BD
            const datosParaEnviar = {
                numero_empleado_supervisor: supervisorData.numero_empleado,
                nombre_supervisor: supervisorData.nombre,
                planta: supervisorData.planta,
                modulo: supervisorData.modulo,
                nombre_mecanico: mecanicoData.nombre,
                numero_empleado_mecanico: mecanicoData.numero_empleado
            };

            // Petición AJAX para guardar los datos
            $.ajax({
                url: '/vinculacion/guardar',
                type: 'POST',
                data: datosParaEnviar,
                success: function(response) {
                    alert(response.message); // O usa una notificación más elegante
                    
                    // Limpiar formulario para una nueva vinculación
                    $selectSupervisor.val(null).trigger('change');
                    $selectMecanico.val(null).trigger('change').prop('disabled', true);
                    $('#btn-anadir-vinculacion').prop('disabled', true);
                },
                error: function(xhr) {
                    const error = xhr.responseJSON;
                    alert('Error: ' + error.message);
                    console.error('Detalles del error:', error.error);
                }
            });
        });
    });