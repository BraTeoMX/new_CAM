const y="minmachdesc_data_v1";let b=null;function k(s,t){try{const r={data:t,ts:Date.now()};localStorage.setItem(s,JSON.stringify(r))}catch{}}function w(s,t){try{const r=JSON.parse(localStorage.getItem(s));return!r||!r.ts||!r.data||Date.now()-r.ts>t?null:r.data}catch{return null}}function m(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function $(s,t,r=!0){return s.slice().sort((e,a)=>e[t]<a[t]?r?-1:1:e[t]>a[t]?r?1:-1:0)}function S(s,t){let r=`
    <div class="sm:hidden">
        <label for="tabs" class="sr-only">Selecciona pestaña</label>
        <select id="tabs" class="bg-indigo-600 border-0 border-b border-gray-200 text-white text-sm rounded-t-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-indigo-700 dark:border-indigo-800 dark:placeholder-white dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-800">
            <option value="global">Global</option>
            ${t.plantas.map((o,l)=>(o.planta.toLowerCase().includes("ixtlahuaca")||o.planta.toLowerCase().includes("san bartolo"),`<option value="planta${l}">${m(o.planta)}</option>`)).join("")}
        </select>
    </div>
    <ul class="hidden text-sm font-medium text-center divide-x divide-gray-200 rounded-lg sm:flex rtl:divide-x-reverse" id="fullWidthTab" data-tabs-toggle="#fullWidthTabContent" role="tablist">
        <li class="w-full">
            <button id="global-tab" data-tabs-target="#global" type="button" role="tab" aria-controls="global" aria-selected="true"
                class="inline-block w-full p-4 rounded-ss-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:text-white dark:focus:ring-indigo-900 font-medium transition">
                <span class="material-symbols-rounded align-middle text-lg mr-1">dashboard</span> Global
            </button>
        </li>
        ${t.plantas.map((o,l)=>{let n="";return o.planta.toLowerCase().includes("ixtlahuaca")?n="factory":o.planta.toLowerCase().includes("san bartolo")?n="apartment":n="location_on",`
            <li class="w-full">
                <button id="planta${l}-tab" data-tabs-target="#planta${l}" type="button" role="tab" aria-controls="planta${l}" aria-selected="false"
                    class="inline-block w-full p-4 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:text-white dark:focus:ring-indigo-900 font-medium transition">
                    <span class="material-symbols-rounded align-middle text-lg mr-1">${n}</span> ${m(o.planta)}
                </button>
            </li>
            `}).join("")}
    </ul>
    `,e=`
    <div class="p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800" id="global" role="tabpanel" aria-labelledby="global-tab">
        <dl class="flex flex-wrap justify-center items-stretch gap-8 p-4 mx-auto text-gray-900 dark:text-white sm:p-8">
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-rounded text-4xl text-blue-500 mb-1">timer</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${t.global.minutos}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Minutos Totales</dd>
            </div>
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-rounded text-4xl text-green-500 mb-1">confirmation_number</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${t.global.tickets}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Tickets</dd>
            </div>
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-outlined text-4xl text-purple-500 mb-1">function</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${t.global.promedio_min}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Promedio Min/Ticket</dd>
            </div>
        </dl>
        <div id="global-table"></div>
    </div>
    `,a=t.plantas.map((o,l)=>{let n="";o.planta.toLowerCase().includes("ixtlahuaca")?n="factory":o.planta.toLowerCase().includes("san bartolo")?n="apartment":n="location_on";let g=o.tickets>0?Math.round(o.minutos/o.tickets*100)/100:0;return`
    <div class="hidden p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800" id="planta${l}" role="tabpanel" aria-labelledby="planta${l}-tab">
        <dl class="flex flex-wrap justify-center items-stretch gap-8 p-4 mx-auto text-gray-900 dark:text-white sm:p-8">
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-rounded text-4xl text-blue-500 mb-1">${n}</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${o.minutos}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Minutos Totales</dd>
            </div>
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-rounded text-4xl text-green-500 mb-1">confirmation_number</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${o.tickets}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Tickets</dd>
            </div>
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-outlined text-4xl text-purple-500 mb-1">function</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${g}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Promedio Min/Ticket</dd>
            </div>
        </dl>
        <div id="planta${l}-table"></div>
    </div>
    `}).join(""),d=`
    <div id="fullWidthTabContent" class="border-t border-gray-200 dark:border-gray-600">
        ${e}
        ${a}
    </div>
    `;s.innerHTML=`
        <div class="w-full bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            ${r}
            ${d}
        </div>
    `}function h(s,t,r){let e={page:1,perPage:10,sortKey:r[0].key,sortAsc:!0,search:"",fontSize:14};const a=document.getElementById(t);if(!a)return;function d(){return document.documentElement.classList.contains("dark")}if(!a._themeObserver){const n=new MutationObserver(()=>l());n.observe(document.documentElement,{attributes:!0,attributeFilter:["class"]}),a._themeObserver=n}function o(){let n=s;if(e.search){const g=e.search.toLowerCase();n=n.filter(u=>r.some(x=>(u[x.key]+"").toLowerCase().includes(g)))}return n}function l(){let n=o(),g=$(n,e.sortKey,e.sortAsc),u=Math.ceil(g.length/e.perPage),x=Math.max(1,Math.min(e.page,u||1)),f=(x-1)*e.perPage,p=g.slice(f,f+e.perPage),v=`
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
                Mostrando ${p.length} de ${n.length} resultados
            </div>
        </div>
        <div class="overflow-x-auto">
        <table class="min-w-full rounded-lg overflow-hidden border"
            style="font-size: ${e.fontSize}px;">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    ${r.map(c=>`
                        <th scope="col" class="px-4 py-3 cursor-pointer select-none group" data-sort="${c.key}">
                            <span>${c.label}</span>
                            <span class="inline-block align-middle ml-1 text-xs ${e.sortKey===c.key?"text-indigo-600 dark:text-indigo-400":"text-gray-400"}">
                                ${e.sortKey===c.key?e.sortAsc?"▲":"▼":""}
                            </span>
                        </th>
                    `).join("")}
                </tr>
            </thead>
            <tbody class="transition">
                ${p.map(c=>`
                    <tr>
                        ${r.map(i=>`
                            <td class="px-4 py-2 ${d()?"text-white":"text-black"}">
                                ${m(c[i.key]??"")}
                            </td>
                        `).join("")}
                    </tr>
                `).join("")}
            </tbody>
        </table>
        </div>
        <div class="flex justify-between items-center mt-2">
            <button class="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50" ${x===1?"disabled":""} id="${t}-prev">Anterior</button>
            <span class="text-xs text-gray-500 dark:text-gray-400">Página ${x} de ${u||1}</span>
            <button class="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50" ${x===u||u===0?"disabled":""} id="${t}-next">Siguiente</button>
        </div>
        `;a.innerHTML=v,a.querySelectorAll("th[data-sort]").forEach(c=>{c.onclick=()=>{const i=c.getAttribute("data-sort");e.sortKey===i?e.sortAsc=!e.sortAsc:(e.sortKey=i,e.sortAsc=!0),l()}}),a.querySelector(`#${t}-search`).addEventListener("input",c=>{e.search=c.target.value,e.page=1,l(),setTimeout(()=>{const i=a.querySelector(`#${t}-search`);i&&i.focus(),i&&typeof i.selectionStart=="number"&&(i.selectionStart=i.selectionEnd=i.value.length)},0)}),a.querySelector(`#${t}-prev`).onclick=()=>{e.page>1&&(e.page--,l())},a.querySelector(`#${t}-next`).onclick=()=>{e.page<u&&(e.page++,l())},a.querySelector(`#${t}-font-inc`).onclick=()=>{e.fontSize=Math.min(e.fontSize+2,32),l()},a.querySelector(`#${t}-font-dec`).onclick=()=>{e.fontSize=Math.max(e.fontSize-2,10),l()}}l()}document.addEventListener("DOMContentLoaded",async()=>{const s=document.querySelector("#minmachdesc-tabs-container");if(!s)return;s.innerHTML='<div class="minmachdesc-tabs-loader min-h-[280px] flex items-center justify-center"><div class="animate-pulse text-gray-400">Cargando...</div></div>',b=w(y,3e5);let t=!1;if(!b)try{const a=await fetch("/dashboard/minmachdesc",{credentials:"same-origin"});if(!a.ok)throw new Error("Error de red");b=await a.json(),k(y,b),t=!0}catch{s.innerHTML='<div class="text-red-500">Error al cargar datos</div>';return}S(s,b),h(b.global.detalle,"global-table",[{key:"folio",label:"Folio"},{key:"modulo",label:"Módulo"},{key:"minutos",label:"Minutos"},{key:"planta",label:"Planta"},{key:"supervisor",label:"Supervisor"}]),b.plantas.forEach((a,d)=>{h(a.detalle,`planta${d}-table`,[{key:"folio",label:"Folio"},{key:"modulo",label:"Módulo"},{key:"minutos",label:"Minutos"},{key:"supervisor",label:"Supervisor"}])});function r(a){s.querySelectorAll('[role="tabpanel"]').forEach(l=>l.classList.add("hidden")),s.querySelectorAll('[role="tab"]').forEach(l=>{l.setAttribute("aria-selected","false"),l.classList.remove("bg-indigo-800","dark:bg-indigo-900","text-white","font-bold"),l.classList.add("bg-indigo-600","dark:bg-indigo-700","text-white")});const d=s.querySelector(`[data-tabs-target="#${a}"]`),o=s.querySelector(`#${a}`);d&&(d.setAttribute("aria-selected","true"),d.classList.remove("bg-indigo-600","dark:bg-indigo-700"),d.classList.add("bg-indigo-800","dark:bg-indigo-900","font-bold","text-white")),o&&o.classList.remove("hidden")}s.querySelectorAll('[role="tab"]').forEach(a=>{a.addEventListener("click",d=>{r(a.getAttribute("data-tabs-target").replace("#",""))})});const e=s.querySelector("#tabs");e&&e.addEventListener("change",a=>{r(a.target.value)}),r("global")});
