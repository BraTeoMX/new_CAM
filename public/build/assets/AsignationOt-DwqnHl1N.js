import{P as a,E as c}from"./pusher-RuRbGOpv.js";import"./_commonjsHelpers-Cpj98o6Y.js";window.Pusher=a;window.Echo=new c({broadcaster:"pusher",key:"51d9687d2d0bffce329a",cluster:"us3",forceTLS:!0,encrypted:!0});function s(e){switch(e){case"FINALIZADO":return"bg-blue-100 text-blue-800";case"ASIGNADO":return"bg-green-100 text-green-800";case"PROCESO":return"bg-yellow-100 text-yellow-800";case"PENDIENTE":return"bg-orange-100 text-orange-800";case"ATENDIDO":return"bg-red-100 text-red-800";default:return"bg-gray-100 text-gray-800"}}function i(e){switch(e){case"FINALIZADO":return"ring-blue-600 dark:ring-blue-600 bg-blue-600";case"ASIGNADO":return"ring-green-600 dark:ring-green-600 bg-green-600";case"PROCESO":return"ring-yellow-400 dark:ring-yellow-400 bg-yellow-400";case"PENDIENTE":return"ring-orange-500 dark:ring-orange-500 bg-orange-500";case"ATENDIDO":return"ring-red-600 dark:ring-red-600 bg-red-600";default:return"ring-gray-400 dark:ring-gray-400 bg-gray-400"}}function n(e){let r=e.foto?e.foto:"http://128.150.102.45:8000/Intimark/"+e.Num_Mecanico+".jpg";const t=s(e.Status),o=i(e.Status);return`
    <div class="relative max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700" data-folio="${e.Folio}">
        <div class="absolute" style="top: -2rem; left: -2rem;">
            <img class="w-28 h-28 rounded-full ring-4 ${o} shadow-lg object-cover"
                src="${r}" alt="${e.Num_Mecanico}"
                onerror="this.onerror=null; this.src='/default-avatar.jpg';">
        </div>
        <div class="p-5 mt-16">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Folio: ${e.Folio}
            </h5>
            <p class="mb-1 font-semibold text-gray-700 dark:text-gray-400">Módulo: ${e.Modulo}</p>
            <p class="mb-1 font-semibold text-gray-700 dark:text-gray-400">Mecánico: ${e.Mecanico}</p>
            <p class="mb-1 font-semibold text-gray-700 dark:text-gray-400">Supervisor: ${e.Supervisor}</p>
            <p class="mb-1 font-semibold text-gray-700 dark:text-gray-400">Maquina: ${e.Maquina}</p>
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Problema: ${e.Problema}</p>
            <span class="inline-block px-3 py-1 text-xs font-medium rounded ${t}">${e.Status}</span>
        </div>
    </div>
    `}function l(){fetch("/asignaciones-ot").then(e=>e.json()).then(e=>{const r=document.getElementById("asignaciones-container");r.innerHTML="",e.filter(t=>t.Status!=="AUTONOMO").forEach(t=>{r.innerHTML+=n(t)})})}document.addEventListener("DOMContentLoaded",function(){l()});window.Echo.channel("asignaciones-ot").listen("AsignacionOTCreated",e=>{const r=document.getElementById("asignaciones-container");e.Status!=="AUTONOMO"&&!r.querySelector(`[data-folio="${e.Folio}"]`)&&r.insertAdjacentHTML("afterbegin",n(e))}).listen("AsignacionOTReasignada",e=>{const t=document.getElementById("asignaciones-container").querySelector(`[data-folio="${e.Folio}"]`);t&&(t.outerHTML=n(e))}).listen("StatusOTUpdated",e=>{const t=document.getElementById("asignaciones-container").querySelector(`[data-folio="${e.Folio}"]`);t&&(t.outerHTML=n(e))});
