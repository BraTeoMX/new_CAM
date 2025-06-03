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
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4">
            <div class="overflow-x-auto">
                <table id="ordenTrabajoTable"
                    class="min-w-full text-sm text-left text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead class="bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">MÓDULO</th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700"># OP</th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">NOMBRE</th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">HORA PARO</th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">HORA TÉRMINO</th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">TOTAL MIN</th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">ID MÁQUINA</th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">CÓDIGO FALLA</th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">CAUSA</th>
                            <th colspan="4"
                                class="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center bg-gray-200 dark:bg-gray-700">
                                ENCUESTA DE SATISFACCIÓN</th>
                        </tr>
                        <tr>
                            <th colspan="9"></th>
                            <th class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-center">EXCELENTE
                            </th>
                            <th class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-center">BUENO</th>
                            <th class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-center">REGULAR</th>
                            <th class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-center">MALO</th>
                        </tr>
                        <tr>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="modulo" id="modulo"
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
                                <input type="text" name="codigo_falla" id="codigo_falla"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            </th>
                            <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                <input type="text" name="causa" id="causa"
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
                    <tbody>

                    </tbody>
                </table>
            </div>
        </div>
    </div>
    @vite(['resources/js/FormOTMeca.js'])
</x-app-layout>
