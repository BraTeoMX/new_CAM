<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="theme-color" content="#111827"> <!-- Color para dispositivos móviles -->

        <title><?php echo e(config('app.name', 'CAM')); ?></title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&display=swap" rel="stylesheet" />

        <!-- Styles -->
        <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/app.js']); ?>
        <?php echo \Livewire\Mechanisms\FrontendAssets\FrontendAssets::styles(); ?>


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
            <?php if (isset($component)) { $__componentOriginal790df3a3003b05a46d3e5fdd59aeab47 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal790df3a3003b05a46d3e5fdd59aeab47 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.app.sidebar','data' => ['variant' => $attributes['sidebarVariant']]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('app.sidebar'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(Illuminate\View\AnonymousComponent::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($attributes['sidebarVariant'])]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal790df3a3003b05a46d3e5fdd59aeab47)): ?>
<?php $attributes = $__attributesOriginal790df3a3003b05a46d3e5fdd59aeab47; ?>
<?php unset($__attributesOriginal790df3a3003b05a46d3e5fdd59aeab47); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal790df3a3003b05a46d3e5fdd59aeab47)): ?>
<?php $component = $__componentOriginal790df3a3003b05a46d3e5fdd59aeab47; ?>
<?php unset($__componentOriginal790df3a3003b05a46d3e5fdd59aeab47); ?>
<?php endif; ?>

            <!-- Content area -->
            <div class="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden <?php if($attributes['background']): ?><?php echo e($attributes['background']); ?><?php endif; ?>" x-ref="contentarea">

                <!-- Header -->
                <?php if (isset($component)) { $__componentOriginal6f648324bf790658b48f4e99fb28ec74 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6f648324bf790658b48f4e99fb28ec74 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.app.header','data' => ['variant' => $attributes['headerVariant']]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('app.header'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(Illuminate\View\AnonymousComponent::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes(['variant' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($attributes['headerVariant'])]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6f648324bf790658b48f4e99fb28ec74)): ?>
<?php $attributes = $__attributesOriginal6f648324bf790658b48f4e99fb28ec74; ?>
<?php unset($__attributesOriginal6f648324bf790658b48f4e99fb28ec74); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6f648324bf790658b48f4e99fb28ec74)): ?>
<?php $component = $__componentOriginal6f648324bf790658b48f4e99fb28ec74; ?>
<?php unset($__componentOriginal6f648324bf790658b48f4e99fb28ec74); ?>
<?php endif; ?>

                <!-- Main content -->
                <main class="grow">
                    <?php echo e($slot); ?>

                </main>
            </div>
        </div>

        <?php echo \Livewire\Mechanisms\FrontendAssets\FrontendAssets::scripts(); ?>

    </body>
</html>
<?php /**PATH C:\xampp8.2\htdocs\Proyecto-CAM\resources\views/layouts/app.blade.php ENDPATH**/ ?>