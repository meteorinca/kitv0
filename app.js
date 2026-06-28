(() => {
  const MANIFEST_URL = 'chapters.json';

  let chapters = [];
  let activeChapterId = null;
  let visitedIds = new Set();

  // DOM refs (app shell)
  const chapterList   = document.getElementById('chapter-list');
  const contentTitle  = document.getElementById('content-title');
  const contentDesc   = document.getElementById('content-desc');
  const scaleBadge    = document.getElementById('scale-badge');
  const markdownBody  = document.getElementById('markdown-body');
  const statusText    = document.getElementById('status-text');
  const contentPanel  = document.getElementById('content-panel');
  const progressBar   = document.getElementById('progress-bar');
  const tocList       = document.getElementById('toc-list');
  const chapterNav    = document.getElementById('chapter-nav');
  const btnPrev       = document.getElementById('btn-prev');
  const btnNext       = document.getElementById('btn-next');
  const scaleDots     = document.getElementById('scale-dots');
  const navLabel      = document.getElementById('nav-chapter-label');
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

      chapters = await resp.json();
      if (!chapters.length) throw new Error('No chapters found');

      renderSidebar();
      renderScaleDots();

      const hash = window.location.hash.replace('#', '');
      const target =
        chapters.find(ch => ch.id === hash) ||
        chapters[0];

      await loadChapter(target.id);
      window.addEventListener('hashchange', onHashChange);

      statusText.textContent = `${chapters.length} scales loaded`;
    } catch (err) {
      showError(err.message);
      statusText.textContent = 'Error loading manifest';
      console.error(err);
    }
  }

  // ── Sidebar ───────────────────────────────────────────────
  function renderSidebar() {
    chapterList.innerHTML = '';
    chapters.forEach((chapter, idx) => {
      const item = document.createElement('li');
      item.className = 'chapter-item';

      const link = document.createElement('a');
      link.href = `#${chapter.id}`;
      link.className = 'chapter-link';
      link.dataset.id = chapter.id;

      const num = document.createElement('span');
      num.className = 'chapter-link-num';
      num.textContent = String(idx).padStart(2, '0');

      const textWrapper = document.createElement('div');
      textWrapper.className = 'chapter-text-content';

      const titleEl = document.createElement('div');
      titleEl.className = 'chapter-title';
      titleEl.textContent = chapter.title;
      textWrapper.appendChild(titleEl);

      if (chapter.description) {
        const desc = document.createElement('div');
        desc.className = 'chapter-desc';
        desc.textContent = chapter.description;
        textWrapper.appendChild(desc);
      }

      link.appendChild(num);
      link.appendChild(textWrapper);
      item.appendChild(link);

      chapterList.appendChild(item);
    });
  }

  // ── Scale Dots ────────────────────────────────────────────
  function renderScaleDots() {
    scaleDots.innerHTML = '';
    chapters.forEach(ch => {
      const dot = document.createElement('div');
      dot.className = 'scale-dot';
      dot.dataset.id = ch.id;
      dot.title = ch.title;
      dot.addEventListener('click', () => loadChapter(ch.id));
      scaleDots.appendChild(dot);
    });
  }

  function updateScaleDots() {
    scaleDots.querySelectorAll('.scale-dot').forEach(dot => {
      const id = dot.dataset.id;
      dot.classList.toggle('active', id === activeChapterId);
      dot.classList.toggle('visited', visitedIds.has(id) && id !== activeChapterId);
    });
  }

  // ── Load Chapter ──────────────────────────────────────────
  async function loadChapter(id) {
    const chapter = chapters.find(ch => ch.id === id);
    if (!chapter) return;

    activeChapterId = chapter.id;
    visitedIds.add(chapter.id);

    if (window.location.hash !== `#${chapter.id}`) {
      window.location.hash = chapter.id;
    }

    updateActiveLink();
    updateScaleDots();

    // Set header
    const idx = chapters.indexOf(chapter);
    scaleBadge.textContent = `Scale ${idx}`;
    contentTitle.textContent = chapter.title.replace(/^Scale \d+[–—-]\s*/i, '');
    contentDesc.textContent = chapter.description || '';
    navLabel.textContent = chapter.title;

    markdownBody.classList.remove('loaded');
    markdownBody.innerHTML = '<div class="loading-placeholder">Loading…</div>';
    statusText.textContent = `Fetching scale ${idx}…`;

    try {
      const resp = await fetch(chapter.file);
      if (!resp.ok) throw new Error(`Failed to load ${chapter.file} (${resp.status})`);

      const markdown = await resp.text();
      const prepared = preprocessMediaShortcodes(markdown);
      const html = marked.parse(prepared);

      markdownBody.innerHTML = html;
      fixRelativeMediaPaths(markdownBody, chapter.file);

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
      updateChapterNav();

      setTimeout(() => { markdownBody.classList.add('loaded'); }, 50);
      contentPanel.scrollTop = 0;
      updateProgress();

      statusText.textContent = `Scale ${idx} — ${chapter.title}`;
    } catch (err) {
      showError(err.message);
      statusText.textContent = 'Error loading chapter';
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

  // ── Chapter nav ───────────────────────────────────────────
  function updateChapterNav() {
    const idx = chapters.findIndex(c => c.id === activeChapterId);
    if (idx === -1) { chapterNav.style.display = 'none'; return; }

    chapterNav.style.display = 'flex';
    const prev = chapters[idx - 1];
    const next = chapters[idx + 1];

    if (prev) {
      btnPrev.disabled = false;
      btnPrev.textContent = `← ${prev.title}`;
      btnPrev.onclick = () => loadChapter(prev.id);
    } else {
      btnPrev.disabled = true;
      btnPrev.textContent = '← Previous';
      btnPrev.onclick = null;
    }

    if (next) {
      btnNext.disabled = false;
      btnNext.textContent = `${next.title} →`;
      btnNext.onclick = () => loadChapter(next.id);
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
    document.querySelectorAll('.chapter-link').forEach(link => {
      link.classList.toggle('active', link.dataset.id === activeChapterId);
    });
  }

  function onHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (hash && chapters.some(ch => ch.id === hash)) loadChapter(hash);
  }

  // ── Sidebar clicks ────────────────────────────────────────
  chapterList.addEventListener('click', e => {
    const link = e.target.closest('.chapter-link');
    if (!link) return;
    e.preventDefault();
    const id = link.dataset.id;
    if (id) loadChapter(id);
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
