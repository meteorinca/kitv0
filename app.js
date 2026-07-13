(() => {
  const MANIFEST_URL = 'scales.json';

  let scales = [];
  let activeScaleId = null;
  let visitedIds = new Set();

  // DOM refs (app shell)
  const scaleList   = document.getElementById('scale-list');
  const contentTitle  = document.getElementById('content-title');
  const contentDesc   = document.getElementById('content-desc');
  const scaleBadge    = document.getElementById('scale-badge');
  const markdownBody  = document.getElementById('markdown-body');
  const statusText    = document.getElementById('status-text');
  const contentPanel  = document.getElementById('content-panel');
  const progressBar   = document.getElementById('progress-bar');
  const tocList       = document.getElementById('toc-list');
  const scaleNav    = document.getElementById('scale-nav');
  const btnPrev       = document.getElementById('btn-prev');
  const btnNext       = document.getElementById('btn-next');
  const scaleDots     = document.getElementById('scale-dots');
  const navLabel      = document.getElementById('nav-scale-label');
  const appEl         = document.getElementById('app');
  const landingEl     = document.getElementById('landing');
  const btnHome       = document.getElementById('btn-home');

  // ── Landing ──────────────────────────────────────────────
  window.enterCourse = function () {
    landingEl.classList.add('exit');
    setTimeout(() => {
      landingEl.style.display = 'none';
      appEl.style.display = 'flex';
      init();
    }, 600);
  };

  btnHome.addEventListener('click', () => {
    appEl.style.display = 'none';
    landingEl.style.display = 'flex';
    landingEl.classList.remove('exit');
  });

  // ── Init ─────────────────────────────────────────────────
  async function init() {
    try {
      statusText.textContent = 'Loading…';
      const resp = await fetch(MANIFEST_URL);
      if (!resp.ok) throw new Error(`Manifest fetch failed: ${resp.status}`);

      scales = await resp.json();
      if (!scales.length) throw new Error('No scales found');

      renderSidebar();
      renderScaleDots();

      const hash = window.location.hash.replace('#', '');
      const target =
        scales.find(ch => s.id === hash) ||
        scales[0];

      await loadScale(target.id);
      window.addEventListener('hashchange', onHashChange);

      statusText.textContent = `${scales.length} scales loaded`;
    } catch (err) {
      showError(err.message);
      statusText.textContent = 'Error loading manifest';
      console.error(err);
    }
  }

  // ── Scale list (sidebar) ───────────────────────────────────────────────
  function renderSidebar() {
    scaleList.innerHTML = '';
    scales.forEach((scale, idx) => {
      const item = document.createElement('li');
      item.className = 'scale-item';

      const link = document.createElement('a');
      link.href = `#${scale.id}`;
      link.className = 'scale-link';
      link.dataset.id = scale.id;

      const num = document.createElement('span');
      num.className = 'scale-link-num';
      num.textContent = String(idx).padStart(2, '0');

      const textWrapper = document.createElement('div');
      textWrapper.className = 'scale-text-content';

      const titleEl = document.createElement('div');
      titleEl.className = 'scale-title';
      titleEl.textContent = scale.title;
      textWrapper.appendChild(titleEl);

      if (scale.description) {
        const desc = document.createElement('div');
        desc.className = 'scale-desc';
        desc.textContent = scale.description;
        textWrapper.appendChild(desc);
      }

      link.appendChild(num);
      link.appendChild(textWrapper);
      item.appendChild(link);

      scaleList.appendChild(item);
    });
  }

  // ── Scale Dots ────────────────────────────────────────────
  function renderScaleDots() {
    scaleDots.innerHTML = '';
    scales.forEach(s => {
      const dot = document.createElement('div');
      dot.className = 'scale-dot';
      dot.dataset.id = s.id;
      dot.title = s.title;
      dot.addEventListener('click', () => loadScale(s.id));
      scaleDots.appendChild(dot);
    });
  }

  function updateScaleDots() {
    scaleDots.querySelectorAll('.scale-dot').forEach(dot => {
      const id = dot.dataset.id;
      dot.classList.toggle('active', id === activeScaleId);
      dot.classList.toggle('visited', visitedIds.has(id) && id !== activeScaleId);
    });
  }

  // ── Load Scale ─────────────────────────────────────────────
  async function loadScale(id) {
    const scale = scales.find(s => s.id === id);
    if (!scale) return;

    activeScaleId = scale.id;
    visitedIds.add(scale.id);

    if (window.location.hash !== `#${scale.id}`) {
      window.location.hash = scale.id;
    }

    updateActiveLink();
    updateScaleDots();

    // Set header
    const idx = scales.indexOf(scale);
    scaleBadge.textContent = `Scale ${idx}`;
    contentTitle.textContent = scale.title.replace(/^Scale \d+[–—-]\s*/i, '');
    contentDesc.textContent = scale.description || '';
    navLabel.textContent = scale.title;

    markdownBody.classList.remove('loaded');
    markdownBody.innerHTML = '<div class="loading-placeholder">Loading…</div>';
    statusText.textContent = `Fetching scale ${idx}…`;

    try {
      const resp = await fetch(scale.file);
      if (!resp.ok) throw new Error(`Failed to load ${scale.file} (${resp.status})`);

      const markdown = await resp.text();
      const prepared = preprocessMediaShortcodes(markdown);
      const html = marked.parse(prepared);

      markdownBody.innerHTML = html;
      fixRelativeMediaPaths(markdownBody, scale.file);

      if (window.renderMathInElement) {
        window.renderMathInElement(markdownBody, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }

      buildTOC();
      updateScaleNav();

      setTimeout(() => { markdownBody.classList.add('loaded'); }, 50);
      contentPanel.scrollTop = 0;
      updateProgress();

      statusText.textContent = `Scale ${idx} — ${scale.title}`;
    } catch (err) {
      showError(err.message);
      statusText.textContent = 'Error loading scale';
      console.error(err);
    }
  }

  // ── Media shortcodes ──────────────────────────────────────
  function preprocessMediaShortcodes(markdown) {
    return markdown
      .replace(/::video\[(.*?)\]\((.*?)\)/g, (_match, caption, src) => [
        '<figure class="media-card">',
        `<video controls preload="metadata" src="${escHtmlAttr(src.trim())}"></video>`,
        caption.trim() ? `<figcaption>${escHtml(caption.trim())}</figcaption>` : '',
        '</figure>'
      ].join(''))
      .replace(/::youtube\[(.*?)\]\((.*?)\)/g, (_match, caption, url) => {
        const embedUrl = toYouTubeEmbedUrl(url.trim());
        return [
          '<figure class="media-card">',
          '<div class="youtube-embed">',
          `<iframe src="${escHtmlAttr(embedUrl)}" title="${escHtmlAttr(caption.trim() || 'YouTube video')}" allowfullscreen loading="lazy"></iframe>`,
          '</div>',
          caption.trim() ? `<figcaption>${escHtml(caption.trim())}</figcaption>` : '',
          '</figure>'
        ].join('');
      })
      .replace(/::audio\[(.*?)\]\((.*?)\)/g, (_match, caption, src) => [
        '<figure class="media-card">',
        `<audio controls preload="metadata" src="${escHtmlAttr(src.trim())}"></audio>`,
        caption.trim() ? `<figcaption>${escHtml(caption.trim())}</figcaption>` : '',
        '</figure>'
      ].join(''));
  }

  function fixRelativeMediaPaths(container, filePath) {
    const base = filePath.includes('/')
      ? filePath.slice(0, filePath.lastIndexOf('/') + 1)
      : '';
    container.querySelectorAll('img[src], video[src], audio[src], iframe[src]').forEach(el => {
      const cur = el.getAttribute('src');
      if (!cur || isExternal(cur)) return;
      el.setAttribute('src', base + cur);
    });
  }

  function isExternal(p) {
    return /^(https?:\/\/|\/\/|\/|data:|mailto:|#)/.test(p);
  }

  function toYouTubeEmbedUrl(url) {
    try {
      const p = new URL(url);
      let id = '';
      if (p.hostname.includes('youtu.be')) id = p.pathname.replace('/', '');
      else if (p.searchParams.has('v')) id = p.searchParams.get('v');
      else if (p.pathname.includes('/embed/')) return url;
      else if (p.pathname.includes('/shorts/')) id = p.pathname.split('/shorts/')[1].split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    } catch { return url; }
  }

  // ── TOC ───────────────────────────────────────────────────
  function buildTOC() {
    tocList.innerHTML = '';
    const headings = markdownBody.querySelectorAll('h2, h3');
    if (!headings.length) {
      tocList.innerHTML = '<li><span class="toc-link" style="color:var(--text-muted)">No sections</span></li>';
      return;
    }
    headings.forEach((h, i) => {
      if (!h.id) h.id = 'section-' + i;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      a.className = 'toc-link' + (h.tagName === 'H3' ? ' toc-h3' : '');
      a.addEventListener('click', e => {
        e.preventDefault();
        h.scrollIntoView({ behavior: 'smooth' });
      });
      li.appendChild(a);
      tocList.appendChild(li);
    });
  }

  // ── Scale nav ──────────────────────────────────────────────
  function updateScaleNav() {
    const idx = scales.findIndex(c => c.id === activeScaleId);
    if (idx === -1) { scaleNav.style.display = 'none'; return; }

    scaleNav.style.display = 'flex';
    const prev = scales[idx - 1];
    const next = scales[idx + 1];

    if (prev) {
      btnPrev.disabled = false;
      btnPrev.textContent = `← ${prev.title}`;
      btnPrev.onclick = () => loadScale(prev.id);
    } else {
      btnPrev.disabled = true;
      btnPrev.textContent = '← Previous';
      btnPrev.onclick = null;
    }

    if (next) {
      btnNext.disabled = false;
      btnNext.textContent = `${next.title} →`;
      btnNext.onclick = () => loadScale(next.id);
    } else {
      btnNext.disabled = true;
      btnNext.textContent = 'Next →';
      btnNext.onclick = null;
    }
  }

  // ── Progress ──────────────────────────────────────────────
  function updateProgress() {
    const { scrollTop, scrollHeight, clientHeight } = contentPanel;
    const max = scrollHeight - clientHeight;
    progressBar.style.width = max > 0 ? `${(scrollTop / max) * 100}%` : '100%';
  }
  contentPanel.addEventListener('scroll', updateProgress);

  // ── Active link ───────────────────────────────────────────
  function updateActiveLink() {
    document.querySelectorAll('.scale-link').forEach(link => {
      link.classList.toggle('active', link.dataset.id === activeScaleId);
    });
  }

  function onHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (hash && scales.some(ch => s.id === hash)) loadScale(hash);
  }

  // ── Sidebar clicks ────────────────────────────────────────
  scaleList.addEventListener('click', e => {
    const link = e.target.closest('.scale-link');
    if (!link) return;
    e.preventDefault();
    const id = link.dataset.id;
    if (id) loadScale(id);
  });

  // ── Error ─────────────────────────────────────────────────
  function showError(message) {
    markdownBody.innerHTML = `<div class="loading-placeholder">⚠ ${escHtml(message)}</div>`;
  }

  // ── Escape utils ──────────────────────────────────────────
  function escHtml(v) {
    return v
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
  function escHtmlAttr(v) { return escHtml(v); }
})();
