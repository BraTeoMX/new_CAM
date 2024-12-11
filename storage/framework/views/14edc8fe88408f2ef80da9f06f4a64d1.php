<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">

        <title><?php echo e(config('app.name', 'CAM')); ?></title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/app.js']); ?>

        <!-- Styles -->
        <?php echo \Livewire\Mechanisms\FrontendAssets\FrontendAssets::styles(); ?>


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
    <body class="font-inter antialiased bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400">

        <main class="bg-white dark:bg-gray-900">

            <div class="relative flex">
                <!-- Content -->
                <div class="w-full md:w-1/2">
                    <div class="min-h-[100dvh] h-full flex flex-col after:flex-1">
                        <!-- Header -->
                        <div class="flex-1">
                            <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                                <!-- Logo -->
                                <a class="block" href="<?php echo e(route('dashboard')); ?>">
                                    <svg class="fill-violet-500" xmlns="http://www.w3.org/2000/svg" width="100" height="50">
                                        <image href="<?php echo e(asset('images/intimark.webp')); ?>" width="90" height="45" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div class="max-w-sm mx-auto w-full px-4 py-8">
                            <?php echo e($slot); ?>

                        </div>
                    </div>
                </div>

                <!-- Image -->
                <div class="hidden md:block absolute top-0 bottom-0 right-0 md:w-1/2" aria-hidden="true">
                    <img class="object-cover object-center w-full h-full" src="<?php echo e(asset('images/tec1.png')); ?>" width="760" height="1024" alt="Authentication image" />
                </div>

            </div>

        </main>

        <?php echo \Livewire\Mechanisms\FrontendAssets\FrontendAssets::scriptConfig(); ?>

    </body>
</html>
<?php /**PATH C:\xampp8.2\htdocs\Proyecto-CAM\resources\views/layouts/authentication.blade.php ENDPATH**/ ?>