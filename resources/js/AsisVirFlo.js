(function initVirtualAssistantButton() {
    'use strict';

    const TICKET_URL = 'http://128.150.102.40:8020/FormGuest';
    const BUTTON_ID = 'asis-vir-flo-btn';
    const TOOLTIP_ID = 'tooltip-ticket';

    if (document.getElementById(BUTTON_ID)) return;

    const createFloatingButton = () => {
        const button = document.createElement('button');
        button.id = BUTTON_ID;
        button.type = 'button';
        button.setAttribute('aria-label', 'Crear ticket');
        button.setAttribute('data-tooltip-target', TOOLTIP_ID);
        button.setAttribute('data-tooltip-placement', 'left');

        button.className = `
            fixed z-50 top-[40%] right-6 flex items-center justify-center
            bg-white dark:bg-gray-800 rounded-full
            ring-4 ring-pink-500 hover:ring-pink-700
            transition-all duration-300 shadow-xl
        `.trim();

        button.style.width = '80px';
        button.style.height = '80px';

        const avatar = document.createElement('img');
        avatar.src = '/images/Avatar.webp';
        avatar.alt = 'AI Avatar';
        avatar.className = 'w-20 h-20 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500';

        button.appendChild(avatar);

        button.addEventListener('click', () => {
            try {
                window.location.href = TICKET_URL;
            } catch (error) {
                console.error('Error al redirigir:', error);
            }
        });

        document.body.appendChild(button);
    };

    const createTooltip = () => {
        const tooltip = document.createElement('div');
        tooltip.id = TOOLTIP_ID;
        tooltip.role = 'tooltip';
        tooltip.className = `
            absolute z-50 inline-block px-3 py-2 text-sm font-medium text-white
            transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm
            opacity-0 tooltip dark:bg-gray-700
        `.trim();

        tooltip.textContent = '¿Quieres crear un ticket nuevo? ¡Haz click aquí!';

        const arrow = document.createElement('div');
        arrow.className = 'tooltip-arrow';
        tooltip.appendChild(arrow);

        document.body.appendChild(tooltip);
    };

    document.addEventListener('DOMContentLoaded', () => {
        createFloatingButton();
        createTooltip();
    });
})();
