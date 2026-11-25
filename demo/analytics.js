// Anonymous website page counts only; never bundled with the distributed tool.
function trackPageView() {
  if (location.hostname !== "webkubor.github.io" || !location.pathname.startsWith("/ai-orb/") || navigator.doNotTrack === '1') return;
  try {
    if (localStorage.getItem('core-analytics') === 'off' || localStorage.getItem('ai-orb-analytics') === 'off') return;
    void fetch('https://api.webkubor.online/v1/analytics/events', {
      method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true,
      headers: { 'content-type': 'application/json' }, signal: AbortSignal.timeout(3000),
      body: JSON.stringify({ project: 'ai-orb', event_id: crypto.randomUUID(), event: 'page.view', properties: {} }),
    }).catch(() => {});
  } catch { /* Measurement must never interrupt browsing. */ }
}

trackPageView();
