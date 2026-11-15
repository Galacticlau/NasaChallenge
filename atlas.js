'use strict';

const categories = {
  modalidad: 'Modalidad de investigación',
  familia: 'Familia de proyecto',
  combustible: 'Combustibles y materiales',
  condiciones: 'Condiciones mencionadas',
  mediciones: 'Mediciones o instrumentos mencionados',
  objetivos: 'Objetivos científicos',
  plataforma: 'Plataforma de trabajo',
  ambitos: 'Área de aplicación',
};
const fields = {
  objetivos: 'Objetivos experimentales',
  combustibles_muestras_quemadores: 'Combustibles, muestras y quemadores',
  condiciones_prueba: 'Condiciones de prueba',
  factores_modificados: 'Factores modificados',
  aspectos_comunes: 'Aspectos comunes',
  sensores_mediciones: 'Sensores y mediciones',
};
const levels = {
  explicito: 'Vínculo explícito',
  inferido: 'Vínculo inferido',
};
const domains = {
  Prevención: '¿Qué condiciones favorecen la ignición o propagación? Explora materiales, atmósferas y geometrías.',
  Detección: '¿Cómo se generan, transportan o reconocen las señales del fuego? Explora humo, aerosoles e instrumentos.',
  Extinción: '¿En qué condiciones se apaga la llama? Explora límites de combustión y agentes supresores.',
};
const modalities = {
  'Investigación experimental': 'Experimental',
  'Simulación / reanálisis': 'Simulación / reanálisis',
  'Experimentos y simulación': 'Mixta',
};
const weights = { modalidad: .16, familia: .07, combustible: .26, condiciones: .18, mediciones: .17, objetivos: .16 };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const normalize = (value) => String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const option = (value, label = value) => `<option value="${esc(value)}">${esc(label)}</option>`;
const sourceLink = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
const studyButton = (study) => `<button type="button" class="study-link" data-study="${esc(study.id)}">${esc(study.nombre)}</button>`;
const chip = (review) => `<span class="evidence-chip ${review.status}">${esc(review.label)} · ${levels[review.status]}</span>`;
const empty = (message) => `<div class="empty">${esc(message)}</div>`;

async function getJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`No se pudo cargar ${path} (${response.status})`);
  return response.json();
}

