const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

document.addEventListener('DOMContentLoaded', function () {
    // Arrays para almacenar los datos
    let mecanicosData = [];
    let supervisoresData = [];

    const mecanicosList = document.getElementById('mecanicos-list');
    const supervisoresList = document.getElementById('supervisores-list');
    const vinculacionTbody = document.getElementById('vinculacion-tbody');

    // Función para cargar mecánicos
    function loadMecanicos() {
        fetch('/mecanicos')
            .then(response => response.json())
            .then(data => {
                mecanicosData = data; // Guardamos los datos en el array
                mecanicosList.innerHTML = mecanicosData.map(mecanico => `
                    <div class="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-move draggable-mecanico"
                         data-nombre="${mecanico.nombre || ''}"
                         data-cvetra="${mecanico.cvetra || ''}"
                         data-index="${mecanicosData.indexOf(mecanico)}">
                        <img class="w-10 h-10 rounded-full ring-2 ring-gray-300"
                             src="http://128.150.102.45:8000/Intimark/${mecanico.cvetra}.jpg"
                             onerror="this.src='/default-avatar.jpg';"
                             alt="${mecanico.cvetra}"/>
                        <div>
                            <h3 class="font-medium">${mecanico.nombre}</h3>
                            <p class="text-sm text-gray-500">${mecanico.cvetra}</p>
                        </div>
                    </div>
                `).join('');
                initializeSortable();
            });
    }

    // Función para cargar supervisores
    function loadSupervisores() {
        fetch('/supervisores')
            .then(response => response.json())
            .then(data => {
                supervisoresData = data; // Guardamos los datos en el array
                supervisoresList.innerHTML = supervisoresData.map(supervisor => `
                    <div class="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-move draggable-supervisor"
                         data-supervisor="${supervisor.Nombre || ''}"
                         data-modulo="${supervisor.Modulo || ''}"
                         data-index="${supervisoresData.indexOf(supervisor)}">
                        <div>
                            <h3 class="font-medium">Módulo: ${supervisor.Modulo}</h3>
                            <p class="text-sm text-gray-500">Supervisor: ${supervisor.Nombre}</p>
                        </div>
                    </div>
                `).join('');
                initializeSortable();
            });
    }

    // Función para inicializar Sortable
    function initializeSortable() {
        // Solo inicializar si ambos arrays tienen datos
        if (mecanicosData.length && supervisoresData.length) {
            // Configurar Sortable para mecánicos
            new Sortable(mecanicosList, {
                group: {
                    name: 'shared',
                    pull: 'clone',
                    put: false
                },
                sort: false,
                animation: 150,
                ghostClass: 'bg-blue-100'
            });

            // Configurar Sortable para supervisores
            new Sortable(supervisoresList, {
                group: {
                    name: 'shared',
                    pull: 'clone',
                    put: false
                },
                sort: false,
                animation: 150,
                ghostClass: 'bg-blue-100'
            });

            // Configurar Sortable para la tabla
            new Sortable(vinculacionTbody, {
                group: {
                    name: 'shared',
                    pull: false,
                    put: true
                },
                animation: 150,
                onAdd: function (evt) {
                    const item = evt.item;
                    const index = parseInt(item.getAttribute('data-index'));
                    let row = getEmptyRow();

                    if (item.classList.contains('draggable-mecanico')) {
                        const mecanico = mecanicosData[index];
                        if (mecanico) {
                            row.querySelector('[name="mecanico"]').textContent = mecanico.nombre;
                            row.setAttribute('data-cvetra', mecanico.cvetra);
                        }
                    }
                    else if (item.classList.contains('draggable-supervisor')) {
                        const supervisor = supervisoresData[index];
                        if (supervisor) {
                            const cell = row.querySelector('[name="supervisor-modulo"]');
                            cell.innerHTML = `Sup: ${supervisor.Nombre}<br>Mod: ${supervisor.Modulo}`;
                            row.setAttribute('data-supervisor', supervisor.Nombre);
                            row.setAttribute('data-modulo', supervisor.Modulo);
                        }
                    }

                    item.remove();
                }
            });
        }
    }

    // Función para obtener o crear una fila vacía
    function getEmptyRow() {
        let row = Array.from(vinculacionTbody.getElementsByTagName('tr')).find(row => {
            return !row.querySelector('[name="mecanico"]').textContent ||
                !row.querySelector('[name="supervisor-modulo"]').textContent;
        });

        if (!row) {
            row = document.createElement('tr');
            row.className = "bg-white dark:bg-gray-800 border-b dark:border-gray-700";
            row.innerHTML = `
                <td name="supervisor-modulo" class="px-4 py-2"></td>
                <td name="mecanico" class="px-4 py-2"></td>
                <td name="comida" class="px-4 py-2" contenteditable="true"></td>
                <td name="break-lj" class="px-4 py-2" contenteditable="true"></td>
                <td name="break-v" class="px-4 py-2" contenteditable="true"></td>
                <td class="px-4 py-2">
                    <button onclick="this.closest('tr').remove()" class="text-red-500 hover:text-red-700">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </td>
            `;
            vinculacionTbody.appendChild(row);
        }
        return row;
    }

    // Iniciar carga de datos
    loadMecanicos();
    loadSupervisores();

    // Función para cargar vinculaciones
    function loadVinculaciones() {
        fetch('/vinculaciones')
            .then(response => response.json())
            .then(data => {
                vinculacionTbody.innerHTML = data.map(vinculacion => `
                    <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                        <td name="supervisor-modulo" class="px-4 py-2">Sup: ${vinculacion.Supervisor}<br>Mod: ${vinculacion.Modulo}</td>
                        <td name="mecanico" class="px-4 py-2">${vinculacion.Mecanico}</td>
                        <td name="comida" class="px-4 py-2" contenteditable="true">${vinculacion.Hora_Comida}</td>
                        <td name="break-lj" class="px-4 py-2" contenteditable="true">${vinculacion.Break_Lun_Jue}</td>
                        <td name="break-v" class="px-4 py-2" contenteditable="true">${vinculacion.Break_Viernes}</td>
                        <td class="px-4 py-2">
                            <button onclick="this.closest('tr').remove()" class="text-red-500 hover:text-red-700">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </td>
                    </tr>
                `).join('');
            });
    }

    // Función para guardar vinculaciones
    document.getElementById('guardar-vinculacion').addEventListener('click', function () {
        const vinculaciones = Array.from(vinculacionTbody.children).map(row => ({
            Supervisor: row.getAttribute('data-supervisor'),
            Modulo: row.getAttribute('data-modulo'),
            Mecanico: row.querySelector('[name="mecanico"]').textContent.trim(),
            Hora_Comida: row.querySelector('[name="comida"]').textContent.trim(),
            Break_Lun_Jue: row.querySelector('[name="break-lj"]').textContent.trim(),
            Break_Viernes: row.querySelector('[name="break-v"]').textContent.trim()
        }));

        fetch('/vinculaciones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({ vinculaciones })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message || 'Vinculaciones guardadas correctamente');
                loadVinculaciones();
            })
            .catch(error => {
                console.error('Error al guardar vinculaciones:', error);
                alert('Error al guardar vinculaciones');
            });
    });

    // Cargar vinculaciones iniciales
    loadVinculaciones();
});
