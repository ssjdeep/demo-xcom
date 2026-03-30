import { createOptimizedPicture } from '../../scripts/aem.js';

const ITEMS_PER_PAGE = 5;

/**
 * Detects the video source type from a URL.
 * @param {string} url - The video URL
 * @returns {{ type: string, id: string, url: string }}
 */
function detectVideoSource(url) {
  try {
    const u = new URL(url);
    const host = u.hostname;

    // YouTube
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      const id = host.includes('youtu.be')
        ? u.pathname.slice(1)
        : u.searchParams.get('v') || '';
      return { type: 'youtube', id, url };
    }

    // Vimeo
    if (host.includes('vimeo.com')) {
      const match = u.pathname.match(/\/(\d+)/);
      return { type: 'vimeo', id: match ? match[1] : '', url };
    }

    // DAM / self-hosted video (mp4, webm, ogg)
    if (/\.(mp4|webm|ogg)(\?|$)/i.test(u.pathname)) {
      return { type: 'dam', id: '', url };
    }

    // Fallback: treat any other link as a DAM/self-hosted video
    return { type: 'dam', id: '', url };
  } catch {
    return { type: 'unknown', id: '', url };
  }
}

function parseDate(text) {
  const d = new Date(text);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

function createPlayButton() {
  const btn = document.createElement('button');
  btn.className = 'video-slider-play';
  btn.setAttribute('aria-label', 'Play video');
  btn.innerHTML = `<svg viewBox="0 0 68 48" width="68" height="48">
    <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="rgba(0,0,0,.75)"/>
    <path d="M45 24L27 14v20" fill="#fff"/>
  </svg>`;
  return btn;
}

/**
 * Creates the appropriate embed element for a video source.
 * @param {{ type: string, id: string, url: string }} source
 * @param {string} title
 * @returns {HTMLElement}
 */
function createVideoEmbed(source, title) {
  if (source.type === 'youtube' && source.id) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${source.id}?autoplay=1`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.title = title;
    return iframe;
  }

  if (source.type === 'vimeo' && source.id) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${source.id}?autoplay=1`;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.title = title;
    return iframe;
  }

  // DAM / self-hosted video
  const video = document.createElement('video');
  video.src = source.url;
  video.controls = true;
  video.autoplay = true;
  video.playsInline = true;
  video.title = title;
  return video;
}

/**
 * Returns a small badge label for the video source.
 * @param {string} type
 * @returns {string}
 */
function getSourceLabel(type) {
  const labels = { youtube: 'YouTube', vimeo: 'Vimeo', dam: 'Video' };
  return labels[type] || '';
}

