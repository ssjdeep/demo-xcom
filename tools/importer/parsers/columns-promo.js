/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-promo variant.
 * Base block: columns. Source: https://www.usa.canon.com/
 * Source DOM: .contentsplit-cmp.contentsplit__50-50
 * UE Model: columns-promo (Columns block - NO field hints per xwalk Rule 4)
 * Columns block: 1 row, 2 columns (text content | product image)
 * Note: Canon USA loads content dynamically via JS. Selectors verified via Playwright (attempt 3).
 */
export default function parse(element, { document }) {
  // Extract text content from left side
  // Verified: .clickable-image-content contains h2, p, and CTA link
  const heading = element.querySelector('h2, h1, .subtitle');
  const description = element.querySelector('.clickable-image-content p:not(:has(a)), .content-inner p:not(:has(a))');
  const ctaLink = element.querySelector('.clickable-image-content a, .content-inner a');

  // Extract product image from right side
  // Verified: img src contains s7d1.scene7.com (megatank yeti image)
  const img = element.querySelector('.cs-image-side img, img[src*="scene7"], img');
  const pic = img ? (img.closest('picture') || img) : null;

  // Build text column (no field hints for Columns blocks)
  const textFrag = document.createDocumentFragment();
  if (heading) textFrag.appendChild(heading);
  if (description) textFrag.appendChild(description);
  if (ctaLink) {
    const p = document.createElement('p');
    p.appendChild(ctaLink);
    textFrag.appendChild(p);
  }

  // Build image column
  const imgFrag = document.createDocumentFragment();
  if (pic) imgFrag.appendChild(pic);

  // Columns: 1 row with 2 columns [text, image]
  const cells = [[textFrag, imgFrag]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}
