const form = document.getElementById('feedback-form');
const result = document.getElementById('feedback-result');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const chips = data.getAll('chips').map(String);
  const payload = {
    sourceSessionKey: String(data.get('sourceSessionKey') || '').trim(),
    turnKey: String(data.get('turnKey') || '').trim(),
    feedback: String(data.get('feedback') || 'neutral'),
    chips,
    instruction: String(data.get('instruction') || '').trim(),
    messageText: String(data.get('messageText') || '').trim()
  };

  result.hidden = false;
  result.textContent = 'Submitting feedback review...';

  try {
    const response = await fetch('/web-modules/OfflineOntologyCritic/api/feedback/launch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    let body;
    try { body = JSON.parse(text); } catch { body = { raw: text }; }
    result.textContent = JSON.stringify(body, null, 2);
  } catch (error) {
    result.textContent = String(error && error.stack ? error.stack : error);
  }
});
