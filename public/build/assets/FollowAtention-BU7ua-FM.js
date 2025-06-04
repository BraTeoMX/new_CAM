import{P as F,E as R}from"./pusher-RuRbGOpv.js";import"./_commonjsHelpers-Cpj98o6Y.js";const D={ASIGNADO:"bg-blue-100 text-blue-800",PROCESO:"bg-yellow-100 text-yellow-800",PENDIENTE:"bg-red-100 text-red-800",ATENDIDO:"bg-green-100 text-green-800",AUTONOMO:"bg-violet-200 text-violet-800",DEFAULT:"bg-gray-100 text-gray-800"},z=["PENDIENTE","ASIGNADO","PROCESO","ATENDIDO","AUTONOMO"],x=new Map,T=new Map,S=new Map;window.Pusher=F;window.Echo=new R({broadcaster:"pusher",key:"51d9687d2d0bffce329a",cluster:"us3",forceTLS:!0,encrypted:!0});function P(e){return D[e]||D.DEFAULT}function H(e){switch(e){case"ASIGNADO":return"ring-blue-400 dark:ring-blue-400 bg-blue-400";case"PROCESO":return"ring-yellow-400 dark:ring-yellow-400 bg-yellow-400";case"PENDIENTE":return"ring-red-500 dark:ring-red-500 bg-red-500";case"ATENDIDO":return"ring-green-600 dark:ring-green-600 bg-green-600";case"AUTONOMO":return"ring-violet-600 dark:ring-violet-600 bg-violet-600";default:return"ring-gray-400 dark:ring-gray-400 bg-gray-400"}}function q(e){return e?new Date(e).toLocaleString():""}function E(e){if(!e)return 0;if(typeof e=="number")return e;if(/^\d+$/.test(e))return parseInt(e);if(/^\d{2}:\d{2}$/.test(e)){const[t,i]=e.split(":").map(Number);return t*60+i}return 0}async function X(e){if(T.has(e))return T.get(e);try{const t=await fetch(`/api/follow-atention/${encodeURIComponent(e)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!t.ok)throw new Error("No se pudo obtener el registro");const i=await t.json();if(i.success){T.set(e,i.data);const a=document.querySelector(`.timer-countdown[data-folio="${e}"]`);if(a){const s=x.get(e);if(s){const o=a.closest(".bg-white, .dark\\:bg-gray-800");o&&(o.outerHTML=O(s),setTimeout(()=>{L()},10))}}return i.data}return null}catch(t){return console.error(t),null}}function O(e){const t=P(e.Status);let i="",a=T.get(e.Folio)||{},s="";e.ComidaBreak&&e.TerminoComidaBreack&&(s=`
            <div class="mt-2">
                <span class="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                    ${e.ComidaBreak}
                    Regresa a las: ${new Date(e.TerminoComidaBreack).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                </span>
            </div>
        `);let o="",c="",r="Tiempo restante:",l="",f="timer-countdown";if(e.Status==="PROCESO"&&(o=a.TimeInicio||"",c=E(a.TimeEstimado)),e.Status==="ATENDIDO"){r="Tiempo total de atención:";let g=0;typeof a.TimeEjecucion<"u"&&a.TimeEjecucion!==null&&a.TimeEjecucion!==""?(g=parseInt(a.TimeEjecucion,10),isNaN(g)&&(g=0)):fetch(`/api/follow-atention/${encodeURIComponent(e.Folio)}`).then(m=>m.json()).then(m=>{if(m.success&&m.data&&m.data.TimeEjecucion!=null){T.set(e.Folio,m.data);const b=document.querySelector(`[data-folio-card="${e.Folio}"]`);b&&(b.outerHTML=O(e))}}),l=`${g} minutos`,f="timer-finalizado",i=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${r}</span>
                </div>
                <div class="font-mono text-2xl font-bold text-blue-700 ${f}">
                    ${l}
                </div>
            </div>
        `}else e.Status==="PROCESO"&&(i=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${r}</span>
                </div>
                <div class="font-mono text-2xl font-bold timer-countdown"
                     data-folio="${e.Folio}"
                     data-inicio="${o}"
                     data-estimado="${c}">
                    <span class="text-gray-400">Cargando...</span>
                </div>
                <div class="text-sm text-gray-500">
                    Tiempo estimado: ${c||"..."} minutos
                </div>
            </div>
        `);let p="",d="",n="",w=!0,u=0;if(window.bahiaTimers[e.Folio]&&typeof window.bahiaTimers[e.Folio].pulsaciones<"u"&&(u=window.bahiaTimers[e.Folio].pulsaciones),u>=4&&(w=!1),e.Status==="PROCESO"){const g=j(e.Folio);w?d=`
                <button class="bahia-btn text-white ${g?"bg-red-700 hover:bg-red-800":"bg-violet-700 hover:bg-violet-800"} focus:ring-4 focus:ring-violet-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 ml-2 dark:${g?"bg-red-600 hover:bg-red-700":"bg-violet-600 hover:bg-violet-700"} focus:outline-none dark:focus:ring-violet-800"
                    type="button"
                    data-folio="${e.Folio}">
                    ${g?"Fin Bahía":"Inicio Bahía"}
                </button>
            `:d="";const m=window.bahiaTimers[e.Folio]&&(window.bahiaTimers[e.Folio].elapsed>0||window.bahiaTimers[e.Folio].running);n=`
            <div class="mt-2 text-center bahia-timer-container" data-folio="${e.Folio}" style="${m?"":"display:none;"}">
                <div class="text-xs text-gray-500 mb-1">Tiempo Bahía:</div>
                <div class="font-mono text-xl font-bold text-violet-700 timer-bahia" data-folio="${e.Folio}">00:00:00</div>
            </div>
        `,p=`
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <button class="finalizar-proceso-btn text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    type="button"
                    data-folio="${e.Folio}"
                    data-inicio="${a.TimeInicio||""}"
                    data-estimado="${E(a.TimeEstimado)}">
                    Finalizar Atención
                </button>
                ${d}
            </div>
        `}if(e.Status==="ATENDIDO"){r="Tiempo total de atención:";let g=0;typeof a.TimeEjecucion<"u"&&a.TimeEjecucion!==null&&a.TimeEjecucion!==""?(g=parseInt(a.TimeEjecucion,10),isNaN(g)&&(g=0)):fetch(`/api/follow-atention/${encodeURIComponent(e.Folio)}`).then(m=>m.json()).then(m=>{if(m.success&&m.data&&m.data.TimeEjecucion!=null){T.set(e.Folio,m.data);const b=document.querySelector(`[data-folio-card="${e.Folio}"]`);b&&(b.outerHTML=O(e))}}),l=`${g} minutos`,f="timer-finalizado",i=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${r}</span>
                </div>
                <div class="font-mono text-2xl font-bold text-blue-700 ${f}">
                    ${l}
                </div>
            </div>
        `}else e.Status==="PROCESO"&&(i=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${r}</span>
                </div>
                <div class="font-mono text-2xl font-bold timer-countdown"
                     data-folio="${e.Folio}"
                     data-inicio="${a.TimeInicio||""}"
                     data-estimado="${E(a.TimeEstimado)}">
                    <span class="text-gray-400">Cargando...</span>
                </div>
                <div class="text-sm text-gray-500">
                    Tiempo estimado: ${E(a.TimeEstimado)?E(a.TimeEstimado):"..."} minutos
                </div>
                ${n}
            </div>
        `);const y=e.Status==="ASIGNADO"?`
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button class="iniciar-atencion-btn w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                    data-folio="${e.Folio}"
                    data-maquina="${e.Maquina}">
                Iniciar Atención
            </button>
        </div>
    `:"",C=H(e.Status),v=e.Status==="AUTONOMO"?"/images/Avatar.webp":"http://128.150.102.45:8000/Intimark/Fotos%20Credenciales/"+e.Num_Mecanico+".jpg";return`
    <div class="relative max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col" data-folio-card="${e.Folio}">
         <div class="absolute -top-8 -left-8 z-10">
            <img class="w-20 h-20 rounded-full ring-4 ${C} shadow-lg object-cover bg-white"
                src="${v}" alt="${e.Num_Mecanico}"
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
                    <span>Creada: ${q(e.created_at)}</span>
                    <span>Actualizada: ${q(e.updated_at)}</span>
                </div>
                ${s}
            </div>
            ${i}
            ${p}
            ${y}
            </div>
        </div>
    `}function U(e){e=parseInt(e)||0;const t=Math.floor(e/60),i=e%60;return`${t}:${i.toString().padStart(2,"0")}`}document.getElementById("drawer-form-finalizar")||document.body.insertAdjacentHTML("beforeend",`
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
    `);document.addEventListener("click",async function(e){if(e.target&&e.target.classList.contains("finalizar-proceso-btn")){const t=e.target.getAttribute("data-folio"),i=e.target.getAttribute("data-inicio"),a=e.target.getAttribute("data-estimado");window.finalizarAtencionFolio=t,window.finalizarAtencionTimeInicio=i,window.finalizarAtencionTimeEstimado=a,await k("/api/fallas","#falla-select","Fallas"),await k("/api/causas","#causa-select","Causa"),await k("/api/acciones","#accion-select","Accion"),window.dispatchEvent(new CustomEvent("open-drawer",{detail:{id:"drawer-form-finalizar"}})),document.getElementById("drawer-form-finalizar").classList.remove("-translate-x-full")}});async function k(e,t,i){const s=await(await fetch(e)).json(),o=document.querySelector(t);o.innerHTML='<option value="">Seleccione una opción</option>'+s.map(c=>`<option value="${c[i]}">${c[i]}</option>`).join(""),$(o).val("").trigger("change"),$(o).select2({dropdownParent:$("#drawer-form-finalizar"),width:"100%"})}document.getElementById("finalizar-atencion-form").addEventListener("submit",async function(e){var a,s;e.preventDefault();let t=document.createElement("div");t.id="finalizar-atencion-spinner",t.className="flex justify-center items-center my-4",t.innerHTML=`
        <div role="status">
          <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
          <span class="sr-only">Cargando...</span>
        </div>
    `;const i=document.getElementById("drawer-form-finalizar");i&&i.prepend(t);try{const o=window.finalizarAtencionFolio,c=$("#falla-select").val(),r=$("#causa-select").val(),l=$("#accion-select").val(),f=$("#comentarios-finalizar").val();if(!c||!r||!l){Swal.fire("Error","Debe seleccionar una opción en cada catálogo.","error");return}const p=new Date,d=p.getHours().toString().padStart(2,"0")+":"+p.getMinutes().toString().padStart(2,"0"),n=document.querySelector(`.timer-countdown[data-folio="${o}"], .timer-finalizado[data-folio="${o}"]`);let w="00:00";n&&(w=n.textContent.replace("-","").trim());const u=T.get(o);let y=(u==null?void 0:u.TimeInicio)||window.finalizarAtencionTimeInicio||"",C=E((u==null?void 0:u.TimeEstimado)||window.finalizarAtencionTimeEstimado||""),v=0;if(y&&d){const[b,A]=y.split(":").map(Number),[N,M]=d.split(":").map(Number);v=N*60+M-(b*60+A),v<0&&(v+=24*60)}if(S.has(o)&&(clearInterval(S.get(o)),S.delete(o)),u&&(u.TimeEjecucion=v),window.bahiaTimers[o]&&(delete window.bahiaTimers[o],I()),n){const b=(s=(a=n.parentElement)==null?void 0:a.previousElementSibling)==null?void 0:s.querySelector("span.text-gray-800");b&&(b.textContent="Tiempo total de atención:"),n.classList.remove("text-green-600","text-orange-500","text-red-600","timer-countdown"),n.classList.add("text-blue-700","timer-finalizado"),n.textContent=U(v)}if((await(await fetch("/api/finalizar-atencion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:o,falla:c,causa:r,accion:l,comentarios:f,time_final:d,time_real:w,time_ejecucion:v})})).json()).success){let b=null;x.has(o)&&(b=x.get(o).id,x.get(o).Status="ATENDIDO"),b&&await fetch("/broadcast-status-ot",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({id:b,status:"ATENDIDO"})});const A=document.getElementById("modulo-select").value;A&&await h(A),Swal.fire("¡Éxito!","Atención finalizada correctamente","success").then(async()=>{const N=`
                    <div style="text-align:left;">
                        <label style="display:flex;align-items:center;margin-bottom:10px;cursor:pointer;">
                            <input type="radio" name="satisfaccion" value="Excelente" style="margin-right:8px;">
                            <span style="font-size:1.5em;margin-right:8px;">🌟</span>
                            <span>Excelente</span>
                        </label>
                        <label style="display:flex;align-items:center;margin-bottom:10px;cursor:pointer;">
                            <input type="radio" name="satisfaccion" value="Bueno" style="margin-right:8px;">
                            <span style="font-size:1.5em;margin-right:8px;">👍</span>
                            <span>Bueno</span>
                        </label>
                        <label style="display:flex;align-items:center;margin-bottom:10px;cursor:pointer;">
                            <input type="radio" name="satisfaccion" value="Regular" style="margin-right:8px;">
                            <span style="font-size:1.5em;margin-right:8px;">😐</span>
                            <span>Regular</span>
                        </label>
                        <label style="display:flex;align-items:center;cursor:pointer;">
                            <input type="radio" name="satisfaccion" value="Malo" style="margin-right:8px;">
                            <span style="font-size:1.5em;margin-right:8px;">👎</span>
                            <span>Malo</span>
                        </label>
                    </div>
                `,{value:M}=await Swal.fire({title:"Califica que tan buena fue la atención",html:N,focusConfirm:!1,preConfirm:()=>{const B=document.querySelector('input[name="satisfaccion"]:checked');return B?B.value:(Swal.showValidationMessage("Debes seleccionar una opción"),!1)},confirmButtonText:"Enviar",showCancelButton:!1,customClass:{htmlContainer:"swal2-radio-group"}});M&&(await fetch("/api/encuesta-satisfaccion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:o,encuesta:M})}),Swal.fire("¡Gracias!","Tu opinión ha sido registrada.","success"))}),document.getElementById("drawer-form-finalizar").classList.add("-translate-x-full")}else Swal.fire("Error","No se pudo finalizar la atención","error")}finally{t&&t.parentNode&&t.parentNode.removeChild(t)}});window.addEventListener("open-drawer",function(e){const t=e.detail.id;document.getElementById(t).classList.remove("-translate-x-full")});document.querySelectorAll("[data-drawer-hide]").forEach(e=>{e.addEventListener("click",function(){const t=e.getAttribute("aria-controls");document.getElementById(t).classList.add("-translate-x-full")})});window.bahiaTimers=window.bahiaTimers||{};function _(){const e=localStorage.getItem("bahiaTimers");if(e)try{window.bahiaTimers=JSON.parse(e)}catch{window.bahiaTimers={}}}function I(){localStorage.setItem("bahiaTimers",JSON.stringify(window.bahiaTimers))}_();function J(e,t){window.bahiaTimers[e]?(window.bahiaTimers[e].start=Date.now(),window.bahiaTimers[e].elapsed=0,window.bahiaTimers[e].running=!0,window.bahiaTimers[e].pulsaciones=t||window.bahiaTimers[e].pulsaciones||1):window.bahiaTimers[e]={start:Date.now(),elapsed:0,running:!0,pulsaciones:t||1},I()}function Z(e){const t=window.bahiaTimers[e];t&&t.running&&(t.elapsed+=Math.floor((Date.now()-t.start)/1e3),t.running=!1,I())}function G(e){const t=window.bahiaTimers[e];return t?t.running?t.elapsed+Math.floor((Date.now()-t.start)/1e3):t.elapsed:0}function j(e){return!!(window.bahiaTimers[e]&&window.bahiaTimers[e].running)}async function W(e,t){try{const a=await(await fetch("/api/bahia",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:e,tipo:t})})).json();return a.success||Swal.fire("Error",a.message||"No se pudo guardar el tiempo de Bahía","error"),a}catch{return Swal.fire("Error","No se pudo guardar el tiempo de Bahía","error"),null}}async function V(e){try{return(await(await fetch(`/api/bahia-info/${encodeURIComponent(e)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}})).json()).bahia||null}catch{return null}}document.addEventListener("click",async function(e){if(e.target&&e.target.classList.contains("bahia-btn")){const t=e.target.getAttribute("data-folio"),i=await V(t);let a=i&&i.Pulsaciones?parseInt(i.Pulsaciones):0;if(a>=4)return;let s="";if(j(t)){if(a===1)s="fin";else if(a===3)s="fin1";else return;Z(t)}else{if(a===0)s="inicio";else if(a===2)s="inicio1";else return;J(t,a+1)}const o=await W(t,s);o&&o.bahia&&(a=o.bahia.Pulsaciones?parseInt(o.bahia.Pulsaciones):a+1,window.bahiaTimers[t]=window.bahiaTimers[t]||{},window.bahiaTimers[t].pulsaciones=a,a>=4&&delete window.bahiaTimers[t],I());const c=document.querySelector(`[data-folio-card="${t}"]`);c&&x.has(t)&&(c.outerHTML=O(x.get(t)),setTimeout(()=>L(),10))}});function K(){for(const e of S.values())clearInterval(e);S.clear()}function L(){K(),document.querySelectorAll(".timer-countdown").forEach(e=>{const t=e.dataset.folio;let i=e.dataset.inicio,a=e.dataset.estimado;if(a=E(a),!i||!a)return;let s;if(/^\d{2}:\d{2}$/.test(i)){const[p,d]=i.split(":");s=new Date,s.setHours(parseInt(p),parseInt(d),0,0)}else s=new Date(i);const o=s.getTime()+a*60*1e3;let c=!1,r=null;function l(){const p=new Date().getTime(),d=o-p;let n,w,u=!1;if(d<4){u=!0;const C=Math.abs(d);n=Math.floor(C/(1e3*60)),w=Math.floor(C%(1e3*60)/1e3),n!==r&&(r=n,document.visibilityState==="visible"&&Swal.fire({title:"¡Atención!",text:`Se ha terminado el tiempo de atención para la OT ${t}. Han pasado ${n} minuto(s) extra.`,icon:"error",timer:4e3}))}else n=Math.floor(d/(1e3*60)),w=Math.floor(d%(1e3*60)/1e3),d<=3e5&&!c&&(c=!0,document.visibilityState==="visible"&&Swal.fire({title:"¡Atención!",text:`Quedan 5 minutos para la OT ${t}`,icon:"warning",timer:5e3}));const y=`${u?"-":""}${n}:${w.toString().padStart(2,"0")}`;e.classList.remove("text-green-600","text-orange-500","text-red-600"),u||d<=a*60*1e3*.25?e.classList.add("text-red-600"):d<=a*60*1e3*.5?e.classList.add("text-orange-500"):e.classList.add("text-green-600"),e.textContent=y}const f=setInterval(l,1e3);S.set(t,f),l()}),document.querySelectorAll(".bahia-timer-container").forEach(e=>{const t=e.dataset.folio,i=e.querySelector(".timer-bahia"),a=window.bahiaTimers[t];if(a&&(a.running||a.elapsed>0)){let s=function(){let c=G(t);const r=Math.floor(c/3600),l=Math.floor(c%3600/60),f=c%60;i.textContent=`${r.toString().padStart(2,"0")}:${l.toString().padStart(2,"0")}:${f.toString().padStart(2,"0")}`};e.style.display="",s();const o=setInterval(s,1e3);S.set(`bahia_${t}`,o)}else e.style.display="none"})}async function Q(e){var f,p,d;x.clear(),e=e.filter(n=>n.Status!=="CANCELADO"&&n.Status!=="FINALIZADO"),e.forEach(n=>x.set(n.Folio,n));const t=((p=(f=document.getElementById("search-ot"))==null?void 0:f.value)==null?void 0:p.toLowerCase())||"",i=((d=document.getElementById("filter-status"))==null?void 0:d.value)||"";let a=e.slice();const s=["AUTONOMO","ASIGNADO","PROCESO","PENDIENTE","ATENDIDO"];a.sort((n,w)=>{const u=s.indexOf(n.Status),y=s.indexOf(w.Status);return(u===-1?99:u)-(y===-1?99:y)}),t&&(a=a.filter(n=>n.Folio&&n.Folio.toLowerCase().includes(t)||n.Modulo&&n.Modulo.toLowerCase().includes(t)||n.Mecanico&&n.Mecanico.toLowerCase().includes(t)||n.Supervisor&&n.Supervisor.toLowerCase().includes(t)||n.Maquina&&n.Maquina.toLowerCase().includes(t)||n.Problema&&n.Problema.toLowerCase().includes(t))),i&&(a=a.filter(n=>n.Status===i));const c=a.filter(n=>n.Status==="PROCESO").map(n=>X(n.Folio));await Promise.all(c);const r={};z.forEach(n=>r[n]=0),r.total=e.filter(n=>n.Status!=="FINALIZADO"&&n.Status!=="CANCELADO").length,e.forEach(n=>{r[n.Status]!==void 0&&r[n.Status]++}),document.getElementById("ot-pendientes")&&(document.getElementById("ot-pendientes").textContent=r.PENDIENTE),document.getElementById("ot-asignadas")&&(document.getElementById("ot-asignadas").textContent=r.ASIGNADO),document.getElementById("ot-proceso")&&(document.getElementById("ot-proceso").textContent=r.PROCESO),document.getElementById("ot-atendidas")&&(document.getElementById("ot-atendidas").textContent=r.ATENDIDO),document.getElementById("ot-autonomas")&&(document.getElementById("ot-autonomas").textContent=r.AUTONOMO),document.getElementById("ot-total")&&(document.getElementById("ot-total").textContent=r.total);const l=document.getElementById("seguimiento-ot-container");l.innerHTML=a.length?a.map(O).join(""):'<div class="col-span-full text-center text-gray-400 py-8">No hay OTs para mostrar.</div>',L()}function h(e){return fetch("/cardsAteOTs").then(t=>t.json()).then(t=>{let i=t.filter(a=>a.Modulo===e);return Q(i)})}window.cargarSeguimientoOTs=h;document.addEventListener("DOMContentLoaded",function(){$("#modulo-select").select2({placeholder:"Selecciona tu módulo de atención",width:"100%"}),axios.get("/obtener-modulos").then(a=>{const s=document.getElementById("modulo-select");a.data.forEach(o=>{let c=o.Modulo||o.moduleid||o.MODULEID||o.value||o,r=o.Modulo||o.moduleid||o.MODULEID||o.value||o;if(c&&r){let l=document.createElement("option");l.value=c,l.textContent=r,s.appendChild(l)}}),$("#modulo-select").trigger("change")}),$("#modulo-select").on("change",function(){const a=this.value;a?(document.getElementById("resumen-bar").classList.remove("hidden"),document.getElementById("filtros-bar").classList.remove("hidden"),h(a)):(document.getElementById("resumen-bar").classList.add("hidden"),document.getElementById("filtros-bar").classList.add("hidden"),document.getElementById("seguimiento-ot-container").innerHTML="")});const e=document.getElementById("search-ot"),t=document.getElementById("filter-status");function i(){const a=document.getElementById("modulo-select").value;a&&h(a)}e&&e.addEventListener("input",i),t&&t.addEventListener("change",i)});document.addEventListener("click",function(e){if(e.target&&e.target.classList.contains("iniciar-atencion-btn")){const t=e.target.getAttribute("data-folio"),i=e.target.getAttribute("data-maquina");let a=document.createElement("div");a.id="modal-iniciar-atencion-spinner",a.className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40",a.innerHTML=`
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col items-center px-8 py-6">
                <svg aria-hidden="true" class="w-12 h-12 mb-3 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span class="text-lg font-semibold text-gray-700 dark:text-gray-100">Cargando...</span>
            </div>
        `,document.body.appendChild(a),Y(t,i).finally(()=>{a&&a.parentNode&&a.parentNode.removeChild(a)})}});async function Y(e,t){try{const i=await fetch(`/api/clases-maquina/${encodeURIComponent(t)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!i.ok)throw new Error(`HTTP error! status: ${i.status}`);const a=i.headers.get("content-type");if(!a||!a.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const s=await i.json(),o=s.clases||[],c=s.numeroMaquina||[],{value:r}=await Swal.fire({title:"Seleccionar Clase y Número de Máquina",html:`
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Clase de Máquina:</label>
                <select id="clase-select" class="swal2-select" style="width: 100%">
                    <option></option>
                    ${o.map(l=>`
                        <option value="${l.class}" data-tiempo="${l.TimeEstimado}">
                            ${l.class} (${l.TimeEstimado} min)
                        </option>
                    `).join("")}
                </select>
                <label class="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">Número de Máquina:</label>
                <select id="numero-maquina-select" class="swal2-select" style="width: 100%">
                    <option></option>
                    ${c.map(l=>`
                        <option value="${l.Remplacad}">
                            ${l.Remplacad}
                        </option>
                    `).join("")}
                </select>
            `,didOpen:()=>{$("#clase-select").select2({dropdownParent:$(".swal2-container"),placeholder:"Selecciona una clase",width:"100%"}),$("#numero-maquina-select").select2({dropdownParent:$(".swal2-container"),placeholder:"Selecciona el número de máquina",width:"100%"})},preConfirm:()=>{const l=document.getElementById("clase-select"),f=l.options[l.selectedIndex],p=document.getElementById("numero-maquina-select");return l.value?p.value?{clase:l.value,tiempo_estimado:f.dataset.tiempo,numero_maquina:p.value}:(Swal.showValidationMessage("Debes seleccionar el número de máquina"),!1):(Swal.showValidationMessage("Debes seleccionar una clase"),!1)}});r&&await ee(e,r.clase,r.tiempo_estimado,r.numero_maquina)}catch(i){console.error("Error:",i),Swal.fire("Error","No se pudieron cargar las clases de máquina","error")}}async function ee(e,t,i,a){try{const s=new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit",hour12:!1}),o=await fetch("/api/iniciar-atencion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:e,clase:t,numero_maquina:a,tiempo_estimado:i,time_inicio:s})});if(!o.ok)throw new Error(`HTTP error! status: ${o.status}`);const c=o.headers.get("content-type");if(!c||!c.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const r=await o.json();if(r.success){await fetch("/broadcast-status-ot",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({id:r.ot.id,status:"PROCESO"})}),await Swal.fire("¡Éxito!","Atención iniciada correctamente","success");const l=document.getElementById("modulo-select").value;l&&await h(l)}}catch(s){console.error("Error:",s),Swal.fire("Error","No se pudo iniciar la atención","error")}}Notification.permission==="default"&&Notification.requestPermission();document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"){const e=document.getElementById("modulo-select").value;e&&h(e)}});window.Echo.channel("asignaciones-ot").listen("AsignacionOTCreated",e=>{var i;if(e&&e.Status==="CANCELADO")return;const t=(i=document.getElementById("modulo-select"))==null?void 0:i.value;t&&h(t)}).listen("AsignacionOTReasignada",e=>{var i;if(e&&e.Status==="CANCELADO")return;const t=(i=document.getElementById("modulo-select"))==null?void 0:i.value;t&&h(t)}).listen("StatusOTUpdated",e=>{var i;if(e&&e.Status==="CANCELADO")return;const t=(i=document.getElementById("modulo-select"))==null?void 0:i.value;t&&h(t)}).listen("ComidaBreakLimpiado",e=>{var i;const t=(i=document.getElementById("modulo-select"))==null?void 0:i.value;t&&h(t)});
