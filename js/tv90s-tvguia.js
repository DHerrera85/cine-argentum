(function () {
'use strict';

const root = document.getElementById('tv90s-tv-guia');
if (!root) return;

const daySelect = document.getElementById('tvguia-day');
const timeInput = document.getElementById('tvguia-time');
const list = document.getElementById('tvguia-list');

const prevHour = document.getElementById('tvguia-prev-hour');
const nextHour = document.getElementById('tvguia-next-hour');

function changeHour(delta) {
  const parts = timeInput.value.split(':').map(Number);
  if (parts.length !== 2 || parts.some(Number.isNaN)) return;

  const current = parts[0] * 60 + parts[1];
  let next;

  if (delta > 0) {
    next = (Math.floor(current / 60) + 1) * 60;
  } else {
    next = (Math.ceil(current / 60) - 1) * 60;
  }

  if (next < 720 || next > 1380) return;

  const hour = Math.floor(next / 60);

  timeInput.value = String(hour).padStart(2, '0') + ':00';
  timeInput.dispatchEvent(
    new Event('change', { bubbles: true })
  );
}

prevHour.addEventListener('click', () => changeHour(-1));
nextHour.addEventListener('click', () => changeHour(1));

const status = document.getElementById('tvguia-status');

const scrollPrev = document.getElementById('tvguia-scroll-prev');
const scrollNext = document.getElementById('tvguia-scroll-next');

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
list.addEventListener('scroll', updateScrollArrows, {passive:true});
window.addEventListener('resize', updateScrollArrows);

const scrollObserver = new MutationObserver(() => {
  list.scrollLeft = 0;
  requestAnimationFrame(updateScrollArrows);
});
scrollObserver.observe(list, {childList:true});


const days = [
  ['lunes','Lunes'], ['martes','Martes'],
  ['mi\u00e9rcoles','Mi\u00e9rcoles'],
  ['jueves','Jueves'], ['viernes','Viernes']
];

const logos = {
  'Telefe':'telefe-1990-120x120.png',
  'Canal 13':'canal13-1990-120x120.png',
  'Canal 9':'canal9-1990-120x120.png',
  'Am\u00e9rica':'america-1990-120x120px.png',
  'ATC':'ATC_logo_120x120_transparente.png'
};

const thumbs = {
  T0007:'1992-brigada-cola.webp',
  T0001:'1992-amigos-son-los-amigos.webp',
  T0004:'1992-grande-pa.webp',
  T0006:'1992-el-gordo-y-el-flaco.webp',
  T0008:'1992-amores.webp',
  T0097:'1992-soy-gina.webp',
  T0093:'1992-la-banda-del-golden-rocket.webp',
  T0098:'1992-zona-de-riesgo.webp',
  T0096:'1992-son-de-diez.webp',
  T0055:'1992-princesa.webp',
  T0054:'1992-flavia-corazon-de-tiza.webp',
  T0108:'1992-los-libonatti.webp',
  T0151:'1992-corazones-de-fuego.webp'
};

function minutes(value) {
  const parts = value.split(':').map(Number);
  return parts[0] * 60 + parts[1];
}

function active(entry, now) {
  let start = minutes(entry.start);
  let end = entry.end ? minutes(entry.end) : start + 30;
  if (end <= start) end += 1440;
  return (now >= start && now < end) ||
         (now + 1440 >= start && now + 1440 < end);
}

function el(tag, cls, value) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (value !== undefined) n.textContent = value;
  return n;
}

function render(channels) {
  list.replaceChildren();
  const day = daySelect.value;
  const now = minutes(timeInput.value);

  channels.forEach(channel => {
    const entry = channel.entries.find(e =>
      Array.isArray(e.days) &&
      e.days.includes(day) && active(e,now)
    );

    const card = el('article','tvguia-card');
    const picture = el('div','tvguia-picture');
    const logoName = logos[channel.channel];
    const logoPath = logoName
      ? 'images/logos/' + logoName : '';

    const file = entry && thumbs[entry.production_id];
    if (file) {
      const img = el('img');
      img.src = 'images/schedules-thumbnails/' + file;
      img.alt = entry.title;
      img.loading = 'lazy';
      picture.append(img);
    } else {
      const fallback = el('div','tvguia-fallback');
      if (logoPath) {
        const img = el('img');
        img.src = logoPath;
        img.alt = channel.channel;
        fallback.append(img);
      }
      picture.append(fallback);
    }

    card.append(picture);
    const info = el('div','tvguia-info');

    if (logoPath) {
      const logo = el('img','tvguia-logo');
      logo.src = logoPath;
      logo.alt = channel.channel;
      info.append(logo);
    }

    const details = el('div');
    details.append(el('div','tvguia-title',
      entry ? entry.title : 'Sin programaci\u00f3n registrada'
    ));

    if (entry) {
      details.append(el('span','tvguia-hours',
        entry.start + ' hs - ' + entry.end + ' hs'
      ));
    }

    info.append(details);
    card.append(info);
    list.append(card);
  });

  status.textContent =
    'Programaci\u00f3n de julio de 1992 \u00b7 ' +
    days.find(d => d[0] === day)[1] +
    ' \u00b7 ' + timeInput.value + ' hs';
}

const shortDays = {
  'lunes':'Lun',
  'martes':'Mar',
  'mi\u00e9rcoles':'Mi\u00e9',
  'jueves':'Jue',
  'viernes':'Vie'
};

days.forEach(([value,label]) => {
  const option = el('option','',shortDays[value] || label);
  option.value = value;
  daySelect.append(option);
});

const formatter = new Intl.DateTimeFormat('en-US',{
  timeZone:'America/Argentina/Buenos_Aires',
  weekday:'long', hour:'2-digit', minute:'2-digit',
  hourCycle:'h23'
});
const parts = Object.fromEntries(
  formatter.formatToParts(new Date())
    .filter(p => p.type !== 'literal')
    .map(p => [p.type,p.value])
);
const weekday = {
  monday:'lunes',tuesday:'martes',
  wednesday:'mi\u00e9rcoles',thursday:'jueves',
  friday:'viernes'
};
daySelect.value = weekday[parts.weekday.toLowerCase()] || 'lunes';
timeInput.value = parts.hour + ':' + parts.minute;

Promise.all([
  fetch('schedules.json').then(r => {
    if (!r.ok) throw new Error('No se pudo cargar schedules.json');
    return r.json();
  })
]).then(([data]) => {
  const period = data.schedules.find(
    p => p.id === 'schedule-1992-07'
  );
  if (!period) throw new Error('Falta julio de 1992');
  const update = () => render(period.channels);
  daySelect.addEventListener('change',update);
  timeInput.addEventListener('change',update);
  update();
}).catch(error => {
  status.textContent = error.message;
});
})();
