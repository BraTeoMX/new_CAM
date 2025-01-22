<x-app-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <!-- Título -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Atención OT</h1>
        </div>

        <!-- Contenedor Principal -->
        <div class="grid grid-cols-5 gap-4">
            <!-- Sección 1: OT's Pendientes -->
            <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">OT's Pendientes</h2>
                <div id="pendientes" class="space-y-4 bg-gray-950 p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>

            <!-- Sección 2: OT's Proceso -->
            <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">OT's Proceso</h2>
                <div id="proceso" class="space-y-4 bg-gray-950 p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>

            <!-- Sección 3: OT's Cerradas -->
            <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">OT's Cerradas</h2>
                <div id="cerradas" class="space-y-4 bg-gray-950 p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>

            <!-- Sección 4: OT's Revisión -->
            <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">OT's Revisión</h2>
                <div id="revision" class="space-y-4 bg-gray-950 p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>

            <!-- Sección 5: OT's Finalizadas -->
            <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">OT's Finalizadas</h2>
                <div id="finalizadas" class="space-y-4 bg-gray-950 p-4 rounded-lg shadow-md">
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
                        const pendientesContainer = document.getElementById('pendientes');
                        const procesoContainer = document.getElementById('proceso');
                        const cerradasContainer = document.getElementById('cerradas');
                        const revisionContainer = document.getElementById('revision');
                        const finalizadasContainer = document.getElementById('finalizadas');

                        // Limpiar contenedores
                        [pendientesContainer, procesoContainer, cerradasContainer, revisionContainer,
                            finalizadasContainer
                        ].forEach(container => {
                            container.innerHTML = '';
                        });

                        // Procesar datos y agregar cards
                        data.forEach(ot => {
                            const card = document.createElement('div');
                            card.classList.add('bg-gray-200', 'rounded-lg', 'shadow', 'p-4', 'cursor-move',
                                'border', 'border-black', 'text-black', 'w-full');
                            card.innerHTML = `
                                <h3 class="text-md font-semibold">${ot.Folio}</h3>
                                <p class="text-sm">${ot.Descrip_prob}</p>
                            `;

                            // Insertar en la sección correspondiente
                            switch (ot.Status) {
                                case 'AUTONOMO':
                                case 'ABIERTO':
                                case 'SIN ASIGNAR':
                                    pendientesContainer.appendChild(card);
                                    break;
                                case 'ASIGNADO':
                                case 'RE-ASIGNADO':
                                case 'PENDIENTE':
                                    procesoContainer.appendChild(card);
                                    break;
                                case 'CERRADO':
                                    cerradasContainer.appendChild(card);
                                    break;
                                case 'POR REVISION':
                                    revisionContainer.appendChild(card);
                                    break;
                                case 'FINALIZADO':
                                    finalizadasContainer.appendChild(card);
                                    break;
                            }
                        });

                        // Inicializar SortableJS en cada contenedor
                        [pendientesContainer, procesoContainer, cerradasContainer, revisionContainer,
                            finalizadasContainer
                        ].forEach(container => {
                            Sortable.create(container, {
                                group: 'shared', // Hacer que todas las secciones sean arrastrables entre sí
                                animation: 150,
                                ghostClass: 'bg-blue-100', // Clase para el elemento "fantasma" mientras se arrastra
                                onEnd: (event) => {
                                    // Captura los índices de arrastre
                                    console.log('Elemento movido de', event.oldIndex, 'a',
                                        event.newIndex);
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
