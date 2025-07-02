<x-app-layout>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <!-- Título -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Catalogos</h1>
        </div>

        <!-- Grid de paneles -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Panel Módulos/Supervisor -->
            <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Módulos/Supervisor</h2>
                <div id="supervisores-list" class="overflow-y-auto max-h-96">
                    <!-- La lista de supervisores se cargará aquí -->
                    <div class="animate-pulse">
                        <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div class="h-4 bg-gray-200 rounded w-full mb-4"></div>
                        <div class="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
            <!-- Panel Mecánicos -->
            <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Mecánicos</h2>
                <div id="mecanicos-list" class="overflow-y-auto max-h-96">
                    <!-- La lista de mecánicos se cargará aquí -->
                    <div class="animate-pulse">
                        <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div class="h-4 bg-gray-200 rounded w-full mb-4"></div>
                        <div class="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Nuevo Panel de Vinculación -->
        <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-8">
            <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Vinculación Mecánico - Módulo/Supervisor
            </h2>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" id="tabla-vinculacion">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th id="col-supervisor-modulo" name="supervisor-modulo"
                                class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Supervisor/Módulo</th>
                            <th id="col-mecanico" name="mecanico"
                                class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Mecánico</th>
                            <th id="col-comida" name="comida"
                                class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Hora Comida</th>
                            <th id="col-break-lj" name="break-lj"
                                class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Break Lun-Jue</th>
                            <th id="col-break-v" name="break-v"
                                class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Break Viernes</th>
                            <th class="px-4 py-2">Accion</th>
                        </tr>
                    </thead>
                    <tbody id="vinculacion-tbody">
                        <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                            <td name="supervisor-modulo" class="px-4 py-2"></td>
                            <td name="mecanico" class="px-4 py-2"></td>
                            <td name="comida" class="px-4 py-2" contenteditable="true"></td>
                            <td name="break-lj" class="px-4 py-2" contenteditable="true"></td>
                            <td name="break-v" class="px-4 py-2" contenteditable="true"></td>
                            <td class="px-4 py-2">
                                <!-- Botón eliminar -->
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="mt-4 flex gap-2">
                <button id="guardar-vinculacion"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">Guardar
                    Vinculaciones</button>
            </div>
        </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
    @vite(['resources/js/vinculacion.js'])
</x-app-layout>
