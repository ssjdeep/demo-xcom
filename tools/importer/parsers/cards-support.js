/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-support variant.
 * Base block: cards. Source: https://www.usa.canon.com/
 * Source DOM: .lists
 * UE Model: card fields: image (reference), text (richtext)
 * Cards block: Each row = 3 cols (card-name, image, text). Each row is one support card.
 * Note: Canon USA loads content dynamically via JS. Selectors verified via Playwright (attempt 3).
 */
export default function parse(element, { document }) {
  // Find support cards
  // Verified on live page: .lists contains .list-cmp with cards having icon, h3, description, CTA
  const cards = element.querySelectorAll('.list-item, [class*="list-item"], .col-lg-4, [class*="threeCol"]');

  const cells = [];

  const processCard = (card) => {
    const img = card.querySelector('img');
    const pic = img ? (img.closest('picture') || img) : null;

    const heading = card.querySelector('h3, h4, [class*="heading"]');
    const description = card.querySelector('p:not(:has(a)), [class*="description"]');
    const ctaLink = card.querySelector('a[href*="/support"], a[href*="/sign-in"], a');

    // Image cell with field hint
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    if (pic) imgFrag.appendChild(pic);

    // Text cell with field hint
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.trim();
      textFrag.appendChild(h3);
    }
    if (description) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      textFrag.appendChild(p);
    }
    if (ctaLink) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = ctaLink.href;
      a.textContent = ctaLink.textContent.trim();
      p.appendChild(a);
      textFrag.appendChild(p);
    }

    cells.push(['card', imgFrag, textFrag]);
  };

  cards.forEach(processCard);

  // Fallback: find support links
  if (cells.length === 0) {
    const headings = element.querySelectorAll('h3');
    headings.forEach((h3) => {
      const card = h3.closest('div');
      if (card) processCard(card);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-support', cells });
  element.replaceWith(block);
}
