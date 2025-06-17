(function(){const i="http://128.150.102.40:8020/FormGuest",o="asis-vir-flo-btn",n="tooltip-ticket";if(document.getElementById(o))return;const r=()=>{const t=document.createElement("button");t.id=o,t.type="button",t.setAttribute("aria-label","Crear ticket"),t.setAttribute("data-tooltip-target",n),t.setAttribute("data-tooltip-placement","left"),t.className=`
            fixed z-50 top-[40%] right-6 flex items-center justify-center
            bg-white dark:bg-gray-800 rounded-full
            ring-4 ring-pink-500 hover:ring-pink-700
            transition-all duration-300 shadow-xl
        `.trim(),t.style.width="80px",t.style.height="80px";const e=document.createElement("img");e.src="/images/Avatar.webp",e.alt="AI Avatar",e.className="w-20 h-20 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500",t.appendChild(e),t.addEventListener("click",()=>{try{window.location.href=i}catch(d){console.error("Error al redirigir:",d)}}),document.body.appendChild(t)},a=()=>{const t=document.createElement("div");t.id=n,t.role="tooltip",t.className=`
            absolute z-50 inline-block px-3 py-2 text-sm font-medium text-white
            transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm
            opacity-0 tooltip dark:bg-gray-700
        `.trim(),t.textContent="¿Quieres crear un ticket nuevo? ¡Haz click aquí!";const e=document.createElement("div");e.className="tooltip-arrow",t.appendChild(e),document.body.appendChild(t)};document.addEventListener("DOMContentLoaded",()=>{r(),a()})})();
