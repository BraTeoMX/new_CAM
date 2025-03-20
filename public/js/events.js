//<!-- Script para cargar las OTs y habilitar SortableJS -->
    document.addEventListener('DOMContentLoaded', function () {
        // Inicializar SortableJS en cada contenedor
        function initializeSortable() {
            const containers = {
                SIN_ASIGNAR: document.getElementById('SIN_ASIGNAR'),
                PENDIENTE: document.getElementById('PENDIENTE'),
                PROCESO: document.getElementById('PROCESO'),
                ATENDIDO: document.getElementById('ATENDIDO'),
                FINALIZADO: document.getElementById('FINALIZADO'),
            };

            // Inicializar Sortable en cada contenedor
            Object.values(containers).forEach((container) => {
                Sortable.create(container, {
                    group: 'shared', // Secciones arrastrables entre sí
                    animation: 150,
                    ghostClass: 'bg-blue-100',
                    onEnd: (event) => {
                        const movedId = event.item.dataset.id; // ID del elemento movido
                        const newStatus = event.to.id; // ID del contenedor destino

                        // Si el destino es 'PENDIENTE', mostrar el modal
                        if (newStatus === 'PENDIENTE') {
                            toggleModal(true);

                            // Configurar envío del formulario
                            const formPendiente = document.getElementById('formPendiente');
                            formPendiente.onsubmit = function (e) {
                                e.preventDefault();

                                const fecha = document.getElementById('fechaPendiente').value;
                                const motivo = document.getElementById('motivoPendiente').value;

                                // Actualizar el estado con los datos del modal
                                fetch('/update-status', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-CSRF-TOKEN': '{{ csrf_token() }}',
                                    },
                                    body: JSON.stringify({
                                        id: movedId,
                                        status: newStatus,
                                        fecha,
                                        motivo,
                                    }),
                                })
                                    .then((response) => response.json())
                                    .then((data) => {
                                        if (data.success) {
                                            console.log(`OT ${movedId} actualizada correctamente.`);
                                            toggleModal(false); // Cerrar modal
                                        } else {
                                            console.error('Error al actualizar la OT:', data.error);
                                        }
                                    })
                                    .catch((error) => console.error('Error de red:', error));
                            };
                        } else {
                            // Actualizar estatus directamente si no es 'PENDIENTE'
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
                                .then((response) => response.json())
                                .then((data) => {
                                    if (data.success) {
                                        console.log(`OT ${movedId} actualizada a ${newStatus}.`);
                                    } else {
                                        console.error('Error al actualizar la OT:', data.error);
                                    }
                                })
                                .catch((error) => console.error('Error al conectar con el servidor:', error));
                        }
                    },
                });
            });
        }

        // Mostrar/Ocultar el modal
        window.toggleModal = function (open) {
            const modal = document.getElementById('modalPendiente');
            modal.classList.toggle('hidden', !open);

            // Restablecer los valores del modal al abrir
            if (open) {
                document.getElementById('fechaPendiente').value = '';
                document.getElementById('motivoPendiente').value = '';
            }
        };

        // Cargar las OTs al iniciar
        function loadOTs() {
            fetch('/cardsAteOTs')
                .then((response) => response.json())
                .then((data) => {
                    const containers = {
                        SIN_ASIGNAR: document.getElementById('SIN_ASIGNAR'),
                        PENDIENTE: document.getElementById('PENDIENTE'),
                        PROCESO: document.getElementById('PROCESO'),
                        ATENDIDO: document.getElementById('ATENDIDO'),
                        FINALIZADO: document.getElementById('FINALIZADO'),
                    };

                    // Limpiar contenedores
                    Object.values(containers).forEach((container) => {
                        container.innerHTML = '';
                    });

                    // Procesar datos y agregar cards
                    data.forEach((ot) => {
                        const card = document.createElement('div');
                        card.classList.add(
                            'bg-gray-200',
                            'rounded-lg',
                            'shadow',
                            'p-4',
                            'cursor-move',
                            'border',
                            'border-black',
                            'text-black',
                            'w-full'
                        );
                        card.setAttribute('data-id', ot.id); // ID único de la OT
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

                    // Inicializar SortableJS
                    initializeSortable();
                })
                .catch((error) => {
                    console.error('Error al cargar las OTs:', error);
                });
        }

        // Llamar a la función de carga al iniciar
        loadOTs();
    });

