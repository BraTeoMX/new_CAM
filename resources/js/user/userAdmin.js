document.addEventListener('DOMContentLoaded', function () {

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

    const selectPuesto = document.getElementById('usercreate-puesto');

    async function cargarPuestos() {
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

    // --- NUEVO: Cargar Usuarios en la Tabla ---
    const tablaBody = document.getElementById('users-table-body');

    async function cargarUsuarios() {
        // Mostramos un estado de carga en la tabla para mejor experiencia de usuario.
        tablaBody.innerHTML = `<tr><td colspan="6" class="text-center p-4">Cargando usuarios...</td></tr>`;

        try {
            const response = await fetch('/UserAdmin/listaUsuarios');
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }
            const usuarios = await response.json();

            // Limpiamos la tabla antes de llenarla.
            tablaBody.innerHTML = '';

            if (usuarios.length === 0) {
                tablaBody.innerHTML = `<tr><td colspan="6" class="text-center p-4">No se encontraron usuarios.</td></tr>`;
                return; // Salimos de la función si no hay usuarios.
            }

            // Iteramos sobre cada usuario y creamos una fila en la tabla.
            usuarios.forEach(user => {
                const fila = `
                    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td class="w-4 p-4">
                            <input type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        </td>
                        <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            ${user.id}
                        </td>
                        <td class="px-6 py-4">
                            <div class="font-semibold">${user.name}</div>
                            <div class="text-xs text-gray-500">${user.email}</div>
                        </td>
                        <td class="px-6 py-4">
                            ${user.puesto}
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center">
                                <div class="h-2.5 w-2.5 rounded-full ${user.status === 'Activo' ? 'bg-green-500' : 'bg-red-500'} me-2"></div>
                                ${user.status}
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <button type="button" class="font-medium text-blue-600 dark:text-blue-500 hover:underline btn-edit" data-user-id="${user.id}">Editar</button>
                            </td>
                    </tr>
                `;
                // Añadimos la fila recién creada al cuerpo de la tabla.
                tablaBody.insertAdjacentHTML('beforeend', fila);
            });

        } catch (error) {
            console.error('Error al cargar los usuarios:', error);
            tablaBody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-red-500">Error al cargar los datos. Intente de nuevo.</td></tr>`;
        }
    }

    // --- Llamamos a la función para cargar los usuarios cuando la página esté lista. ---
    cargarUsuarios();

});