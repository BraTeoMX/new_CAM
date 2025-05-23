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
                    <button class="edit-btn text-blue-500" data-id="${escapeHtml(user.num_empleado)}">Editar</button>
                    <span class="mx-2">|</span>
                    <button class="delete-btn text-red-500" data-id="${escapeHtml(user.num_empleado)}">Eliminar</button>
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

        if (!modal || !editForm || !editUserId || !editName || !editEmail || !editPuesto) {
            console.error('Error: No se encontraron algunos elementos en el DOM.');
            return;
        }

        // Obtener datos del usuario y abrir modal
        const fetchUserData = userId => {
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
                editUserId.value = data.num_empleado;
                editName.value = data.name;
                editEmail.value = data.email;
                // Cargar puestos y seleccionar el actual
                loadPuestos('edit-puesto', data.puesto);
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            })
            .catch(error => {
                console.error('Error obteniendo usuario:', error);
                alert('No se pudo cargar el usuario.');
            });
        };

        // Delegación de eventos para abrir el modal al hacer clic en "Editar"
        document.addEventListener('click', event => {
            if (event.target.classList.contains('edit-btn')) {
                const userId = event.target.getAttribute('data-id');
                if (userId) fetchUserData(userId);
                else console.error('Error: No se encontró el ID del usuario.');
            }
        });

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
                alert('Usuario actualizado correctamente');
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                fetchUsers(); // Refresca la tabla sin recargar la página
            })
            .catch(error => {
                console.error('Error actualizando usuario:', error);
                alert('No se pudo actualizar el usuario.');
            });
        });
    };

    // Modal de agregar usuario
    const setupAddUserModal = () => {
        const openBtn = document.getElementById('openAddUserModal');
        const modal = document.getElementById('addUserModal');
        const closeBtns = document.querySelectorAll('.close-add-user-modal');
        const addForm = document.getElementById('addUserForm');
        const addPuesto = document.getElementById('add-puesto');

        if (!openBtn || !modal || !addForm || !addPuesto) return;

        // Abrir modal
        openBtn.addEventListener('click', () => {
            loadPuestos('add-puesto');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        });

        // Cerrar modal
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                addForm.reset();
            });
        });

        // Enviar formulario
        addForm.addEventListener('submit', e => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('add-name').value,
                email: document.getElementById('add-email').value,
                num_empleado: document.getElementById('add-num_empleado').value,
                password: document.getElementById('add-password').value,
                puesto: document.getElementById('add-puesto').value
            };

            fetch(window.USERS_ROUTE, {
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
                if (!response.ok) throw new Error('Error al agregar usuario');
                return response.json();
            })
            .then(() => {
                alert('Usuario agregado correctamente');
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                addForm.reset();
                fetchUsers();
            })
            .catch(error => {
                console.error('Error agregando usuario:', error);
                alert('No se pudo agregar el usuario.');
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
        setupEditModal();
        setupAddUserModal();
    });
})();
