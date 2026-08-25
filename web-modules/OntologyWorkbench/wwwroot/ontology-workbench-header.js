(function () {
  'use strict';

  const host = document.querySelector('[data-ontology-workbench-header]');
  if (!host) return;

  const harness = location.pathname.startsWith('/harness/');
  const routes = harness
    ? { grammar: '/harness/', runner: '/harness/method-runner', search: '/harness/ontology-search', critics: '/harness/critic-settings' }
    : { grammar: '/web-modules/OntologyWorkbench/workbench', runner: '/web-modules/OntologyWorkbench/method-runner', search: '/web-modules/OntologyWorkbench/ontology-search', critics: '/web-modules/OntologyWorkbench/critic-settings' };
  const active = host.dataset.page || '';
  const items = [
    ['grammar', 'Grammar'],
    ['runner', 'Method runner'],
    ['search', 'Ontology search'],
    ['critics', 'Critic settings']
  ];

  if (!document.querySelector('link[data-ontology-workbench-header-styles]')) {
    const styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.href = '/web-modules/OntologyWorkbench/ontology-workbench-header.css';
    styles.dataset.ontologyWorkbenchHeaderStyles = '';
    document.head.appendChild(styles);
  }

  host.className = 'owb-header';
  host.innerHTML = `<div class="owb-header__inner"><a class="owb-header__brand" href="${routes.grammar}"><span class="owb-header__mark" aria-hidden="true">O</span><span>Ontology Workbench</span></a><nav class="owb-header__nav" aria-label="Ontology Workbench"><div class="owb-header__links">${items.map(([key, label]) => `<a href="${routes[key]}"${key === active ? ' class="is-active" aria-current="page"' : ''}>${label}</a>`).join('')}</div><span class="owb-header__build">Workbench build 2026.08.25.8</span></nav></div>`;
})();
