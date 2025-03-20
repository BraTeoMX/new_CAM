<x-app-layout>
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <!-- Título -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Atención OT</h1>
        </div>
        <!-- Contenedor Principal -->
        <div class="grid grid-cols-5 gap-4">
            <!-- Sección 2: OT's Sin Asignacion -->
            <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">OT's Sin asignación</h2>
                <div id="SIN_ASIGNAR" class="space-y-4 bg-gray-850 p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>
            <!-- Sección 2: OT's Proceso -->
            <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">OT's Proceso</h2>
                <div id="PROCESO" class="space-y-4 bg-gray-850 p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>
            <!-- Sección 1: OT's Pendientes -->
            <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">OT's Pendientes</h2>
                <div id="PENDIENTE" class="space-y-4 bg-gray-850 p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>
            <!-- Sección 3: OT's Cerradas -->
            <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">OT's Atendidas</h2>
                <div id="ATENDIDO" class="space-y-4 bg-gray-850 p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>
            <!-- Sección 4: OT's Finalizadas -->
            <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">OT's Finalizadas</h2>
                <div id="FINALIZADO" class="space-y-4 bg-gray-850 p-4 rounded-lg shadow-md">
                    <!-- Cards dinámicas se insertarán aquí -->
                </div>
            </div>
        </div>
    </div>

     <!-- Scripts -->
     @vite(['resources/js/events.js'])
</x-app-layout>
