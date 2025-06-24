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
            // Hacemos la petición a la nueva ruta, pasando el ID del usuario.
            const response = await fetch(`/UserAdmin/users/${userId}`);

            if (!response.ok) {
                throw new Error('No se pudo obtener la información del usuario.');
            }
            const user = await response.json();

            // Llenamos los campos del formulario con los datos recibidos.
            document.getElementById('edit-name').value = user.name;
            document.getElementById('edit-email').value = user.email;
            document.getElementById('edit-puesto').value = user.puesto;

        } catch (error) {
            console.error('Error al llenar el formulario de edición:', error);
            alert('No se pudo cargar la información para editar.');
            // Si falla, cerramos el modal para no mostrar un formulario vacío/roto.
            cerrarModalEdicion();
        }
    }

    // 2. Delegación de eventos para los botones "Editar" que se crean dinámicamente.
    tablaBody.addEventListener('click', function (event) {
        // Solo reaccionamos si se hizo clic en un botón con la clase 'btn-edit'
        if (event.target && event.target.matches('.btn-edit')) {
            const userId = event.target.dataset.userId;
            
            // 1. Asignamos el ID al campo oculto.
            if (hiddenUserIdInput) {
                hiddenUserIdInput.value = userId;
            }

            // 2. Abrimos el modal (vacío por una fracción de segundo).
            abrirModalEdicion();

            // 3. Inmediatamente después, llamamos a la función para que lo llene.
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
        // 2. Escuchamos el evento 'submit'
        formEdicion.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevenimos la recarga de la página

            // 3. Obtenemos los datos del formulario
            const formData = new FormData(formEdicion);
            const userId = formData.get('edit-user-id'); // Obtenemos el ID del campo oculto

            // Si no tenemos un ID, no podemos continuar.
            if (!userId) {
                alert('Error: No se ha identificado al usuario a editar.');
                return;
            }
            
            // Convertimos a un objeto simple
            const data = Object.fromEntries(formData.entries());

            // 4. Lógica clave: si la contraseña está vacía, la eliminamos del objeto
            // para que el backend no la procese.
            if (!data.password) {
                delete data.password;
            }

            // Obtenemos el token CSRF
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            try {
                // 5. Hacemos la petición PUT a la ruta de actualización
                const response = await fetch(`/UserAdmin/users/${userId}`, {
                    method: 'PUT', // Usamos PUT como definimos en la ruta
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (!response.ok) {
                    if (response.status === 422) { // Error de validación
                        alert('Por favor, corrige los errores: ' + Object.values(result.errors).join('\n'));
                    } else {
                        throw new Error(result.message || 'Error en el servidor.');
                    }
                } else {
                    // 6. Éxito: mostramos mensaje, cerramos modal y refrescamos la tabla
                    alert(result.message);
                    cerrarModalEdicion();
                    cargarUsuarios(); // ¡Fundamental para ver los cambios reflejados en la tabla!
                }

            } catch (error) {
                console.error('Error al actualizar el usuario:', error);
                alert('No se pudo actualizar el usuario.');
            }
        });
    }
    // --- Llamamos a la función para cargar los usuarios cuando la página esté lista. ---
    cargarUsuarios();

});