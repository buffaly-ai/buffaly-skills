(function () {
  if (!window.location.pathname.startsWith('/harness/')) return;
  window.OntologyWorkbenchService = {
    ExtractAndBindAsync: async request => {
      const response = await fetch('/harness/api/extract-and-bind', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(request || {}) });
      const text = await response.text();
      if (!response.ok) throw new Error(text || ('Extraction failed: ' + response.status));
      return JSON.parse(text);
    },
    GroundAsync: async request => {
      const response = await fetch('/harness/api/ground', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(request || {}) });
      const text = await response.text();
      if (!response.ok) throw new Error(text || ('Grounding failed: ' + response.status));
      return text;
    }
  };
})();
