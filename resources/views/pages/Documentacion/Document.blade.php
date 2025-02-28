<x-app-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <!-- Título -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Seguimientos OT</h1>
        </div>
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div
                class="fi-ta-content relative divide-y divide-gray-200 overflow-x-auto dark:divide-white/10 dark:border-t-white/10">
                <table class="fi-ta-table w-full table-auto divide-y divide-gray-200 text-start dark:divide-white/5">
                    <thead class="divide-y divide-gray-200 dark:divide-white/5">
                        <tr class="bg-gray-50 dark:bg-white/5">
                            <th class="fi-ta-header-cell px-3 py-3.5 sm:first-of-type:ps-6 sm:last-of-type:pe-6 fi-table-header-cell-Folio"
                                style=";">
                                <button aria-label="Folio" type="button" wire:click="sortTable('Folio')"
                                    class="group flex w-full items-center gap-x-1 whitespace-nowrap justify-start">
                                    <span
                                        class="fi-ta-header-cell-label text-sm font-semibold text-gray-950 dark:text-white">
                                        Folio OT
                                    </span>
                                    <svg class="fi-ta-header-cell-sort-icon h-5 w-5 shrink-0 transition duration-75 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 group-focus-visible:text-gray-500 dark:group-hover:text-gray-400 dark:group-focus-visible:text-gray-400"
                                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                        aria-hidden="true" data-slot="icon">
                                        <path fill-rule="evenodd"
                                            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                                            clip-rule="evenodd"></path>
                                    </svg>
                                </button>
                            </th>
                            <th class="fi-ta-header-cell px-3 py-3.5 sm:first-of-type:ps-6 sm:last-of-type:pe-6 fi-table-header-cell-Modulo"
                                style=";">
                                <button aria-label="Modulo" type="button" wire:click="sortTable('Modulo')"
                                    class="group flex w-full items-center gap-x-1 whitespace-nowrap justify-start">
                                    <span
                                        class="fi-ta-header-cell-label text-sm font-semibold text-gray-950 dark:text-white">
                                        Modulo
                                    </span>
                                    <svg class="fi-ta-header-cell-sort-icon h-5 w-5 shrink-0 transition duration-75 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 group-focus-visible:text-gray-500 dark:group-hover:text-gray-400 dark:group-focus-visible:text-gray-400"
                                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                        aria-hidden="true" data-slot="icon">
                                        <path fill-rule="evenodd"
                                            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                                            clip-rule="evenodd"></path>
                                    </svg>
                                </button>
                            </th>
                            <th class="fi-ta-header-cell px-3 py-3.5 sm:first-of-type:ps-6 sm:last-of-type:pe-6 fi-table-header-cell-status"
                                style=";">
                                <span class="group flex w-full items-center gap-x-1 whitespace-nowrap justify-start">
                                    <span
                                        class="fi-ta-header-cell-label text-sm font-semibold text-gray-950 dark:text-white">
                                        Status
                                    </span>
                            </th>
                            <th class="fi-ta-header-cell px-3 py-3.5 sm:first-of-type:ps-6 sm:last-of-type:pe-6 fi-table-header-cell-currency" style=";">
                                <button aria-label="Currency" type="button" wire:click="sortTable('currency')"
                                    class="group flex w-full items-center gap-x-1 whitespace-nowrap justify-start">
                                    <span
                                        class="fi-ta-header-cell-label text-sm font-semibold text-gray-950 dark:text-white">
                                        Currency
                                    </span>
                                    <svg class="fi-ta-header-cell-sort-icon h-5 w-5 shrink-0 transition duration-75 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 group-focus-visible:text-gray-500 dark:group-hover:text-gray-400 dark:group-focus-visible:text-gray-400"
                                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                        aria-hidden="true" data-slot="icon">
                                        <path fill-rule="evenodd"
                                            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                                            clip-rule="evenodd"></path>
                                    </svg></button>
                            </th>
                            <th class="fi-ta-header-cell px-3 py-3.5 sm:first-of-type:ps-6 sm:last-of-type:pe-6 fi-table-header-cell-total-price"
                                style=";">
                                <button aria-label="Total price" type="button" wire:click="sortTable('total_price')"
                                    class="group flex w-full items-center gap-x-1 whitespace-nowrap justify-start">
                                    <span
                                        class="fi-ta-header-cell-label text-sm font-semibold text-gray-950 dark:text-white">
                                        Total price
                                    </span><svg
                                        class="fi-ta-header-cell-sort-icon h-5 w-5 shrink-0 transition duration-75 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 group-focus-visible:text-gray-500 dark:group-hover:text-gray-400 dark:group-focus-visible:text-gray-400"
                                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                        aria-hidden="true" data-slot="icon">
                                        <path fill-rule="evenodd"
                                            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                                            clip-rule="evenodd"></path>
                                    </svg></button>
                            </th>
                            <th class="fi-ta-header-cell px-3 py-3.5 sm:first-of-type:ps-6 sm:last-of-type:pe-6 fi-table-header-cell-shipping-price"
                                style=";">
                                <button aria-label="Shipping cost" type="button"
                                    wire:click="sortTable('shipping_price')"
                                    class="group flex w-full items-center gap-x-1 whitespace-nowrap justify-start">
                                    <span
                                        class="fi-ta-header-cell-label text-sm font-semibold text-gray-950 dark:text-white">
                                        Shipping cost
                                    </span>

                                    <svg class="fi-ta-header-cell-sort-icon h-5 w-5 shrink-0 transition duration-75 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 group-focus-visible:text-gray-500 dark:group-hover:text-gray-400 dark:group-focus-visible:text-gray-400"
                                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                        aria-hidden="true" data-slot="icon">
                                        <path fill-rule="evenodd"
                                            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                                            clip-rule="evenodd"></path>
                                    </svg>

                                </button>
                            </th>
                            <th class="fi-ta-header-cell px-3 py-3.5 sm:first-of-type:ps-6 sm:last-of-type:pe-6 fi-table-header-cell-created-at"
                                style=";">
                                <span class="group flex w-full items-center gap-x-1 whitespace-nowrap justify-start">
                                    <span
                                        class="fi-ta-header-cell-label text-sm font-semibold text-gray-950 dark:text-white">
                                        Order Date
                                    </span>
                                </span>
                            </th>
                            <th aria-label="Action" class="fi-ta-actions-header-cell w-1"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 whitespace-nowrap dark:divide-white/5">

                    </tbody>
                </table>

            </div>
        </div>
    </div>
</x-app-layout>
