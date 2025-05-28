let calendarData = [];
let calendarDates = [];

async function initCalendarSelects() {
    const monthSelect = document.getElementById('calendar-month');
    const yearSelect = document.getElementById('calendar-year');
    const daySelect = document.getElementById('calendar-day');
    if (!monthSelect || !yearSelect || !daySelect) return;

    try {
        calendarData = await window.getCardsAteOTsData();
        calendarDates = calendarData
            .map(item => item.created_at)
            .filter(Boolean)
            .map(dateStr => {
                const d = new Date(dateStr);
                return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
            });

        const years = [...new Set(calendarDates.map(d => d.year))].sort((a, b) => a - b);
        yearSelect.innerHTML = '';
        years.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            yearSelect.appendChild(opt);
        });

        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        function fillMonthOptions(selectedYear) {
            monthSelect.innerHTML = '';
            const months = [...new Set(calendarDates.filter(d => d.year === selectedYear).map(d => d.month))];
            for (let m = 0; m < 12; m++) {
                if (months.includes(m)) {
                    const opt = document.createElement('option');
                    opt.value = m;
                    opt.textContent = monthNames[m];
                    monthSelect.appendChild(opt);
                }
            }
        }
        function fillDayOptions(selectedYear, selectedMonth) {
            daySelect.innerHTML = '';
            const optAll = document.createElement('option');
            optAll.value = '';
            optAll.textContent = 'Todos';
            daySelect.appendChild(optAll);
            const days = [...new Set(calendarDates.filter(d => d.year === selectedYear && d.month === selectedMonth).map(d => d.day))].sort((a, b) => a - b);
            days.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = d;
                daySelect.appendChild(opt);
            });
        }

        const now = new Date();
        let currentYear = now.getFullYear();
        let currentMonth = now.getMonth();
        if (![...yearSelect.options].some(o => Number(o.value) === currentYear)) {
            currentYear = Number(yearSelect.options[0]?.value);
        }
        fillMonthOptions(currentYear);
        if (![...monthSelect.options].some(o => Number(o.value) === currentMonth)) {
            currentMonth = Number(monthSelect.options[0]?.value);
        }
        yearSelect.value = currentYear;
        monthSelect.value = currentMonth;
        fillDayOptions(currentYear, currentMonth);
        daySelect.value = '';

        function dispatchCalendarChange() {
            const detail = {
                year: Number(yearSelect.value),
                month: Number(monthSelect.value),
                day: daySelect.value ? Number(daySelect.value) : null
            };
            window.dispatchEvent(new CustomEvent('calendar:change', { detail }));
        }

        dispatchCalendarChange();

        yearSelect.addEventListener('change', () => {
            fillMonthOptions(Number(yearSelect.value));
            monthSelect.value = monthSelect.options[0]?.value;
            fillDayOptions(Number(yearSelect.value), Number(monthSelect.value));
            daySelect.value = '';
            dispatchCalendarChange();
        });
        monthSelect.addEventListener('change', () => {
            fillDayOptions(Number(yearSelect.value), Number(monthSelect.value));
            daySelect.value = '';
            dispatchCalendarChange();
        });
        daySelect.addEventListener('change', () => {
            dispatchCalendarChange();
        });

    } catch (e) {
        const now = new Date();
        yearSelect.innerHTML = `<option value="${now.getFullYear()}">${now.getFullYear()}</option>`;
        monthSelect.innerHTML = `<option value="${now.getMonth()}">${['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][now.getMonth()]}</option>`;
        daySelect.innerHTML = `<option value="">Todos</option>`;
        window.dispatchEvent(new Event('calendar:change'));
    }
}

// No es necesario cambiar nada aquí, el ajuste se hace en efectividad.js
document.addEventListener('DOMContentLoaded', initCalendarSelects);
