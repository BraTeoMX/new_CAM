import{P as u,E as g}from"./pusher-RuRbGOpv.js";import"./_commonjsHelpers-Cpj98o6Y.js";window.Pusher=u;window.Echo=new g({broadcaster:"pusher",key:"51d9687d2d0bffce329a",cluster:"us3",forceTLS:!0,encrypted:!0});function m(e){switch(e){case"FINALIZADO":return"bg-blue-100 text-blue-800";case"ASIGNADO":return"bg-green-100 text-green-800";case"PROCESO":return"bg-yellow-100 text-yellow-800";case"PENDIENTE":return"bg-orange-100 text-orange-800";case"ATENDIDO":return"bg-red-100 text-red-800";default:return"bg-gray-100 text-gray-800"}}function f(e){switch(e){case"FINALIZADO":return"ring-blue-600 dark:ring-blue-600 bg-blue-600";case"ASIGNADO":return"ring-green-600 dark:ring-green-600 bg-green-600";case"PROCESO":return"ring-yellow-400 dark:ring-yellow-400 bg-yellow-400";case"PENDIENTE":return"ring-orange-500 dark:ring-orange-500 bg-orange-500";case"ATENDIDO":return"ring-red-600 dark:ring-red-600 bg-red-600";default:return"ring-gray-400 dark:ring-gray-400 bg-gray-400"}}function p(e){let n=e.foto?e.foto:"http://128.150.102.45:8000/Intimark/"+e.Num_Mecanico+".jpg";const s=m(e.Status),r=f(e.Status);return`
    <div class="relative max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col" data-folio="${e.Folio}">
        <div class="absolute -top-8 -left-8 z-10">
            <img class="w-20 h-20 rounded-full ring-4 ${r} shadow-lg object-cover bg-white"
                src="${n}" alt="${e.Num_Mecanico}"
                onerror="this.onerror=null; this.src='/default-avatar.jpg';">
        </div>
        <div class="p-5 pl-20">
            <div class="flex items-center justify-between">
                <span class="text-xs font-semibold px-2 py-1 rounded ${s}">${e.Status}</span>
                <span class="font-bold text-lg text-gray-800 dark:text-gray-100">Folio:<br>${e.Folio}</span>
            </div>
            <div class="font-bold text-lg text-gray-800 dark:text-gray-100">Problema:<br>${e.Problema}</div>
            <div class="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span>Módulo: <b>${e.Modulo}</b></span>
                <span>Mecánico: <b>${e.Mecanico}</b></span>
                <span>Supervisor: <b>${e.Supervisor}</b></span>
                <span>Máquina: <b>${e.Maquina}</b></span>
            </div>
            <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-gray-400">Creada: ${e.created_at?new Date(e.created_at).toLocaleString():""}</span>
                <span class="text-xs text-gray-400">Últ. actualización: ${e.updated_at?new Date(e.updated_at).toLocaleString():""}</span>
            </div>
        </div>
    </div>
    `}function b(e){var d,l,c;const n=((l=(d=document.getElementById("search-ot"))==null?void 0:d.value)==null?void 0:l.toLowerCase())||"",s=((c=document.getElementById("filter-status"))==null?void 0:c.value)||"";let r=e.filter(t=>t.Status!=="AUTONOMO"&&t.Status!=="FINALIZADO");n&&(r=r.filter(t=>t.Folio&&t.Folio.toLowerCase().includes(n)||t.Modulo&&t.Modulo.toLowerCase().includes(n)||t.Mecanico&&t.Mecanico.toLowerCase().includes(n)||t.Supervisor&&t.Supervisor.toLowerCase().includes(n)||t.Maquina&&t.Maquina.toLowerCase().includes(n)||t.Problema&&t.Problema.toLowerCase().includes(n))),s&&(r=r.filter(t=>t.Status===s));const o={PENDIENTE:0,ASIGNADO:0,PROCESO:0,ATENDIDO:0,FINALIZADO:0,total:e.filter(t=>t.Status!=="AUTONOMO").length};e.forEach(t=>{o[t.Status]!==void 0&&o[t.Status]++}),document.getElementById("ot-pendientes")&&(document.getElementById("ot-pendientes").textContent=o.PENDIENTE),document.getElementById("ot-asignadas")&&(document.getElementById("ot-asignadas").textContent=o.ASIGNADO),document.getElementById("ot-proceso")&&(document.getElementById("ot-proceso").textContent=o.PROCESO),document.getElementById("ot-atendidas")&&(document.getElementById("ot-atendidas").textContent=o.ATENDIDO),document.getElementById("ot-total")&&(document.getElementById("ot-total").textContent=o.total);const i=document.getElementById("asignaciones-container");i.innerHTML=r.length?r.map(p).join(""):'<div class="col-span-full text-center text-gray-400 py-8">No hay OTs para mostrar.</div>'}function a(){fetch("/asignaciones-ot").then(e=>e.json()).then(e=>{b(e)})}document.addEventListener("DOMContentLoaded",function(){a();const e=document.getElementById("search-ot"),n=document.getElementById("filter-status");e&&e.addEventListener("input",a),n&&n.addEventListener("change",a)});window.Echo.channel("asignaciones-ot").listen("AsignacionOTCreated",e=>{a()}).listen("AsignacionOTReasignada",e=>{a()}).listen("StatusOTUpdated",e=>{a()});
