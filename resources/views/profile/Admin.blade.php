<x-app-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <!-- Título -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Admin Control</h1>
            </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden">
            <div class="p-6 sm:px-10 sm:py-8 flex flex-col">
                <div class="flex flex-col sm:flex-row items-center justify-between">
                    <h2 class="text-lg sm:text-xl text-gray-800 dark:text-gray-100 font-bold">Administrar Usuarios</h2>
                </div>
            </div>
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                <div class="flex items-center justify-between flex-wrap py-4 bg-white dark:bg-gray-900 px-4">
                    <div class="relative w-full max-w-md">
                        <span
                            class="material-symbols-outlined absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">person_search</span>
                        <input type="text" id="table-search-users"
                            class="block w-full pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Buscar usuarios...">
                    </div>
                </div>
                <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th class="p-4"><input type="checkbox" id="select-all"></th>
                            <th class="px-6 py-3">ID</th>
                            <th class="px-6 py-3">Nombre</th>
                            <th class="px-6 py-3">Puesto</th>
                            <th class="px-6 py-3">Status</th>
                            <th class="px-6 py-3">Sub-Status</th>
                            <th class="px-6 py-3">Estatus Cuenta</th>
                            <th class="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="users-table-body">
                        <script>
                            document.addEventListener('DOMContentLoaded', function() {
                                const searchInput = document.getElementById('table-search-users');
                                const tbody = document.getElementById('users-table-body');
                                const csrfToken = '{{ csrf_token() }}';

                                function fetchUsers() {
                                    fetch('{{ route('admin-control.users') }}', {
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'X-CSRF-TOKEN': csrfToken,
                                                'X-Requested-With': 'XMLHttpRequest'
                                            }
                                        })
                                        .then(response => response.json())
                                        .then(data => renderUsers(data))
                                        .catch(error => console.error('Error cargando usuarios:', error));
                                }

                                function renderUsers(users) {
                                    tbody.innerHTML = users.map(user => `
                                        <tr>
                                            <td class="p-4"><input type="checkbox"></td>
                                            <td class="px-6 py-3">${user.num_empleado}</td>
                                            <td class="px-6 py-3">${user.name}</td>
                                            <td class="px-6 py-3">${user.puesto}</td>
                                            <td class="px-6 py-3">${user.status}</td>
                                            <td class="px-6 py-3"></td>
                                            <td class="px-6 py-3"></td>
                                            <td class="px-6 py-3">
                                                <button class="edit-btn text-blue-500" data-id="${user.num_empleado}">Editar</button>
                                                <span class="mx-2">|</span>
                                                <button class="delete-btn text-red-500" data-id="${user.num_empleado}">Eliminar</button>
                                            </td>
                                        </tr>
                                    `).join('');
                                }
                                searchInput.addEventListener('keyup', function() {
                                    const searchValue = searchInput.value.toLowerCase();
                                    const rows = tbody.querySelectorAll('tr');
                                    rows.forEach(row => {
                                        const name = row.children[2].textContent.toLowerCase();
                                        row.style.display = name.includes(searchValue) ? '' : 'none';
                                    });
                                });
                                fetchUsers();
                            });
                        </script>
                    </tbody>
                </table>
            </div>
        </div>
        <!-- Edit user modal -->
        <div id="editUserModal" tabindex="-1" aria-hidden="true"
            class="fixed top-0 left-0 right-0 z-50 items-center justify-center hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div class="relative w-full max-w-2xl max-h-full">
                <!-- Modal content -->
                <form class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                    <!-- Modal header -->
                    <div
                        class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600 border-gray-200">
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                            Edit user
                        </h3>
                        <button type="button"
                            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            data-modal-hide="editUserModal" id="closeModal">
                            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                            <span class="sr-only">Close modal</span>
                        </button>
                    </div>
                    <!-- Modal body -->
                    <div class="p-6 space-y-6">
                        <form id="editUserForm">
                            <input type="hidden" id="edit-user-id">

                            <div class="grid grid-cols-6 gap-6">
                                <div class="col-span-6 sm:col-span-3">
                                    <label for="edit-name"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Nombre
                                    </label>
                                    <input type="text" name="edit-name" id="edit-name"
                                        class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                </div>

                                <div class="col-span-6 sm:col-span-3">
                                    <label for="edit-email"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Email
                                    </label>
                                    <input type="email" name="edit-email" id="edit-email"
                                        class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                </div>

                                <div class="col-span-6 sm:col-span-3">
                                    <label for="edit-puesto"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Puesto
                                    </label>
                                    <input type="text" name="edit-puesto" id="edit-puesto"
                                        class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                </div>
                            </div>
                            <!-- Modal footer -->
                            <div
                                class="flex items-center justify-end p-6 space-x-3 border-t border-gray-200 rounded-b dark:border-gray-600">
                                <button type="button" id="closeModal" class="px-4 py-2 bg-gray-500 text-white rounded">
                                    Cancelar
                                </button>
                                <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">
                                    Actualizar
                                </button>
                            </div>
                        </form>
                    </div>
            </div>
        </div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const modal = document.getElementById('editUserModal');
            const closeModalButtons = document.querySelectorAll('[data-modal-hide="editUserModal"]'); // Se seleccionan TODOS los botones de cierre
            const editForm = document.getElementById('editUserForm');
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            // Inputs del modal
            const editUserId = document.getElementById('edit-user-id');
            const editName = document.getElementById('edit-name');
            const editEmail = document.getElementById('edit-email');
            const editPuesto = document.getElementById('edit-puesto');

            // Verificar que el modal y los botones existen
            if (!modal || !editForm || closeModalButtons.length === 0) {
                console.error('Error: No se encontraron algunos elementos en el DOM.');
                return;
            }

            // Función para obtener datos del usuario y abrir el modal
            function fetchUserData(userId) {
                fetch(`/admin-control/users/${userId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (!data) {
                            console.error('Error: No se recibieron datos del usuario.');
                            return;
                        }

                        editUserId.value = data.num_empleado;
                        editName.value = data.name;
                        editEmail.value = data.email;
                        editPuesto.value = data.puesto;

                        // Mostrar modal
                        modal.classList.remove('hidden');
                        modal.classList.add('flex');
                    })
                    .catch(error => console.error('Error obteniendo usuario:', error));
            }

            // Delegación de eventos para abrir el modal al hacer clic en un botón "Editar"
            document.addEventListener('click', function (event) {
                if (event.target.classList.contains('edit-btn')) {
                    const userId = event.target.getAttribute('data-id');
                    if (userId) {
                        fetchUserData(userId);
                    } else {
                        console.error('Error: No se encontró el ID del usuario.');
                    }
                }
            });

            // Cerrar modal con cualquier botón de cierre
            closeModalButtons.forEach(button => {
                button.addEventListener('click', function () {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                });
            });

            // Enviar datos actualizados
            editForm.addEventListener('submit', function (event) {
                event.preventDefault();

                const userId = editUserId.value;
                const formData = {
                    name: editName.value,
                    email: editEmail.value,
                    puesto: editPuesto.value
                };

                fetch(`/admin-control/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify(formData)
                })
                .then(response => response.json())
                .then(data => {
                    alert('Usuario actualizado correctamente');
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');

                    location.reload(); // Quita esta línea si quieres actualizar sin recargar
                })
                .catch(error => console.error('Error actualizando usuario:', error));
            });
        });
    </script>




</x-app-layout>
