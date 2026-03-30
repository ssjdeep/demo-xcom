/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Canon USA cleanup.
 * Removes non-authorable content from Canon USA pages.
 * Handles both AEM-authored DOM and JS-rendered DOM (from file:// imports).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent banner (OneTrust)
    // Chat widget (Five9)
    // Cookie banner (rendered DOM)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '.five9-frame',
      '[role="region"][aria-label="Cookie banner"]',
    ]);

    // Remove accessibility skip links at top of page
    // These are <a> links with href="#to-main-content", "#footer", "#Chat_Image_Button"
    element.querySelectorAll('a[href="#to-main-content"], a[href="#footer"], a[href="#Chat_Image_Button"]').forEach((el) => {
      const parent = el.closest('div') || el.parentElement;
      if (parent && parent.querySelectorAll('a').length <= 2) {
        parent.remove();
      } else {
        el.remove();
      }
    });

    // Remove the accessibility statement link at very top
    element.querySelectorAll('a[href*="website-accessibility"]').forEach((el) => {
      const parent = el.parentElement;
      if (parent && parent.tagName === 'P' && parent.textContent.trim() === el.textContent.trim()) {
        parent.remove();
      }
    });

    // Remove "Enable accessibility" link
    element.querySelectorAll('a').forEach((el) => {
      if (el.textContent.trim() === 'Enable accessibility') {
        const parent = el.parentElement;
        if (parent && parent.tagName === 'P') parent.remove();
        else el.remove();
      }
    });

    // Remove navigation and header elements (JS-rendered DOM)
    WebImporter.DOMUtils.remove(element, [
      'nav',
      '.cmp-header',
      '.header-wrapper',
      '[class*="nav-container"]',
      '[class*="mega-menu"]',
      '.consumer-tab-content',
    ]);

    // Remove shipping promo bar and its tooltip content
    // The rendered DOM has a button with "FREE STANDARD SHIPPING" and detailed tooltip
    element.querySelectorAll('button, div').forEach((el) => {
      const text = el.textContent || '';
      if (text.includes('FREE STANDARD SHIPPING') && text.length < 200) {
        // It's the shipping bar button - remove its parent container
        const container = el.closest('.promo-bar') || el.closest('[class*="shipping"]') || el;
        container.remove();
      }
    });

    // Remove shipping tooltip content (long paragraphs about shipping terms)
    element.querySelectorAll('p').forEach((el) => {
      const text = el.textContent || '';
      if (text.includes('Free Standard Shipping') && text.includes('Offer valid')) {
        el.remove();
      }
    });
    // Also remove "Shipping and Handling" standalone paragraph
    element.querySelectorAll('p').forEach((el) => {
      if (el.textContent.trim() === 'Shipping and Handling') el.remove();
    });

    // Remove mini-cart / shopping cart overlay content
    element.querySelectorAll('h2').forEach((el) => {
      if (el.textContent.includes('Your Cart')) {
        // Find the cart container and remove all related elements
        let parent = el.parentElement;
        // Remove the h2 and nearby cart-related paragraphs
        const siblings = parent ? Array.from(parent.children) : [];
        let removing = false;
        siblings.forEach((sib) => {
          const t = sib.textContent || '';
          if (sib === el) { removing = true; sib.remove(); return; }
          if (removing && (t.includes('Recently added') || t.includes('cart is empty') ||
              t.includes('Estimated Subtotal') || t.includes('$0.00') ||
              t.includes('View Cart') || t.includes('Pay with') ||
              t.includes('Amazon customer') || t.includes('Loading...') ||
              t.includes('My Cart') || t.trim() === 'or')) {
            sib.remove();
          }
        });
      }
    });

    // Remove "My Cart" link paragraph
    element.querySelectorAll('p').forEach((el) => {
      if (el.textContent.includes('My Cart') && el.textContent.includes('0items')) {
        el.remove();
      }
    });

    // Remove chat widget content
    element.querySelectorAll('img[src*="chatbubble"]').forEach((el) => {
      // Find the chat container
      let container = el.closest('div');
      while (container && !container.textContent.includes('QUESTIONS?')) {
        container = container.parentElement;
      }
      if (container) container.remove();
      else el.parentElement?.remove();
    });
    // Remove standalone chat-related paragraphs
    element.querySelectorAll('p').forEach((el) => {
      const t = el.textContent.trim();
      if (t === 'CHAT' || t === 'QUESTIONS?' ||
          t.includes('Experts are standing by') ||
          t === 'Sales Chat' || t === 'Click here to get started' ||
          t === 'Click here to log in' || t === 'Tech Support' ||
          t.includes('Log in to MyCanon Account')) {
        el.remove();
      }
    });
    // Remove tech support chat links
    element.querySelectorAll('a[href*="myprofile.americas.canon"]').forEach((el) => {
      if (el.textContent.includes('Tech Support') || el.textContent.includes('Click here to log in')) {
        const parent = el.parentElement;
        if (parent && parent.tagName === 'P') parent.remove();
        else el.remove();
      }
    });

    // Remove newsletter modal / email subscribe content (rendered in DOM)
    element.querySelectorAll('p').forEach((el) => {
      const t = el.textContent.trim();
      if (t === 'First Name:' || t === 'Last Name:' || t === 'Enter Your Email Address:') {
        el.remove();
      }
    });

    // Remove "Free gift was added" cart popup content
    element.querySelectorAll('p').forEach((el) => {
      const t = el.textContent.trim();
      if (t === 'Free gift was added to your shopping cart' || t === 'Close' ||
          t === 'FREE' || t === 'Subtotal' || t === 'Est. shipping TBD' ||
          t === 'Est. Total' || t.includes('Proceed to cart') ||
          t.includes('Continue shopping')) {
        el.remove();
      }
    });

    // Remove broken file:// images (from Canon's DAM paths)
    element.querySelectorAll('img[src^="file:///"]').forEach((img) => {
      // Check if this is inside a block that will be parsed (keep those)
      // Only remove standalone broken images
      const src = img.getAttribute('src');
      if (src.includes('image-unavailable') || src.includes('loader') ||
          src.includes('logo.svg') || src.includes('sandbox-logo') ||
          src.includes('klarna')) {
        const parent = img.parentElement;
        if (parent && parent.tagName === 'P') parent.remove();
        else img.remove();
      }
    });

    // Deduplicate: Canon renders mobile + desktop versions of some sections.
    // Keep only the first instance of each block selector.
    const { template } = payload;
    if (template && template.blocks) {
      template.blocks.forEach((blockDef) => {
        blockDef.instances.forEach((selector) => {
          const matches = element.querySelectorAll(selector);
          if (matches.length > 1) {
            // Keep first, remove rest
            for (let i = 1; i < matches.length; i++) {
              console.log(`Removing duplicate ${blockDef.name} instance ${i + 1}/${matches.length}`);
              matches[i].remove();
            }
          }
        });
      });
    }
  }

  if (hookName === TransformHook.afterTransform) {
    // Site header/navigation
    // Site footer
    // Experience fragments
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      '[role="region"][aria-label="Footer"]',
      '.experiencefragment_1666706550',
      '.experiencefragment_1361806550',
      'script',
      'noscript',
      'link[rel="stylesheet"]',
      'iframe',
      'style',
    ]);

    // Remove the first experience fragment (header XF)
    const headerXf = element.querySelector(':scope > .experiencefragment:not(.aem-GridColumn)');
    if (headerXf) headerXf.remove();

    // Remove hidden inputs
    element.querySelectorAll(':scope > input').forEach((el) => el.remove());

    // Remove the CTA bar footer (GET SUPPORT / NEED IT FIRST / LEARN WITH CANON)
    // This is a separate div outside the main content area - it's the bumper section
    // handled by columns-cta block if it was found, otherwise remove the raw content
    element.querySelectorAll('div').forEach((el) => {
      const children = el.children;
      if (children.length === 3) {
        const texts = Array.from(children).map((c) => (c.textContent || '').trim().substring(0, 30));
        if (texts[0]?.startsWith('GET SUPPORT') && texts[1]?.startsWith('NEED IT FIRST')) {
          el.remove();
        }
      }
    });

    // Clean tracking/analytics attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-track');
      el.removeAttribute('data-analytics');
      el.removeAttribute('onclick');
      el.removeAttribute('data-cmp-clickable');
    });
  }
}
