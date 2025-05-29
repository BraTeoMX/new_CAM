document.addEventListener("DOMContentLoaded",async()=>{const o=document.querySelector("#minmachdesc-tabs-container");if(!o)return;o.innerHTML='<div class="minmachdesc-tabs-loader min-h-[280px] flex items-center justify-center"><div class="animate-pulse text-gray-400">Cargando...</div></div>';let n;try{n=await(await fetch("/dashboard/minmachdesc")).json()}catch{o.innerHTML='<div class="text-red-500">Error al cargar datos</div>';return}let h=`
    <div class="sm:hidden">
        <label for="tabs" class="sr-only">Selecciona pestaña</label>
        <select id="tabs" class="bg-indigo-600 border-0 border-b border-gray-200 text-white text-sm rounded-t-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-indigo-700 dark:border-indigo-800 dark:placeholder-white dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-800">
            <option value="global">Global</option>
            ${n.plantas.map((a,t)=>(a.planta.toLowerCase().includes("ixtlahuaca")||a.planta.toLowerCase().includes("san bartolo"),`<option value="planta${t}">${a.planta}</option>`)).join("")}
        </select>
    </div>
    <ul class="hidden text-sm font-medium text-center divide-x divide-gray-200 rounded-lg sm:flex rtl:divide-x-reverse" id="fullWidthTab" data-tabs-toggle="#fullWidthTabContent" role="tablist">
        <li class="w-full">
            <button id="global-tab" data-tabs-target="#global" type="button" role="tab" aria-controls="global" aria-selected="true"
                class="inline-block w-full p-4 rounded-ss-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:text-white dark:focus:ring-indigo-900 font-medium transition">
                <span class="material-symbols-rounded align-middle text-lg mr-1">dashboard</span> Global
            </button>
        </li>
        ${n.plantas.map((a,t)=>{let l="";return a.planta.toLowerCase().includes("ixtlahuaca")?l="factory":a.planta.toLowerCase().includes("san bartolo")?l="apartment":l="location_on",`
            <li class="w-full">
                <button id="planta${t}-tab" data-tabs-target="#planta${t}" type="button" role="tab" aria-controls="planta${t}" aria-selected="false"
                    class="inline-block w-full p-4 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:text-white dark:focus:ring-indigo-900 font-medium transition">
                    <span class="material-symbols-rounded align-middle text-lg mr-1">${l}</span> ${a.planta}
                </button>
            </li>
            `}).join("")}
    </ul>
    `,v=`
    <div class="p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800" id="global" role="tabpanel" aria-labelledby="global-tab">
        <dl class="flex flex-wrap justify-center items-stretch gap-8 p-4 mx-auto text-gray-900 dark:text-white sm:p-8">
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-rounded text-4xl text-blue-500 mb-1">timer</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${n.global.minutos}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Minutos Totales</dd>
            </div>
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-rounded text-4xl text-green-500 mb-1">confirmation_number</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${n.global.tickets}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Tickets</dd>
            </div>
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-outlined text-4xl text-purple-500 mb-1">function</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${n.global.promedio_min}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Promedio Min/Ticket</dd>
            </div>
        </dl>
        <div id="global-table"></div>
    </div>
    `,k=n.plantas.map((a,t)=>{let l="";a.planta.toLowerCase().includes("ixtlahuaca")?l="factory":a.planta.toLowerCase().includes("san bartolo")?l="apartment":l="location_on";let e=a.tickets>0?Math.round(a.minutos/a.tickets*100)/100:0;return`
    <div class="hidden p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800" id="planta${t}" role="tabpanel" aria-labelledby="planta${t}-tab">
        <dl class="flex flex-wrap justify-center items-stretch gap-8 p-4 mx-auto text-gray-900 dark:text-white sm:p-8">
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-rounded text-4xl text-blue-500 mb-1">${l}</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${a.minutos}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Minutos Totales</dd>
            </div>
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-rounded text-4xl text-green-500 mb-1">confirmation_number</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${a.tickets}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Tickets</dd>
            </div>
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-outlined text-4xl text-purple-500 mb-1">function</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${e}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Promedio Min/Ticket</dd>
            </div>
        </dl>
        <div id="planta${t}-table"></div>
    </div>
    `}).join(""),w=`
    <div id="fullWidthTabContent" class="border-t border-gray-200 dark:border-gray-600">
        ${v}
        ${k}
    </div>
    `;o.innerHTML=`
        <div class="w-full bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            ${h}
            ${w}
        </div>
    `;function $(a,t,l=!0){return a.slice().sort((e,s)=>e[t]<s[t]?l?-1:1:e[t]>s[t]?l?1:-1:0)}function m(a,t,l){let e={page:1,perPage:10,sortKey:l[0].key,sortAsc:!0,search:"",fontSize:14};const s=document.getElementById(t);if(!s)return;function S(){return document.documentElement.classList.contains("dark")}if(!s._themeObserver){const d=new MutationObserver(()=>c());d.observe(document.documentElement,{attributes:!0,attributeFilter:["class"]}),s._themeObserver=d}function L(){let d=a;if(e.search){const g=e.search.toLowerCase();d=d.filter(b=>l.some(u=>(b[u.key]+"").toLowerCase().includes(g)))}return d}function c(){let d=L(),g=$(d,e.sortKey,e.sortAsc),b=Math.ceil(g.length/e.perPage),u=Math.max(1,Math.min(e.page,b||1)),f=(u-1)*e.perPage,y=g.slice(f,f+e.perPage),M=`
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                <div class="flex-1">${`
            <div class="flex gap-2 items-center mb-2">
                <button type="button" class="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none" id="${t}-font-inc" title="Aumentar tamaño de letra">
                    <span class="material-symbols-rounded align-middle">zoom_in</span>
                </button>
                <button type="button" class="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none" id="${t}-font-dec" title="Reducir tamaño de letra">
                    <span class="material-symbols-rounded align-middle">zoom_out</span>
                </button>
            </div>
            `}</div>
                <input type="text" autocomplete="off" placeholder="Buscar..." class="w-full sm:w-64 px-3 py-2 border rounded focus:ring focus:ring-indigo-200 dark:bg-gray-900 dark:text-white" id="${t}-search" value="${e.search}">
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                    Mostrando ${y.length} de ${d.length} resultados
                </div>
            </div>
            <div class="overflow-x-auto">
            <table class="min-w-full rounded-lg overflow-hidden border"
                style="font-size: ${e.fontSize}px;">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        ${l.map(i=>`
                            <th scope="col" class="px-4 py-3 cursor-pointer select-none group" data-sort="${i.key}">
                                <span>${i.label}</span>
                                <span class="inline-block align-middle ml-1 text-xs ${e.sortKey===i.key?"text-indigo-600 dark:text-indigo-400":"text-gray-400"}">
                                    ${e.sortKey===i.key?e.sortAsc?"▲":"▼":""}
                                </span>
                            </th>
                        `).join("")}
                    </tr>
                </thead>
                <tbody class="transition">
                    ${y.map(i=>`
                        <tr>
                            ${l.map(r=>`
                                <td class="px-4 py-2 ${S()?"text-white":"text-black"}">
                                    ${i[r.key]??""}
                                </td>
                            `).join("")}
                        </tr>
                    `).join("")}
                </tbody>
            </table>
            </div>
            <div class="flex justify-between items-center mt-2">
                <button class="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50" ${u===1?"disabled":""} id="${t}-prev">Anterior</button>
                <span class="text-xs text-gray-500 dark:text-gray-400">Página ${u} de ${b||1}</span>
                <button class="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50" ${u===b||b===0?"disabled":""} id="${t}-next">Siguiente</button>
            </div>
            `;s.innerHTML=M,s.querySelectorAll("th[data-sort]").forEach(i=>{i.onclick=()=>{const r=i.getAttribute("data-sort");e.sortKey===r?e.sortAsc=!e.sortAsc:(e.sortKey=r,e.sortAsc=!0),c()}}),s.querySelector(`#${t}-search`).addEventListener("input",i=>{e.search=i.target.value,e.page=1,c(),setTimeout(()=>{const r=s.querySelector(`#${t}-search`);r&&r.focus(),r&&typeof r.selectionStart=="number"&&(r.selectionStart=r.selectionEnd=r.value.length)},0)}),s.querySelector(`#${t}-prev`).onclick=()=>{e.page>1&&(e.page--,c())},s.querySelector(`#${t}-next`).onclick=()=>{e.page<b&&(e.page++,c())},s.querySelector(`#${t}-font-inc`).onclick=()=>{e.fontSize=Math.min(e.fontSize+2,32),c()},s.querySelector(`#${t}-font-dec`).onclick=()=>{e.fontSize=Math.max(e.fontSize-2,10),c()}}c()}m(n.global.detalle,"global-table",[{key:"folio",label:"Folio"},{key:"modulo",label:"Módulo"},{key:"minutos",label:"Minutos"},{key:"planta",label:"Planta"},{key:"supervisor",label:"Supervisor"}]),n.plantas.forEach((a,t)=>{m(a.detalle,`planta${t}-table`,[{key:"folio",label:"Folio"},{key:"modulo",label:"Módulo"},{key:"minutos",label:"Minutos"},{key:"supervisor",label:"Supervisor"}])});function x(a){o.querySelectorAll('[role="tabpanel"]').forEach(e=>e.classList.add("hidden")),o.querySelectorAll('[role="tab"]').forEach(e=>{e.setAttribute("aria-selected","false"),e.classList.remove("bg-indigo-800","dark:bg-indigo-900","text-white","font-bold"),e.classList.add("bg-indigo-600","dark:bg-indigo-700","text-white")});const t=o.querySelector(`[data-tabs-target="#${a}"]`),l=o.querySelector(`#${a}`);t&&(t.setAttribute("aria-selected","true"),t.classList.remove("bg-indigo-600","dark:bg-indigo-700"),t.classList.add("bg-indigo-800","dark:bg-indigo-900","font-bold","text-white")),l&&l.classList.remove("hidden")}o.querySelectorAll('[role="tab"]').forEach(a=>{a.addEventListener("click",t=>{x(a.getAttribute("data-tabs-target").replace("#",""))})});const p=o.querySelector("#tabs");p&&p.addEventListener("change",a=>{x(a.target.value)}),x("global")});
