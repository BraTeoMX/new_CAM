@props(['message', 'senderName', 'time', 'isUser']) {{-- Ya no necesitas avatarSrc ni avatarAlt aquí --}}

<div class="flex items-start gap-2.5 mb-4 {{ $isUser ? 'justify-end' : '' }}">
    {{-- Avatar para mensajes del asistente (izquierda) --}}
    @unless($isUser)
        <x-IAChat.AvatarIA /> {{-- Invoca el componente AvatarIA --}}
    @endunless

    <div class="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 rounded-e-xl rounded-es-xl {{ $isUser ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-200 dark:bg-gray-700' }}">
        <div class="flex items-center space-x-2 rtl:space-x-reverse {{ $isUser ? 'justify-end' : 'justify-start' }}">
            <span class="text-sm font-semibold {{ $isUser ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white' }}">{{ $senderName }}</span>
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">{{ $time }}</span>
        </div>
        <p class="text-sm font-normal py-2.5 text-gray-900 dark:text-white">{!! $message !!}</p>
    </div>
    {{-- Avatar para mensajes del usuario (derecha) --}}
    @if($isUser)
        <x-IAChat.AvatarUser /> {{-- Invoca el componente AvatarUser --}}
    @endif
</div>
