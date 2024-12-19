<x-guest-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

        <!-- Form Guest actions -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <!-- Left: Title -->
            <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Levantamiento de orden de
                    trabajo</h1>
            </div>
        </div>

        <!-- Ticket Form -->
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <form id="ticketForm" class="space-y-6">

                <!-- Modulo -->
                <div>
                    <label for="modul" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Módulo
                    </label>
                    <select id="modul" style="width: 100%;"></select>
                </div>


                <!-- Numero empleado -->
                <div>
                    <label for="numeroEmpleado" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Número empleado
                    </label>
                    <select id="numeroEmpleado" style="width: 100%;" disabled></select>
                </div>

                <!-- Nombre -->
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre
                        completo</label>
                    <input type="text" name="name" id="name" disabled placeholder="Ingresa tu nombre"
                        class="mt-1 block w-full rounded-md shadow-sm border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>


                <!-- Asunto -->
                <div>
                    <label for="subject"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300">Asunto</label>
                    <input type="text" name="subject" id="subject" required
                        placeholder="Breve descripción del problema"
                        class="mt-1 block w-full rounded-md shadow-sm border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>

                <!-- Descripción -->
                <div>
                    <label for="description"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción detallada</label>
                    <textarea name="description" id="description" rows="4" required placeholder="Describe el problema con detalle"
                        class="mt-1 block w-full rounded-md shadow-sm border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                </div>

                <!-- Botón Enviar -->
                <div class="text-right">
                    <button type="button" id="submitTicket"
                        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Enviar OT
                    </button>
                </div>
            </form>
        </div>
    </div>
    <!--Scripts -->
    <!-- Script para inicializar Select2 y cargar datos -->
    <script>
        $(document).ready(function() {
            $('#modul').select2({
                placeholder: 'Selecciona un módulo',
                ajax: {
                    url: '/obtener-modulos',
                    type: 'GET',
                    dataType: 'json',
                    delay: 250,
                    processResults: function(data) {
                        return {
                            results: $.map(data, function(item) {
                                return {
                                    id: item.MODULEID,
                                    text: item.MODULEID
                                };
                            })
                        };
                    }
                }
            });
        });
    </script>
    <script>
        $(document).ready(function() {
            // Inicializar el Select2 de Número empleado
            $('#numeroEmpleado').select2({
                placeholder: 'Selecciona un número de empleado',
                allowClear: true
            });

            // Evento para cuando se selecciona un módulo
            $('#modul').on('change', function() {
                var moduloID = $(this).val(); // Obtener el ID del módulo seleccionado

                if (moduloID) {
                    // Habilitar el Select2 de Número empleado y cargar datos
                    $('#numeroEmpleado').prop('disabled', false).select2({
                        placeholder: 'Cargando...',
                        ajax: {
                            url: '/obtener-empleados', // Ruta a la función en tu controller
                            type: 'GET',
                            dataType: 'json',
                            delay: 250,
                            data: function() {
                                return {
                                    modulo: moduloID // Pasar el módulo seleccionado
                                };
                            },
                            processResults: function(data) {
                                return {
                                    results: $.map(data, function(item) {
                                        return {
                                            id: item.PERSONNELNUMBER,
                                            text: item.PERSONNELNUMBER
                                        };
                                    })
                                };
                            },
                            cache: true
                        }
                    }).on('select2:open', function() {
                        // Cambiar el placeholder a vacío una vez que los datos hayan cargado
                        if ($('#numeroEmpleado').data('select2').results.$results.children()
                            .length > 0) {
                            $('#numeroEmpleado').data('select2').$selection.find(
                                '.select2-selection__placeholder').text(
                                'Seleccione un número de empleado');
                        }
                    });
                } else {
                    // Deshabilitar el Select2 si no hay módulo seleccionado
                    $('#numeroEmpleado').prop('disabled', true).val(null).trigger('change');
                }
            });
        });
    </script>
    <script>
        $(document).ready(function() {
            // Asegurarse de que el input esté inicialmente deshabilitado
            $('#name').prop('disabled', true);

            // Evento para cuando se selecciona un número de empleado
            $('#numeroEmpleado').on('change', function() {
                var numeroEmpleado = $(this).val(); // Obtener el número de empleado seleccionado

                if (numeroEmpleado) {
                    // Realizar solicitud AJAX para obtener el nombre
                    $.ajax({
                        url: '/obtener-nombre', // Ruta al controlador
                        type: 'GET',
                        dataType: 'json',
                        data: {
                            numeroEmpleado: numeroEmpleado // Pasar el número de empleado seleccionado
                        },
                        beforeSend: function() {
                            // Deshabilitar y limpiar el input mientras se carga la solicitud
                            $('#name').prop('disabled', true).val('Cargando...');
                        },
                        success: function(response) {
                            if (response.success) {
                                // Rellenar el input y habilitarlo
                                $('#name').val(response.name).prop('disabled', true);
                            } else {
                                alert('Error al obtener el nombre: ' + response.message);
                                $('#name').val('').prop('disabled', true);
                            }
                        },
                        error: function() {
                            alert('Hubo un error al cargar el nombre. Intenta de nuevo.');
                            $('#name').val('').prop('disabled', true);
                        }
                    });
                } else {
                    // Si no se selecciona un número, deshabilitar el input
                    $('#name').val('').prop('disabled', true);
                }
            });
        });
    </script>


<script>
    document.getElementById('submitTicket').addEventListener('click', function(event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

        const submitButton = document.getElementById('submitTicket');

        // Evitar el doble envío deshabilitando el botón inmediatamente
        if (submitButton.disabled) {
            return;
        }

        // Captura de datos del formulario
        const formData = {
            modulo: $('#modul').val(), // Select2: módulo seleccionado
            numeroEmpleado: $('#numeroEmpleado').val(), // Select2: número de empleado
            name: $('#name').val(), // Input: nombre del empleado
            subject: document.getElementById('subject').value.trim(), // Asunto
            description: document.getElementById('description').value.trim(), // Descripción
            _token: document.querySelector('meta[name="csrf-token"]').getAttribute('content') // CSRF Token
        };

        // Validaciones del lado del cliente
        if (!formData.modulo) {
            Swal.fire({
                icon: 'warning',
                title: 'Datos inválidos',
                text: 'Por favor, selecciona un módulo válido.'
            });
            return;
        }
        if (!formData.numeroEmpleado) {
            Swal.fire({
                icon: 'warning',
                title: 'Datos inválidos',
                text: 'Por favor, selecciona un número de empleado.'
            });
            return;
        }
        if (!formData.name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Datos inválidos',
                text: 'Por favor, ingresa tu nombre completo.'
            });
            return;
        }
        if (!formData.subject.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Datos inválidos',
                text: 'Por favor, ingresa un asunto válido.'
            });
            return;
        }
        if (!formData.description.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Datos inválidos',
                text: 'Por favor, ingresa una descripción detallada.'
            });
            return;
        }

        // Deshabilitar el botón mientras se envía la solicitud
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';

        // Petición al servidor
        fetch('/ticketsOT', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': formData._token
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Ticket registrado',
                        text: `La Orden de Trabajo fue creada exitosamente con el folio: ${data.folio}.`
                    }).then(() => {
                        document.getElementById('ticketForm').reset();
                        $('#modul, #numeroEmpleado').val(null).trigger('change'); // Reiniciar Select2
                        $('#name').val(''); // Limpiar el nombre
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Hubo un error al registrar el ticket.'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error inesperado',
                    text: 'Inténtalo de nuevo.'
                });
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'Enviar OT';
            });
    });
</script>


</x-guest-layout>
