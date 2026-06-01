<div class="relative" x-data="{ open: false }" @click.outside="open = false" @close.stop="open = false">
    <!-- Trigger Button -->
    <button @click="open = !open" 
            class="relative p-2 text-gray-500 transition-colors duration-200 rounded-full hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300">
        <span class="sr-only">Notificaciones</span>
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        <!-- Badge -->
        @if($unreadCount > 0)
        <span class="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white transform translate-x-1 -translate-y-1 bg-red-500 border-2 border-white rounded-full dark:border-gray-900">
            {{ $unreadCount > 99 ? '99+' : $unreadCount }}
        </span>
        @endif
    </button>

    <!-- Dropdown Menu -->
    <div x-show="open" 
         x-transition:enter="transition ease-out duration-200"
         x-transition:enter-start="transform opacity-0 scale-95"
         x-transition:enter-end="transform opacity-100 scale-100"
         x-transition:leave="transition ease-in duration-75"
         x-transition:leave-start="transform opacity-100 scale-100"
         x-transition:leave-end="transform opacity-0 scale-95"
         class="absolute right-0 z-50 w-80 mt-2 origin-top-right bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden sm:w-96 dark:bg-gray-800 dark:border-gray-700" 
         style="display: none;">
         
        <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center dark:bg-gray-800 dark:border-gray-700">
            <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">Notificaciones</h3>
            @if($unreadCount > 0)
                <span class="px-2 py-1 text-xs text-teal-800 bg-teal-100 rounded-full dark:bg-teal-900 dark:text-teal-200">{{ $unreadCount }} nuevas</span>
            @endif
        </div>

        <div class="max-h-[28rem] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
            @forelse($notificaciones as $notificacion)
                <div class="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors {{ is_null($notificacion['pivot']['leido_at']) ? 'bg-teal-50/50 dark:bg-teal-900/20' : '' }}"
                     @if(is_null($notificacion['pivot']['leido_at']))
                        wire:click="marcarComoLeida('{{ $notificacion['id'] }}')"
                     @endif
                     >
                    <div class="flex items-start">
                        <div class="flex-shrink-0 pt-1">
                            @if(isset($notificacion['data']['icono']))
                                <div class="w-8 h-8 rounded-full flex items-center justify-center bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300">
                                    <!-- Aquí puedes mapear iconos. Usamos un fallback por ahora -->
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            @else
                                <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <span class="text-gray-500 dark:text-gray-400">?</span>
                                </div>
                            @endif
                        </div>
                        <div class="ml-3 w-0 flex-1">
                            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {{ $notificacion['data']['titulo'] ?? 'Nueva Notificación' }}
                            </p>
                            <p class="text-xs text-gray-500 truncate dark:text-gray-400 mt-0.5">
                                {{ $notificacion['data']['mensaje'] ?? '' }}
                            </p>
                            <p class="text-xs text-gray-400 mt-1">
                                {{ \Carbon\Carbon::parse($notificacion['created_at'])->diffForHumans() }}
                            </p>
                        </div>
                        @if(is_null($notificacion['pivot']['leido_at']))
                            <div class="ml-2 flex-shrink-0 self-center">
                                <span class="block w-2.5 h-2.5 bg-teal-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
                            </div>
                        @endif
                    </div>
                </div>
            @empty
                <div class="px-4 py-8 text-center sm:p-6">
                    <svg class="mx-auto w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">No tienes notificaciones por el momento</p>
                </div>
            @endforelse
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-2 text-center">
            <a href="#" class="text-xs font-semibold text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 transition-colors">Ver todas</a>
        </div>
    </div>
</div>
