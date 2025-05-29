document.addEventListener("DOMContentLoaded",async()=>{const s=document.querySelector("#minmachdesc-tabs-container");if(!s)return;s.innerHTML='<div class="minmachdesc-tabs-loader min-h-[280px] flex items-center justify-center"><div class="animate-pulse text-gray-400">Cargando...</div></div>';let i;try{i=await(await fetch("/dashboard/minmachdesc")).json()}catch{s.innerHTML='<div class="text-red-500">Error al cargar datos</div>';return}let h=`
    <div class="sm:hidden">
        <label for="tabs" class="sr-only">Selecciona pestaña</label>
        <select id="tabs" class="bg-indigo-600 border-0 border-b border-gray-200 text-white text-sm rounded-t-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-indigo-700 dark:border-indigo-800 dark:placeholder-white dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-800">
            <option value="global">Global</option>
            ${i.plantas.map((e,a)=>(e.planta.toLowerCase().includes("ixtlahuaca")||e.planta.toLowerCase().includes("san bartolo"),`<option value="planta${a}">${e.planta}</option>`)).join("")}
        </select>
    </div>
    <ul class="hidden text-sm font-medium text-center divide-x divide-gray-200 rounded-lg sm:flex rtl:divide-x-reverse" id="fullWidthTab" data-tabs-toggle="#fullWidthTabContent" role="tablist">
        <li class="w-full">
            <button id="global-tab" data-tabs-target="#global" type="button" role="tab" aria-controls="global" aria-selected="true"
                class="inline-block w-full p-4 rounded-ss-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:text-white dark:focus:ring-indigo-900 font-medium transition">
                <span class="material-symbols-rounded align-middle text-lg mr-1">dashboard</span> Global
            </button>
        </li>
        ${i.plantas.map((e,a)=>{let l="";return e.planta.toLowerCase().includes("ixtlahuaca")?l="factory":e.planta.toLowerCase().includes("san bartolo")?l="apartment":l="location_on",`
            <li class="w-full">
                <button id="planta${a}-tab" data-tabs-target="#planta${a}" type="button" role="tab" aria-controls="planta${a}" aria-selected="false"
                    class="inline-block w-full p-4 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:text-white dark:focus:ring-indigo-900 font-medium transition">
                    <span class="material-symbols-rounded align-middle text-lg mr-1">${l}</span> ${e.planta}
                </button>
            </li>
            `}).join("")}
    </ul>
    `,k=`
    <div class="p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800" id="global" role="tabpanel" aria-labelledby="global-tab">
        <dl class="flex flex-wrap justify-center items-stretch gap-8 p-4 mx-auto text-gray-900 dark:text-white sm:p-8">
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-rounded text-4xl text-blue-500 mb-1">timer</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${i.global.minutos}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Minutos Totales</dd>
            </div>
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-rounded text-4xl text-green-500 mb-1">confirmation_number</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${i.global.tickets}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Tickets</dd>
            </div>
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-outlined text-4xl text-purple-500 mb-1">function</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${i.global.promedio_min}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Promedio Min/Ticket</dd>
            </div>
        </dl>
        <div id="global-table"></div>
    </div>
    `,v=i.plantas.map((e,a)=>{let l="";e.planta.toLowerCase().includes("ixtlahuaca")?l="factory":e.planta.toLowerCase().includes("san bartolo")?l="apartment":l="location_on";let t=e.tickets>0?Math.round(e.minutos/e.tickets*100)/100:0;return`
    <div class="hidden p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800" id="planta${a}" role="tabpanel" aria-labelledby="planta${a}-tab">
        <dl class="flex flex-wrap justify-center items-stretch gap-8 p-4 mx-auto text-gray-900 dark:text-white sm:p-8">
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-rounded text-4xl text-blue-500 mb-1">${l}</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${e.minutos}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Minutos Totales</dd>
            </div>
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-rounded text-4xl text-green-500 mb-1">confirmation_number</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${e.tickets}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Tickets</dd>
            </div>
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-outlined text-4xl text-purple-500 mb-1">function</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${t}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Promedio Min/Ticket</dd>
            </div>
        </dl>
        <div id="planta${a}-table"></div>
    </div>
    `}).join(""),w=`
    <div id="fullWidthTabContent" class="border-t border-gray-200 dark:border-gray-600">
        ${k}
        ${v}
    </div>
    `;s.innerHTML=`
        <div class="w-full bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            ${h}
            ${w}
        </div>
    `;function $(e,a,l=!0){return e.slice().sort((t,o)=>t[a]<o[a]?l?-1:1:t[a]>o[a]?l?1:-1:0)}function p(e,a,l){let t={page:1,perPage:10,sortKey:l[0].key,sortAsc:!0,search:""};const o=document.getElementById(a);if(!o)return;function L(){let n=e;if(t.search){const g=t.search.toLowerCase();n=n.filter(d=>l.some(c=>(d[c.key]+"").toLowerCase().includes(g)))}return n}function b(){let n=L(),g=$(n,t.sortKey,t.sortAsc),d=Math.ceil(g.length/t.perPage),c=Math.max(1,Math.min(t.page,d||1)),f=(c-1)*t.perPage,y=g.slice(f,f+t.perPage),j=`
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                <input type="text" placeholder="Buscar..." class="w-full sm:w-64 px-3 py-2 border rounded focus:ring focus:ring-indigo-200 dark:bg-gray-900 dark:text-white" id="${a}-search" value="${t.search}">
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                    Mostrando ${y.length} de ${n.length} resultados
                </div>
            </div>
            <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 border">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        ${l.map(r=>`
                            <th scope="col" class="px-4 py-3 cursor-pointer select-none group" data-sort="${r.key}">
                                <span>${r.label}</span>
                                <span class="inline-block align-middle ml-1 text-xs ${t.sortKey===r.key?"text-indigo-600 dark:text-indigo-400":"text-gray-400"}">
                                    ${t.sortKey===r.key?t.sortAsc?"▲":"▼":""}
                                </span>
                            </th>
                        `).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${y.map(r=>`
                        <tr>
                            ${l.map(x=>`<td class="px-4 py-2">${r[x.key]??""}</td>`).join("")}
                        </tr>
                    `).join("")}
                </tbody>
            </table>
            </div>
            <div class="flex justify-between items-center mt-2">
                <button class="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50" ${c===1?"disabled":""} id="${a}-prev">Anterior</button>
                <span class="text-xs text-gray-500 dark:text-gray-400">Página ${c} de ${d||1}</span>
                <button class="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50" ${c===d||d===0?"disabled":""} id="${a}-next">Siguiente</button>
            </div>
            `;o.innerHTML=j,o.querySelectorAll("th[data-sort]").forEach(r=>{r.onclick=()=>{const x=r.getAttribute("data-sort");t.sortKey===x?t.sortAsc=!t.sortAsc:(t.sortKey=x,t.sortAsc=!0),b()}}),o.querySelector(`#${a}-search`).oninput=r=>{t.search=r.target.value,t.page=1,b()},o.querySelector(`#${a}-prev`).onclick=()=>{t.page>1&&(t.page--,b())},o.querySelector(`#${a}-next`).onclick=()=>{t.page<d&&(t.page++,b())}}b()}p(i.global.detalle,"global-table",[{key:"folio",label:"Folio"},{key:"modulo",label:"Módulo"},{key:"minutos",label:"Minutos"},{key:"planta",label:"Planta"},{key:"supervisor",label:"Supervisor"}]),i.plantas.forEach((e,a)=>{p(e.detalle,`planta${a}-table`,[{key:"folio",label:"Folio"},{key:"modulo",label:"Módulo"},{key:"minutos",label:"Minutos"},{key:"supervisor",label:"Supervisor"}])});function u(e){s.querySelectorAll('[role="tabpanel"]').forEach(t=>t.classList.add("hidden")),s.querySelectorAll('[role="tab"]').forEach(t=>{t.setAttribute("aria-selected","false"),t.classList.remove("bg-indigo-800","dark:bg-indigo-900","text-white","font-bold"),t.classList.add("bg-indigo-600","dark:bg-indigo-700","text-white")});const a=s.querySelector(`[data-tabs-target="#${e}"]`),l=s.querySelector(`#${e}`);a&&(a.setAttribute("aria-selected","true"),a.classList.remove("bg-indigo-600","dark:bg-indigo-700"),a.classList.add("bg-indigo-800","dark:bg-indigo-900","font-bold","text-white")),l&&l.classList.remove("hidden")}s.querySelectorAll('[role="tab"]').forEach(e=>{e.addEventListener("click",a=>{u(e.getAttribute("data-tabs-target").replace("#",""))})});const m=s.querySelector("#tabs");m&&m.addEventListener("change",e=>{u(e.target.value)}),u("global")});
