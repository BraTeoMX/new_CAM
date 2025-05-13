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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Material+Icons" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script src="https://unpkg.com/flowbite@1.5.4/dist/flowbite.js"></script>
    <!-- Styles -->
    @livewireStyles
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/css/sweetalert.css', 'resources/css/select2tailwind.css', 'resources/js/Pussher.js'])
    <script>
        // Cambiar a usar dark-mode-guest para invitados
        if (localStorage.getItem('dark-mode-guest') === 'false' || !('dark-mode-guest' in localStorage)) {
            document.querySelector('html').classList.remove('dark');
            document.querySelector('html').style.colorScheme = 'light';
        } else {
            document.querySelector('html').classList.add('dark');
            document.querySelector('html').style.colorScheme = 'dark';
        }
    </script>
</head>

<body class="font-inter antialiased bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
    <main class="bg-white dark:bg-gray-900">
        <!-- Content -->
        <div class="w-full">
            <div class="min-h-[100dvh] h-full">
                <!-- Header -->
                <div class="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden @if ($attributes['background']) {{ $attributes['background'] }} @endif"
                    x-ref="contentarea">
                    <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <!-- Logo -->
                        <a class="block">
                            <svg class="fill-violet-500" xmlns="http://www.w3.org/2000/svg" width="100"
                                height="50">
                                <image href="{{ asset('images/intimark.webp') }}" width="90" height="45" />
                            </svg>
                        </a>
                        <!-- Header: Right side -->
                        <div class="flex items-center space-x-3">
                            <!-- Divider -->
                            <hr class="w-px h-6 bg-gray-200 dark:bg-gray-700/60 border-none" />
                            <!-- Dark mode toggle -->
                            <x-theme-toggle-guest />
                            <!-- Divider -->
                            <hr class="w-px h-6 bg-gray-200 dark:bg-gray-700/60 border-none" />
                        </div>
                    </div>
                </div>
                <div class="w-full max-w-1xl mx-auto px-10 py-8">
                    {{ $slot }}
                </div>
            </div>
        </div>
    </main>
    @livewireScriptConfig
</body>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        const lightSwitchesGuest = document.querySelectorAll('.light-switch-guest');
        if (lightSwitchesGuest.length > 0) {
            lightSwitchesGuest.forEach((lightSwitch, i) => {
                // Usar dark-mode-guest para el tema de invitados
                if (localStorage.getItem('dark-mode-guest') === 'true') {
                    lightSwitch.checked = true;
                    document.documentElement.classList.add('dark');
                    document.querySelector('html').style.colorScheme = 'dark';
                }
                lightSwitch.addEventListener('change', () => {
                    const {
                        checked
                    } = lightSwitch;
                    lightSwitchesGuest.forEach((el, n) => {
                        if (n !== i) {
                            el.checked = checked;
                        }
                    });
                    document.documentElement.classList.add('no-transition');
                    if (lightSwitch.checked) {
                        document.documentElement.classList.add('dark');
                        document.querySelector('html').style.colorScheme = 'dark';
                        localStorage.setItem('dark-mode-guest', 'true');
                        document.dispatchEvent(new CustomEvent('darkMode', {
                            detail: {
                                mode: 'on'
                            }
                        }));
                    } else {
                        document.documentElement.classList.remove('dark');
                        document.querySelector('html').style.colorScheme = 'light';
                        localStorage.setItem('dark-mode-guest', 'false');
                        document.dispatchEvent(new CustomEvent('darkMode', {
                            detail: {
                                mode: 'off'
                            }
                        }));
                    }
                    setTimeout(() => {
                        document.documentElement.classList.remove('no-transition');
                    }, 1);
                });
            });
        }
    });
</script>

</html>
