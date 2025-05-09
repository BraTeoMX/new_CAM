<x-guest-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <!-- Progreso -->
        <ol class="flex items-center w-full mb-8">
            <li
                class="flex w-full items-center text-blue-600 dark:text-blue-500 after:content-[''] after:w-full after:h-1 after:border-b after:border-blue-100 after:border-4 after:inline-block dark:after:border-blue-800">
                <span
                    class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full lg:h-12 lg:w-12 dark:bg-blue-800 shrink-0">
                    <svg class="w-3.5 h-3.5 text-blue-600 lg:w-4 lg:h-4 dark:text-blue-300" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M1 5.917 5.724 10.5 15 1.5" />
                    </svg>
                </span>
            </li>
            <li
                class="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block dark:after:border-gray-700">
                <span
                    class="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12 dark:bg-gray-700 shrink-0">
                    <span id="timer">01:00</span>
                </span>
            </li>
            <li class="flex items-center w-full">
                <span
                    class="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12 dark:bg-gray-700 shrink-0">
                    <svg class="w-4 h-4 text-gray-500 lg:w-5 lg:h-5 dark:text-gray-100" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                        <path
                            d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2ZM7 2h4v3H7V2Zm5.7 8.289-3.975 3.857a1 1 0 0 1-1.393 0L5.3 12.182a1.002 1.002 0 1 1 1.4-1.436l1.328 1.289 3.28-3.181a1 1 0 1 1 1.392 1.435Z" />
                    </svg>
                </span>
            </li>
        </ol>

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

                <!-- Numero empleado -->
                <div>
                    <label for="numeroEmpleado" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Número empleado
                    </label>
                    <input type="number" name="numeroEmpleado" id="numeroEmpleado" required
                        placeholder="Numero de empleado"
                        class="mt-1 block w-full rounded-md shadow-sm border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <!-- Modulo -->
                <div>
                    <label for="modul" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Módulo
                    </label>
                    <select id="modul" style="width: 100%;"></select>
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
    let currentFolio = ''; // Variable global para almacenar el folio actual

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
            subject: document.getElementById('subject').value.trim(), // Asunto
            description: document.getElementById('description').value.trim(), // Descripción
            _token: document.querySelector('meta[name="csrf-token"]').getAttribute('content') // CSRF Token
        };

        // Validaciones del lado del cliente
        if (!formData.modulo) {
            Swal.fire({
                icon: 'warning',
                title: 'Datos inválidos',
                text: 'Por favor, selecciona un módulo válido.',
                customClass: {
                    title: 'text-black',
                    content: 'text-black',
                    confirmButton: 'border-black',
                }
            });
            return;
        }
        if (!formData.subject.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Datos inválidos',
                text: 'Por favor, ingresa un asunto válido.',
                customClass: {
                    title: 'text-black',
                    content: 'text-black',
                    confirmButton: 'border-black',
                }
            });
            return;
        }
        if (!formData.description.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Datos inválidos',
                text: 'Por favor, ingresa una descripción detallada.',
                customClass: {
                    title: 'text-black',
                    content: 'text-black',
                    confirmButton: 'border-black',
                }
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
                        text: `La Orden de Trabajo fue creada exitosamente con el folio: ${data.folio}.`,
                        customClass: {
                            title: 'text-black',
                            content: 'text-black',
                            confirmButton: 'border-black',
                        }
                    }).then(() => {
                        document.getElementById('ticketForm').reset();
                        $('#modul, #numeroEmpleado').val(null).trigger('change'); // Reiniciar Select2

                        // Almacenar el folio actual
                        currentFolio = data.folio;

                        // Marcar el primer paso como completado
                        markStepAsCompleted(1);

                        // Iniciar el temporizador de 1 minuto
                        startTimer(60, $('#timer'));
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Hubo un error al registrar el ticket.',
                        customClass: {
                            title: 'text-black',
                            content: 'text-black',
                            confirmButton: 'border-black',
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error inesperado',
                    text: 'Inténtalo de nuevo.',
                    customClass: {
                        title: 'text-black',
                        content: 'text-black',
                        confirmButton: 'border-black',
                    }
                });
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'Enviar OT';
            });
    });

    // Función para iniciar el temporizador
    function startTimer(duration, display) {
        let timer = duration, minutes, seconds;
        const interval = setInterval(() => {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.text(minutes + ":" + seconds);

            if (--timer < 0) {
                clearInterval(interval);
                showResolutionModal();
            }
        }, 1000);

        // Marcar el segundo paso como iniciado
        markStepAsInProgress(2);
    }

    // Mostrar modal de resolución al terminar el temporizador
    function showResolutionModal() {
        Swal.fire({
            title: '¿Pudiste resolver el problema?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: `Sí`,
            denyButtonText: `No`,
            customClass: {
                title: 'text-black',
                content: 'text-black',
                confirmButton: 'border-black',
                denyButton: 'border-black',
            }
        }).then((result) => {
            if (result.isConfirmed) {
                updateTicketStatus('Autonomo');
                markStepAsCompleted(2);
                markStepAsCompleted(3);
            } else if (result.isDenied) {
                updateTicketStatus('Abierto');
                markStepAsCompleted(2);
                markStepAsCompleted(3);
            }
        });
    }

    // Función para actualizar el estado del ticket
    function updateTicketStatus(status) {
        fetch(`/update-ticket-status/${currentFolio}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({ status })
        })
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Estado actualizado',
                    text: 'El estado del ticket ha sido actualizado.',
                    customClass: {
                        title: 'text-black',
                        content: 'text-black',
                        confirmButton: 'border-black',
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al actualizar el estado del ticket.',
                    customClass: {
                        title: 'text-black',
                        content: 'text-black',
                        confirmButton: 'border-black',
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error inesperado',
                text: 'Inténtalo de nuevo.',
                customClass: {
                    title: 'text-black',
                    content: 'text-black',
                    confirmButton: 'border-black',
                }
            });
        });
    }

    // Función para marcar un paso como completado
    function markStepAsCompleted(stepNumber) {
        const step = $(`ol li:nth-child(${stepNumber})`);
        step.removeClass('text-gray-500').addClass('text-blue-600');
        step.find('span').removeClass('bg-gray-100 dark:bg-gray-700').addClass('bg-blue-100 dark:bg-blue-800');
        step.find('svg').removeClass('text-gray-500 dark:text-gray-100').addClass('text-blue-600 dark:text-blue-300');
    }

    // Función para marcar un paso como en progreso
    function markStepAsInProgress(stepNumber) {
        const step = $(`ol li:nth-child(${stepNumber})`);
        step.removeClass('text-gray-500').addClass('text-yellow-600');
        step.find('span').removeClass('bg-gray-100 dark:bg-gray-700').addClass('bg-yellow-100 dark:bg-yellow-800');
        step.find('svg').removeClass('text-gray-500 dark:text-gray-100').addClass('text-yellow-600 dark:text-yellow-300');
    }
</script>


</x-guest-layout>