function init(data, evidence) {
  const byId = new Map(data.map((study) => [study.id, study]));
  const catalogueTags = new Map(data.map((study) => [study.id,
    Object.fromEntries(Object.keys(categories).map((key) => [key, tagRecords(study, key)]))]));
  let selected = [];
  let mode = '';
  let tab = 'inicio';
  const dialog = $('#studyDialog');
  let studyOrigin;
  let outsidePointer = false;
  let featuredOnly = false;

  function tagRecords(study, key) {
    const review = evidence[study.id];
    if (key === 'ambitos') return review?.ambitos ?? [];
    if (key === 'modalidad' && study.modalidad) {
      return [{ label: study.modalidad, status: 'explicito', source: 'base', section: 'modalidad',
        reason: 'Modalidad registrada por el proyecto. Puede integrar simulación de apoyo dentro de un estudio experimental.' }];
    }
    return Object.entries(review?.etiquetas?.[key] ?? {}).map(([label, record]) => ({ label, ...record }));
  }

  function tags(study, key) {
    return catalogueTags.get(study.id)[key];
  }

  function matchesLevel(review, level) {
    return level === 'todas' || review.status === level;
  }

  function evidenceDetail(study, review) {
    const section = fields[review.section] ?? review.section;
    const excerpt = review.source === 'base' && study.atributos[review.section]?.text;
    const citation = review.source === 'base'
      ? `Base del proyecto · ${section}`
      : section;
    return `<article class="evidence-item">${chip(review)}
      <p>${esc(review.reason)}</p>
      ${excerpt ? `<p class="small">${esc(excerpt)}</p>` : ''}
      <p class="small">${citation ? `${esc(citation)} · ` : ''}${sourceLink(study.url, 'Ficha PSI')}</p></article>`;
  }

  function showTab(which) {
    tab = which;
    $('.layout').classList.toggle('is-comparing', tab === 'comparar');
    $('.layout').classList.toggle('is-home', tab === 'inicio');
    $$('.view').forEach((view) => view.classList.toggle('hidden', view.id !== tab));
    $$('.nav [data-tab]').forEach((button) => {
      button.classList.toggle('active', button.dataset.tab === tab);
      if (button.dataset.tab === tab) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    if (tab === 'comparar') renderCompare();
  }

  function navigate(which) {
    if (location.hash !== `#${which}`) history.pushState(null, '', `#${which}`);
    showTab(which);
    const panel = $(`#${which}`);
    const heading = panel.querySelector('h2');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    if ($('.nav').getBoundingClientRect().top <= 0) panel.scrollIntoView();
  }

  function readHash() {
    const hash = location.hash.slice(1);
    showTab($$('.view').some((view) => view.id === hash) ? hash : 'inicio');
  }

  function toggleSelection(id) {
    if (selected.includes(id)) selected = selected.filter((item) => item !== id);
    else if (selected.length < 3) selected.push(id);
    else {
      $$('input[data-pick]').filter((input) => input.dataset.pick === id).forEach((input) => { input.checked = false; });
      alert('Puedes comparar hasta tres investigaciones. Quita una para agregar otra.');
      return;
    }
    renderSelection();
  }

  function renderSelection() {
    $('#selectedNum').textContent = `${selected.length}/3`;
    $('#navSelection').textContent = selected.length;
    $('#navSelection').hidden = selected.length === 0;
    const compareShortcut = $('#studyCompare');
    if (compareShortcut) compareShortcut.hidden = selected.length < 2;
    $('#selectedList').innerHTML = selected.length
      ? selected.map((id) => `<div class="slot"><span>${esc(id)} · ${esc(byId.get(id).nombre)}</span><button type="button" aria-label="Quitar ${esc(id)}" data-pick="${esc(id)}">✕</button></div>`).join('')
      : '<div class="placeholder">Aún no hay investigaciones seleccionadas.</div>';
    $('#goCompare').disabled = selected.length < 2;
    $$('input[data-pick]').forEach((input) => { input.checked = selected.includes(input.dataset.pick); });
    $$('button[data-add]').forEach((button) => {
      const active = selected.includes(button.dataset.add);
      button.setAttribute('aria-pressed', active);
      button.textContent = active ? '✓ En comparación' : '+ Agregar a comparación';
    });
    if (tab === 'comparar') renderCompare();
  }

  function matchesSearch(study, query) {
    const text = [study.id, study.nombre, study.titulo, study.plataforma,
      ...Object.values(study.atributos).map((attribute) => attribute?.text)].join(' ');
    return normalize(text).includes(normalize(query.trim()));
  }

  function renderGroups() {
    const key = $('#groupBy').value;
    const level = $('#groupEvidence').value;
    const domain = key === 'ambitos' ? $('#groupDomain').value : '';
    $('#domainGroup').hidden = key !== 'ambitos';
    const filtered = data.filter((study) => (!mode || mode === study.modalidad) && matchesSearch(study, $('#search').value));
    const groups = new Map();
    const grouped = new Set();
    for (const study of filtered) {
      const choices = tags(study, key).filter((review) => matchesLevel(review, level) && (!domain || review.label === domain));
      for (const review of choices) {
        if (!groups.has(review.label)) groups.set(review.label, []);
        groups.get(review.label).push({ study, review });
        grouped.add(study.id);
      }
    }
    const sorted = [...groups].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'es'));
    $('#countGroups').textContent = `${grouped.size} con etiquetas · ${sorted.length} grupos`;
    $('#groups').innerHTML = sorted.length ? sorted.map(([label, items]) => `
      <section class="group"><div class="group-h"><h3>${esc(label)} <span class="count">${items.length}</span></h3></div>
      <div class="group-grid">${items.map(({ study, review }) => `<div class="item">
        <input type="checkbox" data-pick="${esc(study.id)}" aria-label="Seleccionar ${esc(study.id)} para comparar">
        <span class="item-text"><small>${esc(study.id)} · ${levels[review.status]}</small>${studyButton(study)}</span>
        ${sourceLink(study.url, 'PSI')}
      </div>`).join('')}</div></section>`).join('') : empty('No hay vínculos que coincidan con estos filtros.');
    renderSelection();
  }

  function areaCount(area, status) {
    return data.filter((study) => tags(study, 'ambitos')
      .some((review) => review.label === area && (!status || review.status === status))).length;
  }

  function renderDomains() {
    $('#domainCards').innerHTML = Object.entries(domains).map(([domain, description]) => {
      const counts = Object.entries(levels).map(([status, label]) =>
        `<span class="evidence-chip ${status}">${areaCount(domain, status)} · ${label}</span>`).join('');
      return `<article class="science-card"><h3>${domain}</h3><p>${description}</p><div>${counts}</div>
        <footer><button type="button" class="secondary" data-domain="${domain}">Consultar investigaciones</button></footer></article>`;
    }).join('');
  }

  function renderHome(modalityCounts) {
    $('#heroCount').textContent = data.length;

    const bar = (value, className = '') =>
      `<span class="${className}" style="--bar-width:${100 * value / data.length}%"></span>`;
    $('#homeModalities').innerHTML = modalityCounts.map(([value, label, count]) => `
      <li><button type="button" class="home-bar" data-library-mode="${esc(value)}">
        <span class="home-bar-label"><span>${label}</span><b>${count}</b></span>
        <span class="home-bar-track" aria-hidden="true">${bar(count)}</span>
      </button></li>`).join('');
    $('#homeAreas').innerHTML = Object.keys(domains).map((area) => {
      const explicit = areaCount(area, 'explicito');
      const inferred = areaCount(area, 'inferido');
      return `<li><button type="button" class="home-bar" data-domain="${area}">
        <span class="home-bar-label"><span>${area}</span><b>${areaCount(area)}</b></span>
        <span class="home-bar-track" aria-hidden="true">${bar(explicit)}${bar(inferred, 'inferido')}</span>
        <span class="small">${explicit} explícito${explicit === 1 ? '' : 's'} · ${inferred} inferido${inferred === 1 ? '' : 's'}</span>
      </button></li>`;
    }).join('');
  }

  function setLibraryFilters(domain = '', modality = '') {
    $('#librarySearch').value = '';
    $('#libraryMode').value = modality;
    $('#libraryDomain').value = domain;
    $('#libraryEvidence').value = domain ? 'todas' : 'explicito';
    featuredOnly = false;
    $('#featuredOnly').setAttribute('aria-pressed', 'false');
    renderLibrary();
  }

  function renderLibrary() {
    const domain = $('#libraryDomain').value;
    const level = $('#libraryEvidence').value;
    const modality = $('#libraryMode').value;
    $('#libraryEvidence').disabled = !domain;
    $('#clearLibrary').hidden = !(domain || modality || featuredOnly || $('#librarySearch').value.trim());
    const filtered = data.filter((study) =>
      matchesSearch(study, $('#librarySearch').value) && (!modality || study.modalidad === modality)
      && (!featuredOnly || evidence[study.id]?.tecnica)
      && (!domain || tags(study, 'ambitos').some((review) => review.label === domain && matchesLevel(review, level))));
    $('#libraryCount').textContent = `${filtered.length} de ${data.length} investigaciones`;
    $('#libraryCards').innerHTML = filtered.length ? filtered.map((study) => `
      <article class="science-card"><div class="small">${esc(study.id)} · ${esc(modalities[study.modalidad] ?? study.modalidad)}</div>
        <h3>${studyButton(study)}</h3><p>${esc(study.atributos.objetivos?.text || '')}</p>
        <div>${tags(study, 'ambitos').map(chip).join('')}</div>
        ${evidence[study.id]?.tecnica ? '<p class="small">Ficha técnica ampliada</p>' : ''}
        <footer><button class="secondary" type="button" data-add="${esc(study.id)}"></button>
          ${study.id === 'PSI-98' ? '<a class="secondary" href="psi98-saffire-dashboard.html" aria-label="Ver detalles experimentales de PSI-98">Ver detalles · Beta</a>' : ''}</footer>
      </article>`).join('') : empty('No se encontraron investigaciones con estos filtros.');
    renderSelection();
  }

  function openStudy(id, trigger) {
    const study = byId.get(id);
    const review = evidence[id];
    const technical = review?.tecnica;
    const associations = tags(study, 'ambitos');
    studyOrigin = { id, trigger, tab };
    const sections = [
      ['studyDescription', 'Descripción'],
      ...(associations.length ? [['studyDomains', 'Áreas de aplicaciones']] : []),
      ...(technical ? [['studyTechnical', 'Ficha técnica']] : []),
      ['studyEvidence', 'Etiquetas'],
      ['studySeries', 'Series temporales'],
    ];
    $('#studyJumps').innerHTML = sections.map(([id, title]) =>
      `<button type="button" class="secondary" data-section="${id}">${title}</button>`).join('');
    $('#studyDetail').innerHTML = `<div class="small">${esc(id)} · ${esc(study.modalidad)}</div>
      <h2 id="studyTitle">${esc(study.nombre)}</h2><p>${esc(study.titulo)}</p>
      <div class="detail-actions">${sourceLink(study.url, 'Abrir ficha NASA PSI')}
        ${id === 'PSI-98' ? '<a class="secondary" href="psi98-saffire-dashboard.html" aria-label="Ver detalles experimentales de PSI-98">Ver detalles · Beta</a>' : ''}
        <button class="secondary" type="button" data-add="${esc(id)}"></button>
        <button class="secondary" type="button" id="studyCompare" data-study-view="comparar" hidden>Ir a comparación</button>
        <button class="secondary" type="button" data-study-view="similares">Ver similares</button></div>
      <section id="studyDescription" class="detail-section" tabindex="-1"><h3>Descripción de la investigación</h3>
        <p>Plataforma en el campo de catálogo: ${esc(declaredPlatform(study))}.</p>
        <div class="detail-grid">${Object.entries(fields).map(([key, label]) => `<article class="science-card">
          <h4>${label}</h4><p>${esc(study.atributos[key]?.text || 'Sin datos en el catálogo')}</p>
          <div class="small">${esc(study.atributos[key]?.estado || 'Pendiente')} · Base del proyecto</div></article>`).join('')}</div></section>
      ${associations.length ? `<section id="studyDomains" class="detail-section" tabindex="-1"><h3>Áreas de aplicaciones</h3>
        <div class="science-grid">${associations.map((tag) => evidenceDetail(study, tag)).join('')}</div></section>` : ''}
      ${technical ? `<section id="studyTechnical" class="detail-section" tabindex="-1"><h3>Ficha técnica ampliada</h3>
        <div class="science-grid">${technical.values.map((item) => `<article class="science-card">
          <h4>${esc(item.label)}</h4><strong>${esc(item.value)}</strong><p class="small">${esc(item.kind)}</p>
          ${sourceLink(item.url || study.url, item.section)}</article>`).join('')}</div><p>${esc(technical.note)}</p></section>` : ''}
      <section id="studyEvidence" class="detail-section" tabindex="-1"><h3>Revisión de etiquetas</h3>
        <p class="small">${sourceLink("https://github.com/Galacticlau/NasaChallenge/blob/main/docs/metodologia.md#revisión-de-etiquetas", "Cómo incorporar evidencia")}</p>
        ${Object.keys(categories).filter((key) => key !== 'ambitos' && tags(study, key).length).map((key) => `
          <details><summary>${categories[key]}</summary>
            <div class="science-grid">${tags(study, key).map((tag) => evidenceDetail(study, tag)).join('')}</div></details>`).join('')}</section>
      <section id="studySeries" class="detail-section" tabindex="-1"><h3>Series temporales</h3>
        <p>El catálogo no incorpora una serie temporal verificada para este estudio. Consulta en la ficha PSI los archivos y publicaciones disponibles.</p></section>`;
    renderSelection();
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }

  function declaredPlatform(study) {
    const platform = study.plataforma;
    return platform && platform !== 'Not Applicable' ? platform : 'Sin plataforma declarada';
  }

  function jaccard(a, b) {
    return a.size && b.size ? [...a].filter((label) => b.has(label)).length / new Set([...a, ...b]).size : null;
  }

  const stopWords = new Set(normalize('los las una uno unos unas para sobre entre como desde esta este estos estas este sus del por con que fue son fue han cada dos tres los mas más menor mayor tanto tanto varios según bajo altas alta altas donde todas todos hacia diferentes estudios estudio investigar investigar investigación determinar evaluar mediante utilizar usando resultantes caracterizar evaluar modelo objetivo permite datos efectos efecto experimentales experimental ensayo ensayos investigación condiciones resultado resultados pruebas prueba llamas llama fuego combustible combustibles').split(' '));
  function terms(text) {
    return new Set((normalize(text).match(/[a-z]{4,}/g) ?? []).filter((word) => !stopWords.has(word)));
  }

  function similarity(a, b, exploratory) {
    const shared = [];
    let weight = 0;
    let total = 0;
    let dimensions = 0;
    for (const [key, value] of Object.entries(weights)) {
      const include = (tag) => tag.status === 'explicito' || exploratory;
      const features = (study) => new Set(tags(study, key).filter(include).map((tag) => tag.label));
      const left = features(a);
      const right = features(b);
      const overlap = jaccard(left, right);
      if (overlap === null) continue;
      dimensions++;
      weight += value;
      total += value * overlap;
      const items = [...left].filter((label) => right.has(label));
      if (items.length) shared.push({ key, items });
    }
    const lexical = jaccard(terms(a.atributos.objetivos?.text), terms(b.atributos.objetivos?.text));
    if (lexical !== null) {
      weight += .12;
      total += .12 * lexical;
    }
    // Require a second structured dimension beyond the modality before ranking a pair.
    const score = dimensions >= 2 ? Math.round(total * 100 / weight) : null;
    return { score, dimensions, shared, lexical: lexical !== null };
  }

  function renderSimilars() {
    const reference = byId.get($('#reference').value) || data[0];
    const min = Number($('#minScore').value);
    const exploratory = $('#includeInferred').checked;
    $('#referenceDetail').innerHTML = `Referencia: ${studyButton(reference)} · ${esc(reference.modalidad)}.
      El índice usa los vínculos explícitos y el vocabulario de los objetivos.${exploratory ? ' También incluye los vínculos inferidos.' : ''}`;
    const pairs = data.filter((study) => study !== reference).map((study) => ({ study, ...similarity(reference, study, exploratory) }));
    const ranked = pairs.filter(({ score }) => score !== null && score >= min).sort((a, b) => b.score - a.score || b.dimensions - a.dimensions);
    const unranked = pairs.filter(({ score }) => score === null);
    $('#similarList').innerHTML = (ranked.length ? ranked.map(({ study, score, dimensions, shared, lexical }) => `<article class="sim">
      <div class="sim-top"><div><em>${esc(study.id)}</em><h3>${studyButton(study)}</h3></div><div><strong>${score}%</strong><div class="small">${exploratory ? 'Afinidad exploratoria' : 'Afinidad documental'}</div></div></div>
      <p class="small">${dimensions} de 6 dimensiones comparables${lexical ? ' · incluye vocabulario de objetivos' : ''}</p>
      <p class="sim-desc">${shared.length ? shared.map(({ key, items }) => `<b>${categories[key]}</b>: ${esc(items.join(', '))}`).join(' · ') : 'Sin etiquetas coincidentes en las dimensiones comparadas.'}</p>
      <button class="secondary" type="button" data-add="${esc(study.id)}"></button>
      </article>`).join('') : empty('Ninguna investigación alcanza el umbral con el respaldo elegido.'))
      + (unranked.length ? `<details><summary>${unranked.length} estudios con evidencia insuficiente para puntuar</summary>
        <p class="small">Se requieren al menos dos dimensiones comparables de etiquetas.</p>
        <ul>${unranked.map(({ study }) => `<li>${esc(study.id)} · ${studyButton(study)}</li>`).join('')}</ul></details>` : '');
    renderSelection();
  }

  function compareRows() {
    return [
      ['ID y modalidad', (study) => ({ text: `${study.id} · ${study.modalidad}` })],
      ['Plataforma declarada', (study) => ({ text: declaredPlatform(study) })],
      ['Lugar del ensayo documentado', (study) => {
        const site = tags(study, 'plataforma').find((tag) => tag.source === 'psi' && tag.status === 'explicito');
        return site ? { text: site.label, estado: site.reason } : { text: 'Pendiente de revisión independiente' };
      }],
      ['Áreas de aplicaciones', (study) => ({ text: tags(study, 'ambitos').map((tag) => `${tag.label} (${levels[tag.status]})`).join(' · ') })],
      ...Object.entries(fields).map(([key, title]) => [title, (study) => study.atributos[key] ?? { text: 'Sin dato' }]),
      ['Ficha técnica ampliada', (study) => ({
        text: evidence[study.id]?.tecnica?.values.map((item) => `${item.label}: ${item.value} [${item.kind}; ${item.section}; ${item.url || study.url}]`).join(' · ')
          || 'Sin ficha ampliada',
      })],
    ].map(([label, getCell]) => [label, ...selected.map((id) => getCell(byId.get(id)))]);
  }

  function renderCompare() {
    $('#downloadCSV').disabled = selected.length < 2;
    $('#compareBody').innerHTML = selected.length < 2
      ? `<div class="empty"><p>Selecciona al menos dos investigaciones para compararlas.</p>
        <button type="button" class="secondary" data-tab="biblioteca">Buscar en la Biblioteca</button>
        <button type="button" class="secondary" data-tab="agrupar">Explorar grupos</button></div>`
      : `<div class="table-wrap"><table><thead><tr><th scope="col">Variable</th>${selected.map((id) => {
        const study = byId.get(id);
        return `<th scope="col">${esc(id)}<br>${studyButton(study)}<br>${sourceLink(study.url, 'NASA PSI')}</th>`;
      }).join('')}</tr></thead><tbody>${compareRows().map(([label, ...cells]) => `
        <tr><th scope="row">${esc(label)}</th>${cells.map(({ text, estado }) => `<td>${esc(text ?? 'Sin dato')}${estado ? `<span class="status">${esc(estado)}</span>` : ''}</td>`).join('')}</tr>`).join('')}
        </tbody></table></div><p class="hint">Los datos comparados describen investigaciones. Un parámetro de procedimiento y una medición de un ensayo tienen alcances distintos.</p>`;
  }

  function downloadCSV() {
    if (selected.length < 2) return;
    const rows = [['Variable', ...selected],
      ['Fuente PSI', ...selected.map((id) => byId.get(id).url)],
      ...compareRows().map(([label, ...cells]) => [label, ...cells.map(({ text, estado }) =>
        estado ? `${text} [${estado}]` : text)])];
    const csv = '\ufeff' + rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flame-atlas-comparacion.csv';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function setMode(value) {
    mode = value;
    $$('[data-mode]').forEach((button) => {
      button.classList.toggle('on', button.dataset.mode === mode);
      button.setAttribute('aria-pressed', button.dataset.mode === mode);
    });
    renderGroups();
  }

  const counts = Object.entries(modalities).map(([value, label]) =>
    [value, label, data.filter((study) => study.modalidad === value).length]);
  $('#modeFilters').innerHTML = [['', 'Todas', data.length], ...counts].map(([value, label, count]) =>
    `<button type="button" data-mode="${esc(value)}">${label} (${count})</button>`).join('');
  $('#catalogueSummary').textContent = counts.map(([, label, count]) => `${label} · ${count}`).join(' | ');
  $('#libraryMode').insertAdjacentHTML('beforeend', Object.entries(modalities).map(([key, value]) => option(key, value)).join(''));
  ['#libraryDomain', '#groupDomain'].forEach((selector) => {
    $(selector).insertAdjacentHTML('beforeend', Object.keys(domains).map((name) => option(name)).join(''));
  });
  $$('.evidence-select').forEach((select) => {
    select.innerHTML = Object.entries(levels).map(([key, label]) => option(key, label)).join('') + option('todas', 'Todos los vínculos');
  });
  $('#reference').innerHTML = data.map((study) => option(study.id, `${study.id} · ${study.nombre}`)).join('');

  document.addEventListener('click', ({ target }) => {
    const button = target.closest('button');
    if (!button) return;
    const { tab: view, mode: modality, pick, add, study, domain, libraryMode, section, studyView } = button.dataset;
    if (view) navigate(view);
    if (modality !== undefined) setMode(modality);
    if (pick || add) toggleSelection(pick || add);
    if (study) openStudy(study, button);
    if (domain || libraryMode) {
      setLibraryFilters(domain, libraryMode);
      navigate('biblioteca');
    }
    if (section) {
      const destination = $(`#${section}`);
      destination.focus({ preventScroll: true });
      destination.scrollIntoView({ block: 'start' });
    }
    if (studyView && studyOrigin) {
      const id = studyOrigin.id;
      studyOrigin = undefined;
      dialog.close();
      if (studyView === 'similares') {
        $('#reference').value = id;
        renderSimilars();
      }
      navigate(studyView);
    }
  });
  $('#groups').addEventListener('change', ({ target }) => {
    if (target.matches('input[data-pick]')) toggleSelection(target.dataset.pick);
  });
  ['#groupBy', '#groupEvidence', '#groupDomain'].forEach((id) => { $(id).onchange = renderGroups; });
  $('#search').oninput = renderGroups;
  $('#clearFilters').onclick = () => {
    $('#search').value = '';
    $('#groupBy').value = 'modalidad';
    $('#groupEvidence').value = 'explicito';
    $('#groupDomain').value = '';
    setMode('');
  };
  $('#librarySearch').oninput = renderLibrary;
  $('#clearLibrary').onclick = () => {
    setLibraryFilters();
    $('#librarySearch').focus();
  };
  ['#libraryMode', '#libraryDomain', '#libraryEvidence'].forEach((id) => { $(id).onchange = renderLibrary; });
  $('#featuredOnly').onclick = () => {
    featuredOnly = !featuredOnly;
    $('#featuredOnly').setAttribute('aria-pressed', featuredOnly);
    renderLibrary();
  };
  ['#reference', '#minScore', '#includeInferred'].forEach((id) => { $(id).onchange = renderSimilars; });
  $('#goCompare').onclick = () => navigate('comparar');
  $('#clearSelection').onclick = () => { selected = []; renderSelection(); };
  $('#downloadCSV').onclick = downloadCSV;
  function isBackdrop({ target, clientX, clientY }) {
    if (target !== dialog) return false;
    const { left, right, top, bottom } = dialog.getBoundingClientRect();
    return clientX < left || clientX > right || clientY < top || clientY > bottom;
  }
  dialog.addEventListener('pointerdown', (event) => {
    outsidePointer = isBackdrop(event);
  });
  dialog.addEventListener('click', (event) => {
    if (outsidePointer && isBackdrop(event)) dialog.close();
    outsidePointer = false;
  });
  dialog.addEventListener('close', () => {
    outsidePointer = false;
    if (!studyOrigin || studyOrigin.tab !== tab) return;
    const { trigger, id } = studyOrigin;
    studyOrigin = undefined;
    const opener = trigger?.isConnected ? trigger
      : $$('button[data-study]').find((button) => button.dataset.study === id && button.getClientRects().length);
    opener?.focus({ preventScroll: true });
  });
  window.addEventListener('hashchange', readHash);
  setMode('');
  renderHome(counts);
  renderDomains();
  renderLibrary();
  renderSimilars();
  readHash();
}

Promise.all([getJSON('data/investigaciones.json'), getJSON('data/evidencia.json?v=vinculos')])
  .then(([data, evidence]) => {
    if (!Array.isArray(data) || data.length === 0) throw new Error('Catálogo vacío');
    init(data, evidence);
  })
  .catch((error) => {
    console.error(error);
    $('.layout').innerHTML = empty('No se pudo cargar el catálogo. Vuelve a cargar la página o abre la versión de GitHub Pages.');
  });
