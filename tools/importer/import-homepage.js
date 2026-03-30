/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroPromoParser from './parsers/hero-promo.js';
import carouselDealsParser from './parsers/carousel-deals.js';
import cardsContentParser from './parsers/cards-content.js';
import columnsPromoParser from './parsers/columns-promo.js';
import cardsCategoryParser from './parsers/cards-category.js';
import cardsSupportParser from './parsers/cards-support.js';
import columnsCtaParser from './parsers/columns-cta.js';

// TRANSFORMER IMPORTS
import canonCleanupTransformer from './transformers/canon-cleanup.js';
import canonSectionsTransformer from './transformers/canon-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-promo': heroPromoParser,
  'carousel-deals': carouselDealsParser,
  'cards-content': cardsContentParser,
  'columns-promo': columnsPromoParser,
  'cards-category': cardsCategoryParser,
  'cards-support': cardsSupportParser,
  'columns-cta': columnsCtaParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Canon USA homepage with hero banner, product categories, promotions, and featured content',
  urls: ['https://www.usa.canon.com/'],
  blocks: [
    {
      name: 'hero-promo',
      instances: ['.contentsplit-cmp.contentsplit__40-60'],
    },
    {
      name: 'carousel-deals',
      instances: ['.input-card-carousel .d-card-component-container'],
    },
    {
      name: 'cards-content',
      instances: ['.target-teaser'],
    },
    {
      name: 'columns-promo',
      instances: ['.contentsplit-cmp.contentsplit__50-50'],
    },
    {
      name: 'cards-category',
      instances: ['.popular-categories'],
    },
    {
      name: 'cards-support',
      instances: ['.lists'],
    },
    {
      name: 'columns-cta',
      instances: ['.bumper-gradient'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero Banner',
      selector: '.contentsplit.content-split-clickable-image:first-of-type',
      style: null,
      blocks: ['hero-promo'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Most Popular Deals',
      selector: '.input-card-carousel',
      style: null,
      blocks: ['carousel-deals'],
      defaultContent: ['.d-card-header-container .heading-default', '.input-card-carousel > a'],
    },
    {
      id: 'section-3',
      name: 'Content For You',
      selector: '.target-teaser',
      style: null,
      blocks: ['cards-content'],
      defaultContent: ['.target-teaser-heading'],
    },
    {
      id: 'section-4',
      name: 'MegaTank Promo',
      selector: '.contentsplit.content-split-clickable-image:nth-of-type(2)',
      style: 'light',
      blocks: ['columns-promo'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Popular Categories',
      selector: '.popular-categories',
      style: null,
      blocks: ['cards-category'],
      defaultContent: ['.pc-title'],
    },
    {
      id: 'section-6',
      name: 'Get Support',
      selector: '.lists',
      style: null,
      blocks: ['cards-support'],
      defaultContent: ['.heading-top h2'],
    },
    {
      id: 'section-7',
      name: 'CTA Bar',
      selector: '.bumper',
      style: 'gradient',
      blocks: ['columns-cta'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  canonCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [canonSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index'
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
