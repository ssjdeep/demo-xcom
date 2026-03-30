/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-content variant.
 * Base block: cards. Source: https://www.usa.canon.com/
 * Source DOM: .target-teaser
 * UE Model: card fields: image (reference), text (richtext)
 * Cards block: Each row = 3 cols (card-name, image, text). Each row is one content card.
 * Note: Canon USA loads content dynamically via JS. Selectors verified via Playwright (attempt 3).
 */
export default function parse(element, { document }) {
  // Find content cards - numbered content recommendations
  // Verified on live page: div containers inside .target-teaser with numbered items
  const items = element.querySelectorAll('[class*="teaser-item"], [class*="content-card"]');

  const cells = [];

  const processItem = (item) => {
    const img = item.querySelector('img');
    const pic = img ? (img.closest('picture') || img) : null;

    const title = item.querySelector('[class*="title"] a, a[class*="title"], strong, h3, h4');
    const ctaLink = item.querySelector('a[href*="learn"], a[href*="video-player"], a');

    // Image cell with field hint
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    if (pic) imgFrag.appendChild(pic);

    // Text cell with field hint
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    if (title) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = title.textContent.trim();
      p.appendChild(strong);
      textFrag.appendChild(p);
    }
    if (ctaLink && ctaLink !== title) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = ctaLink.href;
      a.textContent = ctaLink.textContent.trim() || 'Learn More';
      p.appendChild(a);
      textFrag.appendChild(p);
    }

    cells.push(['card', imgFrag, textFrag]);
  };

  items.forEach(processItem);

  // Fallback: find links to learning/video content
  if (cells.length === 0) {
    const links = element.querySelectorAll('a[href*="video-player"], a[href*="learning"], a[href*="training"]');
    const processed = new Set();
    links.forEach((link) => {
      const card = link.closest('div');
      if (!card || processed.has(card)) return;
      processed.add(card);
      processItem(card);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-content', cells });
  element.replaceWith(block);
}
