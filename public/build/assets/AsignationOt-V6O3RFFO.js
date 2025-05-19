import{P as n,E as a}from"./pusher-RuRbGOpv.js";import"./_commonjsHelpers-Cpj98o6Y.js";window.Pusher=n;window.Echo=new a({broadcaster:"pusher",key:"51d9687d2d0bffce329a",cluster:"us3",forceTLS:!0,encrypted:!0});function r(e){let t=e.foto?e.foto:"http://128.150.102.45:8000/Intimark/"+e.Num_Mecanico+".jpg";return`
    <div class="relative max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700" data-folio="${e.Folio}">
        <div class="absolute" style="top: -2rem; left: -2rem;">
            <img class="w-28 h-28 rounded-full ring-4 ring-green-600 dark:ring-green-600 shadow-lg bg-green-600 object-cover"
                src="${t}" alt="${e.Num_Mecanico}"
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
            <span class="inline-block px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">${e.Status}</span>
        </div>
    </div>
    `}function i(){fetch("/asignaciones-ot").then(e=>e.json()).then(e=>{const t=document.getElementById("asignaciones-container");t.innerHTML="",e.filter(o=>o.Status!=="AUTONOMO").forEach(o=>{t.innerHTML+=r(o)})})}document.addEventListener("DOMContentLoaded",function(){i()});window.Echo.channel("asignaciones-ot").listen("AsignacionOTCreated",e=>{const t=document.getElementById("asignaciones-container");e.Status!=="AUTONOMO"&&!t.querySelector(`[data-folio="${e.Folio}"]`)&&t.insertAdjacentHTML("afterbegin",r(e))});
