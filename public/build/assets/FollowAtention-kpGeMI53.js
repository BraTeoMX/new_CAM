import{P as I,E as S}from"./pusher-RuRbGOpv.js";import"./_commonjsHelpers-Cpj98o6Y.js";const y={FINALIZADO:"bg-blue-100 text-blue-800",ASIGNADO:"bg-green-100 text-green-800",PROCESO:"bg-yellow-100 text-yellow-800",PENDIENTE:"bg-orange-100 text-orange-800",ATENDIDO:"bg-red-100 text-red-800",AUTONOMO:"bg-violet-200 text-violet-800",DEFAULT:"bg-gray-100 text-gray-800"},O=["PENDIENTE","ASIGNADO","PROCESO","ATENDIDO","AUTONOMO","FINALIZADO"],E=new Map,m=new Map;window.Pusher=I;window.Echo=new S({broadcaster:"pusher",key:"51d9687d2d0bffce329a",cluster:"us3",forceTLS:!0,encrypted:!0});function b(e){return y[e]||y.DEFAULT}function v(e){return e?new Date(e).toLocaleString():""}async function T(e){try{const o=await fetch(`/api/follow-atention/${encodeURIComponent(e)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!o.ok)throw new Error("No se pudo obtener el registro");const t=await o.json();return t.success?(m.set(e,t.data),t.data):null}catch(o){return console.error(o),null}}function x(e){const o=b(e.Status);let t="",n=m.get(e.Folio);e.Status==="PROCESO"&&n?t=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold timer-countdown"
                     data-folio="${e.Folio}"
                     data-inicio="${n.TimeInicio||""}"
                     data-estimado="${n.TimeEstimado||""}">
                </div>
                <div class="text-sm text-gray-500">
                    Tiempo estimado: ${n.TimeEstimado||""} minutos
                </div>
            </div>
        `:e.Status==="PROCESO"&&(t=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold timer-countdown"
                     data-folio="${e.Folio}"
                     data-inicio=""
                     data-estimado="">
                </div>
                <div class="text-sm text-gray-500">
                    Tiempo estimado: ... minutos
                </div>
            </div>
        `);const l=e.Status==="ASIGNADO"?`
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button class="iniciar-atencion-btn w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                    data-folio="${e.Folio}"
                    data-maquina="${e.Maquina}">
                Iniciar Atención
            </button>
        </div>
    `:"";return`
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-5">
            <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 text-sm font-semibold rounded ${o}">${e.Status}</span>
                <span class="text-lg font-bold">Folio: ${e.Folio}</span>
            </div>
            <div class="space-y-3">
                <p class="font-medium">${e.Problema}</p>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>Módulo: <span class="font-semibold">${e.Modulo}</span></div>
                    <div>Máquina: <span class="font-semibold">${e.Maquina}</span></div>
                    <div>Mecánico: <span class="font-semibold">${e.Mecanico}</span></div>
                    <div>Supervisor: <span class="font-semibold">${e.Supervisor}</span></div>
                </div>
                <div class="text-xs text-gray-500 flex justify-between">
                    <span>Creada: ${v(e.created_at)}</span>
                    <span>Actualizada: ${v(e.updated_at)}</span>
                </div>
            </div>
            ${t}
            ${l}
        </div>
    `}function L(){E.forEach(e=>clearInterval(e)),E.clear(),document.querySelectorAll(".timer-countdown").forEach(e=>{const o=e.dataset.folio;let t=e.dataset.inicio,n=e.dataset.estimado;if((!t||!n)&&o&&m.has(o)){const r=m.get(o);t=r.TimeInicio,n=r.TimeEstimado,e.dataset.inicio=t,e.dataset.estimado=n}if(n=parseInt(n),!t||!n)return;let l;if(/^\d{2}:\d{2}$/.test(t)){const[r,a]=t.split(":");l=new Date,l.setHours(parseInt(r),parseInt(a),0,0)}else l=new Date(t);const i=l.getTime()+n*60*1e3;let s=!1;function c(){const r=new Date().getTime(),a=i-r;let f,g,p=!1;if(a<0){p=!0;const h=Math.abs(a);f=Math.floor(h/(1e3*60)),g=Math.floor(h%(1e3*60)/1e3)}else f=Math.floor(a/(1e3*60)),g=Math.floor(a%(1e3*60)/1e3),a<=3e5&&!s&&(s=!0,document.visibilityState==="visible"&&Swal.fire({title:"¡Atención!",text:`Quedan 5 minutos para la OT ${o}`,icon:"warning",timer:5e3}));const w=`${p?"-":""}${f}:${g.toString().padStart(2,"0")}`;p||a<=n*60*1e3*.25?(e.classList.remove("text-green-600","text-orange-500"),e.classList.add("text-red-600")):a<=n*60*1e3*.5?(e.classList.remove("text-green-600","text-red-600"),e.classList.add("text-orange-500")):(e.classList.remove("text-orange-500","text-red-600"),e.classList.add("text-green-600")),e.textContent=w}const d=setInterval(c,1e3);E.set(o,d),c()})}async function A(e){var c,d,r;const o=((d=(c=document.getElementById("search-ot"))==null?void 0:c.value)==null?void 0:d.toLowerCase())||"",t=((r=document.getElementById("filter-status"))==null?void 0:r.value)||"";let n=e.filter(a=>a.Status!=="FINALIZADO");o&&(n=n.filter(a=>a.Folio&&a.Folio.toLowerCase().includes(o)||a.Modulo&&a.Modulo.toLowerCase().includes(o)||a.Mecanico&&a.Mecanico.toLowerCase().includes(o)||a.Supervisor&&a.Supervisor.toLowerCase().includes(o)||a.Maquina&&a.Maquina.toLowerCase().includes(o)||a.Problema&&a.Problema.toLowerCase().includes(o))),t&&(n=n.filter(a=>a.Status===t));const l=n.filter(a=>a.Status==="PROCESO").map(a=>m.has(a.Folio)?null:T(a.Folio));await Promise.all(l);const i={};O.forEach(a=>i[a]=0),i.total=e.filter(a=>a.Status!=="AUTONOMO").length,e.forEach(a=>{i[a.Status]!==void 0&&i[a.Status]++}),document.getElementById("ot-pendientes")&&(document.getElementById("ot-pendientes").textContent=i.PENDIENTE),document.getElementById("ot-asignadas")&&(document.getElementById("ot-asignadas").textContent=i.ASIGNADO),document.getElementById("ot-proceso")&&(document.getElementById("ot-proceso").textContent=i.PROCESO),document.getElementById("ot-atendidas")&&(document.getElementById("ot-atendidas").textContent=i.ATENDIDO),document.getElementById("ot-autonomas")&&(document.getElementById("ot-autonomas").textContent=i.AUTONOMO),document.getElementById("ot-finalizadas")&&(document.getElementById("ot-finalizadas").textContent=i.FINALIZADO),document.getElementById("ot-total")&&(document.getElementById("ot-total").textContent=i.total);const s=document.getElementById("seguimiento-ot-container");s.innerHTML=n.length?n.map(x).join(""):'<div class="col-span-full text-center text-gray-400 py-8">No hay OTs para mostrar.</div>',L()}function u(e){return fetch("/cardsAteOTs").then(o=>o.json()).then(o=>{let t=o.filter(n=>n.Modulo===e);return A(t)})}window.cargarSeguimientoOTs=u;document.addEventListener("DOMContentLoaded",function(){$("#modulo-select").select2({placeholder:"Selecciona tu módulo de atención",width:"100%"}),axios.get("/obtener-modulos").then(n=>{const l=document.getElementById("modulo-select");n.data.forEach(i=>{let s=i.Modulo||i.moduleid||i.MODULEID||i.value||i,c=i.Modulo||i.moduleid||i.MODULEID||i.value||i;if(s&&c){let d=document.createElement("option");d.value=s,d.textContent=c,l.appendChild(d)}}),$("#modulo-select").trigger("change")}),$("#modulo-select").on("change",function(){const n=this.value;n?(document.getElementById("resumen-bar").classList.remove("hidden"),document.getElementById("filtros-bar").classList.remove("hidden"),u(n)):(document.getElementById("resumen-bar").classList.add("hidden"),document.getElementById("filtros-bar").classList.add("hidden"),document.getElementById("seguimiento-ot-container").innerHTML="")});const e=document.getElementById("search-ot"),o=document.getElementById("filter-status");function t(){const n=document.getElementById("modulo-select").value;n&&u(n)}e&&e.addEventListener("input",t),o&&o.addEventListener("change",t)});document.addEventListener("click",function(e){if(e.target&&e.target.classList.contains("iniciar-atencion-btn")){const o=e.target.getAttribute("data-folio"),t=e.target.getAttribute("data-maquina");C(o,t)}});async function C(e,o){try{const t=await fetch(`/api/clases-maquina/${encodeURIComponent(o)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);const n=t.headers.get("content-type");if(!n||!n.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const l=await t.json(),{value:i}=await Swal.fire({title:"Seleccionar Clase de Máquina",html:`
                <select id="clase-select" class="swal2-select" style="width: 100%">
                    <option></option>
                    ${l.map(s=>`
                        <option value="${s.class}"
                                data-tiempo="${s.TimeEstimado}">
                            ${s.class} (${s.TimeEstimado} min)
                        </option>
                    `).join("")}
                </select>
            `,didOpen:()=>{$("#clase-select").select2({dropdownParent:$(".swal2-container"),placeholder:"Selecciona una clase",width:"100%"})},preConfirm:()=>{const s=document.getElementById("clase-select"),c=s.options[s.selectedIndex];return s.value?{clase:s.value,tiempo_estimado:c.dataset.tiempo}:(Swal.showValidationMessage("Debes seleccionar una clase"),!1)}});i&&await M(e,i.clase,i.tiempo_estimado)}catch(t){console.error("Error:",t),Swal.fire("Error","No se pudieron cargar las clases de máquina","error")}}async function M(e,o,t){try{const n=new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit",hour12:!1}),l=await fetch("/api/iniciar-atencion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:e,clase:o,tiempo_estimado:t,time_inicio:n})});if(!l.ok)throw new Error(`HTTP error! status: ${l.status}`);const i=l.headers.get("content-type");if(!i||!i.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const s=await l.json();if(s.success){await fetch("/broadcast-status-ot",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({id:s.ot.id,status:"PROCESO"})}),await Swal.fire("¡Éxito!","Atención iniciada correctamente","success");const c=document.getElementById("modulo-select").value;c&&await u(c)}}catch(n){console.error("Error:",n),Swal.fire("Error","No se pudo iniciar la atención","error")}}Notification.permission==="default"&&Notification.requestPermission();document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"){const e=document.getElementById("modulo-select").value;e&&u(e)}});window.Echo.channel("asignaciones-ot").listen("AsignacionOTCreated",e=>{var t;const o=(t=document.getElementById("modulo-select"))==null?void 0:t.value;o&&u(o)}).listen("AsignacionOTReasignada",e=>{var t;const o=(t=document.getElementById("modulo-select"))==null?void 0:t.value;o&&u(o)}).listen("StatusOTUpdated",e=>{var t;const o=(t=document.getElementById("modulo-select"))==null?void 0:t.value;o&&u(o)});
