// Importación de dependencias principales
import './bootstrap';
import { Chart } from 'chart.js';
import flatpickr from 'flatpickr';

// Importación de componentes
import dashboardCard01 from './components/dashboard-card-01';
import dashboardCard02 from './components/dashboard-card-02';
import dashboardCard03 from './components/dashboard-card-03';
import dashboardCard04 from './components/dashboard-card-04';
import dashboardCard05 from './components/dashboard-card-05';
import dashboardCard06 from './components/dashboard-card-06';
import dashboardCard08 from './components/dashboard-card-08';
import dashboardCard09 from './components/dashboard-card-09';
import dashboardCard11 from './components/dashboard-card-11';

// Iniciar Livewire solo si no está inicializado
if (typeof Livewire !== 'undefined') {
    Livewire.start();
}

// Configuración global de Chart.js
Chart.defaults.font.family = '"Inter", sans-serif';
Chart.defaults.font.weight = 500;
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.displayColors = false;
Chart.defaults.plugins.tooltip.mode = 'nearest';
Chart.defaults.plugins.tooltip.intersect = false;
Chart.defaults.plugins.tooltip.position = 'nearest';
Chart.defaults.plugins.tooltip.caretSize = 0;
Chart.defaults.plugins.tooltip.caretPadding = 20;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.padding = 8;

// Función para generar un gradiente de fondo en gráficos
export const chartAreaGradient = (ctx, chartArea, colorStops) => {
    if (!ctx || !chartArea || !colorStops || colorStops.length === 0) {
        console.warn('Gradient parameters are missing. Returning transparent color.');
        return 'transparent';
    }
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    colorStops.forEach(({ stop, color }) => {
        gradient.addColorStop(stop, color);
    });
    return gradient;
};

// Registrar el plugin para el fondo de área en Chart.js
Chart.register({
    id: 'chartAreaPlugin',
    beforeDraw: (chart) => {
        const { chartArea } = chart;
        if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
            const ctx = chart.canvas.getContext('2d');
            ctx.save();
            ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
            ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
            ctx.restore();
        }
    },
});

// Función para inicializar el interruptor de modo claro/oscuro
const initLightSwitcher = () => {
    const lightSwitches = document.querySelectorAll('.light-switch');
    if (lightSwitches.length > 0) {
        lightSwitches.forEach((lightSwitch, i) => {
            if (localStorage.getItem('dark-mode') === 'true') {
                lightSwitch.checked = true;
            }
            lightSwitch.addEventListener('change', () => {
                const { checked } = lightSwitch;
                lightSwitches.forEach((el, n) => {
                    if (n !== i) {
                        el.checked = checked;
                    }
                });
                document.documentElement.classList.add('[&_*]:!transition-none');
                if (lightSwitch.checked) {
                    document.documentElement.classList.add('dark');
                    document.querySelector('html').style.colorScheme = 'dark';
                    localStorage.setItem('dark-mode', true);
                    document.dispatchEvent(new CustomEvent('darkMode', { detail: { mode: 'on' } }));
                } else {
                    document.documentElement.classList.remove('dark');
                    document.querySelector('html').style.colorScheme = 'light';
                    localStorage.setItem('dark-mode', false);
                    document.dispatchEvent(new CustomEvent('darkMode', { detail: { mode: 'off' } }));
                }
                setTimeout(() => {
                    document.documentElement.classList.remove('[&_*]:!transition-none');
                }, 1);
            });
        });
    }
};

// Inicializar flatpickr
const initFlatpickr = () => {
    flatpickr('.datepicker', {
        mode: 'range',
        static: true,
        monthSelectorType: 'static',
        dateFormat: 'M j, Y',
        defaultDate: [new Date().setDate(new Date().getDate() - 6), new Date()],
        prevArrow: '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
        nextArrow: '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z" /></svg>',
        onReady: (selectedDates, dateStr, instance) => {
            instance.element.value = dateStr.replace('to', '-');
            const customClass = instance.element.getAttribute('data-class');
            instance.calendarContainer.classList.add(customClass);
        },
        onChange: (selectedDates, dateStr, instance) => {
            instance.element.value = dateStr.replace('to', '-');
        },
    });
};

// Inicializar todo al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Inicialización de todos los componentes
    initLightSwitcher();
    initFlatpickr();

    // Inicializar los dashboards
    dashboardCard01();
    dashboardCard02();
    dashboardCard03();
    dashboardCard04();
    dashboardCard05();
    dashboardCard06();
    dashboardCard08();
    dashboardCard09();
    dashboardCard11();
});