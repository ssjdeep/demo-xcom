import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const VIDEO_PROVIDERS = {
  YOUTUBE: 'youtube',
  VIMEO: 'vimeo',
  DAM: 'dam',
};

function getVideoProvider(url) {
  if (!url) return VIDEO_PROVIDERS.DAM;
  if (url.includes('youtube.com') || url.includes('youtu.be')) return VIDEO_PROVIDERS.YOUTUBE;
  if (url.includes('vimeo.com')) return VIDEO_PROVIDERS.VIMEO;
  return VIDEO_PROVIDERS.DAM;
}

function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function getVimeoId(url) {
  const regExp = /vimeo\.com\/(?:.*\/)?(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

function createPlayButton() {
  const playButton = document.createElement('button');
  playButton.className = 'video-slider-play-btn';
  playButton.setAttribute('aria-label', 'Play video');
  playButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="11" fill="white" stroke="currentColor" stroke-width="1"/>
      <path d="M10 8l6 4-6 4V8z" fill="currentColor"/>
    </svg>
  `;
  return playButton;
}

function createVideoModal(videoUrl, provider) {
  const modal = document.createElement('div');
  modal.className = 'video-slider-modal';

  let embedUrl = videoUrl;
  if (provider === VIDEO_PROVIDERS.YOUTUBE) {
    const videoId = getYouTubeId(videoUrl);
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  } else if (provider === VIDEO_PROVIDERS.VIMEO) {
    const videoId = getVimeoId(videoUrl);
    embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
  }

  modal.innerHTML = `
    <div class="video-slider-modal-overlay"></div>
    <div class="video-slider-modal-content">
      <button class="video-slider-modal-close" aria-label="Close video">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      ${provider === VIDEO_PROVIDERS.DAM
    ? `<video controls autoplay><source src="${embedUrl}" type="video/mp4">Your browser does not support the video tag.</video>`
    : `<iframe src="${embedUrl}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
}
    </div>
  `;

  const closeModal = () => {
    modal.remove();
    document.body.style.overflow = '';
  };

  modal.querySelector('.video-slider-modal-overlay').addEventListener('click', closeModal);
  modal.querySelector('.video-slider-modal-close').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  }, { once: true });

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

function createSortDropdown(block) {
  const sortContainer = document.createElement('div');
  sortContainer.className = 'video-slider-sort';

  const label = document.createElement('span');
  label.className = 'video-slider-sort-label';
  label.textContent = 'Sort By:';

  const select = document.createElement('select');
  select.className = 'video-slider-sort-select';
  select.innerHTML = `
    <option value="featured">Featured</option>
    <option value="newest">Newest</option>
    <option value="oldest">Oldest</option>
    <option value="title">Title A-Z</option>
  `;

  select.addEventListener('change', (e) => {
    const videoItems = [...block.querySelectorAll('.video-slider-item')];
    const container = block.querySelector('.video-slider-list');

    videoItems.sort((a, b) => {
      const titleA = a.querySelector('.video-slider-title')?.textContent || '';
      const titleB = b.querySelector('.video-slider-title')?.textContent || '';
      const orderA = parseInt(a.dataset.order, 10) || 0;
      const orderB = parseInt(b.dataset.order, 10) || 0;

      switch (e.target.value) {
        case 'title':
          return titleA.localeCompare(titleB);
        case 'newest':
          return orderB - orderA;
        case 'oldest':
          return orderA - orderB;
        default:
          return orderA - orderB;
      }
    });

    videoItems.forEach((item) => container.appendChild(item));
  });

  sortContainer.appendChild(label);
  sortContainer.appendChild(select);

  return sortContainer;
}

function createVideoCard(row, index) {
  const card = document.createElement('div');
  card.className = 'video-slider-item';
  card.dataset.order = index;
  moveInstrumentation(row, card);

  const cells = [...row.children];

  const thumbnail = document.createElement('div');
  thumbnail.className = 'video-slider-thumbnail';

  const content = document.createElement('div');
  content.className = 'video-slider-content';

  let videoUrl = '';

  cells.forEach((cell, cellIndex) => {
    const picture = cell.querySelector('picture');
    const link = cell.querySelector('a');
    const text = cell.textContent.trim();

    if (picture) {
      const img = picture.querySelector('img');
      if (img) {
        const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
        moveInstrumentation(img, optimizedPic.querySelector('img'));
        thumbnail.appendChild(optimizedPic);
      }
    } else if (link && (link.href.includes('youtube') || link.href.includes('vimeo') || link.href.includes('.mp4'))) {
      videoUrl = link.href;
    } else if (cellIndex === 0 || (text && !link)) {
      if (!card.querySelector('.video-slider-title') && text) {
        const title = document.createElement('h3');
        title.className = 'video-slider-title';
        title.textContent = text;
        content.appendChild(title);
      } else if (text) {
        const description = document.createElement('p');
        description.className = 'video-slider-description';
        description.textContent = text;
        content.appendChild(description);
      }
    }
  });

  if (!thumbnail.querySelector('picture')) {
    const provider = getVideoProvider(videoUrl);
    if (provider === VIDEO_PROVIDERS.YOUTUBE) {
      const videoId = getYouTubeId(videoUrl);
      if (videoId) {
        const img = document.createElement('img');
        img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        img.alt = 'Video thumbnail';
        thumbnail.appendChild(img);
      }
    }
  }

  const playButton = createPlayButton();
  thumbnail.appendChild(playButton);

  if (videoUrl) {
    const provider = getVideoProvider(videoUrl);
    thumbnail.addEventListener('click', () => {
      createVideoModal(videoUrl, provider);
    });
    thumbnail.style.cursor = 'pointer';
  }

  card.appendChild(thumbnail);
  card.appendChild(content);

  return card;
}

export default function decorate(block) {
  const videoList = document.createElement('div');
  videoList.className = 'video-slider-list';

  const rows = [...block.children];
  rows.forEach((row, index) => {
    const card = createVideoCard(row, index);
    videoList.appendChild(card);
  });

  const sortDropdown = createSortDropdown(block);

  block.textContent = '';
  block.appendChild(sortDropdown);
  block.appendChild(videoList);
}