document.addEventListener('DOMContentLoaded', function () {
    // Inicializar SortableJS en cada contenedor
    function initializeSortable() {
        const containers = {
            SIN_ASIGNAR: document.getElementById('SIN_ASIGNAR'),
            PENDIENTE: document.getElementById('PENDIENTE'),
            PROCESO: document.getElementById('PROCESO'),
            ATENDIDO: document.getElementById('ATENDIDO'),
            FINALIZADO: document.getElementById('FINALIZADO'),
        };

        Object.values(containers).forEach((container) => {
            Sortable.create(container, {
                group: 'shared',
                animation: 150,
                ghostClass: 'bg-blue-100',
                onEnd: (event) => {
                    const card = event.item; // Elemento movido
                    const movedId = card.dataset.id; // ID de la OT
                    const folio = card.querySelector('h3').textContent; // Obtener el Folio de la tarjeta
                    const newStatus = event.to.id; // ID del contenedor destino

                    if (newStatus === 'PENDIENTE') {
                        // Mostrar modal si el destino es 'PENDIENTE'
                        toggleModal(true);

                        // Configurar formulario
                        const formPendiente = document.getElementById('formPendiente');
                        formPendiente.onsubmit = function (e) {
                            e.preventDefault();

                            const fecha = document.getElementById('fechaPendiente').value;
                            const motivo = document.getElementById('motivoPendiente').value;

                            // Primer AJAX: Actualizar estatus
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
                                .then((response) => response.json())
                                .then((data) => {
                                    if (data.success) {
                                        console.log(`OT ${folio} actualizada a ${newStatus}.`);

                                        // Segundo AJAX: Guardar evento en el calendario
                                        fetch('/events', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'X-CSRF-TOKEN': '{{ csrf_token() }}',
                                            },
                                            body: JSON.stringify({
                                                title: folio, // Guardar el Folio como título
                                                start: fecha.split(" to ")[0], // Fecha de inicio
                                                end: fecha.split(" to ")[1] || fecha, // Fecha de fin
                                                description: motivo,
                                            }),
                                        })
                                            .then((response) => response.json())
                                            .then((data) => {
                                                if (data.success) {
                                                    console.log(`Evento registrado: ${folio}.`);
                                                    toggleModal(false); // Cerrar modal
                                                } else {
                                                    console.error('Error al guardar el evento:', data.error);
                                                }
                                            })
                                            .catch((error) =>
                                                console.error('Error de red al guardar evento:', error)
                                            );
                                    } else {
                                        console.error('Error al actualizar el estado de la OT:', data.error);
                                    }
                                })
                                .catch((error) =>
                                    console.error('Error de red al actualizar estado:', error)
                                );
                        };
                    } else {
                        // Actualizar estado directamente si no es 'PENDIENTE'
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
                            .then((response) => response.json())
                            .then((data) => {
                                if (data.success) {
                                    console.log(`OT ${folio} actualizada a ${newStatus}.`);
                                } else {
                                    console.error('Error al actualizar el estado de la OT:', data.error);
                                }
                            })
                            .catch((error) =>
                                console.error('Error de red al actualizar estado:', error)
                            );
                    }
                },
            });
        });
    }

    // Mostrar/Ocultar modal
    window.toggleModal = function (open) {
        const modal = document.getElementById('modalPendiente');
        modal.classList.toggle('hidden', !open);

        if (open) {
            document.getElementById('fechaPendiente').value = '';
            document.getElementById('motivoPendiente').value = '';
        }
    };

    // Inicializar Flatpickr
    flatpickr('#fechaPendiente', {
        mode: 'range', // Permitir seleccionar un rango de fechas
        dateFormat: 'Y-m-d',
    });

    // Inicializar la lógica
    initializeSortable();
});
