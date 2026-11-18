from pathlib import Path
import re

root = Path.cwd()
js = root / 'js' / 'juveniles-rows-autosync.js'
if not js.exists():
    raise SystemExit('Ejecutá este script desde la carpeta CineArgentum.')
s = js.read_text(encoding='utf-8-sig')
start = s.find('    function renderJuvenilesPremiereCalendar(items) {')
if start < 0:
    raise SystemExit('No se encontró la función del calendario. No se modificó nada.')
end = s.find('\n    function ', start + 10)
if end < 0:
    raise SystemExit('No se encontró el final de la función. No se modificó nada.')
old = s[start:end]
checks = ["try { $list.destroy(); }", "var selectedMonth = new Date().getMonth();", "initializeVerticalSlider(list);"]
if not all(x in old for x in checks):
    raise SystemExit('La función local difiere de la revisada. No se modificó nada.')

new = old
new = new.replace('        var entries = items.filter(function (item) {', '''        var currentYear = new Date().getFullYear();
        var today = new Date();
        today.setHours(23, 59, 59, 999);
        var sliderInstance = null;

        // Incorporar la opción general sin cambiar la navegación de meses.
        var allButton = months.querySelector('[data-month="all"]');
        if (!allButton) {
            allButton = document.createElement('button');
            allButton.type = 'button';
            allButton.className = 'juveniles-calendar-month';
            allButton.setAttribute('data-month', 'all');
            allButton.textContent = 'Todos los meses';
            months.insertBefore(allButton, months.firstChild);
        }

        var entries = items.filter(function (item) {''', 1)
new = new.replace('''            var approximate = false;

            if (!date) {
                var year = Number(item.year);
                if (Number.isInteger(year) && year >= 2000) {
                    date = new Date(year, 0, 1);
                    date.setHours(0, 0, 0, 0);
                    approximate = true;
                }
            }

            return date && date.getFullYear() >= 2000
                ? { item: item, date: date, approximate: approximate }
                : null;''', '''            return date && date.getFullYear() >= 2000 &&
                date.getFullYear() <= currentYear && date <= today
                ? { item: item, date: date }
                : null;''', 1)
new = new.replace('''        var years = Array.from(new Set(entries.map(function (entry) {
            return entry.date.getFullYear();
        }))).sort(function (a, b) { return b - a; });''', '''        var years = Array.from({ length: currentYear - 1999 }, function (_, i) {
            return currentYear - i;
        });''', 1)
new = new.replace('        var selectedMonth = new Date().getMonth();', "        var selectedMonth = 'all';", 1)
new = new.replace('''                return (!entry.approximate && entry.date.getMonth() === selectedMonth) &&
                    (year === 'all' || entry.date.getFullYear() === Number(year));''', '''                return (selectedMonth === 'all' || entry.date.getMonth() === Number(selectedMonth)) &&
                    (year === 'all' || entry.date.getFullYear() === Number(year));''', 1)
new = new.replace('''            if (window.jQuery && window.jQuery.fn && window.jQuery.fn.lightSlider) {
                var $list = window.jQuery(list);
                if ($list.hasClass('lightSlider')) {
                    try { $list.destroy(); } catch (error) { console.warn(error); }
                }
            }''', '''            // Destruir la instancia real antes de reemplazar el contenido.
            if (sliderInstance && typeof sliderInstance.destroy === 'function') {
                sliderInstance.destroy();
                sliderInstance = null;
            }''', 1)
new = new.replace('''                var formatted = entry.approximate
                    ? 'Estreno ' + date.getFullYear() + ' (fecha por confirmar)'
                    : String(date.getDate()).padStart(2, '0') + '/' +
                    String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear();''', '''                var formatted = String(date.getDate()).padStart(2, '0') + '/' +
                    String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear();''', 1)
new = new.replace('''            if (filtered.length) initializeVerticalSlider(list);''', '''            if (filtered.length) {
                list.classList.remove('cs-hidden');
                if (window.jQuery && window.jQuery.fn && window.jQuery.fn.lightSlider) {
                    sliderInstance = window.jQuery(list).lightSlider({
                        item: 5, autoWidth: false, slideMove: 1, slideMargin: 12,
                        loop: false, pager: false, controls: true,
                        enableTouch: true, enableDrag: true, freeMove: false,
                        responsive: [
                            { breakpoint: 1100, settings: { item: 4, slideMargin: 10 } },
                            { breakpoint: 768, settings: { item: 2, slideMargin: 8 } }
                        ]
                    });
                }
            }''', 1)
new = new.replace("                var active = Number(button.getAttribute('data-month')) === selectedMonth;", "                var active = button.getAttribute('data-month') === String(selectedMonth);", 1)
new = new.replace("            selectedMonth = Number(button.getAttribute('data-month'));", "            selectedMonth = button.getAttribute('data-month');", 1)
if new == old or any(x in new for x in ['try { $list.destroy(); }', 'entry.approximate', 'selectedMonth = new Date().getMonth()']):
    raise SystemExit('No se pudieron aplicar todas las correcciones; archivo intacto.')
# Avoid duplicate options on repeated initialization.
new = new.replace('''        years.forEach(function (year) {''', '''        yearSelect.querySelectorAll('option:not([value="all"])').forEach(function (option) {
            option.remove();
        });
        years.forEach(function (year) {''', 1)
js.write_text(s[:start] + new + s[end:], encoding='utf-8')
print('Corregido:', js)
print('Revisá con: git diff HEAD -- js/juveniles-rows-autosync.js')
