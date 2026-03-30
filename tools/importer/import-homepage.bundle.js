var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-promo.js
  function parse(element, { document }) {
    const bgImage = element.querySelector('.cs-image-side img, img[src*="scene7"], img');
    const heading = element.querySelector("h1, h2, .subtitle");
    const description = element.querySelector(".clickable-image-content p:not(:has(a)), .content-inner p:not(:has(a))");
    const ctaLink = element.querySelector(".clickable-image-content a, .content-inner a");
    const cells = [];
    if (bgImage) {
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      const pic = bgImage.closest("picture") || bgImage;
      imgFrag.appendChild(pic);
      cells.push([imgFrag]);
    } else {
      cells.push([""]);
    }
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(" field:text "));
    if (heading) textFrag.appendChild(heading);
    if (description) textFrag.appendChild(description);
    if (ctaLink) {
      const p = document.createElement("p");
      p.appendChild(ctaLink);
      textFrag.appendChild(p);
    }
    cells.push([textFrag]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-deals.js
  function parse2(element, { document }) {
    const items = element.querySelectorAll('.cmp-carousel > div, .d-card-carousel-items > div, [class*="card-item"]');
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector("img");
      const pic = img ? img.closest("picture") || img : null;
      const productName = item.querySelector('[class*="product-name"], [class*="name"], strong, b');
      const priceContainer = item.querySelector('[class*="price"], del, [class*="sale"]');
      const ctaLink = item.querySelector('a[href*="/shop/p/"], a');
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:media_image "));
      if (pic) imgFrag.appendChild(pic);
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:content_text "));
      if (productName) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = productName.textContent;
        p.appendChild(strong);
        textFrag.appendChild(p);
      }
      if (priceContainer) textFrag.appendChild(priceContainer.cloneNode(true));
      if (ctaLink) {
        const p = document.createElement("p");
        p.appendChild(ctaLink.cloneNode(true));
        textFrag.appendChild(p);
      }
      cells.push(["carousel-deals-slide", imgFrag, textFrag]);
    });
    if (cells.length === 0) {
      const links = element.querySelectorAll('a[href*="/shop/p/"]');
      links.forEach((link) => {
        const card = link.closest("div");
        if (!card) return;
        const img = card.querySelector("img");
        const pic = img ? img.closest("picture") || img : null;
        const imgFrag = document.createDocumentFragment();
        imgFrag.appendChild(document.createComment(" field:media_image "));
        if (pic) imgFrag.appendChild(pic);
        const textFrag = document.createDocumentFragment();
        textFrag.appendChild(document.createComment(" field:content_text "));
        const nameEl = card.querySelector('[class*="name"], strong');
        if (nameEl) {
          const p = document.createElement("p");
          const strong = document.createElement("strong");
          strong.textContent = nameEl.textContent;
          p.appendChild(strong);
          textFrag.appendChild(p);
        }
        const priceEl = card.querySelector('del, [class*="price"]');
        if (priceEl) textFrag.appendChild(priceEl.cloneNode(true));
        const ctaP = document.createElement("p");
        ctaP.appendChild(link.cloneNode(true));
        textFrag.appendChild(ctaP);
        cells.push(["carousel-deals-slide", imgFrag, textFrag]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-deals", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-content.js
  function parse3(element, { document }) {
    const items = element.querySelectorAll('[class*="teaser-item"], [class*="content-card"]');
    const cells = [];
    const processItem = (item) => {
      const img = item.querySelector("img");
      const pic = img ? img.closest("picture") || img : null;
      const title = item.querySelector('[class*="title"] a, a[class*="title"], strong, h3, h4');
      const ctaLink = item.querySelector('a[href*="learn"], a[href*="video-player"], a');
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      if (pic) imgFrag.appendChild(pic);
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (title) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = title.textContent.trim();
        p.appendChild(strong);
        textFrag.appendChild(p);
      }
      if (ctaLink && ctaLink !== title) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = ctaLink.href;
        a.textContent = ctaLink.textContent.trim() || "Learn More";
        p.appendChild(a);
        textFrag.appendChild(p);
      }
      cells.push(["card", imgFrag, textFrag]);
    };
    items.forEach(processItem);
    if (cells.length === 0) {
      const links = element.querySelectorAll('a[href*="video-player"], a[href*="learning"], a[href*="training"]');
      const processed = /* @__PURE__ */ new Set();
      links.forEach((link) => {
        const card = link.closest("div");
        if (!card || processed.has(card)) return;
        processed.add(card);
        processItem(card);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-content", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-promo.js
  function parse4(element, { document }) {
    const heading = element.querySelector("h2, h1, .subtitle");
    const description = element.querySelector(".clickable-image-content p:not(:has(a)), .content-inner p:not(:has(a))");
    const ctaLink = element.querySelector(".clickable-image-content a, .content-inner a");
    const img = element.querySelector('.cs-image-side img, img[src*="scene7"], img');
    const pic = img ? img.closest("picture") || img : null;
    const textFrag = document.createDocumentFragment();
    if (heading) textFrag.appendChild(heading);
    if (description) textFrag.appendChild(description);
    if (ctaLink) {
      const p = document.createElement("p");
      p.appendChild(ctaLink);
      textFrag.appendChild(p);
    }
    const imgFrag = document.createDocumentFragment();
    if (pic) imgFrag.appendChild(pic);
    const cells = [[textFrag, imgFrag]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-category.js
  function parse5(element, { document }) {
    const tiles = element.querySelectorAll('.popular-category-item, .pc-item, [class*="category-item"]');
    const cells = [];
    const processTile = (tile) => {
      const img = tile.querySelector("img");
      const pic = img ? img.closest("picture") || img : null;
      const link = tile.querySelector('a[href*="/shop/"], a');
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      if (pic) imgFrag.appendChild(pic);
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (link) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.textContent.trim();
        p.appendChild(a);
        textFrag.appendChild(p);
      }
      cells.push(["card", imgFrag, textFrag]);
    };
    tiles.forEach(processTile);
    if (cells.length === 0) {
      const links = element.querySelectorAll('a[href*="/shop/"]');
      const processed = /* @__PURE__ */ new Set();
      links.forEach((link) => {
        const tile = link.closest("div");
        if (!tile || processed.has(tile)) return;
        processed.add(tile);
        processTile(tile);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-category", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-support.js
  function parse6(element, { document }) {
    const cards = element.querySelectorAll('.list-item, [class*="list-item"], .col-lg-4, [class*="threeCol"]');
    const cells = [];
    const processCard = (card) => {
      const img = card.querySelector("img");
      const pic = img ? img.closest("picture") || img : null;
      const heading = card.querySelector('h3, h4, [class*="heading"]');
      const description = card.querySelector('p:not(:has(a)), [class*="description"]');
      const ctaLink = card.querySelector('a[href*="/support"], a[href*="/sign-in"], a');
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      if (pic) imgFrag.appendChild(pic);
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (heading) {
        const h3 = document.createElement("h3");
        h3.textContent = heading.textContent.trim();
        textFrag.appendChild(h3);
      }
      if (description) {
        const p = document.createElement("p");
        p.textContent = description.textContent.trim();
        textFrag.appendChild(p);
      }
      if (ctaLink) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = ctaLink.href;
        a.textContent = ctaLink.textContent.trim();
        p.appendChild(a);
        textFrag.appendChild(p);
      }
      cells.push(["card", imgFrag, textFrag]);
    };
    cards.forEach(processCard);
    if (cells.length === 0) {
      const headings = element.querySelectorAll("h3");
      headings.forEach((h3) => {
        const card = h3.closest("div");
        if (card) processCard(card);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-support", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta.js
  function parse7(element, { document }) {
    const items = element.querySelectorAll(".bumper-item, .bumper-row > div");
    const columnContents = [];
    items.forEach((item) => {
      const frag = document.createDocumentFragment();
      const heading = item.querySelector('.bumper-item-header, [class*="header"], strong, h3');
      const description = item.querySelector('.bumper-item-description, [class*="description"], p:not(:has(a)):not([class*="header"])');
      const ctaLink = item.querySelector("a, button");
      if (heading) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = heading.textContent.trim();
        p.appendChild(strong);
        frag.appendChild(p);
      }
      if (description) {
        const p = document.createElement("p");
        p.textContent = description.textContent.trim();
        frag.appendChild(p);
      }
      if (ctaLink) {
        const p = document.createElement("p");
        if (ctaLink.tagName === "A") {
          const a = document.createElement("a");
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
    while (columnContents.length < 3) {
      columnContents.push("");
    }
    const cells = [columnContents];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/canon-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        ".five9-frame",
        '[role="region"][aria-label="Cookie banner"]'
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        ".experiencefragment_1666706550",
        ".experiencefragment_1361806550",
        "script",
        "noscript",
        "link",
        "iframe"
      ]);
      const headerXf = element.querySelector(":scope > .experiencefragment:not(.aem-GridColumn)");
      if (headerXf) headerXf.remove();
      element.querySelectorAll(":scope > input").forEach((el) => el.remove());
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-track");
        el.removeAttribute("data-analytics");
        el.removeAttribute("onclick");
      });
    }
  }

  // tools/importer/transformers/canon-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const { document } = payload;
      const template = payload.template;
      if (!template || !template.sections || template.sections.length < 2) return;
      const sections = template.sections;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectors) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(metaBlock);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-promo": parse,
    "carousel-deals": parse2,
    "cards-content": parse3,
    "columns-promo": parse4,
    "cards-category": parse5,
    "cards-support": parse6,
    "columns-cta": parse7
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Canon USA homepage with hero banner, product categories, promotions, and featured content",
    urls: ["https://www.usa.canon.com/"],
    blocks: [
      {
        name: "hero-promo",
        instances: [".contentsplit-cmp.contentsplit__40-60"]
      },
      {
        name: "carousel-deals",
        instances: [".input-card-carousel .d-card-component-container"]
      },
      {
        name: "cards-content",
        instances: [".target-teaser"]
      },
      {
        name: "columns-promo",
        instances: [".contentsplit-cmp.contentsplit__50-50"]
      },
      {
        name: "cards-category",
        instances: [".popular-categories"]
      },
      {
        name: "cards-support",
        instances: [".lists"]
      },
      {
        name: "columns-cta",
        instances: [".bumper-gradient"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Banner",
        selector: ".contentsplit.content-split-clickable-image:first-of-type",
        style: null,
        blocks: ["hero-promo"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Most Popular Deals",
        selector: ".input-card-carousel",
        style: null,
        blocks: ["carousel-deals"],
        defaultContent: [".d-card-header-container .heading-default", ".input-card-carousel > a"]
      },
      {
        id: "section-3",
        name: "Content For You",
        selector: ".target-teaser",
        style: null,
        blocks: ["cards-content"],
        defaultContent: [".target-teaser-heading"]
      },
      {
        id: "section-4",
        name: "MegaTank Promo",
        selector: ".contentsplit.content-split-clickable-image:nth-of-type(2)",
        style: "light",
        blocks: ["columns-promo"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "Popular Categories",
        selector: ".popular-categories",
        style: null,
        blocks: ["cards-category"],
        defaultContent: [".pc-title"]
      },
      {
        id: "section-6",
        name: "Get Support",
        selector: ".lists",
        style: null,
        blocks: ["cards-support"],
        defaultContent: [".heading-top h2"]
      },
      {
        id: "section-7",
        name: "CTA Bar",
        selector: ".bumper",
        style: "gradient",
        blocks: ["columns-cta"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
