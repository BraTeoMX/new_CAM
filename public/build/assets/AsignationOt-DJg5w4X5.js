import{P as p,E as b}from"./pusher-RuRbGOpv.js";import"./_commonjsHelpers-Cpj98o6Y.js";window.Pusher=p;window.Echo=new b({broadcaster:"pusher",key:"51d9687d2d0bffce329a",cluster:"us3",forceTLS:!0,encrypted:!0});window.foliosComidaBreak=[];window.horasComidaBreak=[];function E(e){switch(e){case"FINALIZADO":return"bg-blue-800 text-blue-100";case"ASIGNADO":return"bg-blue-100 text-blue-800";case"PROCESO":return"bg-yellow-100 text-yellow-800";case"PENDIENTE":return"bg-red-100 text-red-800";case"ATENDIDO":return"bg-green-100 text-green-800";default:return"bg-gray-100 text-gray-800"}}function w(e){switch(e){case"FINALIZADO":return"ring-blue-600 dark:ring-blue-600 bg-blue-600";case"ASIGNADO":return"ring-blue-400 dark:ring-blue-400 bg-blue-400";case"PROCESO":return"ring-yellow-400 dark:ring-yellow-400 bg-yellow-400";case"PENDIENTE":return"ring-red-500 dark:ring-red-500 bg-red-500";case"ATENDIDO":return"ring-green-600 dark:ring-green-600 bg-green-600";default:return"ring-gray-400 dark:ring-gray-400 bg-gray-400"}}function y(e){window.foliosComidaBreak=[],window.horasComidaBreak=[],e.forEach(o=>{o.ComidaBreak&&o.TerminoComidaBreack&&(window.foliosComidaBreak.push(o.Folio),window.horasComidaBreak.push(o.TerminoComidaBreack))})}function C(e){const o=e.foto?e.foto:"http://128.150.102.45:8000/Intimark/Fotos%20Credenciales/"+e.Num_Mecanico+".jpg",i=E(e.Status),s=w(e.Status);let n="";return e.ComidaBreak&&e.TerminoComidaBreack&&(n=`
            <div class="mt-2">
                <span class="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                    ${e.ComidaBreak}
                    Regresa a las: ${new Date(e.TerminoComidaBreack).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                </span>
            </div>
        `),`
    <div class="relative max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col" data-folio="${e.Folio}">
        <div class="absolute -top-8 -left-8 z-10">
            <img class="w-20 h-20 rounded-full ring-4 ${s} shadow-lg object-cover bg-white"
                src="${o}" alt="${e.Num_Mecanico}"
                onerror="this.onerror=null; this.src='/default-avatar.jpg';">
        </div>
        <div class="p-5 pl-20">
            <div class="flex items-center justify-between">
                <span class="text-xs font-semibold px-2 py-1 rounded ${i}">${e.Status}</span>
                <span class="font-bold text-lg text-gray-800 dark:text-gray-100">Folio:<br>${e.Folio}</span>
            </div>
            <div class="font-bold text-lg text-gray-800 dark:text-gray-100">Problema:<br>${e.Problema}</div>
            <div class="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span>Módulo: <b>${e.Modulo}</b></span>
                <span>Operario: <b>${e.Operario}</b></span>
                <span>Nombre Operario: <b>${e.NombreOperario}</b></span>
                <span>Mecánico: <b>${e.Mecanico}</b></span>
                <span>Supervisor: <b>${e.Supervisor}</b></span>
                <span>Máquina: <b>${e.Maquina}</b></span>
            </div>
            ${n}
            <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-gray-400">Creada: ${e.created_at?new Date(e.created_at).toLocaleString():""}</span>
                <span class="text-xs text-gray-400">Últ. actualización: ${e.updated_at?new Date(e.updated_at).toLocaleString():""}</span>
            </div>
        </div>
    </div>
    `}function x(e){var d,l,c;y(e);const o=((l=(d=document.getElementById("search-ot"))==null?void 0:d.value)==null?void 0:l.toLowerCase())||"",i=((c=document.getElementById("filter-status"))==null?void 0:c.value)||"",s=["ASIGNADO","PROCESO","PENDIENTE","ATENDIDO","FINALIZADO"];let n=e.filter(t=>t.Status!=="AUTONOMO"&&t.Status!=="CANCELADO");n.sort((t,f)=>{const u=s.indexOf(t.Status),m=s.indexOf(f.Status);return(u===-1?99:u)-(m===-1?99:m)}),o&&(n=n.filter(t=>t.Folio&&t.Folio.toLowerCase().includes(o)||t.Modulo&&t.Modulo.toLowerCase().includes(o)||t.Mecanico&&t.Mecanico.toLowerCase().includes(o)||t.Supervisor&&t.Supervisor.toLowerCase().includes(o)||t.Maquina&&t.Maquina.toLowerCase().includes(o)||t.Problema&&t.Problema.toLowerCase().includes(o))),i&&(n=n.filter(t=>t.Status===i));const a={PENDIENTE:0,ASIGNADO:0,PROCESO:0,ATENDIDO:0,FINALIZADO:0,total:n.length};n.forEach(t=>{a[t.Status]!==void 0&&a[t.Status]++}),document.getElementById("ot-pendientes")&&(document.getElementById("ot-pendientes").textContent=a.PENDIENTE),document.getElementById("ot-asignadas")&&(document.getElementById("ot-asignadas").textContent=a.ASIGNADO),document.getElementById("ot-proceso")&&(document.getElementById("ot-proceso").textContent=a.PROCESO),document.getElementById("ot-atendidas")&&(document.getElementById("ot-atendidas").textContent=a.ATENDIDO),document.getElementById("ot-finalizadas")&&(document.getElementById("ot-finalizadas").textContent=a.FINALIZADO),document.getElementById("ot-total")&&(document.getElementById("ot-total").textContent=a.total);const g=document.getElementById("asignaciones-container");g.innerHTML=n.length?n.map(C).join(""):'<div class="col-span-full text-center text-gray-400 py-8">No hay OTs para mostrar.</div>'}function r(){fetch("/asignaciones-ot").then(e=>e.json()).then(e=>{x(e)})}function h(){const e=new Date,o=[];window.horasComidaBreak.forEach((i,s)=>{const n=new Date(i);(e.getHours()>n.getHours()||e.getHours()===n.getHours()&&e.getMinutes()>=n.getMinutes())&&o.push(window.foliosComidaBreak[s])}),o.length>0&&fetch("/asignaciones-ot/limpiar-comida-break-masivo",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({folios:o})})}document.addEventListener("DOMContentLoaded",function(){r();const e=document.getElementById("search-ot"),o=document.getElementById("filter-status");e&&e.addEventListener("input",r),o&&o.addEventListener("change",r)});window.Echo.channel("asignaciones-ot").listen("AsignacionOTCreated",()=>r()).listen("AsignacionOTReasignada",()=>r()).listen("StatusOTUpdated",()=>r()).listen("ComidaBreakLimpiado",()=>r());setInterval(h,1e3);
