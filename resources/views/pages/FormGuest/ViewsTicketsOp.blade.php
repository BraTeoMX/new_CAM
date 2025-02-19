<x-guest-layout>
    <!DOCTYPE html>
    <html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'CAM') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&display=swap" rel="stylesheet" />
        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
        <!-- Styles -->
        @livewireStyles
        <script>
            if (localStorage.getItem('dark-mode') === 'false' || !('dark-mode' in localStorage)) {
                document.querySelector('html').classList.remove('dark');
                document.querySelector('html').style.colorScheme = 'light';
            } else {
                document.querySelector('html').classList.add('dark');
                document.querySelector('html').style.colorScheme = 'dark';
            }
        </script>
    </head>
    <body>
        <div class="flex h-[100dvh] flex-col">
            <div class="flex justify-end px-8 sm:px-8 lg:px-9">
                <div class="flex items-center space-x-9">
                    <!-- Divider -->
                    <hr class="w-px h-6 bg-gray-200 dark:bg-gray-700/60 border-none" />
                    <!-- Notifications button -->
                    <x-dropdown-notifications align="right" />
                    <!-- Divider -->
                    <hr class="w-px h-6 bg-gray-200 dark:bg-gray-700/60 border-none" />
                </div>
            </div>
            <div class="flex-1 px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                <!-- Form Guest actions -->
                <div class="sm:flex sm:justify-between sm:items-center mb-8">
                    <!-- Left: Title -->
                    <div class="mb-4 sm:mb-0">
                        <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Ordenes de trabajo
                        </h1>
                    </div>
                </div>
                <!-- Ticket Form -->
                <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-auto">
                    <!-- Aquí puedes agregar el contenido del formulario de tickets -->
                </div>
            </div>
        </div>
    </body>
    </html>
</x-guest-layout>
