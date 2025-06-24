<x-app-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Administrar Usuarios</h1>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden">
            <div class="p-6 sm:px-10 sm:py-8 flex flex-col">
                <div class="flex flex-col sm:flex-row items-center justify-between">
                    <div class="relative w-full max-w-md">
                        <span
                            class="material-symbols-outlined absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">person_search</span>
                        <input type="text" id="table-search-users"
                            class="block w-full pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Buscar usuarios...">
                    </div>
                    <button id="btn-open-usercreate"
                        class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                        <span class="material-symbols-outlined mr-2">person_add</span>
                        Nuevo Usuario
                    </button>
                </div>
            </div>
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th class="px-6 py-3">ID</th>
                            <th class="px-6 py-3">Nombre</th>
                            <th class="px-6 py-3">Numero de empleado</th>
                            <th class="px-6 py-3">Puesto</th>
                            <th class="px-6 py-3">Status</th>
                            <th class="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="users-table-body" data-users-route="{{ route('users.listaUsuarios') }}">
                        <script></script>
                    </tbody>
                </table>
            </div>
        </div>
        <!-- Edit user modal -->
        <div id="editUserModal" tabindex="-1"
            class="fixed top-0 left-0 right-0 z-50 items-center justify-center hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div class="relative w-full max-w-2xl max-h-full">
                <form id="editUserForm" class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                    <div
                        class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600 border-gray-200">
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                            Editar Usuario
                        </h3>
                        <button type="button"
                            class="close-edit-user-modal text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            data-modal-hide="editUserModal">
                            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                            <span class="sr-only">Close modal</span>
                        </button>
                    </div>
                    <div class="p-6 space-y-6">
                        <input type="hidden" id="edit-user-id" name="edit-user-id">

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
                                <label for="edit-num-empleado"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Número de Empleado
                                </label>
                                <input type="text" name="edit-num-empleado" id="edit-num-empleado"
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
                                <select name="edit-puesto" id="edit-puesto"
                                    class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    <option value="">Cargando...</option>
                                </select>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="edit-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Nueva contraseña
                                </label>
                                <div class="relative">
                                    <input type="password" id="edit-password" name="edit-password" placeholder="Dejar en blanco para no cambiar"
                                        class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 pr-10"> <button type="button" id="toggle-edit-password" class="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m-5.858-.908a3 3 0 00-4.243-4.243"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div
                            class="flex items-center justify-end p-6 space-x-3 border-t border-gray-200 rounded-b dark:border-gray-600">
                            <button type="button"
                                class="close-edit-user-modal px-4 py-2 bg-gray-500 text-white rounded"
                                data-modal-hide="editUserModal">
                                Cancelar
                            </button>
                            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">
                                Actualizar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <!-- Nuevo modal para crear usuario -->
        <div id="modal-usercreate"
            class="fixed top-0 left-0 right-0 z-50 items-center justify-center hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div class="relative w-full max-w-2xl max-h-full">
                <form id="form-usercreate" class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                    <div
                        class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600 border-gray-200">
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                            Crear Nuevo Usuario
                        </h3>
                        <button type="button" id="btn-close-usercreate"
                            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                            <span class="sr-only">Cerrar modal</span>
                        </button>
                    </div>
                    <div class="p-6 space-y-6">
                        <div class="grid grid-cols-6 gap-6">
                            <div class="col-span-6 sm:col-span-3">
                                <label for="usercreate-name"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Nombre
                                </label>
                                <input type="text" name="usercreate-name" id="usercreate-name" required
                                    class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500">
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="usercreate-email"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Email
                                </label>
                                <input type="email" name="usercreate-email" id="usercreate-email" required
                                    class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500">
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="usercreate-num_empleado"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Número de Empleado
                                </label>
                                <input type="text" name="usercreate-num_empleado" id="usercreate-num_empleado"
                                    required
                                    class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500">
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="usercreate-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Contraseña
                                </label>
                                <div class="relative">
                                    <input type="password" name="usercreate-password" id="usercreate-password" required
                                        class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500 pr-10"> <button type="button" id="toggle-usercreate-password" class="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m-5.858-.908a3 3 0 00-4.243-4.243"></path></svg>
                                    </button>
                                </div>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="usercreate-puesto"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Puesto
                                </label>
                                <select name="usercreate-puesto" id="usercreate-puesto" required
                                    class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500">
                                    <option value="">Cargando...</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div
                        class="flex items-center justify-end p-6 space-x-3 border-t border-gray-200 rounded-b dark:border-gray-600">
                        <button type="button" id="btn-cancel-usercreate"
                            class="px-4 py-2 bg-gray-500 text-white rounded">
                            Cancelar
                        </button>
                        <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    @vite(['resources/js/user/userAdmin.js'])
</x-app-layout>
