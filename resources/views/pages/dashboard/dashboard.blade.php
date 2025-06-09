<x-app-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        {{-- Select Calendar --}}
        <x-dashboard.selectCalendar />
        {{-- Fin de Select Calendar --}}
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <!-- Left: Title -->
            <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Dashboard</h1>
            </div>
        </div>
        {{-- ...Elementos del dashboard... --}}
        <div class="w-full my-1 mx-auto px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col space-y-4">
            {{-- NUEVO: Tab global --}}
            <x-dashboard.tabGlobal />
            {{-- Fin de Tab Global --}}
            <hr class="my-4 border-gray-200 dark:border-gray-700 border-2 rounded-lg ">
            {{-- NUEVO: Tops 10 --}}
            <x-dashboard.topsTen />
            {{-- Fin de Tops 10 --}}
            <hr class="my-4 border-gray-200 dark:border-gray-700 border-2 rounded-lg ">
            {{-- NUEVO: Group Grap --}}
            <x-dashboard.groupGrap />
            {{-- Fin de Group Grap --}}
            <hr class="my-4 border-gray-200 dark:border-gray-700 border-2 rounded-lg ">
            {{-- NUEVO: creatComplet --}}
            <x-dashboard.creatComplet />
            {{-- Fin de creatComplet --}}
            <hr class="my-4 border-gray-200 dark:border-gray-700 border-2 rounded-lg ">
            {{-- NUEVO: línea de tiempo --}}
            <x-dashboard.timeline />
            {{-- Fin de línea de tiempo --}}
            @vite(['resources/js/dashboard/dashboard.js'])
        </div>
</x-app-layout>
