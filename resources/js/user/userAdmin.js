document.addEventListener('DOMContentLoaded', function () {

    // --- MANEJO DEL MODAL ---
    const botonAbrirModal = document.getElementById('btn-open-usercreate');
    const modalCrearUsuario = document.getElementById('modal-usercreate');
    const botonCerrarModal = document.getElementById('btn-close-usercreate');
    const botonCancelarModal = document.getElementById('btn-cancel-usercreate');

    const abrirModal = () => {
        modalCrearUsuario.classList.remove('hidden');
        modalCrearUsuario.classList.add('flex');
    };

    const cerrarModal = () => {
        modalCrearUsuario.classList.add('hidden');
        modalCrearUsuario.classList.remove('flex');
    };

    if (botonAbrirModal && modalCrearUsuario && botonCerrarModal && botonCancelarModal) {
        botonAbrirModal.addEventListener('click', abrirModal);
        botonCerrarModal.addEventListener('click', cerrarModal);
        botonCancelarModal.addEventListener('click', cerrarModal);
    }

    // --- Cargar Puestos en el Select ---
    const selectPuesto = document.getElementById('usercreate-puesto');

    async function cargarPuestos() {
        // ... (código existente para cargar puestos, sin cambios)
        try {
            const response = await fetch('/UserAdmin/puestos');
            if (!response.ok) { throw new Error(`Error del servidor: ${response.status}`); }
            const puestos = await response.json();
            selectPuesto.innerHTML = '';
            selectPuesto.add(new Option('Seleccione un puesto', ''));
            puestos.forEach(puesto => {
                const opcion = new Option(puesto, puesto);
                selectPuesto.add(opcion);
            });
        } catch (error) {
            console.error('No se pudieron cargar los puestos:', error);
            selectPuesto.innerHTML = '<option value="">Error al cargar puestos</option>';
        }
    }

    cargarPuestos();

    const formCrearUsuario = document.getElementById('form-usercreate');
    if (formCrearUsuario) {
        formCrearUsuario.addEventListener('submit', async function (event) {
            event.preventDefault();

            const formData = new FormData(formCrearUsuario);
            const datosUsuario = Object.fromEntries(formData.entries());

            const body = {
                name: datosUsuario['usercreate-name'],
                email: datosUsuario['usercreate-email'],
                num_empleado: datosUsuario['usercreate-num_empleado'],
                password: datosUsuario['usercreate-password'],
                puesto: datosUsuario['usercreate-puesto']
            };

            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            try {
                const response = await fetch('/UserAdmin/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify(body)
                });

                const result = await response.json();

                if (!response.ok) {
                    if (response.status === 422) {
                        console.error('Errores de validación:', result.errors);
                        alert('Por favor, corrige los errores en el formulario: ' + Object.values(result.errors).join('\n'));
                    } else {
                        throw new Error(result.message || 'Ocurrió un error en el servidor.');
                    }
                } else {
                    alert(result.message);
                    formCrearUsuario.reset();
                    cerrarModal();
                }

            } catch (error) {
                console.error('Error al enviar el formulario:', error);
                alert('No se pudo crear el usuario. Inténtalo de nuevo.');
            }
        });
    }
});