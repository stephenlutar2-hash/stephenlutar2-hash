/* Live signed-receipt counter — sums `*_receipts_total` from each flagship's
   Prometheus /metrics endpoint across the five organs, polling every 8s.
   Reed-Solomon parity protects the Khipu chain on disk (it is error-correcting
   coding, not "holographic" — no mystical claims). Event-sourced append-only log
   (not "time travel"). Quechua names are brand naming only.
   Apache-2.0 · Signed Yachay <yachay@szlholdings.dev> · Doctrine v11 LOCKED 749/14/163. */
(function () {
  const el = document.getElementById('receipt-counter');
  if (!el) return;
  const ORGANS = ['amaru', 'sentra', 'rosie', 'killinchu', 'a11oy'];
  const valEl = el.querySelector('.rc-val');
  const subEl = el.querySelector('.rc-sub');

  let displayed = 0;
  function animateTo(target) {
    const start = displayed, t0 = performance.now(), dur = 700;
    function step(now) {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      displayed = Math.round(start + (target - start) * e);
      valEl.textContent = displayed.toLocaleString();
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function parseReceipts(text) {
    // sum every metric line ending in _receipts_total (any organ prefix)
    let sum = 0, hits = 0;
    text.split('\n').forEach(line => {
      if (line.startsWith('#')) return;
      const m = line.match(/_receipts_total(?:\{[^}]*\})?\s+([0-9.eE+\-]+)/);
      if (m) { const v = parseFloat(m[1]); if (!isNaN(v)) { sum += v; hits++; } }
    });
    return hits ? sum : null;
  }

  async function poll() {
    let total = 0, live = 0;
    await Promise.all(ORGANS.map(async o => {
      try {
        const r = await fetch('https://szlholdings-' + o + '.hf.space/metrics', { cache: 'no-store', mode: 'cors' });
        if (!r.ok) return;
        const v = parseReceipts(await r.text());
        if (v !== null) { total += v; live++; }
      } catch (e) { /* organ unreachable from this device — skip */ }
    }));
    if (live > 0) {
      animateTo(total);
      subEl.innerHTML = `signed Khipu receipts · summed live from <b>${live}/5</b> organs’ <code>/metrics</code> · Reed-Solomon parity on disk`;
    } else {
      // sovereign offline fallback — be honest, do not fabricate a number
      valEl.textContent = '—';
      subEl.innerHTML = `organs unreachable from this device — counters live at each <code>/metrics</code>; the chain is append-only & RS-coded.`;
    }
  }
  poll(); setInterval(poll, 8000);
})();
