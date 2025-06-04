import{P as D,E as q}from"./pusher-RuRbGOpv.js";import"./_commonjsHelpers-Cpj98o6Y.js";const M={ASIGNADO:"bg-blue-100 text-blue-800",PROCESO:"bg-yellow-100 text-yellow-800",PENDIENTE:"bg-red-100 text-red-800",ATENDIDO:"bg-green-100 text-green-800",AUTONOMO:"bg-violet-200 text-violet-800",DEFAULT:"bg-gray-100 text-gray-800"},j=["PENDIENTE","ASIGNADO","PROCESO","ATENDIDO","AUTONOMO"],x=new Map,S=new Map,O=new Map;window.Pusher=D;window.Echo=new q({broadcaster:"pusher",key:"51d9687d2d0bffce329a",cluster:"us3",forceTLS:!0,encrypted:!0});function F(e){return M[e]||M.DEFAULT}function R(e){switch(e){case"ASIGNADO":return"ring-blue-400 dark:ring-blue-400 bg-blue-400";case"PROCESO":return"ring-yellow-400 dark:ring-yellow-400 bg-yellow-400";case"PENDIENTE":return"ring-red-500 dark:ring-red-500 bg-red-500";case"ATENDIDO":return"ring-green-600 dark:ring-green-600 bg-green-600";case"AUTONOMO":return"ring-violet-600 dark:ring-violet-600 bg-violet-600";default:return"ring-gray-400 dark:ring-gray-400 bg-gray-400"}}function L(e){return e?new Date(e).toLocaleString():""}function T(e){if(!e)return 0;if(typeof e=="number")return e;if(/^\d+$/.test(e))return parseInt(e);if(/^\d{2}:\d{2}$/.test(e)){const[t,i]=e.split(":").map(Number);return t*60+i}return 0}async function P(e){if(S.has(e))return S.get(e);try{const t=await fetch(`/api/follow-atention/${encodeURIComponent(e)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!t.ok)throw new Error("No se pudo obtener el registro");const i=await t.json();if(i.success){S.set(e,i.data);const a=document.querySelector(`.timer-countdown[data-folio="${e}"]`);if(a){const l=x.get(e);if(l){const o=a.closest(".bg-white, .dark\\:bg-gray-800");o&&(o.outerHTML=I(l),setTimeout(()=>{N()},10))}}return i.data}return null}catch(t){return console.error(t),null}}function I(e){const t=F(e.Status);let i="",a=S.get(e.Folio)||{},l="";e.ComidaBreak&&e.TerminoComidaBreack&&(l=`
            <div class="mt-2">
                <span class="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                    ${e.ComidaBreak}
                    Regresa a las: ${new Date(e.TerminoComidaBreack).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                </span>
            </div>
        `);let o="",c="",r="Tiempo restante:",s="",p="timer-countdown";if(e.Status==="PROCESO"&&(o=a.TimeInicio||"",c=T(a.TimeEstimado)),e.Status==="ATENDIDO"){r="Tiempo total de atención:";let f=0;typeof a.TimeEjecucion<"u"&&a.TimeEjecucion!==null&&a.TimeEjecucion!==""?(f=parseInt(a.TimeEjecucion,10),isNaN(f)&&(f=0)):fetch(`/api/follow-atention/${encodeURIComponent(e.Folio)}`).then(m=>m.json()).then(m=>{if(m.success&&m.data&&m.data.TimeEjecucion!=null){S.set(e.Folio,m.data);const w=document.querySelector(`[data-folio-card="${e.Folio}"]`);w&&(w.outerHTML=I(e))}}),s=`${f} minutos`,p="timer-finalizado",i=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${r}</span>
                </div>
                <div class="font-mono text-2xl font-bold text-blue-700 ${p}">
                    ${s}
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
        `);let d="",u="",n="",y=!0,g=0;if(window.bahiaTimers[e.Folio]&&typeof window.bahiaTimers[e.Folio].pulsaciones<"u"&&(g=window.bahiaTimers[e.Folio].pulsaciones),g>=4&&(y=!1),e.Status==="PROCESO"){const f=B(e.Folio);y?u=`
                <button class="bahia-btn text-white ${f?"bg-red-700 hover:bg-red-800":"bg-violet-700 hover:bg-violet-800"} focus:ring-4 focus:ring-violet-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 ml-2 dark:${f?"bg-red-600 hover:bg-red-700":"bg-violet-600 hover:bg-violet-700"} focus:outline-none dark:focus:ring-violet-800"
                    type="button"
                    data-folio="${e.Folio}">
                    ${f?"Fin Bahía":"Inicio Bahía"}
                </button>
            `:u="";const m=window.bahiaTimers[e.Folio]&&(window.bahiaTimers[e.Folio].elapsed>0||window.bahiaTimers[e.Folio].running);n=`
            <div class="mt-2 text-center bahia-timer-container" data-folio="${e.Folio}" style="${m?"":"display:none;"}">
                <div class="text-xs text-gray-500 mb-1">Tiempo Bahía:</div>
                <div class="font-mono text-xl font-bold text-violet-700 timer-bahia" data-folio="${e.Folio}">00:00:00</div>
            </div>
        `,d=`
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <button class="finalizar-proceso-btn text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    type="button"
                    data-folio="${e.Folio}"
                    data-inicio="${a.TimeInicio||""}"
                    data-estimado="${T(a.TimeEstimado)}">
                    Finalizar Atención
                </button>
                ${u}
            </div>
        `}if(e.Status==="ATENDIDO"){r="Tiempo total de atención:";let f=0;typeof a.TimeEjecucion<"u"&&a.TimeEjecucion!==null&&a.TimeEjecucion!==""?(f=parseInt(a.TimeEjecucion,10),isNaN(f)&&(f=0)):fetch(`/api/follow-atention/${encodeURIComponent(e.Folio)}`).then(m=>m.json()).then(m=>{if(m.success&&m.data&&m.data.TimeEjecucion!=null){S.set(e.Folio,m.data);const w=document.querySelector(`[data-folio-card="${e.Folio}"]`);w&&(w.outerHTML=I(e))}}),s=`${f} minutos`,p="timer-finalizado",i=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${r}</span>
                </div>
                <div class="font-mono text-2xl font-bold text-blue-700 ${p}">
                    ${s}
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
                     data-estimado="${T(a.TimeEstimado)}">
                    <span class="text-gray-400">Cargando...</span>
                </div>
                <div class="text-sm text-gray-500">
                    Tiempo estimado: ${T(a.TimeEstimado)?T(a.TimeEstimado):"..."} minutos
                </div>
                ${n}
            </div>
        `);const v=e.Status==="ASIGNADO"?`
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button class="iniciar-atencion-btn w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                    data-folio="${e.Folio}"
                    data-maquina="${e.Maquina}">
                Iniciar Atención
            </button>
        </div>
    `:"",E=R(e.Status),b=e.Status==="AUTONOMO"?"/images/Avatar.webp":"http://128.150.102.45:8000/Intimark/Fotos%20Credenciales/"+e.Num_Mecanico+".jpg";return`
    <div class="relative max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col" data-folio-card="${e.Folio}">
         <div class="absolute -top-8 -left-8 z-10">
            <img class="w-20 h-20 rounded-full ring-4 ${E} shadow-lg object-cover bg-white"
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
                    <span>Creada: ${L(e.created_at)}</span>
                    <span>Actualizada: ${L(e.updated_at)}</span>
                </div>
                ${l}
            </div>
            ${i}
            ${d}
            ${v}
            </div>
        </div>
    `}function z(e){e=parseInt(e)||0;const t=Math.floor(e/60),i=e%60;return`${t}:${i.toString().padStart(2,"0")}`}document.getElementById("drawer-form-finalizar")||document.body.insertAdjacentHTML("beforeend",`
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
    `);document.addEventListener("click",async function(e){if(e.target&&e.target.classList.contains("finalizar-proceso-btn")){const t=e.target.getAttribute("data-folio"),i=e.target.getAttribute("data-inicio"),a=e.target.getAttribute("data-estimado");window.finalizarAtencionFolio=t,window.finalizarAtencionTimeInicio=i,window.finalizarAtencionTimeEstimado=a,await C("/api/fallas","#falla-select","Fallas"),await C("/api/causas","#causa-select","Causa"),await C("/api/acciones","#accion-select","Accion"),window.dispatchEvent(new CustomEvent("open-drawer",{detail:{id:"drawer-form-finalizar"}})),document.getElementById("drawer-form-finalizar").classList.remove("-translate-x-full")}});async function C(e,t,i){const l=await(await fetch(e)).json(),o=document.querySelector(t);o.innerHTML='<option value="">Seleccione una opción</option>'+l.map(c=>`<option value="${c[i]}">${c[i]}</option>`).join(""),$(o).val("").trigger("change"),$(o).select2({dropdownParent:$("#drawer-form-finalizar"),width:"100%"})}document.getElementById("finalizar-atencion-form").addEventListener("submit",async function(e){var v,E;e.preventDefault();const t=window.finalizarAtencionFolio,i=$("#falla-select").val(),a=$("#causa-select").val(),l=$("#accion-select").val(),o=$("#comentarios-finalizar").val();if(!i||!a||!l){Swal.fire("Error","Debe seleccionar una opción en cada catálogo.","error");return}const c=new Date,r=c.getHours().toString().padStart(2,"0")+":"+c.getMinutes().toString().padStart(2,"0"),s=document.querySelector(`.timer-countdown[data-folio="${t}"], .timer-finalizado[data-folio="${t}"]`);let p="00:00";s&&(p=s.textContent.replace("-","").trim());const d=S.get(t);let u=(d==null?void 0:d.TimeInicio)||window.finalizarAtencionTimeInicio||"";T((d==null?void 0:d.TimeEstimado)||window.finalizarAtencionTimeEstimado||"");let n=0;if(u&&r){const[b,f]=u.split(":").map(Number),[m,w]=r.split(":").map(Number);n=m*60+w-(b*60+f),n<0&&(n+=24*60)}if(O.has(t)&&(clearInterval(O.get(t)),O.delete(t)),d&&(d.TimeEjecucion=n),window.bahiaTimers[t]&&(delete window.bahiaTimers[t],A()),s){const b=(E=(v=s.parentElement)==null?void 0:v.previousElementSibling)==null?void 0:E.querySelector("span.text-gray-800");b&&(b.textContent="Tiempo total de atención:"),s.classList.remove("text-green-600","text-orange-500","text-red-600","timer-countdown"),s.classList.add("text-blue-700","timer-finalizado"),s.textContent=z(n)}if((await(await fetch("/api/finalizar-atencion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:t,falla:i,causa:a,accion:l,comentarios:o,time_final:r,time_real:p,time_ejecucion:n})})).json()).success){let b=null;x.has(t)&&(b=x.get(t).id,x.get(t).Status="ATENDIDO"),b&&await fetch("/broadcast-status-ot",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({id:b,status:"ATENDIDO"})});const f=document.getElementById("modulo-select").value;f&&await h(f),Swal.fire("¡Éxito!","Atención finalizada correctamente","success").then(async()=>{const m=`
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
            `,{value:w}=await Swal.fire({title:"Califica que tan buena fue la atención",html:m,focusConfirm:!1,preConfirm:()=>{const k=document.querySelector('input[name="satisfaccion"]:checked');return k?k.value:(Swal.showValidationMessage("Debes seleccionar una opción"),!1)},confirmButtonText:"Enviar",showCancelButton:!1,customClass:{htmlContainer:"swal2-radio-group"}});w&&(await fetch("/api/encuesta-satisfaccion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:t,encuesta:w})}),Swal.fire("¡Gracias!","Tu opinión ha sido registrada.","success"))}),document.getElementById("drawer-form-finalizar").classList.add("-translate-x-full")}else Swal.fire("Error","No se pudo finalizar la atención","error")});window.addEventListener("open-drawer",function(e){const t=e.detail.id;document.getElementById(t).classList.remove("-translate-x-full")});document.querySelectorAll("[data-drawer-hide]").forEach(e=>{e.addEventListener("click",function(){const t=e.getAttribute("aria-controls");document.getElementById(t).classList.add("-translate-x-full")})});window.bahiaTimers=window.bahiaTimers||{};function H(){const e=localStorage.getItem("bahiaTimers");if(e)try{window.bahiaTimers=JSON.parse(e)}catch{window.bahiaTimers={}}}function A(){localStorage.setItem("bahiaTimers",JSON.stringify(window.bahiaTimers))}H();function X(e,t){window.bahiaTimers[e]?(window.bahiaTimers[e].start=Date.now(),window.bahiaTimers[e].elapsed=0,window.bahiaTimers[e].running=!0,window.bahiaTimers[e].pulsaciones=t||window.bahiaTimers[e].pulsaciones||1):window.bahiaTimers[e]={start:Date.now(),elapsed:0,running:!0,pulsaciones:t||1},A()}function U(e){const t=window.bahiaTimers[e];t&&t.running&&(t.elapsed+=Math.floor((Date.now()-t.start)/1e3),t.running=!1,A())}function _(e){const t=window.bahiaTimers[e];return t?t.running?t.elapsed+Math.floor((Date.now()-t.start)/1e3):t.elapsed:0}function B(e){return!!(window.bahiaTimers[e]&&window.bahiaTimers[e].running)}async function J(e,t){try{const a=await(await fetch("/api/bahia",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:e,tipo:t})})).json();return a.success||Swal.fire("Error",a.message||"No se pudo guardar el tiempo de Bahía","error"),a}catch{return Swal.fire("Error","No se pudo guardar el tiempo de Bahía","error"),null}}async function G(e){try{return(await(await fetch(`/api/bahia-info/${encodeURIComponent(e)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}})).json()).bahia||null}catch{return null}}document.addEventListener("click",async function(e){if(e.target&&e.target.classList.contains("bahia-btn")){const t=e.target.getAttribute("data-folio"),i=await G(t);let a=i&&i.Pulsaciones?parseInt(i.Pulsaciones):0;if(a>=4)return;let l="";if(B(t)){if(a===1)l="fin";else if(a===3)l="fin1";else return;U(t)}else{if(a===0)l="inicio";else if(a===2)l="inicio1";else return;X(t,a+1)}const o=await J(t,l);o&&o.bahia&&(a=o.bahia.Pulsaciones?parseInt(o.bahia.Pulsaciones):a+1,window.bahiaTimers[t]=window.bahiaTimers[t]||{},window.bahiaTimers[t].pulsaciones=a,a>=4&&delete window.bahiaTimers[t],A());const c=document.querySelector(`[data-folio-card="${t}"]`);c&&x.has(t)&&(c.outerHTML=I(x.get(t)),setTimeout(()=>N(),10))}});function W(){for(const e of O.values())clearInterval(e);O.clear()}function N(){W(),document.querySelectorAll(".timer-countdown").forEach(e=>{const t=e.dataset.folio;let i=e.dataset.inicio,a=e.dataset.estimado;if(a=T(a),!i||!a)return;let l;if(/^\d{2}:\d{2}$/.test(i)){const[d,u]=i.split(":");l=new Date,l.setHours(parseInt(d),parseInt(u),0,0)}else l=new Date(i);const o=l.getTime()+a*60*1e3;let c=!1,r=null;function s(){const d=new Date().getTime(),u=o-d;let n,y,g=!1;if(u<4){g=!0;const E=Math.abs(u);n=Math.floor(E/(1e3*60)),y=Math.floor(E%(1e3*60)/1e3),n!==r&&(r=n,document.visibilityState==="visible"&&Swal.fire({title:"¡Atención!",text:`Se ha terminado el tiempo de atención para la OT ${t}. Han pasado ${n} minuto(s) extra.`,icon:"error",timer:4e3}))}else n=Math.floor(u/(1e3*60)),y=Math.floor(u%(1e3*60)/1e3),u<=3e5&&!c&&(c=!0,document.visibilityState==="visible"&&Swal.fire({title:"¡Atención!",text:`Quedan 5 minutos para la OT ${t}`,icon:"warning",timer:5e3}));const v=`${g?"-":""}${n}:${y.toString().padStart(2,"0")}`;e.classList.remove("text-green-600","text-orange-500","text-red-600"),g||u<=a*60*1e3*.25?e.classList.add("text-red-600"):u<=a*60*1e3*.5?e.classList.add("text-orange-500"):e.classList.add("text-green-600"),e.textContent=v}const p=setInterval(s,1e3);O.set(t,p),s()}),document.querySelectorAll(".bahia-timer-container").forEach(e=>{const t=e.dataset.folio,i=e.querySelector(".timer-bahia"),a=window.bahiaTimers[t];if(a&&(a.running||a.elapsed>0)){let l=function(){let c=_(t);const r=Math.floor(c/3600),s=Math.floor(c%3600/60),p=c%60;i.textContent=`${r.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}:${p.toString().padStart(2,"0")}`};e.style.display="",l();const o=setInterval(l,1e3);O.set(`bahia_${t}`,o)}else e.style.display="none"})}async function V(e){var p,d,u;x.clear(),e=e.filter(n=>n.Status!=="CANCELADO"&&n.Status!=="FINALIZADO"),e.forEach(n=>x.set(n.Folio,n));const t=((d=(p=document.getElementById("search-ot"))==null?void 0:p.value)==null?void 0:d.toLowerCase())||"",i=((u=document.getElementById("filter-status"))==null?void 0:u.value)||"";let a=e.slice();const l=["AUTONOMO","ASIGNADO","PROCESO","PENDIENTE","ATENDIDO"];a.sort((n,y)=>{const g=l.indexOf(n.Status),v=l.indexOf(y.Status);return(g===-1?99:g)-(v===-1?99:v)}),t&&(a=a.filter(n=>n.Folio&&n.Folio.toLowerCase().includes(t)||n.Modulo&&n.Modulo.toLowerCase().includes(t)||n.Mecanico&&n.Mecanico.toLowerCase().includes(t)||n.Supervisor&&n.Supervisor.toLowerCase().includes(t)||n.Maquina&&n.Maquina.toLowerCase().includes(t)||n.Problema&&n.Problema.toLowerCase().includes(t))),i&&(a=a.filter(n=>n.Status===i));const c=a.filter(n=>n.Status==="PROCESO").map(n=>P(n.Folio));await Promise.all(c);const r={};j.forEach(n=>r[n]=0),r.total=e.filter(n=>n.Status!=="FINALIZADO"&&n.Status!=="CANCELADO").length,e.forEach(n=>{r[n.Status]!==void 0&&r[n.Status]++}),document.getElementById("ot-pendientes")&&(document.getElementById("ot-pendientes").textContent=r.PENDIENTE),document.getElementById("ot-asignadas")&&(document.getElementById("ot-asignadas").textContent=r.ASIGNADO),document.getElementById("ot-proceso")&&(document.getElementById("ot-proceso").textContent=r.PROCESO),document.getElementById("ot-atendidas")&&(document.getElementById("ot-atendidas").textContent=r.ATENDIDO),document.getElementById("ot-autonomas")&&(document.getElementById("ot-autonomas").textContent=r.AUTONOMO),document.getElementById("ot-total")&&(document.getElementById("ot-total").textContent=r.total);const s=document.getElementById("seguimiento-ot-container");s.innerHTML=a.length?a.map(I).join(""):'<div class="col-span-full text-center text-gray-400 py-8">No hay OTs para mostrar.</div>',N()}function h(e){return fetch("/cardsAteOTs").then(t=>t.json()).then(t=>{let i=t.filter(a=>a.Modulo===e);return V(i)})}window.cargarSeguimientoOTs=h;document.addEventListener("DOMContentLoaded",function(){$("#modulo-select").select2({placeholder:"Selecciona tu módulo de atención",width:"100%"}),axios.get("/obtener-modulos").then(a=>{const l=document.getElementById("modulo-select");a.data.forEach(o=>{let c=o.Modulo||o.moduleid||o.MODULEID||o.value||o,r=o.Modulo||o.moduleid||o.MODULEID||o.value||o;if(c&&r){let s=document.createElement("option");s.value=c,s.textContent=r,l.appendChild(s)}}),$("#modulo-select").trigger("change")}),$("#modulo-select").on("change",function(){const a=this.value;a?(document.getElementById("resumen-bar").classList.remove("hidden"),document.getElementById("filtros-bar").classList.remove("hidden"),h(a)):(document.getElementById("resumen-bar").classList.add("hidden"),document.getElementById("filtros-bar").classList.add("hidden"),document.getElementById("seguimiento-ot-container").innerHTML="")});const e=document.getElementById("search-ot"),t=document.getElementById("filter-status");function i(){const a=document.getElementById("modulo-select").value;a&&h(a)}e&&e.addEventListener("input",i),t&&t.addEventListener("change",i)});document.addEventListener("click",function(e){if(e.target&&e.target.classList.contains("iniciar-atencion-btn")){const t=e.target.getAttribute("data-folio"),i=e.target.getAttribute("data-maquina");K(t,i)}});async function K(e,t){try{const i=await fetch(`/api/clases-maquina/${encodeURIComponent(t)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!i.ok)throw new Error(`HTTP error! status: ${i.status}`);const a=i.headers.get("content-type");if(!a||!a.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const l=await i.json(),o=l.clases||[],c=l.numeroMaquina||[],{value:r}=await Swal.fire({title:"Seleccionar Clase y Número de Máquina",html:`
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Clase de Máquina:</label>
                <select id="clase-select" class="swal2-select" style="width: 100%">
                    <option></option>
                    ${o.map(s=>`
                        <option value="${s.class}" data-tiempo="${s.TimeEstimado}">
                            ${s.class} (${s.TimeEstimado} min)
                        </option>
                    `).join("")}
                </select>
                <label class="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">Número de Máquina:</label>
                <select id="numero-maquina-select" class="swal2-select" style="width: 100%">
                    <option></option>
                    ${c.map(s=>`
                        <option value="${s.Remplacad}">
                            ${s.Remplacad}
                        </option>
                    `).join("")}
                </select>
            `,didOpen:()=>{$("#clase-select").select2({dropdownParent:$(".swal2-container"),placeholder:"Selecciona una clase",width:"100%"}),$("#numero-maquina-select").select2({dropdownParent:$(".swal2-container"),placeholder:"Selecciona el número de máquina",width:"100%"})},preConfirm:()=>{const s=document.getElementById("clase-select"),p=s.options[s.selectedIndex],d=document.getElementById("numero-maquina-select");return s.value?d.value?{clase:s.value,tiempo_estimado:p.dataset.tiempo,numero_maquina:d.value}:(Swal.showValidationMessage("Debes seleccionar el número de máquina"),!1):(Swal.showValidationMessage("Debes seleccionar una clase"),!1)}});r&&await Z(e,r.clase,r.tiempo_estimado,r.numero_maquina)}catch(i){console.error("Error:",i),Swal.fire("Error","No se pudieron cargar las clases de máquina","error")}}async function Z(e,t,i,a){try{const l=new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit",hour12:!1}),o=await fetch("/api/iniciar-atencion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:e,clase:t,numero_maquina:a,tiempo_estimado:i,time_inicio:l})});if(!o.ok)throw new Error(`HTTP error! status: ${o.status}`);const c=o.headers.get("content-type");if(!c||!c.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const r=await o.json();if(r.success){await fetch("/broadcast-status-ot",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({id:r.ot.id,status:"PROCESO"})}),await Swal.fire("¡Éxito!","Atención iniciada correctamente","success");const s=document.getElementById("modulo-select").value;s&&await h(s)}}catch(l){console.error("Error:",l),Swal.fire("Error","No se pudo iniciar la atención","error")}}Notification.permission==="default"&&Notification.requestPermission();document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"){const e=document.getElementById("modulo-select").value;e&&h(e)}});window.Echo.channel("asignaciones-ot").listen("AsignacionOTCreated",e=>{var i;if(e&&e.Status==="CANCELADO")return;const t=(i=document.getElementById("modulo-select"))==null?void 0:i.value;t&&h(t)}).listen("AsignacionOTReasignada",e=>{var i;if(e&&e.Status==="CANCELADO")return;const t=(i=document.getElementById("modulo-select"))==null?void 0:i.value;t&&h(t)}).listen("StatusOTUpdated",e=>{var i;if(e&&e.Status==="CANCELADO")return;const t=(i=document.getElementById("modulo-select"))==null?void 0:i.value;t&&h(t)}).listen("ComidaBreakLimpiado",e=>{var i;const t=(i=document.getElementById("modulo-select"))==null?void 0:i.value;t&&h(t)});
