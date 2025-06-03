<div class="min-w-fit">
    @php
        $isAuthenticated = auth()->check();
    @endphp

    @if (!$isAuthenticated)
        <script>
            window.location.href = "{{ route('login') }}";
        </script>
    @else
        <!-- Sidebar backdrop (mobile only) -->
        <div class="fixed inset-0 bg-gray-900 bg-opacity-30 z-40 lg:hidden transition-opacity duration-200"
            :class="sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'" aria-hidden="true" x-cloak></div>

        <!-- Sidebar -->
        <aside id="sidebar"
            class="flex flex-col absolute z-40 left-0 top-0 lg:static h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:!w-64 shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out {{ $variant === 'v2' ? 'border-r border-gray-200 dark:border-gray-700/60' : 'rounded-r-2xl shadow-sm' }}"
            :class="sidebarOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-64'"
            @click.outside="sidebarOpen = false"
            @keydown.escape.window="sidebarOpen = false">

            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
                <!-- Close button (mobile) -->
                <button class="lg:hidden text-gray-500 hover:text-gray-400" @click.stop="sidebarOpen = !sidebarOpen"
                    aria-controls="sidebar" :aria-expanded="sidebarOpen">
                    <span class="sr-only">Close sidebar</span>
                    <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
                    </svg>
                </button>
                <!-- Logo -->
                <a class="block mx-auto" href="{{ route('dashboard') }}">
                    <img src="{{ asset('images/intimark.webp') }}" alt="Logo" class="h-12 w-auto mx-auto" />
                </a>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 flex flex-col justify-between">
                <div>
                    <h3 class="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3 mb-2">
                        <span class="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6" aria-hidden="true">•••</span>
                    </h3>
                    @if (auth()->user()->isAdmin())
                        <ul class="space-y-2 mb-4">
                            <!-- Configuraciones -->
                            <li x-data="{ open: false }">
                                <div class="pl-4 pr-3 py-2 rounded-lg">
                                    <button type="button"
                                        class="w-full flex items-center justify-between rounded-lg transition cursor-pointer text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                        @click="open = !open">
                                        <span class="flex items-center">
                                            <span class="material-symbols-outlined">manufacturing</span>
                                            <span class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Configuraciones</span>
                                        </span>
                                        <svg class="w-4 h-4 fill-current text-gray-500 dark:text-gray-400 transition-transform"
                                            :class="{ 'rotate-180': open }" viewBox="0 0 20 20">
                                            <path d="M5.23 7.97a1 1 0 0 1 1.54 0l3 3a1 1 0 0 1-1.41 1.42l-2.29-2.3-2.3 2.3a1 1 0 0 1-1.41-1.42l3-3z" />
                                        </svg>
                                    </button>
                                    <ul x-show="open" class="pl-8 pr-3 py-2 space-y-2">
                                        <li class="rounded-lg">
                                            <a class="flex items-center text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition truncate pl-4 pr-3 py-2
                                                @if (Request::segment(1) === 'Admin') bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04] @endif"
                                                href="{{ route('Admin') }}">
                                                <span class="material-symbols-outlined">admin_panel_settings</span>
                                                <span class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Panel Admin</span>
                                            </a>
                                        </li>
                                        <li class="rounded-lg">
                                            <a class="flex items-center text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition truncate pl-4 pr-3 py-2
                                                @if (Request::segment(1) === 'Catalogos') bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04] @endif"
                                                href="{{ route('Catalogos') }}">
                                                <span class="material-symbols-outlined">library_books</span>
                                                <span class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Admin Catálogos</span>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    @endif

                    <ul class="space-y-2">
                        <!-- Dashboard -->
                        @if (auth()->user()->isAdmin() || auth()->user()->ISNULL())
                        <li>
                            <a class="flex items-center pl-4 pr-3 py-2 rounded-lg
                                @if (Request::segment(1) === 'dashboard') bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04] @endif
                                transition truncate text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                href="{{ route('dashboard') }}">
                                <svg class="shrink-0 fill-current @if (in_array(Request::segment(1), ['dashboard'])) text-violet-500 @else text-gray-400 dark:text-gray-500 @endif"
                                    xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                    viewBox="0 0 16 16">
                                    <path d="M5.936.278A7.983 7.983 0 0 1 8 0a8 8 0 1 1-8 8c0-.722.104-1.413.278-2.064a1 1 0 1 1 1.932.516A5.99 5.99 0 0 0 2 8a6 6 0 1 0 6-6c-.53 0-1.045.076-1.548.21A1 1 0 1 1 5.936.278Z" />
                                    <path d="M6.068 7.482A2.003 2.003 0 0 0 8 10a2 2 0 1 0-.518-3.932L3.707 2.293a1 1 0 0 0-1.414 1.414l3.775 3.775Z" />
                                </svg>
                                <span class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Dashboard</span>
                            </a>
                        </li>
                        <!-- Atencion OT -->
                        <li>
                            <a class="flex items-center pl-4 pr-3 py-2 rounded-lg
                                @if (Request::segment(1) === 'AtencionOT') bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04] @endif
                                transition truncate text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white"
                                href="{{ route('AtencionOT') }}">
                                <span class="material-symbols-outlined">person_alert</span>
                                <span class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Reasignación Manual</span>
                            </a>
                        </li>
                        @endif
                        <!-- OTs Pendientes o en standby -->
                        <li>
                            <a class="flex items-center pl-4 pr-3 py-2 rounded-lg
                                @if (Request::segment(1) === 'OTsProgram') bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04] @endif
                                transition truncate text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white"
                                href="{{ route('OTsProgram') }}">
                                <span class="material-symbols-outlined">edit_calendar</span>
                                <span class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Programar OTS pendientes</span>
                            </a>
                        </li>
                        <!-- Reportes (colapsable) -->
                        <li x-data="{ open: {{ in_array(Request::segment(1), ['Documentar', 'FormOTMeca']) ? 1 : 0 }} }">
                            <div class="pl-4 pr-3 py-2 rounded-lg">
                                <button type="button"
                                    class="w-full flex items-center justify-between rounded-lg transition cursor-pointer text-gray-800 dark:text-gray-100"
                                    @click="open = !open">
                                    <span class="flex items-center">
                                        <span class="material-symbols-outlined">description</span>
                                        <span class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Reportes</span>
                                    </span>
                                    <svg class="w-4 h-4 fill-current text-gray-500 dark:text-gray-400 transition-transform"
                                        :class="{ 'rotate-180': open }" viewBox="0 0 20 20">
                                    <path d="M5.23 7.97a1 1 0 0 1 1.54 0l3 3a1 1 0 0 1-1.41 1.42l-2.29-2.3-2.3 2.3a1 1 0 0 1-1.41-1.42l3-3z" />
                                    </svg>
                                </button>
                                <ul x-show="open" class="pl-8 pr-3 py-2 space-y-2">
                                    <li class="rounded-lg">
                                        <a class="flex items-center text-gray-800 dark:text-gray-100 truncate transition pl-4 pr-3 py-2
                                            @if (Request::segment(1) === 'Documentar') bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04] @endif"
                                            href="{{ route('Documentar') }}">
                                            <span class="material-symbols-outlined">edit_document</span>
                                            <span class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Seguimientos OTs</span>
                                        </a>
                                    </li>
                                    <li class="rounded-lg">
                                        <a class="flex items-center text-gray-800 dark:text-gray-100 truncate transition pl-4 pr-3 py-2
                                            @if (Request::segment(1) === 'FormOTMeca') bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04] @endif"
                                            href="{{ route('FormOTMeca') }}">
                                            <span class="material-symbols-outlined">build</span>
                                            <span class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Form OT Mecánico</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>

                <!-- Expand / collapse button -->
                <div class="hidden lg:flex flex-col justify-end">
                    <button
                        class="mx-auto mb-2 p-2 rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                        @click="sidebarExpanded = !sidebarExpanded">
                        <span class="sr-only">Expand / collapse sidebar</span>
                        <svg class="shrink-0 fill-current text-gray-400 dark:text-gray-500 sidebar-expanded:rotate-180"
                            xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                            viewBox="0 0 16 16">
                            <path
                                d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z" />
                        </svg>
                    </button>
                </div>
            </nav>
        </aside>
    @endif
</div>
