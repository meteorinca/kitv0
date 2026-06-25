(() => {
  const MANIFEST_URL = 'chapters.json';
  const DEFAULT_CHAPTER_ID = null; // set to 'ch2' or any id if you want a fixed default

  let chapters = [];
  let activeChapterId = null;

  const chapterList = document.getElementById('chapter-list');
  const contentTitle = document.getElementById('content-title');
  const markdownBody = document.getElementById('markdown-body');
  const statusText = document.getElementById('status-text');

  async function init() {
    try {
      statusText.textContent = 'Loading manifest...';

      const resp = await fetch(MANIFEST_URL);
      if (!resp.ok) throw new Error(`Manifest fetch failed: ${resp.status}`);

      chapters = await resp.json();
      if (!chapters.length) throw new Error('No chapters found in manifest');

      renderSidebar();

      const hash = window.location.hash.replace('#', '');
      const defaultChapter = DEFAULT_CHAPTER_ID
        ? chapters.find(ch => ch.id === DEFAULT_CHAPTER_ID)
        : null;

      const targetChapter =
        chapters.find(ch => ch.id === hash) ||
        defaultChapter ||
        chapters[0];

      await loadChapter(targetChapter.id);
      window.addEventListener('hashchange', onHashChange);

      statusText.textContent = `${chapters.length} chapter(s) loaded`;
    } catch (err) {
      showError(err.message);
      statusText.textContent = 'Error loading manifest';
      console.error(err);
    }
  }

  function renderSidebar() {
    chapterList.innerHTML = '';

    chapters.forEach(chapter => {
      const item = document.createElement('li');
      item.className = 'chapter-item';

      const link = document.createElement('a');
      link.href = `#${chapter.id}`;
      link.className = 'chapter-link';
      link.dataset.id = chapter.id;
      link.textContent = chapter.title;

      item.appendChild(link);

      if (chapter.description) {
        const desc = document.createElement('span');
        desc.className = 'chapter-desc';
        desc.textContent = chapter.description;
        item.appendChild(desc);
      }

      chapterList.appendChild(item);
    });
  }

  async function loadChapter(id) {
    const chapter = chapters.find(ch => ch.id === id);
    if (!chapter) return;

    activeChapterId = chapter.id;

    if (window.location.hash !== `#${chapter.id}`) {
      window.location.hash = chapter.id;
    }

    updateActiveLink();

    contentTitle.textContent = chapter.title;
    markdownBody.innerHTML = '<div class="loading-placeholder">Loading chapter...</div>';
    statusText.textContent = `Fetching: ${chapter.file}`;

    try {
      const resp = await fetch(chapter.file);
      if (!resp.ok) throw new Error(`Failed to load ${chapter.file} (${resp.status})`);

      const markdown = await resp.text();
      const preparedMarkdown = preprocessMediaShortcodes(markdown);
      const html = marked.parse(preparedMarkdown);

      markdownBody.innerHTML = html;
      fixRelativeMediaPaths(markdownBody, chapter.file);
      statusText.textContent = `Displaying: ${chapter.title}`;
    } catch (err) {
      showError(err.message);
      statusText.textContent = 'Error loading chapter';
      console.error(err);
    }
  }

  function preprocessMediaShortcodes(markdown) {
    return markdown
      .replace(/::video\[(.*?)\]\((.*?)\)/g, (_match, caption, src) => {
        return [
          '<figure class="media-card">',
          `<video controls preload="metadata" src="${escapeHtmlAttr(src.trim())}"></video>`,
          caption.trim() ? `<figcaption>${escapeHtml(caption.trim())}</figcaption>` : '',
          '</figure>'
        ].join('');
      })
      .replace(/::youtube\[(.*?)\]\((.*?)\)/g, (_match, caption, url) => {
        const embedUrl = toYouTubeEmbedUrl(url.trim());
        return [
          '<figure class="media-card">',
          '<div class="youtube-embed">',
          `<iframe src="${escapeHtmlAttr(embedUrl)}" title="${escapeHtmlAttr(caption.trim() || 'YouTube video')}" allowfullscreen loading="lazy"></iframe>`,
          '</div>',
          caption.trim() ? `<figcaption>${escapeHtml(caption.trim())}</figcaption>` : '',
          '</figure>'
        ].join('');
      })
      .replace(/::audio\[(.*?)\]\((.*?)\)/g, (_match, caption, src) => {
        return [
          '<figure class="media-card">',
          `<audio controls preload="metadata" src="${escapeHtmlAttr(src.trim())}"></audio>`,
          caption.trim() ? `<figcaption>${escapeHtml(caption.trim())}</figcaption>` : '',
          '</figure>'
        ].join('');
      });
  }

  function fixRelativeMediaPaths(container, markdownFilePath) {
    const basePath = markdownFilePath.includes('/')
      ? markdownFilePath.slice(0, markdownFilePath.lastIndexOf('/') + 1)
      : '';

    const elements = container.querySelectorAll(
      'img[src], video[src], video source[src], audio[src], audio source[src], iframe[src]'
    );

    elements.forEach(el => {
      const attr = el.hasAttribute('src') ? 'src' : null;
      if (!attr) return;

      const current = el.getAttribute(attr);
      if (!current || isExternalOrRootPath(current)) return;

      el.setAttribute(attr, basePath + current);
    });
  }

  function isExternalOrRootPath(path) {
    return (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('//') ||
      path.startsWith('/') ||
      path.startsWith('data:') ||
      path.startsWith('mailto:') ||
      path.startsWith('#')
    );
  }

  function toYouTubeEmbedUrl(url) {
    try {
      const parsed = new URL(url);
      let id = '';

      if (parsed.hostname.includes('youtu.be')) {
        id = parsed.pathname.replace('/', '');
      } else if (parsed.searchParams.has('v')) {
        id = parsed.searchParams.get('v');
      } else if (parsed.pathname.includes('/embed/')) {
        return url;
      } else if (parsed.pathname.includes('/shorts/')) {
        id = parsed.pathname.split('/shorts/')[1].split('/')[0];
      }

      return id ? `https://www.youtube.com/embed/${id}` : url;
    } catch {
      return url;
    }
  }

  function updateActiveLink() {
    document.querySelectorAll('.chapter-link').forEach(link => {
      link.classList.toggle('active', link.dataset.id === activeChapterId);
    });
  }

  function onHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (hash && chapters.some(ch => ch.id === hash)) {
      loadChapter(hash);
    }
  }

  function showError(message) {
    markdownBody.innerHTML = `<div class="loading-placeholder">⚠ ${escapeHtml(message)}</div>`;
  }

  function escapeHtml(value) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function escapeHtmlAttr(value) {
    return escapeHtml(value);
  }

  chapterList.addEventListener('click', event => {
    const link = event.target.closest('.chapter-link');
    if (!link) return;

    event.preventDefault();
    const id = link.dataset.id;
    if (id) loadChapter(id);
  });

  init();
})();
