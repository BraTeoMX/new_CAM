<x-app-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <!-- Título -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <h3 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Vinculacion Area/Modulo - Mecanico</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
                <label for="select-supervisor" class="block font-medium mb-1">Area/Modulo - Supervisor</label>
                <select id="select-supervisor" class="w-full"></select>
            </div>
            <div>
                <label for="select-mecanico" class="block font-medium mb-1">Mecánico</label>
                <select id="select-mecanico" class="w-full" disabled></select>
            </div>
        </div>

        <div class="mt-4">
            <button id="btn-anadir-vinculacion"
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                disabled>
                Añadir a lista
            </button>
        </div>

        <!-- Nuevo Panel de Vinculación -->
        <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-8">
            <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Vinculación Area/Modulo - Supervisor - Mecánico 
            </h2>
            <div class="overflow-x-auto">
                <table class="min-w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700" id="tabla-vinculacion">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th id="col-modulo-supervisor" name="modulo-supervisor"
                                class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Area/Modulo - Supervisor</th>
                            <th id="col-mecanico" name="mecanico"
                                class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Mecánico</th>
                            <th id="col-planta" name="planta"
                                class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Planta</th>
                            <th id="col-comida" name="comida"
                                class="px-4 py-2 text-left text-xs font-medium ... uppercase min-w-[200px]">
                                Hora Comida
                            </th>
                            <th id="col-break-lj" name="break-lj"
                                class="px-4 py-2 text-left text-xs font-medium ... uppercase min-w-[200px]">
                                Break Lunes-Jueves
                            </th>
                            <th id="col-break-v" name="break-v"
                                class="px-4 py-2 text-left text-xs font-medium ... uppercase min-w-[200px]">
                                Break Viernes
                            </th>
                            <th class="px-4 py-2">Accion</th>
                        </tr>
                    </thead>
                    <tbody id="vinculacion-tbody">
                    </tbody>
                </table>
            </div>
            <div class="mt-4 flex gap-2">
                <button id="guardar-vinculacion"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">Guardar Vinculaciones
                </button>
            </div>
        </div>
    </div>
    @vite(['resources/js/vinculacionV2.js'])
</x-app-layout>
