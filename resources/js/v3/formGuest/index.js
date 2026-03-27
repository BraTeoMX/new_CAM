/**
 * @file resources/js/v3/formGuest/index.js
 * Entrypoint principal para el nuevo flujo V3 de FormGuest.
 * Compilado independientemente por Vite para optimizar la carga y evitar conflictos.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('FormGuest V3 Initialized. Consultando API local optimizada...');
    
    // El chat se inicializa de forma explícita
    import('./chat/index.js').then(module => {
        console.log('Módulo de Chat V3 cargado exitosamente.');
        module.initializeChat();
    }).catch(err => {
        console.error('Error cargando módulo de Chat V3:', err);
    });
});
