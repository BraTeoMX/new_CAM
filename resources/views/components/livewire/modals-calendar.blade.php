<meta name="csrf-token" content="{{ csrf_token() }}">
        <!-- Modal Prioridad -->
        <div id="modalPrioridad"
            class="fixed inset-0 z-50 hidden bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg">
                <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Asignar Prioridad</h2>

                <form id="formPrioridad" class="space-y-4">
                    <!-- Selector de prioridad -->
                    <div>
                        <label for="Prioridad"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300">Selecciona la
                            prioridad</label>
                        <select id="Prioridad" name="Prioridad"
                            class="mt-1 block w-full px-3 py-2 border  text-gray-700 dark:text-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="">Selecciona una prioridad</option>
                            <option value="Alta">🔴 Alta</option>
                            <option value="Media">🟠 Media</option>
                            <option value="Baja">🟢 Baja</option>
                        </select>
                    </div>

                    <!-- Botones -->
                    <div class="flex justify-end space-x-4">
                        <button type="button" id="closePriorityModal"
                            class="px-4 py-2 text-white dark:text-white bg-red-500 hover:bg-red-300 rounded-md">Cancelar</button>
                        <button type="submit" id="savePriorityButton"
                            class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
