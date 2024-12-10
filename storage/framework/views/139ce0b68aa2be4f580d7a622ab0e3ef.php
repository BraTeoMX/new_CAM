<?php if (isset($component)) { $__componentOriginal9ac128a9029c0e4701924bd2d73d7f54 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54 = $attributes; } ?>
<?php $component = App\View\Components\AppLayout::resolve([] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('app-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(App\View\Components\AppLayout::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

        <!-- Dashboard actions -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">

            <!-- Left: Title -->
            <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Dashboard</h1>
            </div>

            <!-- Right: Actions -->
            <div class="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">

                <!-- Filter button -->
                <?php if (isset($component)) { $__componentOriginal6ca2d8ccc55c158b185c1e1ec5f520c6 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6ca2d8ccc55c158b185c1e1ec5f520c6 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dropdown-filter','data' => ['align' => 'right']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('dropdown-filter'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(Illuminate\View\AnonymousComponent::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes(['align' => 'right']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6ca2d8ccc55c158b185c1e1ec5f520c6)): ?>
<?php $attributes = $__attributesOriginal6ca2d8ccc55c158b185c1e1ec5f520c6; ?>
<?php unset($__attributesOriginal6ca2d8ccc55c158b185c1e1ec5f520c6); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6ca2d8ccc55c158b185c1e1ec5f520c6)): ?>
<?php $component = $__componentOriginal6ca2d8ccc55c158b185c1e1ec5f520c6; ?>
<?php unset($__componentOriginal6ca2d8ccc55c158b185c1e1ec5f520c6); ?>
<?php endif; ?>

                <!-- Datepicker built with flatpickr -->
                <?php if (isset($component)) { $__componentOriginal2686ed4927c64f67d2844e9b73af898c = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal2686ed4927c64f67d2844e9b73af898c = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.datepicker','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('datepicker'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(Illuminate\View\AnonymousComponent::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal2686ed4927c64f67d2844e9b73af898c)): ?>
<?php $attributes = $__attributesOriginal2686ed4927c64f67d2844e9b73af898c; ?>
<?php unset($__attributesOriginal2686ed4927c64f67d2844e9b73af898c); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal2686ed4927c64f67d2844e9b73af898c)): ?>
<?php $component = $__componentOriginal2686ed4927c64f67d2844e9b73af898c; ?>
<?php unset($__componentOriginal2686ed4927c64f67d2844e9b73af898c); ?>
<?php endif; ?>

                <!-- Add view button -->
                <button class="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                    <svg class="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                  </svg>
                  <span class="max-xs:sr-only">Add View</span>
                </button>
                
            </div>

        </div>
        
        <!-- Cards -->
        <div class="grid grid-cols-12 gap-6">

            <!-- Line chart (Acme Plus) -->
            <?php if (isset($component)) { $__componentOriginal9aee567733d4754072fbb42819a34adc = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9aee567733d4754072fbb42819a34adc = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dashboard.dashboard-card-01','data' => ['dataFeed' => $dataFeed]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('dashboard.dashboard-card-01'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(Illuminate\View\AnonymousComponent::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes(['dataFeed' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($dataFeed)]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9aee567733d4754072fbb42819a34adc)): ?>
<?php $attributes = $__attributesOriginal9aee567733d4754072fbb42819a34adc; ?>
<?php unset($__attributesOriginal9aee567733d4754072fbb42819a34adc); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9aee567733d4754072fbb42819a34adc)): ?>
<?php $component = $__componentOriginal9aee567733d4754072fbb42819a34adc; ?>
<?php unset($__componentOriginal9aee567733d4754072fbb42819a34adc); ?>
<?php endif; ?>

            <!-- Line chart (Acme Advanced) -->
            <?php if (isset($component)) { $__componentOriginal28f4d4b353cdc353439c885b935064f0 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal28f4d4b353cdc353439c885b935064f0 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dashboard.dashboard-card-02','data' => ['dataFeed' => $dataFeed]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('dashboard.dashboard-card-02'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(Illuminate\View\AnonymousComponent::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes(['dataFeed' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($dataFeed)]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal28f4d4b353cdc353439c885b935064f0)): ?>
<?php $attributes = $__attributesOriginal28f4d4b353cdc353439c885b935064f0; ?>
<?php unset($__attributesOriginal28f4d4b353cdc353439c885b935064f0); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal28f4d4b353cdc353439c885b935064f0)): ?>
<?php $component = $__componentOriginal28f4d4b353cdc353439c885b935064f0; ?>
<?php unset($__componentOriginal28f4d4b353cdc353439c885b935064f0); ?>
<?php endif; ?>

            <!-- Line chart (Acme Professional) -->
            <?php if (isset($component)) { $__componentOriginald395ffe311b873a75a759c65a1c6a561 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald395ffe311b873a75a759c65a1c6a561 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dashboard.dashboard-card-03','data' => ['dataFeed' => $dataFeed]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('dashboard.dashboard-card-03'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(Illuminate\View\AnonymousComponent::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes(['dataFeed' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($dataFeed)]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald395ffe311b873a75a759c65a1c6a561)): ?>
<?php $attributes = $__attributesOriginald395ffe311b873a75a759c65a1c6a561; ?>
<?php unset($__attributesOriginald395ffe311b873a75a759c65a1c6a561); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald395ffe311b873a75a759c65a1c6a561)): ?>
<?php $component = $__componentOriginald395ffe311b873a75a759c65a1c6a561; ?>
<?php unset($__componentOriginald395ffe311b873a75a759c65a1c6a561); ?>
<?php endif; ?>

            <!-- Bar chart (Direct vs Indirect) -->
            <?php if (isset($component)) { $__componentOriginal4bbd6ebab50ccd290346af6937ebdf8b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal4bbd6ebab50ccd290346af6937ebdf8b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dashboard.dashboard-card-04','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('dashboard.dashboard-card-04'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(Illuminate\View\AnonymousComponent::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal4bbd6ebab50ccd290346af6937ebdf8b)): ?>
<?php $attributes = $__attributesOriginal4bbd6ebab50ccd290346af6937ebdf8b; ?>
<?php unset($__attributesOriginal4bbd6ebab50ccd290346af6937ebdf8b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal4bbd6ebab50ccd290346af6937ebdf8b)): ?>
<?php $component = $__componentOriginal4bbd6ebab50ccd290346af6937ebdf8b; ?>
<?php unset($__componentOriginal4bbd6ebab50ccd290346af6937ebdf8b); ?>
<?php endif; ?>

            <!-- Line chart (Real Time Value) -->
            <?php if (isset($component)) { $__componentOriginal6c2ce5806ea6d7c0b18bfa8bbae282b1 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6c2ce5806ea6d7c0b18bfa8bbae282b1 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dashboard.dashboard-card-05','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('dashboard.dashboard-card-05'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(Illuminate\View\AnonymousComponent::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6c2ce5806ea6d7c0b18bfa8bbae282b1)): ?>
<?php $attributes = $__attributesOriginal6c2ce5806ea6d7c0b18bfa8bbae282b1; ?>
<?php unset($__attributesOriginal6c2ce5806ea6d7c0b18bfa8bbae282b1); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6c2ce5806ea6d7c0b18bfa8bbae282b1)): ?>
<?php $component = $__componentOriginal6c2ce5806ea6d7c0b18bfa8bbae282b1; ?>
<?php unset($__componentOriginal6c2ce5806ea6d7c0b18bfa8bbae282b1); ?>
<?php endif; ?>

            <!-- Doughnut chart (Top Countries) -->
            <?php if (isset($component)) { $__componentOriginal6af48b786cb3f2e83834177599060eef = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6af48b786cb3f2e83834177599060eef = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dashboard.dashboard-card-06','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('dashboard.dashboard-card-06'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(Illuminate\View\AnonymousComponent::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6af48b786cb3f2e83834177599060eef)): ?>
<?php $attributes = $__attributesOriginal6af48b786cb3f2e83834177599060eef; ?>
<?php unset($__attributesOriginal6af48b786cb3f2e83834177599060eef); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6af48b786cb3f2e83834177599060eef)): ?>
<?php $component = $__componentOriginal6af48b786cb3f2e83834177599060eef; ?>
<?php unset($__componentOriginal6af48b786cb3f2e83834177599060eef); ?>
<?php endif; ?>

            <!-- Table (Top Channels) -->
            <?php if (isset($component)) { $__componentOriginala6770fca37d17c18f2b1206931165abf = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala6770fca37d17c18f2b1206931165abf = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dashboard.dashboard-card-07','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('dashboard.dashboard-card-07'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(Illuminate\View\AnonymousComponent::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala6770fca37d17c18f2b1206931165abf)): ?>
<?php $attributes = $__attributesOriginala6770fca37d17c18f2b1206931165abf; ?>
<?php unset($__attributesOriginala6770fca37d17c18f2b1206931165abf); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala6770fca37d17c18f2b1206931165abf)): ?>
<?php $component = $__componentOriginala6770fca37d17c18f2b1206931165abf; ?>
<?php unset($__componentOriginala6770fca37d17c18f2b1206931165abf); ?>
<?php endif; ?>

            <!-- Line chart (Sales Over Time) -->
            <?php if (isset($component)) { $__componentOriginal6303836ea2337270314016722cc461d3 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6303836ea2337270314016722cc461d3 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dashboard.dashboard-card-08','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('dashboard.dashboard-card-08'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(Illuminate\View\AnonymousComponent::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6303836ea2337270314016722cc461d3)): ?>
<?php $attributes = $__attributesOriginal6303836ea2337270314016722cc461d3; ?>
<?php unset($__attributesOriginal6303836ea2337270314016722cc461d3); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6303836ea2337270314016722cc461d3)): ?>
<?php $component = $__componentOriginal6303836ea2337270314016722cc461d3; ?>
<?php unset($__componentOriginal6303836ea2337270314016722cc461d3); ?>
<?php endif; ?>

            <!-- Stacked bar chart (Sales VS Refunds) -->
            <?php if (isset($component)) { $__componentOriginalf3f00f2a8b8c78ee77014d7ebd515c65 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalf3f00f2a8b8c78ee77014d7ebd515c65 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dashboard.dashboard-card-09','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('dashboard.dashboard-card-09'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(Illuminate\View\AnonymousComponent::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalf3f00f2a8b8c78ee77014d7ebd515c65)): ?>
<?php $attributes = $__attributesOriginalf3f00f2a8b8c78ee77014d7ebd515c65; ?>
<?php unset($__attributesOriginalf3f00f2a8b8c78ee77014d7ebd515c65); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalf3f00f2a8b8c78ee77014d7ebd515c65)): ?>
<?php $component = $__componentOriginalf3f00f2a8b8c78ee77014d7ebd515c65; ?>
<?php unset($__componentOriginalf3f00f2a8b8c78ee77014d7ebd515c65); ?>
<?php endif; ?>

            <!-- Card (Customers) -->
            <?php if (isset($component)) { $__componentOriginalb4fcc1679260197e568c69c30385dd52 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalb4fcc1679260197e568c69c30385dd52 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dashboard.dashboard-card-10','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('dashboard.dashboard-card-10'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(Illuminate\View\AnonymousComponent::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalb4fcc1679260197e568c69c30385dd52)): ?>
<?php $attributes = $__attributesOriginalb4fcc1679260197e568c69c30385dd52; ?>
<?php unset($__attributesOriginalb4fcc1679260197e568c69c30385dd52); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalb4fcc1679260197e568c69c30385dd52)): ?>
<?php $component = $__componentOriginalb4fcc1679260197e568c69c30385dd52; ?>
<?php unset($__componentOriginalb4fcc1679260197e568c69c30385dd52); ?>
<?php endif; ?>

            <!-- Card (Reasons for Refunds) -->
            <?php if (isset($component)) { $__componentOriginal145a246bdeeffbde48c57e7a3db2765f = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal145a246bdeeffbde48c57e7a3db2765f = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dashboard.dashboard-card-11','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('dashboard.dashboard-card-11'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(Illuminate\View\AnonymousComponent::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal145a246bdeeffbde48c57e7a3db2765f)): ?>
<?php $attributes = $__attributesOriginal145a246bdeeffbde48c57e7a3db2765f; ?>
<?php unset($__attributesOriginal145a246bdeeffbde48c57e7a3db2765f); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal145a246bdeeffbde48c57e7a3db2765f)): ?>
<?php $component = $__componentOriginal145a246bdeeffbde48c57e7a3db2765f; ?>
<?php unset($__componentOriginal145a246bdeeffbde48c57e7a3db2765f); ?>
<?php endif; ?>             

            <!-- Card (Recent Activity) -->
            <?php if (isset($component)) { $__componentOriginal8f4edc0e94cdd353b09ab0244bed9bac = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal8f4edc0e94cdd353b09ab0244bed9bac = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dashboard.dashboard-card-12','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('dashboard.dashboard-card-12'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(Illuminate\View\AnonymousComponent::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal8f4edc0e94cdd353b09ab0244bed9bac)): ?>
<?php $attributes = $__attributesOriginal8f4edc0e94cdd353b09ab0244bed9bac; ?>
<?php unset($__attributesOriginal8f4edc0e94cdd353b09ab0244bed9bac); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal8f4edc0e94cdd353b09ab0244bed9bac)): ?>
<?php $component = $__componentOriginal8f4edc0e94cdd353b09ab0244bed9bac; ?>
<?php unset($__componentOriginal8f4edc0e94cdd353b09ab0244bed9bac); ?>
<?php endif; ?>
            
            <!-- Card (Income/Expenses) -->
            <?php if (isset($component)) { $__componentOriginala93035d1039b4cd64fd5a747a5d2cd67 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala93035d1039b4cd64fd5a747a5d2cd67 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.dashboard.dashboard-card-13','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? (array) $attributes->getIterator() : [])); ?>
