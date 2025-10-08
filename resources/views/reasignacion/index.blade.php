<x-app-layout>
    <div class="px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 w-full max-w-9xl mx-auto">
        <div class="sm:flex sm:justify-between sm:items-center mb-6 md:mb-8">
            <h1 class="text-xl sm:text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Reasignación Manual
                de OT</h1>
        </div>

        <div class="flex flex-col lg:flex-row gap-6">

            <div class="lg:w-1/4">
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">OT's Sin Asignación</h2>
                <div id="ots-sin-asignar-container"
                    class="space-y-4 bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg shadow-md min-h-[200px]">
                    <p class="text-gray-500 dark:text-gray-400">Cargando OTs...</p>
                </div>
            </div>

            <div class="flex-1">
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
                    <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Búsqueda Específica</h2>
                    <form id="search-form" class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label for="folio-search"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300">Folio de OT</label>
                            <input type="text" id="folio-search" name="folio"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div>
                            <label for="date-range-search"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300">Rango de
                                Fechas</label>
                            <input type="text" id="date-range-search" name="dates"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Selecciona un rango">
                        </div>
                        <button type="submit"
                            class="w-full md:w-auto px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md">Buscar</button>
                    </form>
                </div>

                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Resultados de Búsqueda</h2>
                <div id="search-results-container" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    <p class="text-gray-500 dark:text-gray-400 col-span-full">Realiza una búsqueda para ver los
                        resultados.</p>
                </div>
            </div>
        </div>
    </div>

    {{-- Modales --}}
    <div id="modalAsignar" class="fixed inset-0 z-50 hidden items-center justify-center bg-gray-900 bg-opacity-75">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Asignar Mecánico</h2>
            <form id="formAsignar">
                <input type="hidden" id="ot-id-asignar" name="ot_id">
                <div>
                    <label for="mecanico-select"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300">Selecciona un
                        mecánico</label>
                    <select id="mecanico-select" name="mecanico_cvetra" required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                    </select>
                </div>
                <div class="flex justify-end space-x-4 mt-6">
                    <button type="button" id="cancelar-asignacion"
                        class="px-4 py-2 text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md">Cancelar</button>
                    <button type="submit" class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md">Guardar
                        Asignación</button>
                </div>
            </form>
        </div>
    </div>

    <div id="modalDetalles" class="fixed inset-0 z-50 hidden items-center justify-center bg-gray-900 bg-opacity-75">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Detalles de la OT</h2>
                <button id="cerrar-detalles"
                    class="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">&times;</button>
            </div>
            <div id="modal-detalles-content" class="mt-4">
                <p class="dark:text-gray-300">Aquí se mostrarán los detalles de la OT seleccionada.</p>
            </div>
        </div>
    </div>

    @vite(['resources/js/reasignacion/reasignacion.js'])
</x-app-layout>