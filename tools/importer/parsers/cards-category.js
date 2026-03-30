/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-category variant.
 * Base block: cards. Source: https://www.usa.canon.com/
 * Source DOM: .popular-categories
 * UE Model: card fields: image (reference), text (richtext)
 * Cards block: Each row = 3 cols (card-name, image, text). Each row is one category tile.
 * Note: Canon USA loads content dynamically via JS. Selectors verified via Playwright (attempt 3).
 */
export default function parse(element, { document }) {
  // Find category tiles
  // Verified on live page: .popular-categories contains div tiles with image + label link
  const tiles = element.querySelectorAll('.popular-category-item, .pc-item, [class*="category-item"]');

  const cells = [];

  const processTile = (tile) => {
    const img = tile.querySelector('img');
    const pic = img ? (img.closest('picture') || img) : null;
    const link = tile.querySelector('a[href*="/shop/"], a');

    // Image cell with field hint
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    if (pic) imgFrag.appendChild(pic);

    // Text cell with field hint
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    if (link) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.textContent.trim();
      p.appendChild(a);
      textFrag.appendChild(p);
    }

    cells.push(['card', imgFrag, textFrag]);
  };

  tiles.forEach(processTile);

  // Fallback: find category links in the container
  if (cells.length === 0) {
    const links = element.querySelectorAll('a[href*="/shop/"]');
    const processed = new Set();
    links.forEach((link) => {
      const tile = link.closest('div');
      if (!tile || processed.has(tile)) return;
      processed.add(tile);
      processTile(tile);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-category', cells });
  element.replaceWith(block);
}
