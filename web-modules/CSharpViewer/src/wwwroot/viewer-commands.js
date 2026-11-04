(() => {
  'use strict';
  // Shared command owner for module pages. Styling stays in the viewer's shared stylesheet;
  // glyphs use the host's Font Awesome 5 Free asset rather than page-local SVG variants.
  const icons = Object.freeze({ nextPage: 'fa-chevron-down' });
  function commandButton(action, label, execute) {
    if (!Object.hasOwn(icons, action)) throw new Error('Unknown viewer command: ' + action);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary';
    const icon = document.createElement('i');
    icon.className = 'fas ' + icons[action];
    icon.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    text.textContent = label;
    button.append(icon, text);
    button.addEventListener('click', execute);
    return button;
  }
  window.CSharpViewerCommands = Object.freeze({ commandButton });
})();
