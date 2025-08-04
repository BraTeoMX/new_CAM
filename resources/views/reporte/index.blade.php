<x-app-layout>
    <div class="max-w-7xl mx-auto py-8 px-4">
        <div
            class="flex items-center mb-6 *:justify-between bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <img src="{{ asset('images/intimark.webp') }}" alt="Logo"
                class="h-16 w-50 rounded mr-4">
            <div>
                <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">ORDEN DE TRABAJO PARA MECÁNICOS</h1>
                <div class="mt-2 flex items-center flex-wrap gap-4">
                <div>
                    <span class="font-semibold text-gray-700 dark:text-gray-300 mr-2">FECHA INICIO:</span>
                    <input type="date" id="fecha_inicio"
                            class="border rounded px-2 py-1 focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 w-full md:w-auto" />
                </div>
                <div>
                    <span class="font-semibold text-gray-700 dark:text-gray-300 mr-2">FECHA FIN:</span>
                    <input type="date" id="fecha_fin"
                            class="border rounded px-2 py-1 focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 w-full md:w-auto" />
                </div>
            </div>
            </div>
        </div>
        <div class="bg-gradient-to-br from-blue-100 via-white to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex flex-wrap items-center justify-end gap-2 mb-4">
                <button id="copy-table-btn" type="button"
                    class="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-700 hover:text-blue-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                    <svg class="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 18 20">
                        <path d="M5 9V4.13a2.96 2.96 0 0 0-1.293.749L.879 7.707A2.96 2.96 0 0 0 .13 9H5Zm11.066-9H9.829a2.98 2.98 0 0 0-2.122.879L7 1.584A.987.987 0 0 0 6.766 2h4.3A3.972 3.972 0 0 1 15 6v10h1.066A1.97 1.97 0 0 0 18 14V2a1.97 1.97 0 0 0-1.934-2Z"/>
                        <path d="M11.066 4H7v5a2 2 0 0 1-2 2H0v7a1.969 1.969 0 0 0 1.933 2h9.133A1.97 1.97 0 0 0 13 18V6a1.97 1.97 0 0 0-1.934-2Z"/>
                    </svg>
                    Copiar tabla
                </button>
                <button id="save-table-btn" type="button"
                    class="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-green-700 hover:text-green-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition">
                    <svg class="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"/>
                        <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
                    </svg>
                    Descargar tabla
                </button>
            </div>
            <div class="overflow-x-auto rounded-xl">
                <table id="ordenTrabajoTable"
                    class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 rounded-xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
                    <thead class="bg-gradient-to-r from-blue-200 via-blue-100 to-blue-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
                        <tr>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">PLANTA</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">FOLIO</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">MÓDULO</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">SUPERVISOR</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center"># OP</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">NOMBRE</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">PROBLEMA</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">HORA PARO</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">HORA TÉRMINO</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">MINUTOS TOTALES</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">MINUTOS REALES</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">MINUTOS BAHIA</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">ID MÁQUINA</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">TIPO MAQUINA</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">MECANICO</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">FALLA</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">CAUSA</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">ACCION</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">ENCUESTA</th>
                        </tr>
                        <tr>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="planta" id="planta"
                                    placeholder="Planta"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="folio" id="folio"
                                    placeholder="Folio"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="modulo" id="modulo"
                                    placeholder="Módulo"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="supervisor" id="supervisor"
                                    placeholder="Supervisor"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="op" id="op"
                                    placeholder="# OP"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="nombre" id="nombre"
                                    placeholder="Nombre"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="problema" id="problema"
                                    placeholder="Problema"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="hora_paro" id="hora_paro"
                                    placeholder="HH:MM:SS"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="hora_termino" id="hora_termino"
                                    placeholder="HH:MM:SS"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="total_min" id="total_min"
                                    placeholder="Minutos Totales"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="minutos_reales" id="minutos_reales"
                                    placeholder="Minutos Reales"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="minutos_bahia" id="minutos_bahia"
                                    placeholder="Minutos Bahía"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="id_maquina" id="id_maquina"
                                    placeholder="ID Máquina"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="tipo_maquina" id="tipo_maquina"
                                    placeholder="Tipo Máquina"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="mecanico" id="mecanico"
                                    placeholder="Mecánico"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="codigo_falla" id="codigo_falla"
                                    placeholder="Código Falla"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="causa" id="causa"
                                    placeholder="Causa"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="accion" id="accion"
                                    placeholder="Acción"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="encuesta" id="encuesta"
                                    placeholder="Encuesta"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        {{-- Aquí se insertan las filas dinámicamente con JS --}}
                    </tbody>
                </table>
                <div id="pagination-container" class="mt-4 flex justify-center"></div>
            </div>
        </div>
    </div>
    @vite(['resources/js/reporte/reporteMecanico.js'])
    {{-- Modal para elegir Excel o PDF --}}
    <div id="save-modal"
        tabindex="-1"
        class="fixed inset-0 z-50 items-center justify-center bg-black/50 p-4 transition-all duration-200 hidden"
        style="min-height: 100vh;">
        <div class="relative w-full max-w-md md:max-w-lg bg-white rounded-lg shadow dark:bg-gray-700 mx-auto">
            <button type="button" id="close-modal-btn"
                class="absolute top-3 right-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
                data-modal-hide="save-modal">
                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"></path>
                </svg>
                <span class="sr-only">Close modal</span>
            </button>
            <div class="p-6 text-center">
                <h3 class="mb-5 text-lg font-normal text-gray-700 dark:text-gray-200">
                    ¿En qué formato deseas descargar la tabla?
                </h3>
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <button id="download-excel-btn"
                        class="w-full sm:w-auto text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center justify-center px-5 py-2.5 text-center">
                        <svg class="w-7 h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.828a2 2 0 0 0-.586-1.414l-4.828-4.828A2 2 0 0 0 12.172 1H4zm8 0v4a2 2 0 0 0 2 2h4v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8zm-2.707 8.293a1 1 0 0 0-1.414 0L7 11.172l-1.293-1.293a1 1 0 0 0-1.414 1.414L5.586 12.586l-1.293 1.293a1 1 0 0 0 1.414 1.414L7 14.828l1.293 1.293a1 1 0 0 0 1.414-1.414L8.414 12.586l1.293-1.293a1 1 0 0 0 0-1.414z" />
                        </svg>
                        Excel
                    </button>
                    <button id="download-pdf-btn"
                        class="w-full sm:w-auto text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center justify-center px-5 py-2.5 text-center">
                        <svg class="w-7 h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.828a2 2 0 0 0-.586-1.414l-4.828-4.828A2 2 0 0 0 11.172 1H6zm8 0v4a2 2 0 0 0 2 2h-4V2h2zm-2 8a1 1 0 0 1 1 1v1h-2v-1a1 1 0 0 1 1-1zm-2 2h2v2h-2v-2zm-2 0h2v2H8v-2zm-2 0h2v2H6v-2z" />
                        </svg>
                        PDF
                    </button>
                </div>
            </div>
        </div>
    </div>
    {{-- Flowbite, SheetJS, jsPDF --}}

</x-app-layout>