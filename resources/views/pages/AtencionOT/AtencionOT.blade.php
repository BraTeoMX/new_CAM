<x-app-layout>
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <div class="px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 w-full max-w-9xl mx-auto">
        <!-- Título -->
        <div class="sm:flex sm:justify-between sm:items-center mb-6 md:mb-8">
            <h1 class="text-xl sm:text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Atención OT</h1>
        </div>
        <!-- Contenedor Principal -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
             <!-- Sección 1: OT's Sin Asignacion -->
            <div>
                <h2 class="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 md:mb-4">OT's Sin asignación
                </h2>
                <div id="SIN_ASIGNAR"
                    class="space-y-4 bg-gray-850 p-2 md:p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>
            <!-- Sección 1: OT's Asignadas -->
            <div>
                <h2 class="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 md:mb-4">OT's Asignadas
                </h2>
                <div id="ASIGNADO"
                    class="space-y-4 bg-gray-850 p-2 md:p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>
            <!-- Sección 2: OT's Proceso -->
            <div>
                <h2 class="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 md:mb-4">OT's Proceso
                </h2>
                <div id="PROCESO"
                    class="space-y-4 bg-gray-850 p-2 md:p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>
            <!-- Sección 3: OT's Pendientes -->
            <div>
                <h2 class="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 md:mb-4">OT's Pendientes
                </h2>
                <div id="PENDIENTE"
                    class="space-y-4 bg-gray-850 p-2 md:p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>
            <!-- Sección 4: OT's Atendidas -->
            <div>
                <h2 class="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 md:mb-4">OT's Atendidas
                </h2>
                <div id="ATENDIDO"
                    class="space-y-4 bg-gray-850 p-2 md:p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>
            <!-- Sección 5: OT's Finalizadas -->
            <div>
                <h2 class="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 md:mb-4">OT's Finalizadas
                </h2>
                <div id="FINALIZADO"
                    class="space-y-4 bg-gray-850 p-2 md:p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>
        </div>
        <!-- Modal -->
        <div id="modalPendiente"
            class="fixed inset-0 z-50 hidden bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg">
                <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Mover OT a Pendiente</h2>

                <form id="formPendiente" class="space-y-4">
                    <!-- Selector de fecha -->
                    <div>
                        <label for="fechaPendiente"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300">Selecciona el rango de
                            días</label>
                        <input id="fechaPendiente" type="text"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Selecciona días" required />
                    </div>

                    <!-- Área de texto -->
                    <div>
                        <label for="motivoPendiente"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300">Motivo</label>
                        <textarea id="motivoPendiente" rows="4"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Explica por qué esta OT se mueve a pendiente..." required></textarea>
                    </div>

                    <!-- Botones -->
                    <div class="flex justify-end space-x-4">
                        <button type="button"
                            class="px-4 py-2 text-gray-800 dark:text-gray-300 bg-gray-200 hover:bg-gray-300 rounded-md"
                            onclick="toggleModal(false)">Cancelar</button>
                        <button type="submit"
                            class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md">Guardar</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Scripts -->
        @vite(['resources/js/events.js'])
</x-app-layout>
