import Sortable from 'sortablejs';

// Selecciona el contenedor que contiene las cards o elementos
const sortableContainer = document.getElementById('DOMContentLoaded');

if (sortableContainer) {
    const sortable = new Sortable(sortableContainer, {
        animation: 150, // Animación durante el movimiento
        ghostClass: 'bg-gray-300', // Clase para el elemento "fantasma"
        onEnd: (event) => {
            // Captura los índices de arrastre
            console.log('Elemento movido de', event.oldIndex, 'a', event.newIndex);

            // Ejemplo para enviar al backend con fetch o Axios
            // Puedes enviar las posiciones actualizadas aquí
            const order = Array.from(sortableContainer.children).map((item, index) => ({
                id: item.dataset.id, // Asume que cada elemento tiene un atributo data-id
                position: index,
            }));
            console.log('Nuevo orden:', order);
        },
    });
}
