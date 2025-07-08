<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="mobile-web-app-capable" content="yes">
    <title>{{ config('app.name', 'CAM') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&display=swap" rel="stylesheet" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Material+Icons" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://unpkg.com/flowbite@1.5.4/dist/flowbite.js"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
    <script src="https://code.highcharts.com/highcharts-more.js"></script>
    <script src="{{ asset('js/sweetalert2.min.js') }}"></script>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded" rel="stylesheet" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/css/sweetalert.css', 'resources/css/select2tailwind.css', 'resources/js/app.js', 'resources/js/Sortable.js', 'resources/js/Pussher.js','resources/js/cardsAteOTsCache.js'])

    <!-- Styles -->
    @livewireStyles

    <script>
        if (localStorage.getItem('dark-mode') === 'false' || ('dark-mode' in localStorage)) {
            document.querySelector('html').classList.remove('dark');
            document.querySelector('html').style.colorScheme = 'light';
        } else {
            document.querySelector('html').classList.add('dark');
            document.querySelector('html').style.colorScheme = 'dark';
        }
    </script>

</head>

<body class="font-inter antialiased bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400"
    :class="{ 'sidebar-expanded': sidebarExpanded, 'sidebar-active-expanded': sidebarActiveExpanded }"
    x-data="{
        sidebarOpen: false,
        sidebarExpanded: localStorage.getItem('sidebar-expanded') == 'true',
        sidebarOpenActive: false,
        sidebarActiveExpanded: localStorage.getItem('sidebar-active-expanded') == 'true'
    }" x-init="$watch('sidebarExpanded', value => localStorage.setItem('sidebar-expanded', value));
    $watch('sidebarActiveExpanded', value => localStorage.setItem('sidebar-active-expanded', value))">

    <script>
        if (localStorage.getItem('sidebar-expanded') == 'true') {
            document.querySelector('body').classList.add('sidebar-expanded');
        } else {
            document.querySelector('body').classList.remove('sidebar-expanded');
        }

        if (localStorage.getItem('sidebar-active-expanded') == 'true') {
            document.querySelector('body').classList.add('sidebar-active-expanded');
        } else {
            document.querySelector('body').classList.remove('sidebar-active-expanded');
        }
    </script>

    <!-- Page wrapper -->
    <div class="flex h-[100dvh] overflow-hidden">

        {{-- Sidebar solo visible en sm y superior --}}
        <div class="hidden sm:block">
            <x-app.sidebar :variant="$attributes['sidebarVariant']" />
        </div>

        {{-- Docker solo visible en móvil --}}
        <div class="block sm:hidden">
            <x-app.docker />
        </div>

        <!-- Content area -->
        <div class="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden @if ($attributes['background']) {{ $attributes['background'] }} @endif
            pb-0 sm:pb-0"
            :class="{ 'pb-20': window.innerWidth < 640 }"
            x-ref="contentarea">

            <x-app.header :variant="$attributes['headerVariant']" />

            <main class="grow">
                {{ $slot }}
            </main>

        </div>
        <!-- Livewire Sidebar -->
            <x-livewire.sidebar-usuarios-activos-nuevo />
    </div>
    @livewireScriptConfig
</body>

</html>
