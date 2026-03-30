import { toClassName, loadSection } from '../../scripts/aem.js';

/**
 * Section-based tabs block.
 *
 * The block rows define the tab labels.  Subsequent sibling sections whose
 * section-metadata contains a `tab` value matching a label become the
 * corresponding tab panels.  Each panel is a full section and can therefore
 * hold any combination of blocks and default content.
 */
export default async function decorate(block) {
  // 1. Read tab labels from the block rows
  const labels = [...block.children].map((row) => {
    const text = row.textContent.trim();
    row.remove();
    return text;
  });

  if (!labels.length) return;

  // 2. Find the host section that contains this block
  const hostSection = block.closest('.section');
  if (!hostSection) return;

  // 3. Collect sibling sections that have a matching data-tab attribute
  const panelSections = [];
  let next = hostSection.nextElementSibling;
  while (next) {
    if (next.dataset.tab) {
      panelSections.push(next);
      next = next.nextElementSibling;
    } else {
      break;
    }
  }

  // 4. Build tab navigation
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  // 5. Build panel container
  const panelContainer = document.createElement('div');
  panelContainer.className = 'tabs-panel-container';

  labels.forEach((label, i) => {
    const id = toClassName(label);

    // Find the matching panel section
    const panel = panelSections.find(
      (s) => toClassName(s.dataset.tab) === id,
    );

    // Create tab button
    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;
    button.textContent = label;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');

    button.addEventListener('click', () => {
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      panelContainer.querySelectorAll('.tabs-panel').forEach((p) => {
        p.setAttribute('aria-hidden', true);
      });
      button.setAttribute('aria-selected', true);
      if (panel) panel.setAttribute('aria-hidden', false);
    });

    tablist.append(button);

    // Configure the panel section
    if (panel) {
      panel.classList.add('tabs-panel');
      panel.id = `tabpanel-${id}`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', `tab-${id}`);
      panel.setAttribute('aria-hidden', !!i);
      panel.style.display = '';
      panelContainer.append(panel);
    }
  });

  block.innerHTML = '';
  block.append(tablist);
  block.append(panelContainer);

  // 6. Load blocks inside all panel sections that haven't been loaded yet
  const loadPromises = panelSections.map(async (section) => {
    if (section.dataset.sectionStatus !== 'loaded') {
      await loadSection(section);
    }
  });
  await Promise.all(loadPromises);
}
