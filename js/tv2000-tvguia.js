(function () {
  'use strict';

  const root = document.getElementById('tv2000-tv-guia');
  if (!root) return;

  const daySelect = document.getElementById('tv2000-guia-day');
  const timeInput = document.getElementById('tv2000-guia-time');
  const list = document.getElementById('tv2000-guia-list');
  const periodSelect = document.getElementById('tv2000-guia-period');
  let currentPeriod = null;

  const prevHour = document.getElementById('tv2000-guia-prev-hour');
  const nextHour = document.getElementById('tv2000-guia-next-hour');

  /* tvguia-smart-navigation-v1 */
  let navigationChannels = [];

  function availableStarts(channels, day) {
    const starts = new Set();

    channels.forEach(channel => {
      channel.entries.forEach(entry => {
        if (
          !matchesDay(entry, day) ||
          !entry.start
        ) return;

        const value = minutes(entry.start);

        if (
          Number.isFinite(value) &&
          value >= 0 &&
          value < 1440
        ) {
          starts.add(value);
        }
      });
    });

    return Array.from(starts).sort((a, b) => a - b);
  }

  function changeHour(delta) {
    if (!navigationChannels.length) return;

    const current = minutes(timeInput.value);
    if (!Number.isFinite(current)) return;

    const starts = availableStarts(
      navigationChannels,
      daySelect.value
    );

    const next = delta > 0
      ? starts.find(value => value > current)
      : starts.slice().reverse().find(value => value < current);

    if (next === undefined) return;

    const hour = String(Math.floor(next / 60)).padStart(2, '0');
    const minute = String(next % 60).padStart(2, '0');

    timeInput.value = hour + ':' + minute;

    timeInput.dispatchEvent(
      new Event('change', { bubbles: true })
    );
  }

  prevHour.addEventListener('click', () => changeHour(-1));
  nextHour.addEventListener('click', () => changeHour(1));

  const status = document.getElementById('tv2000-guia-status');

  const scrollPrev = document.getElementById('tv2000-guia-scroll-prev');
  const scrollNext = document.getElementById('tv2000-guia-scroll-next');

  function updateScrollArrows() {
    const max = Math.max(0, list.scrollWidth - list.clientWidth);
    scrollPrev.disabled = list.scrollLeft <= 2;
    scrollNext.disabled = list.scrollLeft >= max - 2;
  }

  function scrollCards(direction) {
    const card = list.querySelector('.tvguia-card');
    if (!card) return;

    const gap = parseFloat(getComputedStyle(list).gap) || 0;
    const distance = card.getBoundingClientRect().width + gap;

    list.scrollBy({
      left: direction * distance,
      behavior: 'smooth'
    });
  }

  scrollPrev.addEventListener('click', () => scrollCards(-1));
  scrollNext.addEventListener('click', () => scrollCards(1));
  list.addEventListener('scroll', updateScrollArrows, { passive: true });
  window.addEventListener('resize', updateScrollArrows);

  const scrollObserver = new MutationObserver(() => {
    list.scrollLeft = 0;
    requestAnimationFrame(updateScrollArrows);
  });
  scrollObserver.observe(list, { childList: true });


  const days = [
    ['lunes', 'Lunes'], ['martes', 'Martes'],
    ['mi\u00e9rcoles', 'Mi\u00e9rcoles'],
    ['jueves', 'Jueves'], ['viernes', 'Viernes']
  ];

  const logosByPeriod = {
    'schedule-2008-10': {
      'Telefe': 'telefe-logo-2000s.png',
      'Canal 13': 'canal-13-logo-120x120.png',
      'Canal 9': 'Canal_9_Argentina_2007-2017.webp',
      'Am\u00e9rica': 'america-logo-120x120.png',
      'Canal 7': 'tv-publica-logo-120x120.png'
    }
  };

  const thumbs = {
    T0007: '1992-brigada-cola.webp',
    T0001: '1992-amigos-son-los-amigos.webp',
    T0004: '1992-grande-pa.webp',
    T0006: '1992-el-gordo-y-el-flaco.webp',
    T0008: '1992-amores.webp',
    T0097: '1992-soy-gina.webp',
    T0093: '1992-la-banda-del-golden-rocket.webp',
    T0098: '1992-zona-de-riesgo.webp',
    T0096: '1992-son-de-diez.webp',
    T0055: '1992-princesa.webp',
    T0054: '1992-flavia-corazon-de-tiza.webp',
    T0108: '1992-los-libonatti.webp',
    T0151: '1992-corazones-de-fuego.webp',
    T0009: '1996-mi-cunado.webp',
    T0020: '1996-chiquititas.webp',
    T0024: '1996-zingara.webp',
    T0040: '1996-mi-familia-es-un-dibujo.webp',
    T0068: '1996-por-siempre-mujercitas.webp'
  };

  let productionImages = new Map();
  let productionTitles = new Map();

  function minutes(value) {
    if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) {
      return NaN;
    }

    const [hour, minute] = value.split(':').map(Number);
    return hour < 24 && minute < 60 ? hour * 60 + minute : NaN;
  }

  function matchesDay(entry, day) {
    return Array.isArray(entry.days) && (
      entry.days.includes(day) ||
      (day === 'mi\u00e9rcoles' &&
        entry.days.includes('mi\u003frcoles'))
    );
  }

  function channelName(name) {
    return name === 'Am\u003frica' ? 'Am\u00e9rica' : name;
  }

  function titleFor(entry) {
    return entry.title || productionTitles.get(entry.production_id) || '';
  }

  function activeEntry(channel, day, now) {
    const dayIndex = days.findIndex(item => item[0] === day);
    if (dayIndex < 0) return undefined;

    const offsets = [];
    if (dayIndex > 0) offsets.push(-1);
    offsets.push(0);
    if (dayIndex < days.length - 1) offsets.push(1);

    const occurrences = [];
    offsets.forEach(offset => {
      const occurrenceDay = days[dayIndex + offset][0];
      channel.entries.forEach(entry => {
        if (!matchesDay(entry, occurrenceDay)) return;

        const start = minutes(entry.start);
        if (Number.isFinite(start)) {
          occurrences.push({ entry, start: start + offset * 1440 });
        }
      });
    });

    occurrences.sort((a, b) => a.start - b.start);
    const occurrence = occurrences
      .filter(item => item.start <= now)
      .pop();

    if (!occurrence) return undefined;
    if (!occurrence.entry.end) return occurrence.entry;

    const start = minutes(occurrence.entry.start);
    let end = minutes(occurrence.entry.end);
    if (!Number.isFinite(end)) return undefined;
    if (end <= start) end += 1440;

    return now < occurrence.start + end - start
      ? occurrence.entry
      : undefined;
  }

  function el(tag, cls, value) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (value !== undefined) n.textContent = value;
    return n;
  }


  function nextStart(channel, day, now) {
    const starts = channel.entries
      .filter(entry => matchesDay(entry, day))
      .map(entry => minutes(entry.start))
      .filter(value => Number.isFinite(value))
      .sort((a, b) => a - b);

    const upcoming = starts.find(value => value > now);

    if (upcoming === undefined) return null;

    const hour = String(Math.floor(upcoming / 60)).padStart(2, '0');
    const minute = String(upcoming % 60).padStart(2, '0');

    return hour + ':' + minute;
  }

  function render(channels) {
    list.replaceChildren();
    const day = daySelect.value;
    const now = minutes(timeInput.value);

    channels.forEach(channel => {
      const entry = activeEntry(channel, day, now);

      const card = el('article', 'tvguia-card');
      const picture = el('div', 'tvguia-picture');
      const periodLogos = logosByPeriod[currentPeriod.id] || {};
      const name = channelName(channel.channel);
      const logoName = periodLogos[name];
      const logoPath = logoName
        ? 'images/logos/' + logoName : '';

      const file = entry && thumbs[entry.production_id];
      const directImage = entry && entry.image;
      const catalogImage = entry && productionImages.get(entry.production_id);
      if (directImage || catalogImage || file) {
        const img = el('img');
        img.src = directImage || catalogImage || 'images/schedules-thumbnails/' + file;
        img.alt = titleFor(entry);
        img.loading = 'lazy';
        picture.append(img);
      } else {
        const fallback = el('div', 'tvguia-fallback');
        if (logoPath) {
          const img = el('img');
          img.src = logoPath;
          img.alt = name;
          fallback.append(img);
        }
        picture.append(fallback);
      }

      card.append(picture);
      const info = el('div', 'tvguia-info');

      if (logoPath) {
        const logo = el('img', 'tvguia-logo');
        logo.src = logoPath;
        logo.alt = name;
        info.append(logo);
      }

      const details = el('div');
      details.append(el('div', 'tvguia-title',
        entry
          ? titleFor(entry)
          : (() => {
            const start = nextStart(channel, day, now);
            return start
              ? 'La programaci\u00f3n empieza a las ' + start + ' hs'
              : 'Sin programaci\u00f3n registrada';
          })()
      ));

      if (entry) {
        details.append(el('span', 'tvguia-hours',
          entry.end
            ? entry.start + ' hs - ' + entry.end + ' hs'
            : 'Desde las ' + entry.start + ' hs'
        ));
      }

      info.append(details);
      card.append(info);
      list.append(card);
    });

    status.textContent =
      '\u0050rogramaci\u00f3n de ' + currentPeriod.label + ' \u00b7 ' +
      days.find(d => d[0] === day)[1] +
      ' \u00b7 ' + timeInput.value + ' hs';
  }

  const shortDays = {
    'lunes': 'Lun',
    'martes': 'Mar',
    'mi\u00e9rcoles': 'Mi\u00e9',
    'jueves': 'Jue',
    'viernes': 'Vie'
  };

  days.forEach(([value, label]) => {
    const option = el('option', '', shortDays[value] || label);
    option.value = value;
    daySelect.append(option);
  });

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'long', hour: '2-digit', minute: '2-digit',
    hourCycle: 'h23'
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date())
      .filter(p => p.type !== 'literal')
      .map(p => [p.type, p.value])
  );
  const weekday = {
    monday: 'lunes', tuesday: 'martes',
    wednesday: 'mi\u00e9rcoles', thursday: 'jueves',
    friday: 'viernes'
  };
  daySelect.value = weekday[parts.weekday.toLowerCase()] || 'lunes';
  timeInput.value = parts.hour + ':' + parts.minute;

  Promise.all([
    fetch('schedules.json').then(r => {
      if (!r.ok) throw new Error('No se pudo cargar schedules.json');
      return r.json();
    }),
    fetch('data.json').then(r => {
      if (!r.ok) throw new Error('No se pudo cargar data.json');
      return r.json();
    })
  ]).then(([scheduleData, productionData]) => {
    productionTitles = new Map(
      productionData.items.map(item => [item.id, item.title])
    );
    productionImages = new Map(
      productionData.items
        .filter(item => item.horizontal_image)
        .map(item => [item.id, item.horizontal_image])
    );
    const periods = scheduleData.schedules.filter(period =>
      period.year >= 2000 && period.year <= 2009
    );
    periodSelect.replaceChildren();

    periods.forEach(period => {
      const option = el('option', '', period.label);
      option.value = period.id;
      periodSelect.append(option);
    });

    function selectPeriod() {
      currentPeriod = periods.find(
        period => period.id === periodSelect.value
      );

      if (!currentPeriod) return;

      navigationChannels = currentPeriod.channels;
      render(currentPeriod.channels);
    }

    periodSelect.value = 'schedule-2008-10';

    periodSelect.addEventListener('change', selectPeriod);
    daySelect.addEventListener('change', selectPeriod);
    timeInput.addEventListener('change', selectPeriod);

    selectPeriod();
  }).catch(error => {
    status.textContent = error.message;
  });
})();
