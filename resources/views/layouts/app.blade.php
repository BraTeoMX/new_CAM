<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="theme-color" content="#111827"> <!-- Color para dispositivos móviles -->

        <title>{{ config('app.name', 'CAM') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&display=swap" rel="stylesheet" />

        <!-- Styles -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
        @livewireStyles

        <script>
            // Inicialización del modo oscuro
            const htmlElement = document.documentElement;
            if (localStorage.getItem('dark-mode') === 'true') {
                htmlElement.classList.add('dark');
                htmlElement.style.colorScheme = 'dark';
            } else {
                htmlElement.classList.remove('dark');
                htmlElement.style.colorScheme = 'light';
            }
        </script>
    </head>
    <body
        class="font-inter antialiased bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400"
        x-data="{ sidebarOpen: false, sidebarExpanded: localStorage.getItem('sidebar-expanded') === 'true' }"
        x-init="$watch('sidebarExpanded', value => localStorage.setItem('sidebar-expanded', value))"
        :class="{ 'sidebar-expanded': sidebarExpanded }"
    >
        <script>
            // Estado del sidebar
            if (localStorage.getItem('sidebar-expanded') === 'true') {
                document.body.classList.add('sidebar-expanded');
            } else {
                document.body.classList.remove('sidebar-expanded');
            }
        </script>

        <!-- Page wrapper -->
        <div class="flex h-screen overflow-hidden">

            <!-- Sidebar -->
            <x-app.sidebar :variant="$attributes['sidebarVariant']" />

            <!-- Content area -->
            <div class="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden @if($attributes['background']){{ $attributes['background'] }}@endif" x-ref="contentarea">

                <!-- Header -->
                <x-app.header :variant="$attributes['headerVariant']" />

                <!-- Main content -->
                <main class="grow">
                    {{ $slot }}
                </main>
            </div>
        </div>

        @livewireScripts
    </body>
</html>
