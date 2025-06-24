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

    const selectPuestoCreacion = document.getElementById('usercreate-puesto');
    const selectPuestoEdicion = document.getElementById('edit-puesto'); // Nueva referencia

    async function cargarPuestos() {
        try {
            const response = await fetch('/UserAdmin/puestos');
            if (!response.ok) { throw new Error(`Error del servidor: ${response.status}`); }
            const puestos = await response.json();

            // Limpiamos y llenamos el SELECT DE CREACIÓN
            selectPuestoCreacion.innerHTML = '';
            selectPuestoCreacion.add(new Option('Seleccione un puesto', ''));
            puestos.forEach(puesto => {
                selectPuestoCreacion.add(new Option(puesto, puesto));
            });

            // Limpiamos y llenamos el SELECT DE EDICIÓN
            selectPuestoEdicion.innerHTML = '';
            selectPuestoEdicion.add(new Option('Seleccione un puesto', ''));
            puestos.forEach(puesto => {
                selectPuestoEdicion.add(new Option(puesto, puesto));
            });

        } catch (error) {
            console.error('No se pudieron cargar los puestos:', error);
            // Mostramos error en ambos selects
            selectPuestoCreacion.innerHTML = '<option value="">Error al cargar</option>';
            selectPuestoEdicion.innerHTML = '<option value="">Error al cargar</option>';
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

                if (response.ok) { // La petición fue exitosa (código 2xx)
                    
                    // --- CAMBIO 1: ALERTA DE ÉXITO ---
                    Swal.fire({
                        icon: 'success',
                        title: '¡Usuario Creado!',
                        text: result.message,
                        timer: 2000, // La alerta se cierra sola después de 2 segundos
                        showConfirmButton: false
                    });

                    formCrearUsuario.reset();
                    cerrarModal();
                    // Opcional: Recargar la tabla de usuarios o añadir el nuevo usuario dinámicamente
                    // location.reload(); 

                } else { // La petición falló

                    if (response.status === 422) { // Error de validación específico de Laravel
                        
                        // --- CAMBIO 2: ALERTA DE VALIDACIÓN (WARNING) ---
                        // Formateamos los errores para mostrarlos en una lista
                        const errorMessages = Object.values(result.errors).flat().join('<br>');
                        
                        Swal.fire({
                            icon: 'warning',
                            title: 'Datos Inválidos',
                            html: `Por favor, corrige los siguientes errores:<br><br><div class="text-left">${errorMessages}</div>`
                        });

                    } else {
                        
                        // --- CAMBIO 3: ALERTA DE ERROR GENERAL (DANGER/ERROR) ---
                        // Para errores 500 u otros problemas del servidor
                        Swal.fire({
                            icon: 'error',
                            title: 'Error del Servidor',
                            text: result.message || 'Ocurrió un error inesperado al procesar la solicitud.'
                        });
                    }
                }

            } catch (error) {
                
                // --- CAMBIO 4: ALERTA DE ERROR DE CONEXIÓN ---
                console.error('Error al enviar el formulario:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'No se pudo conectar con el servidor. Revisa tu conexión a internet.'
                });
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

    // 1. Declaraciones ÚNICAS para el modal de edición. No chocan con las de "Crear".
    const modalEdicion = document.getElementById('editUserModal');
    const hiddenUserIdInput = document.getElementById('edit-user-id'); // El campo oculto
    const botonesCerrarModalEdicion = document.querySelectorAll('.close-edit-user-modal');

    // Función separada para abrir el modal de edición.
    const abrirModalEdicion = () => {
        if (modalEdicion) {
            modalEdicion.classList.remove('hidden');
            modalEdicion.classList.add('flex');
        }
    };

    // Función separada para cerrar el modal de edición.
    const cerrarModalEdicion = () => {
        if (modalEdicion) {
            modalEdicion.classList.add('hidden');
            modalEdicion.classList.remove('flex');
            hiddenUserIdInput.value = ''; // Limpiamos el ID al cerrar
            document.getElementById('edit-name').value = '';
            document.getElementById('edit-email').value = '';
            document.getElementById('edit-puesto').value = '';
        }
    };

    // --- LÓGICA AÑADIDA: Nueva función para llenar el formulario ---
    async function llenarFormularioEdicion(userId) {
        try {
            const response = await fetch(`/UserAdmin/users/${userId}`);

            if (!response.ok) {
                throw new Error('No se pudo obtener la información del usuario.');
            }
            const user = await response.json();

            // Cerramos el Swal de "cargando" una vez que tenemos los datos
            Swal.close();

            // Llenamos el formulario
            document.getElementById('edit-name').value = user.name;
            document.getElementById('edit-email').value = user.email;
            document.getElementById('edit-num-empleado').value = user.num_empleado;
            document.getElementById('edit-puesto').value = user.puesto;
            document.getElementById('edit-password').value = ''; 

        } catch (error) {
            console.error('Error al llenar el formulario de edición:', error);
            // --- CAMBIO: ALERTA DE ERROR AL CARGAR DATOS ---
            Swal.fire({
                icon: 'error',
                title: 'Error al Cargar',
                text: 'No se pudo cargar la información del usuario para editar.'
            });
            // La alerta de error reemplaza a la anterior, y no cerramos el modal 
            // para que el usuario pueda intentar de nuevo si quiere.
        }
    }

    // 2. Delegación de eventos para los botones "Editar" que se crean dinámicamente.
    tablaBody.addEventListener('click', function (event) {
        if (event.target && event.target.matches('.btn-edit')) {
            const userId = event.target.dataset.userId;
            
            if (hiddenUserIdInput) {
                hiddenUserIdInput.value = userId;
            }

            abrirModalEdicion();

            // --- CAMBIO: MOSTRAR ALERTA DE "CARGANDO..." ---
            Swal.fire({
                title: 'Cargando datos...',
                text: 'Por favor, espera.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            llenarFormularioEdicion(userId);
        }
    });

    // 5. Asignamos el evento de cierre a los botones 'X' y 'Cancelar' del modal de edición.
    botonesCerrarModalEdicion.forEach(boton => {
        boton.addEventListener('click', cerrarModalEdicion);
    });

    // 1. Obtenemos la referencia al formulario de edición
    const formEdicion = document.getElementById('editUserForm');

    if (formEdicion) {
        formEdicion.addEventListener('submit', async function(event) {
            event.preventDefault();

            const formData = new FormData(formEdicion);
            const userId = formData.get('edit-user-id');

            if (!userId) {
                // --- CAMBIO: ALERTA DE ERROR POR FALTA DE ID ---
                Swal.fire('Error', 'No se ha identificado al usuario a editar.', 'error');
                return;
            }
            
            const data = Object.fromEntries(formData.entries());

            // Renombramos los campos para que coincidan con el backend
            const body = {
                name: data['edit-name'],
                email: data['edit-email'],
                num_empleado: data['edit-num-empleado'],
                puesto: data['edit-puesto'],
                password: data['edit-password']
            };

            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            try {
                const response = await fetch(`/UserAdmin/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify(body)
                });

                const result = await response.json();

                if (response.ok) {
                    // --- CAMBIO 1: ALERTA DE ÉXITO ---
                    Swal.fire({
                        icon: 'success',
                        title: '¡Usuario Actualizado!',
                        text: result.message
                    });
                    
                    cerrarModalEdicion();
                    cargarUsuarios(); // Fundamental para ver los cambios

                } else {
                    if (response.status === 422) { // Error de validación
                        // --- CAMBIO 2: ALERTA DE VALIDACIÓN (WARNING) ---
                        const errorMessages = Object.values(result.errors).flat().join('<br>');
                        
                        Swal.fire({
                            icon: 'warning',
                            title: 'Datos Inválidos',
                            html: `Por favor, corrige los siguientes errores:<br><br><div class="text-left">${errorMessages}</div>`
                        });

                    } else {
                        // --- CAMBIO 3: ALERTA DE ERROR GENERAL (DANGER/ERROR) ---
                        Swal.fire({
                            icon: 'error',
                            title: 'Error del Servidor',
                            text: result.message || 'Ocurrió un error inesperado al actualizar.'
                        });
                    }
                }

            } catch (error) {
                // --- CAMBIO 4: ALERTA DE ERROR DE CONEXIÓN ---
                console.error('Error al actualizar el usuario:', error);
                Swal.fire('Oops...', 'No se pudo conectar con el servidor.', 'error');
            }
        });
    }
    // --- Llamamos a la función para cargar los usuarios cuando la página esté lista. ---
    cargarUsuarios();

    // Guardamos los SVGs de los iconos en variables para fácil acceso
    const svgIconEye = `
        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
    `;
    const svgIconEyeOff = `
        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m-5.858-.908a3 3 0 00-4.243-4.243"></path></svg>
    `;

    /**
     * Configura un botón para alternar la visibilidad de un campo de contraseña.
     * @param {string} inputId - El ID del input de la contraseña.
     * @param {string} toggleId - El ID del botón que contiene el icono.
     */
    function setupPasswordToggle(inputId, toggleId) {
        const passwordInput = document.getElementById(inputId);
        const toggleButton = document.getElementById(toggleId);

        // Si alguno de los elementos no existe, no hacemos nada.
        if (!passwordInput || !toggleButton) {
            return;
        }

        toggleButton.addEventListener('click', () => {
            // Comprueba el tipo actual del input
            if (passwordInput.type === 'password') {
                // Si es 'password', lo cambia a 'text' y muestra el icono de ojo abierto
                passwordInput.type = 'text';
                toggleButton.innerHTML = svgIconEye;
            } else {
                // Si es 'text', lo cambia de nuevo a 'password' y muestra el icono de ojo cerrado
                passwordInput.type = 'password';
                toggleButton.innerHTML = svgIconEyeOff;
            }
        });
    }

    // Aplicar al campo de contraseña del modal de CREACIÓN
    setupPasswordToggle('usercreate-password', 'toggle-usercreate-password');

    // Aplicar al campo de contraseña del modal de EDICIÓN
    setupPasswordToggle('edit-password', 'toggle-edit-password');
});