function buildVideoItem(row) {
  const cols = [...row.children];
  const item = document.createElement('div');
  item.className = 'video-slider-item';

  // Col 1: thumbnail image
  const thumbnailCol = cols[0];
  // Col 2: video link, title, description, date
  const contentCol = cols[1];

  // Extract video link and detect source
  const link = contentCol?.querySelector('a');
  const videoUrl = link?.href || '';
  const source = detectVideoSource(videoUrl);
  if (link) link.remove();

  // Extract title (first heading)
  const heading = contentCol?.querySelector('h1, h2, h3, h4, h5, h6');
  const title = heading?.textContent?.trim() || '';

  // Extract date from last paragraph if it looks like a date
  const paragraphs = contentCol ? [...contentCol.querySelectorAll('p')] : [];
  let dateStr = '';
  if (paragraphs.length > 0) {
    const lastP = paragraphs[paragraphs.length - 1];
    const text = lastP.textContent.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
      dateStr = text;
      lastP.remove();
    }
  }

  // Extract description (remaining paragraphs)
  const descParagraphs = contentCol ? [...contentCol.querySelectorAll('p')] : [];
  const description = descParagraphs.map((p) => p.textContent.trim()).filter(Boolean).join(' ');

  // Build thumbnail
  const thumbWrapper = document.createElement('div');
  thumbWrapper.className = 'video-slider-thumbnail';

  const img = thumbnailCol?.querySelector('img');
  if (img) {
    const optimized = createOptimizedPicture(img.src, img.alt || title, false, [{ width: '400' }]);
    thumbWrapper.append(optimized);
  }

  thumbWrapper.append(createPlayButton());

  // Source badge
  const sourceLabel = getSourceLabel(source.type);
  if (sourceLabel) {
    const badge = document.createElement('span');
    badge.className = `video-slider-badge video-slider-badge-${source.type}`;
    badge.textContent = sourceLabel;
    thumbWrapper.append(badge);
  }

  // Build content section
  const content = document.createElement('div');
  content.className = 'video-slider-content';

  if (title) {
    const h3 = document.createElement('h3');
    h3.className = 'video-slider-title';
    h3.textContent = title;
    content.append(h3);
  }

  if (description) {
    const p = document.createElement('p');
    p.className = 'video-slider-description';
    p.textContent = description;
    content.append(p);
  }

  item.append(thumbWrapper, content);

  // Store data attributes
  item.dataset.sourceType = source.type;
  if (source.id) item.dataset.videoId = source.id;
  if (dateStr) item.dataset.date = dateStr;

  // Click handler for video playback
  item.addEventListener('click', () => {
    if (source.type === 'unknown' || !videoUrl) return;
    const embed = createVideoEmbed(source, title);
    thumbWrapper.innerHTML = '';
    thumbWrapper.classList.add('video-slider-playing');
    thumbWrapper.append(embed);
  });

  return item;
}

function sortItems(items, method) {
  return [...items].sort((a, b) => {
    if (method === 'date') {
      return parseDate(b.dataset.date) - parseDate(a.dataset.date);
    }
    // 'featured' = original authored order
    return 0;
  });
}

function renderItems(container, items, count) {
  container.innerHTML = '';
  items.slice(0, count).forEach((item) => container.append(item));
}

export default function decorate(block) {
  const rows = [...block.children];
  const allItems = rows.map((row) => buildVideoItem(row));

  block.innerHTML = '';

  // Sort controls
  const controls = document.createElement('div');
  controls.className = 'video-slider-controls';

  const sortLabel = document.createElement('span');
  sortLabel.className = 'video-slider-sort-label';
  sortLabel.textContent = 'Sort By:';

  const sortSelect = document.createElement('select');
  sortSelect.className = 'video-slider-sort-select';
  sortSelect.setAttribute('aria-label', 'Sort videos');
  ['Featured', 'Most Recent'].forEach((opt, i) => {
    const option = document.createElement('option');
    option.value = i === 0 ? 'featured' : 'date';
    option.textContent = opt;
    sortSelect.append(option);
  });

  controls.append(sortLabel, sortSelect);

  // Video list
  const list = document.createElement('div');
  list.className = 'video-slider-list';

  let visibleCount = ITEMS_PER_PAGE;
  let currentSort = 'featured';
  const featuredOrder = [...allItems];

  function refresh() {
    const sorted = currentSort === 'featured'
      ? featuredOrder
      : sortItems(allItems, currentSort);
    renderItems(list, sorted, visibleCount);
    // eslint-disable-next-line no-use-before-define
    loadMoreBtn.style.display = visibleCount >= allItems.length ? 'none' : '';
  }

  // Load More button
  const loadMoreWrapper = document.createElement('div');
  loadMoreWrapper.className = 'video-slider-load-more';
  const loadMoreBtn = document.createElement('button');
  loadMoreBtn.className = 'video-slider-load-more-btn';
  loadMoreBtn.textContent = 'LOAD MORE';
  loadMoreBtn.setAttribute('aria-label', 'Load more videos');
  loadMoreWrapper.append(loadMoreBtn);

  loadMoreBtn.addEventListener('click', () => {
    visibleCount += ITEMS_PER_PAGE;
    refresh();
  });

  sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    visibleCount = ITEMS_PER_PAGE;
    refresh();
  });

  block.append(controls, list, loadMoreWrapper);
  refresh();
}
