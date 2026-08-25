(function () {
  'use strict';

  const host = document.querySelector('[data-ontology-workbench-header]');
  if (!host) return;

  const externalBaseUrl = (host.dataset.baseUrl || '').replace(/\/$/, '');
  const harness = externalBaseUrl.length > 0 || location.pathname.startsWith('/harness/');
  const routeBase = externalBaseUrl || '';
  const routes = harness
    ? { grammar: routeBase + '/harness/', runner: routeBase + '/harness/method-runner', search: routeBase + '/harness/ontology-search', settings: routeBase + '/harness/settings', critics: routeBase + '/harness/critic-settings' }
    : { grammar: '/web-modules/OntologyWorkbench/workbench', runner: '/web-modules/OntologyWorkbench/method-runner', search: '/web-modules/OntologyWorkbench/ontology-search', critics: '/web-modules/OntologyWorkbench/critic-settings' };
  const active = host.dataset.page || '';
  const items = [
    ['grammar', 'Grammar'],
    ['runner', 'Method runner'],
    ['search', 'Ontology search']
  ];
  if (harness) items.push(['settings', 'Settings']);
  if (!harness) items.push(['critics', 'Critic settings']);

  if (!document.querySelector('link[data-ontology-workbench-header-styles]')) {
    const styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.href = routeBase + '/web-modules/OntologyWorkbench/ontology-workbench-header.css';
    styles.dataset.ontologyWorkbenchHeaderStyles = '';
    document.head.appendChild(styles);
  }

  host.className = 'owb-header';
  host.innerHTML = `<div class="owb-header__inner"><a class="owb-header__brand" href="${routes.grammar}"><span class="owb-header__mark" aria-hidden="true">O</span><span>Ontology Workbench</span></a><nav class="owb-header__nav" aria-label="Ontology Workbench"><div class="owb-header__links">${items.map(([key, label]) => `<a href="${routes[key]}"${key === active ? ' class="is-active" aria-current="page"' : ''}>${label}</a>`).join('')}</div><span class="owb-header__build">Workbench build 2026.08.25.12</span></nav></div>`;
})();
