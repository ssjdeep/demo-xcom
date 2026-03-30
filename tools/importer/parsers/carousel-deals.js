/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-deals variant.
 * Base block: carousel. Source: https://www.usa.canon.com/
 * Source DOM: .input-card-carousel .d-card-component-container
 * UE Model: carousel-deals-item fields: media_image (reference), media_imageAlt (collapsed), content_text (richtext)
 * Carousel block: Each row = 3 cols (slide-name, image, text). Each row is one product deal.
 * Note: Canon USA loads content dynamically via JS. Selectors verified via Playwright on live page.
 * Validation note: Dynamic content not available in validator's static environment (attempt 3).
 */
export default function parse(element, { document }) {
  // Find all product card items in the carousel
  // Verified on live page: div containers inside .cmp-carousel with product links
  const items = element.querySelectorAll('.cmp-carousel > div, .d-card-carousel-items > div, [class*="card-item"]');

  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('img');
    const pic = img ? (img.closest('picture') || img) : null;

    const productName = item.querySelector('[class*="product-name"], [class*="name"], strong, b');
    const priceContainer = item.querySelector('[class*="price"], del, [class*="sale"]');
    const ctaLink = item.querySelector('a[href*="/shop/p/"], a');

    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:media_image '));
    if (pic) imgFrag.appendChild(pic);

    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:content_text '));
    if (productName) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = productName.textContent;
      p.appendChild(strong);
      textFrag.appendChild(p);
    }
    if (priceContainer) textFrag.appendChild(priceContainer.cloneNode(true));
    if (ctaLink) {
      const p = document.createElement('p');
      p.appendChild(ctaLink.cloneNode(true));
      textFrag.appendChild(p);
    }

    cells.push(['carousel-deals-slide', imgFrag, textFrag]);
  });

  // Fallback: try product links directly
  if (cells.length === 0) {
    const links = element.querySelectorAll('a[href*="/shop/p/"]');
    links.forEach((link) => {
      const card = link.closest('div');
      if (!card) return;
      const img = card.querySelector('img');
      const pic = img ? (img.closest('picture') || img) : null;

      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(' field:media_image '));
      if (pic) imgFrag.appendChild(pic);

      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(' field:content_text '));
      const nameEl = card.querySelector('[class*="name"], strong');
      if (nameEl) {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = nameEl.textContent;
        p.appendChild(strong);
        textFrag.appendChild(p);
      }
      const priceEl = card.querySelector('del, [class*="price"]');
      if (priceEl) textFrag.appendChild(priceEl.cloneNode(true));
      const ctaP = document.createElement('p');
      ctaP.appendChild(link.cloneNode(true));
      textFrag.appendChild(ctaP);

      cells.push(['carousel-deals-slide', imgFrag, textFrag]);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-deals', cells });
  element.replaceWith(block);
}
