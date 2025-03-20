import path from 'path';
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/js/calendar.js',
                'resources/js/events.js',
                'resources/css/sweetAlert2.min.css',
            ],
            refresh: true,
        }),
    ],
    resolve: {
        alias: {
            '@tailwindConfig': path.resolve(__dirname, 'tailwind.config.js'),
        },
    },
    optimizeDeps: {
        include: [
            '@tailwindConfig',
            'laravel-echo',
            'pusher-js',
            'sweetalert2',

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
