<x-app-layout>
    <div class="max-w-7xl mx-auto py-8 px-4">
        <div
            class="flex items-center mb-6 *:justify-between bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <img src="{{ asset('images/intimark.webp') }}" alt="Logo"
                class="h-16 w-50 rounded mr-4 border-2 border-gray-300 object-cover dark:border-gray-700">
            <div>
                <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">ORDEN DE TRABAJO PARA MECÁNICOS</h1>
                <div class="mt-2 flex items-center flex-wrap">
                    <span class="font-semibold text-gray-700 dark:text-gray-300 mr-2">FECHA:</span>
                    <input type="date"
                        class="border rounded px-2 py-1 focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 w-full md:w-auto" />
                </div>
            </div>
        </div>
        <div class="bg-gradient-to-br from-blue-100 via-white to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div class="overflow-x-auto rounded-xl">
                <table id="ordenTrabajoTable"
                    class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 rounded-xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
                    <thead class="bg-gradient-to-r from-blue-200 via-blue-100 to-blue-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
                        <tr>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">FOLIO</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">MÓDULO</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">SUPERVISOR</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center"># OP</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">NOMBRE</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">PROBLEMA</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">HORA PARO</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">HORA TÉRMINO</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">TOTAL MIN</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">ID MÁQUINA</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">TIPO MAQUINA</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">MECANICO</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">FALLA</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">CAUSA</th>
                            <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-center">ACCION</th>
                            <th colspan="4"
                                class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-lg font-extrabold text-center bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200 uppercase tracking-wider rounded-tr-xl">
                                ENCUESTA DE SATISFACCIÓN</th>
                        </tr>
                        <tr>
                            <th colspan="15"></th>
                            <th class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-center font-bold text-green-700 dark:text-green-400">EXCELENTE</th>
                            <th class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-center font-bold text-blue-700 dark:text-blue-400">BUENO</th>
                            <th class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-center font-bold text-yellow-700 dark:text-yellow-400">REGULAR</th>
                            <th class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-center font-bold text-red-700 dark:text-red-400">MALO</th>
                        </tr>
                        <tr>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="folio" id="folio"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="modulo" id="modulo"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="supervisor" id="supervisor"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="op" id="op"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="nombre" id="nombre"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                             <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="problema" id="problema"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="time" name="hora_paro" id="hora_paro"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="time" name="hora_termino" id="hora_termino"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="number" name="total_min" id="total_min"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="id_maquina" id="id_maquina"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="tipo_maquina" id="tipo_maquina"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="mecanico" id="mecanico"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="codigo_falla" id="codigo_falla"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="causa" id="causa"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="accion" id="accion"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-center"><input
                                    type="radio" name="satisfaccion" value="excelente"></th>
                            <th class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-center"><input
                                    type="radio" name="satisfaccion" value="bueno"></th>
                            <th class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-center"><input
                                    type="radio" name="satisfaccion" value="regular"></th>
                            <th class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-center"><input
                                    type="radio" name="satisfaccion" value="malo"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        {{-- Aquí se insertan las filas dinámicamente con JS --}}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    @vite(['resources/js/FormOTMeca.js'])

    {{-- Flowbite Speed Dial --}}
    <div data-dial-init class="fixed end-6 bottom-6 group z-50">
        <div id="speed-dial-menu-text-outside-button" class="flex flex-col items-center hidden mb-4 space-y-2">
            <button id="copy-table-btn" type="button" class="relative w-[52px] h-[52px] text-gray-500 bg-white rounded-lg border border-gray-200 dark:border-gray-600 hover:text-gray-900 shadow-xs dark:hover:text-white dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400">
                <svg class="w-5 h-5 mx-auto" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                    <path d="M5 9V4.13a2.96 2.96 0 0 0-1.293.749L.879 7.707A2.96 2.96 0 0 0 .13 9H5Zm11.066-9H9.829a2.98 2.98 0 0 0-2.122.879L7 1.584A.987.987 0 0 0 6.766 2h4.3A3.972 3.972 0 0 1 15 6v10h1.066A1.97 1.97 0 0 0 18 14V2a1.97 1.97 0 0 0-1.934-2Z"/>
                    <path d="M11.066 4H7v5a2 2 0 0 1-2 2H0v7a1.969 1.969 0 0 0 1.933 2h9.133A1.97 1.97 0 0 0 13 18V6a1.97 1.97 0 0 0-1.934-2Z"/>
                </svg>
                <span class="absolute block mb-px text-sm font-medium -translate-y-1/2 -start-14 top-1/2">Copy</span>
            </button>
            <button id="save-table-btn" type="button" class="relative w-[52px] h-[52px] text-gray-500 bg-white rounded-lg border border-gray-200 dark:border-gray-600 hover:text-gray-900 shadow-xs dark:hover:text-white dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400">
                <svg class="w-5 h-5 mx-auto" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"/>
                    <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
                </svg>
                <span class="absolute block mb-px text-sm font-medium -translate-y-1/2 -start-14 top-1/2">Save</span>
            </button>
        </div>
        <button type="button" data-dial-toggle="speed-dial-menu-text-outside-button" aria-controls="speed-dial-menu-text-outside-button" aria-expanded="false" class="flex items-center justify-center text-white bg-blue-700 rounded-lg w-14 h-14 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800">
            <svg class="w-5 h-5 transition-transform group-hover:rotate-45" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"/>
            </svg>
            <span class="sr-only">Open actions menu</span>
        </button>
    </div>

    {{-- Modal para elegir Excel o PDF --}}
    <div id="save-modal" tabindex="-1" class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full bg-black/50">
        <div class="relative w-full h-full max-w-md md:h-auto mx-auto flex items-center justify-center">
            <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <button type="button" id="close-modal-btn" class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-hide="save-modal">
                    <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                    <span class="sr-only">Close modal</span>
                </button>
                <div class="p-6 text-center">
                    <h3 class="mb-5 text-lg font-normal text-gray-700 dark:text-gray-200">¿En qué formato deseas descargar la tabla?</h3>
                    <button id="download-excel-btn" class="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                        Excel
                    </button>
                    <button id="download-pdf-btn" class="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                        PDF
                    </button>
                </div>
            </div>
        </div>
    </div>

    {{-- Flowbite, SheetJS, jsPDF --}}
    <script src="https://unpkg.com/flowbite@2.3.0/dist/flowbite.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
</x-app-layout>
