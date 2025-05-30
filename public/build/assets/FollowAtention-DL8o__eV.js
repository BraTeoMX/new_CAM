import{P as L,E as M}from"./pusher-RuRbGOpv.js";import"./_commonjsHelpers-Cpj98o6Y.js";const O={ASIGNADO:"bg-blue-100 text-blue-800",PROCESO:"bg-yellow-100 text-yellow-800",PENDIENTE:"bg-red-100 text-red-800",ATENDIDO:"bg-green-100 text-green-800",AUTONOMO:"bg-violet-200 text-violet-800",DEFAULT:"bg-gray-100 text-gray-800"},D=["PENDIENTE","ASIGNADO","PROCESO","ATENDIDO","AUTONOMO"],v=new Map,h=new Map,E=new Map;window.Pusher=L;window.Echo=new M({broadcaster:"pusher",key:"51d9687d2d0bffce329a",cluster:"us3",forceTLS:!0,encrypted:!0});function B(e){return O[e]||O.DEFAULT}function q(e){switch(e){case"ASIGNADO":return"ring-blue-400 dark:ring-blue-400 bg-blue-400";case"PROCESO":return"ring-yellow-400 dark:ring-yellow-400 bg-yellow-400";case"PENDIENTE":return"ring-red-500 dark:ring-red-500 bg-red-500";case"ATENDIDO":return"ring-green-600 dark:ring-green-600 bg-green-600";case"AUTONOMO":return"ring-violet-600 dark:ring-violet-600 bg-violet-600";default:return"ring-gray-400 dark:ring-gray-400 bg-gray-400"}}function A(e){return e?new Date(e).toLocaleString():""}function T(e){if(!e)return 0;if(typeof e=="number")return e;if(/^\d+$/.test(e))return parseInt(e);if(/^\d{2}:\d{2}$/.test(e)){const[t,a]=e.split(":").map(Number);return t*60+a}return 0}async function j(e){if(h.has(e))return h.get(e);try{const t=await fetch(`/api/follow-atention/${encodeURIComponent(e)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!t.ok)throw new Error("No se pudo obtener el registro");const a=await t.json();if(a.success){h.set(e,a.data);const o=document.querySelector(`.timer-countdown[data-folio="${e}"]`);if(o){const l=v.get(e);if(l){const s=o.closest(".bg-white, .dark\\:bg-gray-800");s&&(s.outerHTML=I(l),setTimeout(()=>{C()},10))}}return a.data}return null}catch(t){return console.error(t),null}}function I(e){const t=B(e.Status);let a="",o=h.get(e.Folio)||{},l="";e.ComidaBreak&&e.TerminoComidaBreack&&(l=`
            <div class="mt-2">
                <span class="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                    ${e.ComidaBreak}
                    Regresa a las: ${new Date(e.TerminoComidaBreack).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                </span>
            </div>
        `);let s="",c="",r="Tiempo restante:",i="",f="timer-countdown";if(e.Status==="PROCESO"&&(s=o.TimeInicio||"",c=T(o.TimeEstimado)),e.Status==="ATENDIDO"){r="Tiempo total de atención:";let g=0;typeof o.TimeEjecucion<"u"&&o.TimeEjecucion!==null&&o.TimeEjecucion!==""?(g=parseInt(o.TimeEjecucion,10),isNaN(g)&&(g=0)):fetch(`/api/follow-atention/${encodeURIComponent(e.Folio)}`).then(m=>m.json()).then(m=>{if(m.success&&m.data&&m.data.TimeEjecucion!=null){h.set(e.Folio,m.data);const w=document.querySelector(`[data-folio-card="${e.Folio}"]`);w&&(w.outerHTML=I(e))}}),i=`${g} minutos`,f="timer-finalizado",a=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${r}</span>
                </div>
                <div class="font-mono text-2xl font-bold text-blue-700 ${f}">
                    ${i}
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
                     data-inicio="${s}"
                     data-estimado="${c}">
                    <span class="text-gray-400">Cargando...</span>
                </div>
                <div class="text-sm text-gray-500">
                    Tiempo estimado: ${c||"..."} minutos
                </div>
            </div>
        `);let d="";e.Status==="PROCESO"&&(d=`
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <button class="finalizar-proceso-btn text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    type="button"
                    data-folio="${e.Folio}"
                    data-inicio="${s}"
                    data-estimado="${c}">
                    Finalizar Atención
                </button>
            </div>
        `);const u=e.Status==="ASIGNADO"?`
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button class="iniciar-atencion-btn w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                    data-folio="${e.Folio}"
                    data-maquina="${e.Maquina}">
                Iniciar Atención
            </button>
        </div>
    `:"",n=q(e.Status),b=e.Status==="AUTONOMO"?"/images/Avatar.webp":"http://128.150.102.45:8000/Intimark/Fotos%20Credenciales/"+e.Num_Mecanico+".jpg";return`
    <div class="relative max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col" data-folio-card="${e.Folio}">
         <div class="absolute -top-8 -left-8 z-10">
            <img class="w-20 h-20 rounded-full ring-4 ${n} shadow-lg object-cover bg-white"
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
                    <div>Operario: <span class="font-semibold">${e.Operario}</span></div>
                    <div>Nombre Operario: <span class="font-semibold">${e.NombreOperario}</span></div>
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
            ${d}
            ${u}
            </div>
        </div>
    `}function z(e){e=parseInt(e)||0;const t=Math.floor(e/60),a=e%60;return`${t}:${a.toString().padStart(2,"0")}`}document.getElementById("drawer-form-finalizar")||document.body.insertAdjacentHTML("beforeend",`
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
    `);document.addEventListener("click",async function(e){if(e.target&&e.target.classList.contains("finalizar-proceso-btn")){const t=e.target.getAttribute("data-folio"),a=e.target.getAttribute("data-inicio"),o=e.target.getAttribute("data-estimado");window.finalizarAtencionFolio=t,window.finalizarAtencionTimeInicio=a,window.finalizarAtencionTimeEstimado=o,await S("/api/fallas","#falla-select","Fallas"),await S("/api/causas","#causa-select","Causa"),await S("/api/acciones","#accion-select","Accion"),window.dispatchEvent(new CustomEvent("open-drawer",{detail:{id:"drawer-form-finalizar"}})),document.getElementById("drawer-form-finalizar").classList.remove("-translate-x-full")}});async function S(e,t,a){const l=await(await fetch(e)).json(),s=document.querySelector(t);s.innerHTML='<option value="">Seleccione una opción</option>'+l.map(c=>`<option value="${c[a]}">${c[a]}</option>`).join(""),$(s).val("").trigger("change"),$(s).select2({dropdownParent:$("#drawer-form-finalizar"),width:"100%"})}document.getElementById("finalizar-atencion-form").addEventListener("submit",async function(e){var m,w;e.preventDefault();const t=window.finalizarAtencionFolio,a=$("#falla-select").val(),o=$("#causa-select").val(),l=$("#accion-select").val(),s=$("#comentarios-finalizar").val();if(!a||!o||!l){Swal.fire("Error","Debe seleccionar una opción en cada catálogo.","error");return}const c=new Date,r=c.getHours().toString().padStart(2,"0")+":"+c.getMinutes().toString().padStart(2,"0"),i=document.querySelector(`.timer-countdown[data-folio="${t}"], .timer-finalizado[data-folio="${t}"]`);let f="00:00";i&&(f=i.textContent.replace("-","").trim());const d=h.get(t);let u=(d==null?void 0:d.TimeInicio)||window.finalizarAtencionTimeInicio||"";T((d==null?void 0:d.TimeEstimado)||window.finalizarAtencionTimeEstimado||"");let n=0;if(u&&r){const[y,x]=u.split(":").map(Number),[N,k]=r.split(":").map(Number);n=N*60+k-(y*60+x),n<0&&(n+=24*60)}if(E.has(t)&&(clearInterval(E.get(t)),E.delete(t)),d&&(d.TimeEjecucion=n),i){const y=(w=(m=i.parentElement)==null?void 0:m.previousElementSibling)==null?void 0:w.querySelector("span.text-gray-800");y&&(y.textContent="Tiempo total de atención:"),i.classList.remove("text-green-600","text-orange-500","text-red-600","timer-countdown"),i.classList.add("text-blue-700","timer-finalizado"),i.textContent=z(n)}if((await(await fetch("/api/finalizar-atencion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:t,falla:a,causa:o,accion:l,comentarios:s,time_final:r,time_real:f,time_ejecucion:n})})).json()).success){let y=null;v.has(t)&&(y=v.get(t).id,v.get(t).Status="ATENDIDO"),y&&await fetch("/broadcast-status-ot",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({id:y,status:"ATENDIDO"})});const x=document.getElementById("modulo-select").value;x&&await p(x),Swal.fire("¡Éxito!","Atención finalizada correctamente","success"),document.getElementById("drawer-form-finalizar").classList.add("-translate-x-full")}else Swal.fire("Error","No se pudo finalizar la atención","error")});window.addEventListener("open-drawer",function(e){const t=e.detail.id;document.getElementById(t).classList.remove("-translate-x-full")});document.querySelectorAll("[data-drawer-hide]").forEach(e=>{e.addEventListener("click",function(){const t=e.getAttribute("aria-controls");document.getElementById(t).classList.add("-translate-x-full")})});function P(){for(const e of E.values())clearInterval(e);E.clear()}function C(){P(),document.querySelectorAll(".timer-countdown").forEach(e=>{const t=e.dataset.folio;let a=e.dataset.inicio,o=e.dataset.estimado;if(o=T(o),!a||!o)return;let l;if(/^\d{2}:\d{2}$/.test(a)){const[d,u]=a.split(":");l=new Date,l.setHours(parseInt(d),parseInt(u),0,0)}else l=new Date(a);const s=l.getTime()+o*60*1e3;let c=!1,r=null;function i(){const d=new Date().getTime(),u=s-d;let n,b,g=!1;if(u<4){g=!0;const w=Math.abs(u);n=Math.floor(w/(1e3*60)),b=Math.floor(w%(1e3*60)/1e3),n!==r&&(r=n,document.visibilityState==="visible"&&Swal.fire({title:"¡Atención!",text:`Se ha terminado el tiempo de atención para la OT ${t}. Han pasado ${n} minuto(s) extra.`,icon:"error",timer:4e3}))}else n=Math.floor(u/(1e3*60)),b=Math.floor(u%(1e3*60)/1e3),u<=3e5&&!c&&(c=!0,document.visibilityState==="visible"&&Swal.fire({title:"¡Atención!",text:`Quedan 5 minutos para la OT ${t}`,icon:"warning",timer:5e3}));const m=`${g?"-":""}${n}:${b.toString().padStart(2,"0")}`;e.classList.remove("text-green-600","text-orange-500","text-red-600"),g||u<=o*60*1e3*.25?e.classList.add("text-red-600"):u<=o*60*1e3*.5?e.classList.add("text-orange-500"):e.classList.add("text-green-600"),e.textContent=m}const f=setInterval(i,1e3);E.set(t,f),i()})}async function F(e){var f,d,u;v.clear(),e=e.filter(n=>n.Status!=="CANCELADO"&&n.Status!=="FINALIZADO"),e.forEach(n=>v.set(n.Folio,n));const t=((d=(f=document.getElementById("search-ot"))==null?void 0:f.value)==null?void 0:d.toLowerCase())||"",a=((u=document.getElementById("filter-status"))==null?void 0:u.value)||"";let o=e.slice();const l=["AUTONOMO","ASIGNADO","PROCESO","PENDIENTE","ATENDIDO"];o.sort((n,b)=>{const g=l.indexOf(n.Status),m=l.indexOf(b.Status);return(g===-1?99:g)-(m===-1?99:m)}),t&&(o=o.filter(n=>n.Folio&&n.Folio.toLowerCase().includes(t)||n.Modulo&&n.Modulo.toLowerCase().includes(t)||n.Mecanico&&n.Mecanico.toLowerCase().includes(t)||n.Supervisor&&n.Supervisor.toLowerCase().includes(t)||n.Maquina&&n.Maquina.toLowerCase().includes(t)||n.Problema&&n.Problema.toLowerCase().includes(t))),a&&(o=o.filter(n=>n.Status===a));const c=o.filter(n=>n.Status==="PROCESO").map(n=>j(n.Folio));await Promise.all(c);const r={};D.forEach(n=>r[n]=0),r.total=e.filter(n=>n.Status!=="FINALIZADO"&&n.Status!=="CANCELADO").length,e.forEach(n=>{r[n.Status]!==void 0&&r[n.Status]++}),document.getElementById("ot-pendientes")&&(document.getElementById("ot-pendientes").textContent=r.PENDIENTE),document.getElementById("ot-asignadas")&&(document.getElementById("ot-asignadas").textContent=r.ASIGNADO),document.getElementById("ot-proceso")&&(document.getElementById("ot-proceso").textContent=r.PROCESO),document.getElementById("ot-atendidas")&&(document.getElementById("ot-atendidas").textContent=r.ATENDIDO),document.getElementById("ot-autonomas")&&(document.getElementById("ot-autonomas").textContent=r.AUTONOMO),document.getElementById("ot-total")&&(document.getElementById("ot-total").textContent=r.total);const i=document.getElementById("seguimiento-ot-container");i.innerHTML=o.length?o.map(I).join(""):'<div class="col-span-full text-center text-gray-400 py-8">No hay OTs para mostrar.</div>',C()}function p(e){return fetch("/cardsAteOTs").then(t=>t.json()).then(t=>{let a=t.filter(o=>o.Modulo===e);return F(a)})}window.cargarSeguimientoOTs=p;document.addEventListener("DOMContentLoaded",function(){$("#modulo-select").select2({placeholder:"Selecciona tu módulo de atención",width:"100%"}),axios.get("/obtener-modulos").then(o=>{const l=document.getElementById("modulo-select");o.data.forEach(s=>{let c=s.Modulo||s.moduleid||s.MODULEID||s.value||s,r=s.Modulo||s.moduleid||s.MODULEID||s.value||s;if(c&&r){let i=document.createElement("option");i.value=c,i.textContent=r,l.appendChild(i)}}),$("#modulo-select").trigger("change")}),$("#modulo-select").on("change",function(){const o=this.value;o?(document.getElementById("resumen-bar").classList.remove("hidden"),document.getElementById("filtros-bar").classList.remove("hidden"),p(o)):(document.getElementById("resumen-bar").classList.add("hidden"),document.getElementById("filtros-bar").classList.add("hidden"),document.getElementById("seguimiento-ot-container").innerHTML="")});const e=document.getElementById("search-ot"),t=document.getElementById("filter-status");function a(){const o=document.getElementById("modulo-select").value;o&&p(o)}e&&e.addEventListener("input",a),t&&t.addEventListener("change",a)});document.addEventListener("click",function(e){if(e.target&&e.target.classList.contains("iniciar-atencion-btn")){const t=e.target.getAttribute("data-folio"),a=e.target.getAttribute("data-maquina");R(t,a)}});async function R(e,t){try{const a=await fetch(`/api/clases-maquina/${encodeURIComponent(t)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!a.ok)throw new Error(`HTTP error! status: ${a.status}`);const o=a.headers.get("content-type");if(!o||!o.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const l=await a.json(),s=l.clases||[],c=l.numeroMaquina||[],{value:r}=await Swal.fire({title:"Seleccionar Clase y Número de Máquina",html:`
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Clase de Máquina:</label>
                <select id="clase-select" class="swal2-select" style="width: 100%">
                    <option></option>
                    ${s.map(i=>`
                        <option value="${i.class}" data-tiempo="${i.TimeEstimado}">
                            ${i.class} (${i.TimeEstimado} min)
                        </option>
                    `).join("")}
                </select>
                <label class="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">Número de Máquina:</label>
                <select id="numero-maquina-select" class="swal2-select" style="width: 100%">
                    <option></option>
                    ${c.map(i=>`
                        <option value="${i.ID_INTIMARK}">
                            ${i.ID_INTIMARK}
                        </option>
                    `).join("")}
                </select>
            `,didOpen:()=>{$("#clase-select").select2({dropdownParent:$(".swal2-container"),placeholder:"Selecciona una clase",width:"100%"}),$("#numero-maquina-select").select2({dropdownParent:$(".swal2-container"),placeholder:"Selecciona el número de máquina",width:"100%"})},preConfirm:()=>{const i=document.getElementById("clase-select"),f=i.options[i.selectedIndex],d=document.getElementById("numero-maquina-select");return i.value?d.value?{clase:i.value,tiempo_estimado:f.dataset.tiempo,numero_maquina:d.value}:(Swal.showValidationMessage("Debes seleccionar el número de máquina"),!1):(Swal.showValidationMessage("Debes seleccionar una clase"),!1)}});r&&await H(e,r.clase,r.tiempo_estimado,r.numero_maquina)}catch(a){console.error("Error:",a),Swal.fire("Error","No se pudieron cargar las clases de máquina","error")}}async function H(e,t,a,o){try{const l=new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit",hour12:!1}),s=await fetch("/api/iniciar-atencion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:e,clase:t,numero_maquina:o,tiempo_estimado:a,time_inicio:l})});if(!s.ok)throw new Error(`HTTP error! status: ${s.status}`);const c=s.headers.get("content-type");if(!c||!c.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const r=await s.json();if(r.success){await fetch("/broadcast-status-ot",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({id:r.ot.id,status:"PROCESO"})}),await Swal.fire("¡Éxito!","Atención iniciada correctamente","success");const i=document.getElementById("modulo-select").value;i&&await p(i)}}catch(l){console.error("Error:",l),Swal.fire("Error","No se pudo iniciar la atención","error")}}Notification.permission==="default"&&Notification.requestPermission();document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"){const e=document.getElementById("modulo-select").value;e&&p(e)}});window.Echo.channel("asignaciones-ot").listen("AsignacionOTCreated",e=>{var a;if(e&&e.Status==="CANCELADO")return;const t=(a=document.getElementById("modulo-select"))==null?void 0:a.value;t&&p(t)}).listen("AsignacionOTReasignada",e=>{var a;if(e&&e.Status==="CANCELADO")return;const t=(a=document.getElementById("modulo-select"))==null?void 0:a.value;t&&p(t)}).listen("StatusOTUpdated",e=>{var a;if(e&&e.Status==="CANCELADO")return;const t=(a=document.getElementById("modulo-select"))==null?void 0:a.value;t&&p(t)}).listen("ComidaBreakLimpiado",e=>{var a;const t=(a=document.getElementById("modulo-select"))==null?void 0:a.value;t&&p(t)});
