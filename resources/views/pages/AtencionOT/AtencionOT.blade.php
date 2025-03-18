<x-app-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <!-- Título -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Atención OT</h1>
        </div>
        <!-- Contenedor Principal -->
        <div class="grid grid-cols-5 gap-4">
            <!-- Sección 2: OT's Sin Asignacion -->
            <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">OT's Sin asignación</h2>
                <div id="SIN_ASIGNAR" class="space-y-4 bg-gray-850 p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>
            <!-- Sección 2: OT's Proceso -->
            <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">OT's Proceso</h2>
                <div id="PROCESO" class="space-y-4 bg-gray-850 p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>
            <!-- Sección 1: OT's Pendientes -->
            <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">OT's Pendientes</h2>
                <div id="PENDIENTE" class="space-y-4 bg-gray-850 p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>
            <!-- Sección 3: OT's Cerradas -->
            <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">OT's Atendidas</h2>
                <div id="ATENDIDO" class="space-y-4 bg-gray-850 p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>
            <!-- Sección 4: OT's Finalizadas -->
            <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">OT's Finalizadas</h2>
                <div id="FINALIZADO" class="space-y-4 bg-gray-850 p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>
        </div>
    </div>
    <!-- Script para cargar las OTs y habilitar SortableJS -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Cargar las OTs vía AJAX
            function loadOTs() {
                fetch('/cardsAteOTs')
                    .then(response => response.json())
                    .then(data => {
                        const containers = {
                            SIN_ASIGNAR: document.getElementById('SIN_ASIGNAR'),
                            PENDIENTE: document.getElementById('PENDIENTE'),
                            PROCESO: document.getElementById('PROCESO'),
                            ATENDIDO: document.getElementById('ATENDIDO'),
                            FINALIZADO: document.getElementById('FINALIZADO'),
                        };

                        // Limpiar contenedores
                        Object.values(containers).forEach(container => {
                            container.innerHTML = '';
                        });

                        // Procesar datos y agregar cards
                        data.forEach(ot => {
                            const card = document.createElement('div');
                            card.classList.add('bg-gray-200', 'rounded-lg', 'shadow', 'p-4',
                                'cursor-move',
                                'border', 'border-black', 'text-black', 'w-full');
                            card.setAttribute('data-id', ot.id); // Identificador único de la OT
                            card.innerHTML = `
                                <h3 class="text-md font-semibold">${ot.Folio}</h3>
                                <p class="text-sm">${ot.Descrip_prob}</p>
                            `;
                            // Insertar en la sección correspondiente
                            switch (ot.Status) {
                                case 'ABIERTO':
                                case 'SIN_ASIGNAR':
                                    containers.SIN_ASIGNAR.appendChild(card);
                                    break;
                                case 'PENDIENTE':
                                    containers.PENDIENTE.appendChild(card);
                                    break;
                                case 'ASIGNADO':
                                case 'RE-ASIGNADO':
                                case 'PROCESO':
                                    containers.PROCESO.appendChild(card);
                                    break;
                                case 'AUTONOMO':
                                case 'ATENDIDO':
                                    containers.ATENDIDO.appendChild(card);
                                    break;
                                case 'FINALIZADO':
                                    containers.FINALIZADO.appendChild(card);
                                    break;
                            }
                        });
                        // Inicializar SortableJS en cada contenedor
                        Object.values(containers).forEach((container) => {
                            Sortable.create(container, {
                                group: 'shared', // Hacer que todas las secciones sean arrastrables entre sí
                                animation: 150,
                                ghostClass: 'bg-blue-100', // Clase para el elemento "fantasma" mientras se arrastra
                                onEnd: (event) => {
                                    const movedId = event.item.dataset
                                        .id; // ID del elemento movido
                                    const newStatus = event.to
                                        .id; // ID del contenedor destino

                                    // Actualizar estatus vía AJAX
                                    fetch('/update-status', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'X-CSRF-TOKEN': '{{ csrf_token() }}',
                                            },
                                            body: JSON.stringify({
                                                id: movedId,
                                                status: newStatus,
                                            }),
                                        })
                                        .then(response => response.json())
                                        .then(data => {
                                            if (data.success) {
                                                console.log(
                                                    `OT ${movedId} actualizada a ${newStatus}`
                                                );
                                            } else {
                                                console.error(
                                                    'Error al actualizar la OT:',
                                                    data.error);
                                            }
                                        })
                                        .catch(error => {
                                            console.error(
                                                'Error al conectar con el servidor:',
                                                error);
                                        });
                                },
                            });
                        });
                    })
                    .catch(error => {
                        console.error('Error al cargar las OTs:', error);
                    });
            }
            // Cargar las OTs al iniciar
            loadOTs();
        });
    </script>


</x-app-layout>
