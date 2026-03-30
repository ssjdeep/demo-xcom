/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-cta variant.
 * Base block: columns. Source: https://www.usa.canon.com/
 * Source DOM: .bumper-gradient
 * UE Model: columns-cta (Columns block - NO field hints per xwalk Rule 4)
 * Columns block: 1 row, 3 columns (each with heading, description, CTA)
 * Note: Canon USA loads content dynamically via JS. Selectors verified via Playwright (attempt 3).
 */
export default function parse(element, { document }) {
  // Find the 3 CTA column items
  // Verified on live page: .bumper-row contains .bumper-item divs (3 columns)
  const items = element.querySelectorAll('.bumper-item, .bumper-row > div');

  const columnContents = [];

  items.forEach((item) => {
    const frag = document.createDocumentFragment();

    const heading = item.querySelector('.bumper-item-header, [class*="header"], strong, h3');
    const description = item.querySelector('.bumper-item-description, [class*="description"], p:not(:has(a)):not([class*="header"])');
    const ctaLink = item.querySelector('a, button');

    if (heading) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = heading.textContent.trim();
      p.appendChild(strong);
      frag.appendChild(p);
    }
    if (description) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      frag.appendChild(p);
    }
    if (ctaLink) {
      const p = document.createElement('p');
      if (ctaLink.tagName === 'A') {
        const a = document.createElement('a');
        a.href = ctaLink.href;
        a.textContent = ctaLink.textContent.trim();
        p.appendChild(a);
      } else {
        p.textContent = ctaLink.textContent.trim();
      }
      frag.appendChild(p);
    }

    columnContents.push(frag);
  });

  // Ensure we have 3 columns (pad with empty if needed)
  while (columnContents.length < 3) {
    columnContents.push('');
  }

  // Columns: 1 row with 3 columns (no field hints for Columns blocks)
  const cells = [columnContents];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta', cells });
  element.replaceWith(block);
}