<?php $component->withName('dashboard.dashboard-card-13'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag && $constructor = (new ReflectionClass(Illuminate\View\AnonymousComponent::class))->getConstructor()): ?>
<?php $attributes = $attributes->except(collect($constructor->getParameters())->map->getName()->all()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala93035d1039b4cd64fd5a747a5d2cd67)): ?>
<?php $attributes = $__attributesOriginala93035d1039b4cd64fd5a747a5d2cd67; ?>
<?php unset($__attributesOriginala93035d1039b4cd64fd5a747a5d2cd67); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala93035d1039b4cd64fd5a747a5d2cd67)): ?>
<?php $component = $__componentOriginala93035d1039b4cd64fd5a747a5d2cd67; ?>
<?php unset($__componentOriginala93035d1039b4cd64fd5a747a5d2cd67); ?>
<?php endif; ?>

        </div>

    </div>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54)): ?>
<?php $attributes = $__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54; ?>
<?php unset($__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9ac128a9029c0e4701924bd2d73d7f54)): ?>
<?php $component = $__componentOriginal9ac128a9029c0e4701924bd2d73d7f54; ?>
<?php unset($__componentOriginal9ac128a9029c0e4701924bd2d73d7f54); ?>
<?php endif; ?>
<?php /**PATH C:\xampp8.2\htdocs\Proyecto-CAM\resources\views/pages/dashboard/dashboard.blade.php ENDPATH**/ ?>