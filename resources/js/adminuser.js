(() => {
    // Utilidades de seguridad
    const getCsrfToken = () => {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') : '';
    };

    // Renderizado de usuarios en la tabla
    const renderUsers = users => {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;
        tbody.innerHTML = users.map(user => `
            <tr>
                <td class="p-4"><input type="checkbox"></td>
                <td class="px-6 py-3">${escapeHtml(user.num_empleado)}</td>
                <td class="px-6 py-3">${escapeHtml(user.name)}</td>
                <td class="px-6 py-3">${escapeHtml(user.puesto)}</td>
                <td class="px-6 py-3">${escapeHtml(user.status)}</td>
                <td class="px-6 py-3">
                    <button class="edit-btn text-blue-500" data-id="${escapeHtml(user.id)}">Editar</button>
                    <span class="mx-2">|</span>
                    <button class="delete-btn text-red-500" data-id="${escapeHtml(user.id)}">Eliminar</button>
                </td>
            </tr>
        `).join('');
    };

    // Escapar HTML para evitar XSS
    const escapeHtml = str => String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // Fetch de usuarios
    const fetchUsers = () => {
        fetch(window.USERS_ROUTE, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.json();
        })
        .then(data => renderUsers(data))
        .catch(error => console.error('Error cargando usuarios:', error));
    };

    // Filtro de búsqueda
    const setupSearch = () => {
        const searchInput = document.getElementById('table-search-users');
        const tbody = document.getElementById('users-table-body');
        if (!searchInput || !tbody) return;
        searchInput.addEventListener('keyup', () => {
            const searchValue = searchInput.value.toLowerCase();
            tbody.querySelectorAll('tr').forEach(row => {
                const name = row.children[2].textContent.toLowerCase();
                row.style.display = name.includes(searchValue) ? '' : 'none';
            });
        });
    };

    // Cargar opciones de puestos en un select
    const loadPuestos = (selectId, selectedValue = null) => {
        const select = document.getElementById(selectId);
        if (!select) return;
        fetch('/admin-control/puestos', {
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(puestos => {
            select.innerHTML = '<option value="">Seleccione un puesto</option>' +
                puestos.map(puesto =>
                    `<option value="${escapeHtml(puesto)}"${selectedValue && puesto === selectedValue ? ' selected' : ''}>${escapeHtml(puesto)}</option>`
                ).join('');
        })
        .catch(() => {
            select.innerHTML = '<option value="">Error al cargar puestos</option>';
        });
    };

    // Modal de edición de usuario
    const setupEditModal = () => {
        const modal = document.getElementById('editUserModal');
        const closeModalButtons = document.querySelectorAll('.close-edit-user-modal');
        const editForm = document.getElementById('editUserForm');
        const editUserId = document.getElementById('edit-user-id');
        const editName = document.getElementById('edit-name');
        const editEmail = document.getElementById('edit-email');
        const editPuesto = document.getElementById('edit-puesto');
        const editPassword = document.getElementById('edit-password');

        if (!modal || !editForm || !editUserId || !editName || !editEmail || !editPuesto) {
            console.error('Error: No se encontraron algunos elementos del DOM para editar.');
            return;
        }

        // <-- CAMBIO: Ya no ponemos el listener de apertura aquí. Solo la lógica de cierre y envío.

        // Cerrar modal
        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            });
        });

        // Enviar datos actualizados
        editForm.addEventListener('submit', event => {
            event.preventDefault();
            const userId = editUserId.value;
            const formData = {
                name: editName.value,
                email: editEmail.value,
                puesto: editPuesto.value
            };
            if (editPassword && editPassword.value.trim() !== '') {
                formData.password = editPassword.value;
            }

            fetch(`/admin-control/users/${encodeURIComponent(userId)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) throw new Error('Error actualizando usuario');
                return response.json();
            })
            .then(() => {
                Swal.fire('Actualizado', 'Usuario actualizado correctamente', 'success');
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                fetchUsers();
            })
            .catch(error => {
                console.error('Error actualizando usuario:', error);
                Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error');
            });
        });
    };

    // <-- CAMBIO: La función setupDeleteUser ya no es necesaria, porque su lógica se moverá.

    // Lógica del Modal de Creación
    const setupCreateModal = () => {
        // <-- CAMBIO: Quitamos la constante btnOpen de aquí porque su listener se moverá.
        const btnClose = document.getElementById('btn-close-usercreate');
        const btnCancel = document.getElementById('btn-cancel-usercreate');
        const modal = document.getElementById('modal-usercreate');
        const form = document.getElementById('form-usercreate');
        const selectPuesto = document.getElementById('usercreate-puesto');

        if (!btnClose || !btnCancel || !modal || !form || !selectPuesto) {
            console.error('Faltan elementos del DOM para el modal de creación de usuario.');
            return;
        }

        // <-- CAMBIO: La función openModal ya no es necesaria aquí.
        
        const closeModal = () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            form.reset();
        };
        
        // <-- CAMBIO: Eliminamos el listener de btnOpen.
        btnClose.addEventListener('click', closeModal);
        btnCancel.addEventListener('click', closeModal);

        // Enviar formulario de creación
        form.addEventListener('submit', e => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('usercreate-name').value,
                email: document.getElementById('usercreate-email').value,
                num_empleado: document.getElementById('usercreate-num_empleado').value,
                password: document.getElementById('usercreate-password').value,
                puesto: document.getElementById('usercreate-puesto').value
            };

            fetch('/admin-control/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(() => {
                Swal.fire('Agregado', 'Usuario creado correctamente', 'success');
                closeModal();
                fetchUsers();
            })
            .catch(error => {
                console.error('Error creando usuario:', error);
                const errorMessage = error.message || 'No se pudo crear el usuario.';
                Swal.fire('Error', errorMessage, 'error');
            });
        });
    };

    // Inicialización principal
    document.addEventListener('DOMContentLoaded', () => {
        // Define la ruta global de usuarios si no existe
        if (!window.USERS_ROUTE) {
            window.USERS_ROUTE = document.getElementById('users-table-body')?.dataset?.usersRoute || '/admin-control/users';
        }
        
        fetchUsers();
        setupSearch();
        setupEditModal(); // Sigue configurando la lógica INTERNA del modal de edición
        setupCreateModal(); // Sigue configurando la lógica INTERNA del modal de creación

        // <-- CAMBIO: Aquí centralizamos TODOS los listeners de clic que abren modales o inician acciones.
        document.addEventListener('click', event => {
            
            // Acción: Abrir modal para CREAR usuario
            if (event.target.closest('#btn-open-usercreate')) {
                const modal = document.getElementById('modal-usercreate');
                loadPuestos('usercreate-puesto');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }

            // Acción: Abrir modal para EDITAR usuario
            const editButton = event.target.closest('.edit-btn');
            if (editButton) {
                const userId = editButton.getAttribute('data-id');
                const modal = document.getElementById('editUserModal');

                fetch(`/admin-control/users/${encodeURIComponent(userId)}`, {
                    headers: {
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                })
                .then(response => {
                    if (!response.ok) throw new Error('No se pudo obtener el usuario');
                    return response.json();
                })
                .then(data => {
                    if (!data) throw new Error('Datos de usuario vacíos');
                    document.getElementById('edit-user-id').value = data.id;
                    document.getElementById('edit-name').value = data.name;
                    document.getElementById('edit-email').value = data.email;
                    loadPuestos('edit-puesto', data.puesto);
                    modal.classList.remove('hidden');
                    modal.classList.add('flex');
                })
                .catch(error => {
                    console.error('Error obteniendo usuario:', error);
                    alert('No se pudo cargar el usuario.');
                });
            }

            // Acción: ELIMINAR usuario
            const deleteButton = event.target.closest('.delete-btn');
            if (deleteButton) {
                const userId = deleteButton.getAttribute('data-id');
                if (!userId) return;
                Swal.fire({
                    title: '¿Estás seguro?',
                    text: "¡Esta acción no se puede deshacer!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        fetch(`/admin-control/users/${encodeURIComponent(userId)}`, {
                            method: 'DELETE',
                            headers: {
                                'X-CSRF-TOKEN': getCsrfToken(),
                                'X-Requested-With': 'XMLHttpRequest'
                            },
                            credentials: 'same-origin'
                        })
                        .then(response => {
                            if (!response.ok) throw new Error('Error eliminando usuario');
                            return response.json();
                        })
                        .then(() => {
                            Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
                            fetchUsers();
                        })
                        .catch(error => {
                            console.error('Error eliminando usuario:', error);
                            Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
                        });
                    }
                });
            }
        });
    });
})();