(function () {
  "use strict";
  const select = document.getElementById("ranking-year");
  const list = document.getElementById("ranking-list");
  const heading = document.getElementById("ranking-heading");
  const status = document.getElementById("ranking-status");
  const format = new Intl.NumberFormat("es-AR");
  const search = document.getElementById("headerSearch");
  if (search) search.addEventListener("submit", function (event) {
    event.preventDefault();
    const field = search.querySelector('input[name="q"]');
    location.href = "search.html?q=" + encodeURIComponent(field ? field.value.trim() : "");
  });

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  async function read(path) {
    const response = await fetch(path, {cache:"no-cache"});
    if (!response.ok) throw new Error("No se pudo cargar " + path);
    return response.json();
  }

  Promise.all([
    read("data/rankings-nacionales-2004-2026.json"),
    read("data.json")
  ]).then(function (results) {
    const rankings = results[0];
    const items = new Map();
    for (const item of results[1].items) {
      if (item.id) {
        if (items.has(item.id)) throw new Error("ID duplicado: " + item.id);
        items.set(item.id, item);
      }
    }
    const years = [...rankings.years].sort((a,b) => Number(b.year)-Number(a.year));
    if (!years.length) throw new Error("No hay rankings disponibles");
    if (new Set(years.map(y => String(y.year))).size !== years.length) {
      throw new Error("Hay anios duplicados");
    }
    document.getElementById("ranking-snapshot").hidden = true;
    for (const year of years) {
      const option = node("option", "", String(year.year) + (Number(year.year) === 2026 ? " (parcial)" : ""));
      option.value = String(year.year);
      select.append(option);
    }

    function render() {
      try {
        const year = years.find(y => String(y.year) === select.value);
        const rows = year.ranking.map(function (row) {
          const stats = row.theatrical_stats || {};
          return {
            title:row.title,
            id:row.data_id || row.id || null,
            rank:Number(row.national_rank ?? stats.national_rank),
            overall:row.overall_rank ?? stats.overall_rank,
            viewers:row.viewers ?? stats.viewers,
            embedded:row
          };
        }).filter(row => row.rank >= 1 && row.rank <= 10)
          .sort((a,b) => a.rank-b.rank);
        if (rows.length !== 10 || rows.some((row,i) => row.rank !== i+1)) {
          throw new Error("El Top 10 de este anio necesita revision");
        }
        const fragment = document.createDocumentFragment();
        for (const row of rows) {
          if (!Number.isInteger(row.viewers) || row.viewers < 0) {
            throw new Error("Cantidad de espectadores invalida");
          }
          const item = items.get(row.id);
          const card = node("li", "ranking-card");
          const content = node(item ? "a" : "div");
          if (item) content.href = "show.html?id=" + encodeURIComponent(item.id);
          const poster = node("div", "ranking-poster");
          const placeholder = node("span", "ranking-placeholder", row.title);
          poster.append(placeholder);
          const imagePath = item ? item.image : row.embedded.image;
          if (typeof imagePath === "string" && imagePath.trim()) {
            const image = node("img");
            image.alt = row.title;
            image.loading = "lazy";
            image.addEventListener("load", () => { placeholder.hidden = true; });
            image.addEventListener("error", () => { image.remove(); placeholder.hidden = false; });
            image.src = imagePath;
            poster.append(image);
          }
          poster.append(node("span", "ranking-number", String(row.rank)));
          content.append(poster, node("h3", "", item ? item.title : row.title));
          const release = (item && item.release_date) || row.embedded.release_date;
          if (typeof release === "string" && release.trim() && release.trim() !== "-") {
            const raw = release.trim();
            const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            const local = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            const dateText = iso
              ? iso[3] + "/" + iso[2] + "/" + iso[1]
              : local
                ? local[1].padStart(2, "0") + "/" + local[2].padStart(2, "0") + "/" + local[3]
                : raw;
            content.append(node("p", "ranking-release-date", dateText));
          }
          content.append(node("p", "ranking-viewers", format.format(row.viewers) + " espectadores"));
          if (row.overall !== null && row.overall !== undefined) {
            content.append(node("p", "", "Posicion general: " + row.overall));
          }
          card.append(content);
          fragment.append(card);
        }
        list.replaceChildren(fragment);
        heading.textContent = "Top 10 nacional " + year.year +
          (Number(year.year) === 2026 ? " - cifras parciales" : "");
        status.textContent = "";
        document.title = "Ranking nacional " + year.year + " - Cine Argentum";
      } catch (error) {
        list.replaceChildren();
        heading.textContent = "";
        status.textContent = error.message;
      }
    }
    const requested = new URL(location.href).searchParams.get("year");
    select.value = years.some(y => String(y.year) === requested) ? requested : String(years[0].year);
    select.disabled = false;
    render();
    select.addEventListener("change", function () {
      const url = new URL(location.href);
      url.searchParams.set("year", select.value);
      history.replaceState(null, "", url);
      render();
    });
  }).catch(function (error) {
    status.textContent = "No se pudieron cargar los rankings. " + error.message;
  });
})();
