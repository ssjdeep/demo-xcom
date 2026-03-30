/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-promo variant.
 * Base block: hero. Source: https://www.usa.canon.com/
 * Source DOM: .contentsplit-cmp.contentsplit__40-60
 * UE Model fields: image (reference), imageAlt (collapsed), text (richtext)
 * Hero block: Row 1 = background image, Row 2 = text (heading, subtext, CTA)
 * Note: Canon USA loads main content dynamically via JS. Selectors verified on live page via Playwright.
 */
export default function parse(element, { document }) {
  // Extract background image
  // Verified on live page: img src contains s7d1.scene7.com in cs-image-side
  const bgImage = element.querySelector('.cs-image-side img, img[src*="scene7"], img');

  // Extract text content from clickable-image content area
  // Verified: h1.subtitle.small-subtitle = "MARCH INTO SAVINGS"
  const heading = element.querySelector('h1, h2, .subtitle');
  const description = element.querySelector('.clickable-image-content p:not(:has(a)), .content-inner p:not(:has(a))');
  const ctaLink = element.querySelector('.clickable-image-content a, .content-inner a');

  const cells = [];

  // Row 1: Background image with field hint
  if (bgImage) {
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    const pic = bgImage.closest('picture') || bgImage;
    imgFrag.appendChild(pic);
    cells.push([imgFrag]);
  } else {
    cells.push(['']);
  }

  // Row 2: Text content (heading + description + CTA) with field hint
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));
  if (heading) textFrag.appendChild(heading);
  if (description) textFrag.appendChild(description);
  if (ctaLink) {
    const p = document.createElement('p');
    p.appendChild(ctaLink);
    textFrag.appendChild(p);
  }
  cells.push([textFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-promo', cells });
  element.replaceWith(block);
}
