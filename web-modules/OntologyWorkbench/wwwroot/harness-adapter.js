(function () {
  if (!window.location.pathname.startsWith('/harness/')) return;
  async function invokePreparation(methodName, request) {
    const promptMethods = ['create-annotation-document', 'render-annotated-text', 'apply-annotation-edit', 'apply-grounding-proposal', 'apply-organization-proposal'];
    const prefix = promptMethods.indexOf(methodName) >= 0 ? '/harness/api/prompt/' : '/harness/api/ontology-preparation/';
    const response = await fetch(prefix + methodName, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request || {})
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text || ('Harness request failed: ' + response.status));
    return JSON.parse(text);
  }
  window.OntologyWorkbenchService = {
    ExtractAndBindAsync: request => invokePreparation('extract-and-bind', request),
    OrganizeAsync: request => invokePreparation('organize', request),
    PrepareAllAsync: request => invokePreparation('prepare-all', request),
    CreateAnnotationDocumentAsync: request => invokePreparation('create-annotation-document', request),
    RenderAnnotatedTextAsync: request => invokePreparation('render-annotated-text', request),
    ApplyAnnotationEditAsync: request => invokePreparation('apply-annotation-edit', request),
    ApplyGroundingProposalAsync: request => invokePreparation('apply-grounding-proposal', request),
    ApplyOrganizationProposalAsync: request => invokePreparation('apply-organization-proposal', request),
    GroundAnnotationAsync: async request => {
      const response = await fetch('/harness/api/preflight/ground-annotation', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(request || {}) });
      const text = await response.text();
      if (!response.ok) throw new Error(text || ('Harness grounding failed: ' + response.status));
      return JSON.parse(text);
    },
    run: async function (_sessionKey, prototypeName, argsJson) {
      const response = await fetch('/harness/api/run/' + encodeURIComponent(prototypeName), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: argsJson || '{}'
      });
      const text = await response.text();
      if (!response.ok) throw new Error(text || ('Harness request failed: ' + response.status));
      return text;
    }
  };
})();
