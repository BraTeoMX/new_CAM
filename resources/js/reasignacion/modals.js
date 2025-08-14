// resources/js/reasignacion/modals.js

// --- Selectores de Elementos de los Modales ---
const modalAsignar = document.getElementById('modalAsignar');
const modalDetalles = document.getElementById('modalDetalles');
const formAsignar = document.getElementById('formAsignar');
const mecanicoSelect = document.getElementById('mecanico-select');
const otIdInput = document.getElementById('ot-id-asignar');

/**
 * Carga la lista de mecánicos desde la API y la puebla en el select.
 */
async function cargarMecanicos() {
    try {
        const response = await fetch('/api/reasignacion/mecanicos');
        if (!response.ok) throw new Error('Error al cargar mecánicos.');
        const mecanicos = await response.json();

        mecanicoSelect.innerHTML = '<option value="">Seleccione un mecánico...</option>';
        
        mecanicos.forEach(mecanico => {
            const option = document.createElement('option');
            option.value = mecanico.numero_empleado; 
            option.textContent = mecanico.nombre; 
            option.setAttribute('data-planta', mecanico.planta); 
            mecanicoSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
        mecanicoSelect.innerHTML = '<option value="">Error al cargar</option>';
    }
}

/**
 * Abre el modal para asignar un mecánico.
 * @param {number} otId - El ID de la OT a asignar.
 */
export function openAssignModal(ot) {
    // 1. Asignamos el ID de la OT al campo oculto del formulario.
    otIdInput.value = ot.id;
    
    // 2. Lógica de preselección.
    //    Establecemos el valor del 'select' para que coincida con el número de empleado
    //    del mecánico ya asignado a la OT.
    //    El `|| ''` asegura que si `ot.Numero_Mecanico` es nulo, se seleccione la opción por defecto.
    mecanicoSelect.value = ot.Numero_Mecanico || '';

    // 3. Mostramos el modal.
    modalAsignar.classList.remove('hidden');
    modalAsignar.classList.add('flex');
}
/**
 * Abre el modal para ver los detalles de una OT.
 * @param {object} ot - El objeto de datos de la OT.
 */
export function openDetailsModal(ot) {
    document.getElementById('modal-detalles-content').innerHTML = `
        <p class="dark:text-gray-300"><strong>Folio:</strong> ${ot.Folio}</p>
        <p class="dark:text-gray-300"><strong>Máquina:</strong> ${ot.Maquina}</p>
        <p class="dark:text-gray-300"><strong>Problema:</strong> ${ot.Problema}</p>
        <p class="dark:text-gray-300"><strong>Mecánico Actual:</strong> ${ot.Mecanico || 'N/A'}</p>
        <p class="dark:text-gray-300"><strong>Estado:</strong> ${ot.Status}</p>
        <p class="dark:text-gray-300"><strong>Fecha Creación:</strong> ${ot.fecha_creacion}</p>
    `;
    modalDetalles.classList.remove('hidden');
    modalDetalles.classList.add('flex');
}

/**
 * Inicializa todos los listeners y la lógica de los modales.
 * @param {function} onAssignSuccess - Callback a ejecutar cuando una asignación es exitosa.
 */
export function initializeModals(onAssignSuccess) {
    // Cargar la lista de mecánicos al iniciar
    cargarMecanicos();

    // Listeners para cerrar los modales
    document.getElementById('cancelar-asignacion').addEventListener('click', () => {
        modalAsignar.classList.add('hidden');
        modalAsignar.classList.remove('flex');
    });

    document.getElementById('cerrar-detalles').addEventListener('click', () => {
        modalDetalles.classList.add('hidden');
        modalDetalles.classList.remove('flex');
    });

    // Listener para el envío del formulario de asignación
    formAsignar.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const otId = otIdInput.value;
        const selectedOption = mecanicoSelect.options[mecanicoSelect.selectedIndex];

        if (!selectedOption || !selectedOption.value) {
            Swal.fire('Error', 'Debes seleccionar un mecánico.', 'error');
            return;
        }

        const numeroEmpleado = selectedOption.value;
        const nombreMecanico = selectedOption.textContent;
        const plantaMecanico = selectedOption.dataset.planta;

        try {
            const response = await fetch(`/api/reasignacion/asignar/${otId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ 
                    numero_empleado: numeroEmpleado,
                    nombre_mecanico: nombreMecanico,
                    planta: plantaMecanico
                })
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Ocurrió un error desconocido.');
            }

            Swal.fire('¡Éxito!', 'Mecánico asignado correctamente.', 'success');
            modalAsignar.classList.add('hidden');
            modalAsignar.classList.remove('flex');
            
            // Ejecutamos el callback para actualizar la lista de OTs sin asignar
            if (onAssignSuccess) {
                onAssignSuccess();
            }

        } catch (error) {
            console.error('Error al asignar mecánico:', error);
            Swal.fire('Error', error.message, 'error');
        }
    });
}