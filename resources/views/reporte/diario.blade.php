<x-app-layout>
    <!-- DataTables CSS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.7/css/dataTables.bootstrap5.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/buttons/2.4.2/css/buttons.bootstrap5.min.css">

    <div class="max-w-7xl mx-auto py-8 px-4">
        <div
            class="flex items-center mb-6 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <img src="{{ asset('images/intimark.webp') }}" alt="Logo" class="h-16 w-50 rounded mr-4">
            <div>
                <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">REPORTE DIARIO CAM</h1>
                <div class="mt-2 flex items-center flex-wrap gap-4">
                    <div>
                        <span class="font-semibold text-gray-700 dark:text-gray-300 mr-2">FECHA:</span>
                        <input type="date" id="fecha"
                            class="border rounded px-2 py-1 focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
                    </div>
                    <div>
                        <span class="font-semibold text-gray-700 dark:text-gray-300 mr-2">PLANTA:</span>
                        <select id="planta"
                            class="border rounded px-2 py-1 focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                            <option value="">Seleccionar Planta</option>
                            <option value="1">Ixtlahuaca</option>
                            <option value="2">San Bartolo</option>
                        </select>
                    </div>
                    <button id="consultar-btn" type="button"
                        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                clip-rule="evenodd" />
                        </svg>
                        Consultar
                    </button>
                </div>
            </div>
        </div>
        <div
            class="bg-gradient-to-br from-blue-100 via-white to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div class="overflow-x-auto rounded-xl">
                <table id="reporteTable"
                    class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 rounded-xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
                    <thead
                        class="bg-gradient-to-r from-blue-200 via-blue-100 to-blue-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
                        <tr>
                            <th
                                class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">
                                MÓDULO</th>
                            <th
                                class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">
                                # EMPLEADO OPERARIO</th>
                            <th
                                class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">
                                NOMBRE OPERARIO</th>
                            <th
                                class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">
                                # EMPLEADO SUPERVISOR</th>
                            <th
                                class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">
                                NOMBRE SUPERVISOR</th>
                            <th
                                class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">
                                TIEMPO EJECUCIÓN</th>
                            <th
                                class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">
                                CLASE MÁQUINA</th>
                            <th
                                class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">
                                NÚMERO MÁQUINA</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        <!-- Data will be populated by DataTable -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <!-- DataTables JS -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

    @vite(['resources/js/reporte/reporteDiario.js'])
</x-app-layout>