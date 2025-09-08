<footer
    class="fixed bottom-0 left-0 z-50 w-full bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600 shadow-lg">
    @php $user = auth()->user(); @endphp
    <nav class="flex justify-between items-center max-w-lg mx-auto h-16 px-2 sm:px-4">
        {{-- Dashboard --}}
        @if ($user && ($user->isAdmin() || $user->ISNULL()))
        <a href="{{ route('dashboard') }}"
            class="flex flex-col items-center justify-center flex-1 mx-1 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition
            @if (Request::segment(1) === 'dashboard') bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04] @endif">
            <svg class="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                fill="currentColor" viewBox="0 0 20 20">
                <path
                    d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
            </svg>
            <span class="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">Dashboard</span>
        </a>
        @endif

        {{-- Reasignación Manual --}}
        @if ($user && ($user->isAdmin() || $user->ISNULL()))
        <a href="{{ route('AtencionOT') }}"
            class="flex flex-col items-center justify-center flex-1 mx-1 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition
            @if (Request::segment(1) === 'AtencionOT') bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04] @endif">
            <span
                class="material-symbols-outlined w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                style="font-size:1.5rem;">person_alert</span>
            <span class="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">Reasignación</span>
        </a>
        @endif

        {{-- Programar OTS pendientes --}}
        <a href="{{ route('OTsProgram') }}"
            class="flex flex-col items-center justify-center flex-1 mx-1 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition
            @if (Request::segment(1) === 'OTsProgram') bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04] @endif">
            <span
                class="material-symbols-outlined w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                style="font-size:1.5rem;">edit_calendar</span>
            <span class="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">Programar OTS</span>
        </a>

        {{-- Reportes (todos los usuarios) --}}
        <div class="relative flex-1 mx-1" x-data="{ open: false }">
            <button type="button"
                class="flex flex-col items-center justify-center w-full py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition focus:outline-none group"
                @click="open = !open" @click.away="open = false">
                <span
                    class="material-symbols-outlined w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                    style="font-size:1.5rem;">description</span>
                <span class="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">Reportes</span>
            </button>
            <div class="absolute bottom-14 left-1/2 transform -translate-x-1/2 z-50 min-w-max" x-show="open"
                x-transition @click.away="open = false" style="display: none;">
                <div class="bg-white dark:bg-gray-700 rounded shadow-lg py-2">
                    <!--
                    <a href="{{ route('Documentar') }}" class="flex items-center px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600
                        @if (Request::segment(1) === 'Documentar') bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04] @endif">
                        <span class="material-symbols-outlined w-5 h-5 mr-2">edit_document</span>
                        Seguimientos
                    </a>
                    -->
                    <a href="{{ route('FormOTMeca') }}"
                        class="flex items-center px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600
                        @if (Request::segment(1) === 'FormOTMeca') bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04] @endif">
                        <span class="material-symbols-outlined w-5 h-5 mr-2">build</span>
                        Form Mecánico
                    </a>
                </div>
            </div>
        </div>

        {{-- Configuraciones (solo admin) --}}
        @if ($user && $user->isAdmin())
        <div class="relative flex-1 mx-1" x-data="{ open: false }">
            <button type="button"
                class="flex flex-col items-center justify-center w-full py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition focus:outline-none group"
                @click="open = !open" @click.away="open = false">
                <span
                    class="material-symbols-outlined w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                    style="font-size:1.5rem;">manufacturing</span>
                <span class="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">Config</span>
            </button>
            <div class="absolute bottom-14 left-1/2 transform -translate-x-1/2 z-50 min-w-max" x-show="open"
                x-transition @click.away="open = false" style="display: none;">
                <div class="bg-white dark:bg-gray-700 rounded shadow-lg py-2">
                    <a href="{{ route('user.index') }}"
                        class="flex items-center px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600
                        @if (Request::segment(1) === 'UserAdmin') bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04] @endif">
                        <span class="material-symbols-outlined w-5 h-5 mr-2">admin_panel_settings</span>
                        Administrar Usuarios
                    </a>
                    <a href="{{ route('vinculacion') }}"
                        class="flex items-center px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600
                        @if (Request::segment(1) === 'vinculacion.index') bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04] @endif">
                        <span class="material-symbols-outlined w-5 h-5 mr-2">library_books</span>
                        Catálogos
                    </a>
                </div>
            </div>
        </div>
        @endif

    </nav>
</footer>