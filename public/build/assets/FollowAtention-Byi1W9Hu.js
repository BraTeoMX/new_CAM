import{P as N,E as M}from"./pusher-RuRbGOpv.js";import"./_commonjsHelpers-Cpj98o6Y.js";const O={ASIGNADO:"bg-blue-100 text-blue-800",PROCESO:"bg-yellow-100 text-yellow-800",PENDIENTE:"bg-red-100 text-red-800",ATENDIDO:"bg-green-100 text-green-800",AUTONOMO:"bg-violet-200 text-violet-800",DEFAULT:"bg-gray-100 text-gray-800"},B=["PENDIENTE","ASIGNADO","PROCESO","ATENDIDO","AUTONOMO"],y=new Map,v=new Map,h=new Map;window.Pusher=N;window.Echo=new M({broadcaster:"pusher",key:"51d9687d2d0bffce329a",cluster:"us3",forceTLS:!0,encrypted:!0});function D(e){return O[e]||O.DEFAULT}function j(e){switch(e){case"FINALIZADO":return"ring-blue-600 dark:ring-blue-600 bg-blue-600";case"ASIGNADO":return"ring-blue-400 dark:ring-blue-400 bg-blue-400";case"PROCESO":return"ring-yellow-400 dark:ring-yellow-400 bg-yellow-400";case"PENDIENTE":return"ring-red-500 dark:ring-red-500 bg-red-500";case"ATENDIDO":return"ring-green-600 dark:ring-green-600 bg-green-600";case"AUTONOMO":return"ring-violet-600 dark:ring-violet-600 bg-violet-600";default:return"ring-gray-400 dark:ring-gray-400 bg-gray-400"}}function A(e){return e?new Date(e).toLocaleString():""}function T(e){if(!e)return 0;if(typeof e=="number")return e;if(/^\d+$/.test(e))return parseInt(e);if(/^\d{2}:\d{2}$/.test(e)){const[t,a]=e.split(":").map(Number);return t*60+a}return 0}async function z(e){if(v.has(e))return v.get(e);try{const t=await fetch(`/api/follow-atention/${encodeURIComponent(e)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!t.ok)throw new Error("No se pudo obtener el registro");const a=await t.json();if(a.success){v.set(e,a.data);const n=document.querySelector(`.timer-countdown[data-folio="${e}"]`);if(n){const l=y.get(e);if(l){const i=n.closest(".bg-white, .dark\\:bg-gray-800");i&&(i.outerHTML=I(l),setTimeout(()=>{C()},10))}}return a.data}return null}catch(t){return console.error(t),null}}function I(e){const t=D(e.Status);let a="",n=v.get(e.Folio)||{},l="";e.ComidaBreak&&e.TerminoComidaBreack&&(l=`
            <div class="mt-2">
                <span class="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                    ${e.ComidaBreak}
                    Regresa a las: ${new Date(e.TerminoComidaBreack).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                </span>
            </div>
        `);let i="",s="",r="Tiempo restante:",d="",m="timer-countdown";if(e.Status==="PROCESO"&&(i=n.TimeInicio||"",s=T(n.TimeEstimado)),e.Status==="ATENDIDO"){r="Tiempo total de atención:";let g=0;typeof n.TimeEjecucion<"u"&&n.TimeEjecucion!==null&&n.TimeEjecucion!==""?(g=parseInt(n.TimeEjecucion,10),isNaN(g)&&(g=0)):fetch(`/api/follow-atention/${encodeURIComponent(e.Folio)}`).then(u=>u.json()).then(u=>{if(u.success&&u.data&&u.data.TimeEjecucion!=null){v.set(e.Folio,u.data);const E=document.querySelector(`[data-folio-card="${e.Folio}"]`);E&&(E.outerHTML=I(e))}}),d=`${g} minutos`,m="timer-finalizado",a=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${r}</span>
                </div>
                <div class="font-mono text-2xl font-bold text-blue-700 ${m}">
                    ${d}
                </div>
            </div>
        `}else e.Status==="PROCESO"&&(a=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${r}</span>
                </div>
                <div class="font-mono text-2xl font-bold timer-countdown"
                     data-folio="${e.Folio}"
                     data-inicio="${i}"
                     data-estimado="${s}">
                    <span class="text-gray-400">Cargando...</span>
                </div>
                <div class="text-sm text-gray-500">
                    Tiempo estimado: ${s||"..."} minutos
                </div>
            </div>
        `);let c="";e.Status==="PROCESO"&&(c=`
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <button class="finalizar-proceso-btn text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    type="button"
                    data-folio="${e.Folio}"
                    data-inicio="${i}"
                    data-estimado="${s}">
                    Finalizar Proceso
                </button>
            </div>
        `);const f=e.Status==="ASIGNADO"?`
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button class="iniciar-atencion-btn w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                    data-folio="${e.Folio}"
                    data-maquina="${e.Maquina}">
                Iniciar Atención
            </button>
        </div>
    `:"",o=j(e.Status),b=e.Status==="AUTONOMO"?"/images/Avatar.webp":"http://128.150.102.45:8000/Intimark/"+e.Num_Mecanico+".jpg";return`
    <div class="relative max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col" data-folio-card="${e.Folio}">
         <div class="absolute -top-8 -left-8 z-10">
            <img class="w-20 h-20 rounded-full ring-4 ${o} shadow-lg object-cover bg-white"
                src="${b}" alt="${e.Num_Mecanico}"
                onerror="this.onerror=null; this.src='/default-avatar.jpg';">
        </div>
        <div class="p-5 pl-20">
        <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 text-sm font-semibold rounded ${t}">${e.Status}</span>
                <span class="text-lg font-bold text-gray-800 dark:text-gray-100">Folio: ${e.Folio}</span>
            </div>
            <div class="space-y-3">
                <p class="font-bold text-gray-800 dark:text-gray-100">${e.Problema}</p>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>Módulo: <span class="font-semibold">${e.Modulo}</span></div>
                    <div>Máquina: <span class="font-semibold">${e.Maquina}</span></div>
                    <div>Mecánico: <span class="font-semibold">${e.Mecanico}</span></div>
                    <div>Supervisor: <span class="font-semibold">${e.Supervisor}</span></div>
                </div>
                <div class="text-xs text-gray-500 flex justify-between">
                    <span>Creada: ${A(e.created_at)}</span>
                    <span>Actualizada: ${A(e.updated_at)}</span>
                </div>
                ${l}
            </div>
            ${a}
            ${c}
            ${f}
            </div>
        </div>
    `}function P(e){e=parseInt(e)||0;const t=Math.floor(e/60),a=e%60;return`${t}:${a.toString().padStart(2,"0")}`}document.getElementById("drawer-form-finalizar")||document.body.insertAdjacentHTML("beforeend",`
    <div id="drawer-form-finalizar" class="fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto transition-transform -translate-x-full bg-white w-80 dark:bg-gray-800" tabindex="-1" aria-labelledby="drawer-form-label">
        <h5 class="inline-flex items-center mb-6 text-base font-semibold text-gray-500 uppercase dark:text-gray-400">
            <span class="material-symbols-outlined mr-2">assignment_turned_in</span>Finalizar Atención
        </h5>
        <button type="button" data-drawer-hide="drawer-form-finalizar" aria-controls="drawer-form-finalizar" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" >
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span class="sr-only">Close menu</span>
        </button>
        <form id="finalizar-atencion-form" class="mb-6">
            <div class="mb-6">
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleccione que falla tenía:</label>
                <select id="falla-select" class="swal2-select w-full"></select>
            </div>
            <div class="mb-6">
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleccione la causa de la falla:</label>
                <select id="causa-select" class="swal2-select w-full"></select>
            </div>
            <div class="mb-6">
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleccione la acción que implementó:</label>
                <select id="accion-select" class="swal2-select w-full"></select>
            </div>
            <div class="mb-6">
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Comentarios adicionales (opcional):</label>
                <textarea id="comentarios-finalizar" rows="3" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></textarea>
            </div>
            <button type="submit" class="text-white justify-center flex items-center bg-blue-700 hover:bg-blue-800 w-full focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                Finalizar Atención
            </button>
        </form>
    </div>
    `);document.addEventListener("click",async function(e){if(e.target&&e.target.classList.contains("finalizar-proceso-btn")){const t=e.target.getAttribute("data-folio"),a=e.target.getAttribute("data-inicio"),n=e.target.getAttribute("data-estimado");window.finalizarAtencionFolio=t,window.finalizarAtencionTimeInicio=a,window.finalizarAtencionTimeEstimado=n,await S("/api/fallas","#falla-select","Fallas"),await S("/api/causas","#causa-select","Causa"),await S("/api/acciones","#accion-select","Accion"),window.dispatchEvent(new CustomEvent("open-drawer",{detail:{id:"drawer-form-finalizar"}})),document.getElementById("drawer-form-finalizar").classList.remove("-translate-x-full")}});async function S(e,t,a){const l=await(await fetch(e)).json(),i=document.querySelector(t);i.innerHTML='<option value="">Seleccione una opción</option>'+l.map(s=>`<option value="${s[a]}">${s[a]}</option>`).join(""),$(i).val("").trigger("change"),$(i).select2({dropdownParent:$("#drawer-form-finalizar"),width:"100%"})}document.getElementById("finalizar-atencion-form").addEventListener("submit",async function(e){var u,E;e.preventDefault();const t=window.finalizarAtencionFolio,a=$("#falla-select").val(),n=$("#causa-select").val(),l=$("#accion-select").val(),i=$("#comentarios-finalizar").val();if(!a||!n||!l){Swal.fire("Error","Debe seleccionar una opción en cada catálogo.","error");return}const s=new Date,r=s.getHours().toString().padStart(2,"0")+":"+s.getMinutes().toString().padStart(2,"0"),d=document.querySelector(`.timer-countdown[data-folio="${t}"], .timer-finalizado[data-folio="${t}"]`);let m="00:00";d&&(m=d.textContent.replace("-","").trim());const c=v.get(t);let f=(c==null?void 0:c.TimeInicio)||window.finalizarAtencionTimeInicio||"";T((c==null?void 0:c.TimeEstimado)||window.finalizarAtencionTimeEstimado||"");let o=0;if(f&&r){const[w,x]=f.split(":").map(Number),[k,L]=r.split(":").map(Number);o=k*60+L-(w*60+x),o<0&&(o+=24*60)}if(h.has(t)&&(clearInterval(h.get(t)),h.delete(t)),c&&(c.TimeEjecucion=o),d){const w=(E=(u=d.parentElement)==null?void 0:u.previousElementSibling)==null?void 0:E.querySelector("span.text-gray-800");w&&(w.textContent="Tiempo total de atención:"),d.classList.remove("text-green-600","text-orange-500","text-red-600","timer-countdown"),d.classList.add("text-blue-700","timer-finalizado"),d.textContent=P(o)}if((await(await fetch("/api/finalizar-atencion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:t,falla:a,causa:n,accion:l,comentarios:i,time_final:r,time_real:m,time_ejecucion:o})})).json()).success){let w=null;y.has(t)&&(w=y.get(t).id,y.get(t).Status="ATENDIDO"),w&&await fetch("/broadcast-status-ot",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({id:w,status:"ATENDIDO"})});const x=document.getElementById("modulo-select").value;x&&await p(x),Swal.fire("¡Éxito!","Atención finalizada correctamente","success"),document.getElementById("drawer-form-finalizar").classList.add("-translate-x-full")}else Swal.fire("Error","No se pudo finalizar la atención","error")});window.addEventListener("open-drawer",function(e){const t=e.detail.id;document.getElementById(t).classList.remove("-translate-x-full")});document.querySelectorAll("[data-drawer-hide]").forEach(e=>{e.addEventListener("click",function(){const t=e.getAttribute("aria-controls");document.getElementById(t).classList.add("-translate-x-full")})});function q(){for(const e of h.values())clearInterval(e);h.clear()}function C(){q(),document.querySelectorAll(".timer-countdown").forEach(e=>{const t=e.dataset.folio;let a=e.dataset.inicio,n=e.dataset.estimado;if(n=T(n),!a||!n)return;let l;if(/^\d{2}:\d{2}$/.test(a)){const[m,c]=a.split(":");l=new Date,l.setHours(parseInt(m),parseInt(c),0,0)}else l=new Date(a);const i=l.getTime()+n*60*1e3;let s=!1;function r(){const m=new Date().getTime(),c=i-m;let f,o,b=!1;if(c<0){b=!0;const u=Math.abs(c);f=Math.floor(u/(1e3*60)),o=Math.floor(u%(1e3*60)/1e3)}else f=Math.floor(c/(1e3*60)),o=Math.floor(c%(1e3*60)/1e3),c<=3e5&&!s&&(s=!0,document.visibilityState==="visible"&&Swal.fire({title:"¡Atención!",text:`Quedan 5 minutos para la OT ${t}`,icon:"warning",timer:5e3}));const g=`${b?"-":""}${f}:${o.toString().padStart(2,"0")}`;e.classList.remove("text-green-600","text-orange-500","text-red-600"),b||c<=n*60*1e3*.25?e.classList.add("text-red-600"):c<=n*60*1e3*.5?e.classList.add("text-orange-500"):e.classList.add("text-green-600"),e.textContent=g}const d=setInterval(r,1e3);h.set(t,d),r()})}async function F(e){var m,c,f;y.clear(),e.forEach(o=>y.set(o.Folio,o));const t=((c=(m=document.getElementById("search-ot"))==null?void 0:m.value)==null?void 0:c.toLowerCase())||"",a=((f=document.getElementById("filter-status"))==null?void 0:f.value)||"";let n=e.slice();const l=["AUTONOMO","ASIGNADO","PROCESO","PENDIENTE","ATENDIDO"];n.sort((o,b)=>{const g=l.indexOf(o.Status),u=l.indexOf(b.Status);return(g===-1?99:g)-(u===-1?99:u)}),t&&(n=n.filter(o=>o.Folio&&o.Folio.toLowerCase().includes(t)||o.Modulo&&o.Modulo.toLowerCase().includes(t)||o.Mecanico&&o.Mecanico.toLowerCase().includes(t)||o.Supervisor&&o.Supervisor.toLowerCase().includes(t)||o.Maquina&&o.Maquina.toLowerCase().includes(t)||o.Problema&&o.Problema.toLowerCase().includes(t))),a&&(n=n.filter(o=>o.Status===a));const s=n.filter(o=>o.Status==="PROCESO").map(o=>z(o.Folio));await Promise.all(s);const r={};B.forEach(o=>r[o]=0),r.total=e.filter(o=>o.Status!=="FINALIZADO").length,e.forEach(o=>{r[o.Status]!==void 0&&r[o.Status]++}),document.getElementById("ot-pendientes")&&(document.getElementById("ot-pendientes").textContent=r.PENDIENTE),document.getElementById("ot-asignadas")&&(document.getElementById("ot-asignadas").textContent=r.ASIGNADO),document.getElementById("ot-proceso")&&(document.getElementById("ot-proceso").textContent=r.PROCESO),document.getElementById("ot-atendidas")&&(document.getElementById("ot-atendidas").textContent=r.ATENDIDO),document.getElementById("ot-autonomas")&&(document.getElementById("ot-autonomas").textContent=r.AUTONOMO),document.getElementById("ot-total")&&(document.getElementById("ot-total").textContent=r.total);const d=document.getElementById("seguimiento-ot-container");d.innerHTML=n.length?n.map(I).join(""):'<div class="col-span-full text-center text-gray-400 py-8">No hay OTs para mostrar.</div>',C()}function p(e){return fetch("/cardsAteOTs").then(t=>t.json()).then(t=>{let a=t.filter(n=>n.Modulo===e);return F(a)})}window.cargarSeguimientoOTs=p;document.addEventListener("DOMContentLoaded",function(){$("#modulo-select").select2({placeholder:"Selecciona tu módulo de atención",width:"100%"}),axios.get("/obtener-modulos").then(n=>{const l=document.getElementById("modulo-select");n.data.forEach(i=>{let s=i.Modulo||i.moduleid||i.MODULEID||i.value||i,r=i.Modulo||i.moduleid||i.MODULEID||i.value||i;if(s&&r){let d=document.createElement("option");d.value=s,d.textContent=r,l.appendChild(d)}}),$("#modulo-select").trigger("change")}),$("#modulo-select").on("change",function(){const n=this.value;n?(document.getElementById("resumen-bar").classList.remove("hidden"),document.getElementById("filtros-bar").classList.remove("hidden"),p(n)):(document.getElementById("resumen-bar").classList.add("hidden"),document.getElementById("filtros-bar").classList.add("hidden"),document.getElementById("seguimiento-ot-container").innerHTML="")});const e=document.getElementById("search-ot"),t=document.getElementById("filter-status");function a(){const n=document.getElementById("modulo-select").value;n&&p(n)}e&&e.addEventListener("input",a),t&&t.addEventListener("change",a)});document.addEventListener("click",function(e){if(e.target&&e.target.classList.contains("iniciar-atencion-btn")){const t=e.target.getAttribute("data-folio"),a=e.target.getAttribute("data-maquina");R(t,a)}});async function R(e,t){try{const a=await fetch(`/api/clases-maquina/${encodeURIComponent(t)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!a.ok)throw new Error(`HTTP error! status: ${a.status}`);const n=a.headers.get("content-type");if(!n||!n.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const l=await a.json(),{value:i}=await Swal.fire({title:"Seleccionar Clase de Máquina",html:`
                <select id="clase-select" class="swal2-select" style="width: 100%">
                    <option></option>
                    ${l.map(s=>`
                        <option value="${s.class}"
                                data-tiempo="${s.TimeEstimado}">
                            ${s.class} (${s.TimeEstimado} min)
                        </option>
                    `).join("")}
                </select>
            `,didOpen:()=>{$("#clase-select").select2({dropdownParent:$(".swal2-container"),placeholder:"Selecciona una clase",width:"100%"})},preConfirm:()=>{const s=document.getElementById("clase-select"),r=s.options[s.selectedIndex];return s.value?{clase:s.value,tiempo_estimado:r.dataset.tiempo}:(Swal.showValidationMessage("Debes seleccionar una clase"),!1)}});i&&await H(e,i.clase,i.tiempo_estimado)}catch(a){console.error("Error:",a),Swal.fire("Error","No se pudieron cargar las clases de máquina","error")}}async function H(e,t,a){try{const n=new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit",hour12:!1}),l=await fetch("/api/iniciar-atencion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:e,clase:t,tiempo_estimado:a,time_inicio:n})});if(!l.ok)throw new Error(`HTTP error! status: ${l.status}`);const i=l.headers.get("content-type");if(!i||!i.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const s=await l.json();if(s.success){await fetch("/broadcast-status-ot",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({id:s.ot.id,status:"PROCESO"})}),await Swal.fire("¡Éxito!","Atención iniciada correctamente","success");const r=document.getElementById("modulo-select").value;r&&await p(r)}}catch(n){console.error("Error:",n),Swal.fire("Error","No se pudo iniciar la atención","error")}}Notification.permission==="default"&&Notification.requestPermission();document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"){const e=document.getElementById("modulo-select").value;e&&p(e)}});window.Echo.channel("asignaciones-ot").listen("AsignacionOTCreated",e=>{var a;const t=(a=document.getElementById("modulo-select"))==null?void 0:a.value;t&&p(t)}).listen("AsignacionOTReasignada",e=>{var a;const t=(a=document.getElementById("modulo-select"))==null?void 0:a.value;t&&p(t)}).listen("StatusOTUpdated",e=>{var a;const t=(a=document.getElementById("modulo-select"))==null?void 0:a.value;t&&p(t)}).listen("ComidaBreakLimpiado",e=>{var a;const t=(a=document.getElementById("modulo-select"))==null?void 0:a.value;t&&p(t)});
