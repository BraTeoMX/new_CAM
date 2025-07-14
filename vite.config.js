import path from 'path';
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/css/sweetalert.css',
                'resources/css/select2tailwind.css',
                'resources/js/app.js',
                'resources/js/active.js',
                'resources/js/calendar.js',
                'resources/js/events.js',
                'resources/js/IAChat.js',
                'resources/js/Sortable.js',
                'resources/js/Pussher.js',
                'resources/js/utils.js',
                'resources/js/vinculacion.js',
                'resources/js/AsignationOt.js',
                'resources/js/FollowAtention.js',
                //'resources/js/adminuser.js',
                'resources/js/cardsAteOTsCache.js',
                //'resources/js/usercreate.js',
                'resources/js/FormOTMeca.js',
                'resources/js/excellPDF.js',
                'resources/js/AsisVirFlo.js',
                'resources/js/seguimientoSolicitud.js',
                'resources/js/dashboard/dashboard.js',
                'resources/js/IAChat/ChatIA.js',
                'resources/js/IAChat/select2Modulo.js',
                'resources/js/user/userAdmin.js',
                'resources/js/chat.js',
                'resources/js/vinculacionV2.js',
            ],
            refresh: true,
        }),
    ],
    resolve: {
        alias: {
            '@tailwindConfig': path.resolve(__dirname, 'tailwind.config.js'),
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    optimizeDeps: {
        include: [
            '@tailwindConfig',
            'laravel-echo',
            'pusher-js',
            'sweetalert2',
            'flowbite',
            'flatpickr',
            'sortablejs',
            'select2',
            'jquery',
            'highcharts',
            'highcharts-more',
            'jspdf',
        ],
    },
    server: {
        host: '128.150.102.40',
        port: 8021,
        strictPort: true,
        cors: {
            origin: 'http://128.150.102.40:8020',
            credentials: true
        }
    }
});
