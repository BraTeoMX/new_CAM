// --- CONSTANTES Y ARRAYS GLOBALES ---
const ACTIVE_USERS_STORAGE_KEY = 'active_users_data_v1';
const ACTIVE_USERS_STORAGE_TTL = 2 * 60 * 1000; // 2 minutos

let activeUsersData = null;

// --- FUNCIONES DE UTILIDAD ---
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
    } catch (e) {}
}

function loadFromLocalStorage(key, ttl) {
    try {
        const payload = JSON.parse(localStorage.getItem(key));
        if (!payload || !payload.ts || !payload.data) return null;
        if (Date.now() - payload.ts > ttl) return null;
        return payload.data;
    } catch (e) {
        return null;
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getUserPhotoUrl(id) {
    // Endpoint seguro backend
    return `/user-photo/${encodeURIComponent(id)}`;
}

// --- RENDERIZADO DE USUARIOS ---
function renderActiveUsers(data) {
    // Render para escritorio (sidebar)
    const userList = $("#active-users-list");
    userList.empty();

    // Render para móvil (barra horizontal)
    const userListMobile = $("#active-users-list-mobile");
    if (userListMobile.length) userListMobile.empty();

    // Detecta si es móvil/pantalla chica (ejemplo: <640px)
    const isMobile = window.innerWidth < 640;

    // Ordenar usuarios (Gerente > Jefe > Resto)
    data.sort((a, b) => {
        const puestoA = (a.puesto || '').toLowerCase();
        const puestoB = (b.puesto || '').toLowerCase();
        if (puestoA.includes("gerente") && !puestoB.includes("gerente")) return -1;
        if (!puestoA.includes("gerente") && puestoB.includes("gerente")) return 1;
        if (puestoA.includes("jefe") && !puestoB.includes("jefe")) return -1;
        if (!puestoA.includes("jefe") && puestoB.includes("jefe")) return 1;
        return 0;
    });

    data.forEach(function(user) {
        const imagePath = getUserPhotoUrl(user.numero_empleado);
        const tooltipId = `tooltip-${user.numero_empleado}`;
        let listItem = "";

        // Desktop sidebar
        listItem = `
            <li class="py-3 sm:py-4 relative">
                <div class="flex items-center space-x-3 rtl:space-x-reverse">
                    <div class="shrink-0 relative">
                        <img class="w-10 h-10 rounded-full cursor-pointer"
                            src="${imagePath}"
                            alt="${escapeHtml(user.numero_empleado)} image"
                            id="user-img-${escapeHtml(user.numero_empleado)}"
                            onerror="this.onerror=null; this.src='/default-avatar.jpg';">
                        <span class="top-0 left-7 absolute w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
                        <!-- Tooltip -->
                        <div id="${tooltipId}" role="tooltip"
                            class="absolute z-10 hidden md:block px-4 py-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg max-w-xs break-words opacity-0 transition-opacity duration-200 dark:bg-gray-700">
                            <p><strong>Número empleado:</strong> ${escapeHtml(user.numero_empleado)}</p>
                            <p><strong>Nombre:</strong> ${escapeHtml(user.nombre)}</p>
                            <p><strong>Puesto:</strong> ${escapeHtml(user.puesto)}</p>
                        </div>
                    </div>
                    <div class="flex-5 min-w-0">
                        <p class="text-sm font-semibold text-gray-900 truncate dark:text-white">
                            ${escapeHtml(user.nombre)}
                        </p>
                        <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                            ${escapeHtml(user.puesto)}
                        </p>
                        <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                            ${escapeHtml(user.numero_empleado)}
                        </p>
                    </div>
                </div>
            </li>`;
        userList.append(listItem);

        // Barra vertical móvil
        if (userListMobile.length) {
            userListMobile.append(`
                <li>
                    <img class="w-10 h-10 rounded-full border-2 border-green-400"
                        src="${imagePath}"
                        alt="${escapeHtml(user.numero_empleado)} image"
                        onerror="this.onerror=null; this.src='/default-avatar.jpg';">
                </li>
            `);
        }

        // Tooltip hover (Desktop)
        if (!isMobile) {
            const imgElement = document.getElementById(`user-img-${user.numero_empleado}`);
            const tooltipElement = document.getElementById(tooltipId);

            if (imgElement && tooltipElement) {
                imgElement.addEventListener("mouseover", function() {
                    tooltipElement.style.opacity = "1";
                    tooltipElement.style.visibility = "visible";
                });
                imgElement.addEventListener("mouseout", function() {
                    tooltipElement.style.opacity = "0";
                    tooltipElement.style.visibility = "hidden";
                });
                document.addEventListener("mouseout", function(event) {
                    if (!imgElement.contains(event.target) && !tooltipElement.contains(event.target)) {
                        tooltipElement.style.opacity = "0";
                        tooltipElement.style.visibility = "hidden";
                    }
                });
            }
        }
    });
}

// --- LOGICA PRINCIPAL ---
document.addEventListener("DOMContentLoaded", function() {
    // 1. Intenta cargar de localStorage
    activeUsersData = loadFromLocalStorage(ACTIVE_USERS_STORAGE_KEY, ACTIVE_USERS_STORAGE_TTL);

    // 2. Si no hay datos o están expirados, pide al backend
    if (!activeUsersData) {
        $.ajax({
            url: "/active-users",
            method: "GET",
            success: function(data) {
                saveToLocalStorage(ACTIVE_USERS_STORAGE_KEY, data);
                renderActiveUsers(data);
                // Guarda para resize
                activeUsersData = data;
            },
            error: function(error) {
                console.error("Error obteniendo usuarios:", error);
            },
        });
    } else {
        renderActiveUsers(activeUsersData);
    }

    // Redibuja usuarios activos al cambiar tamaño de pantalla
    window.addEventListener('resize', function() {
        if (activeUsersData) {
            renderActiveUsers(activeUsersData);
        }
    });
});

