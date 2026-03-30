# Tabs Block (Section-Based)

A section-based tabs component where each tab panel is a full AEM Edge Delivery section. This allows authors to place **any combination of blocks and default content** inside each tab — unlike traditional block-level tabs that are limited to a single block cell per tab.

## How It Works

1. A **Tabs block** defines the tab labels (one per row).
2. Consecutive sibling sections with a `tab` value in their **Section Metadata** become tab panels.
3. The block creates an accessible tab navigation bar and manages panel visibility.

```
┌──────────────────────────────┐
│  Section: Tabs block         │  ← defines tab labels
│  | Tabs |                    │
│  | Tab 1 |                   │
│  | Tab 2 |                   │
│  | Tab 3 |                   │
└──────────────────────────────┘
┌──────────────────────────────┐
│  Section: Tab 1 content      │  ← full section with any blocks
│  [hero, cards, text, etc.]   │
│  Section Metadata: tab=Tab 1 │
└──────────────────────────────┘
┌──────────────────────────────┐
│  Section: Tab 2 content      │
│  [columns, images, etc.]     │
│  Section Metadata: tab=Tab 2 │
└──────────────────────────────┘
┌──────────────────────────────┐
│  Section: Tab 3 content      │
│  [any content]               │
│  Section Metadata: tab=Tab 3 │
└──────────────────────────────┘
```

## Content Model

### Tabs Block (defines tab labels)

| Tabs            |
|-----------------|
| Overview        |
| Features        |
| Specifications  |

Each row is a single text value — the tab label.

### Tab Panel Sections (one per tab)

Each panel section is a standard section with any content, plus a **Section Metadata** block:

| Section Metadata |               |
|------------------|---------------|
| tab              | Overview      |

The `tab` value **must exactly match** one of the labels in the Tabs block.

## Authoring in Document (Word/Google Docs)

```
--- (section break)

| Tabs |
| Overview |
| Features |
| Specifications |

--- (section break)

## Product Overview
Some introductory text about the product.

| Section Metadata |           |
|------------------|-----------|
| tab              | Overview  |

--- (section break)

## Key Features

| Cards |
| **Fast** Performance is excellent. |
| **Reliable** Built to last.        |

| Section Metadata |           |
|------------------|-----------|
| tab              | Features  |

--- (section break)

## Technical Specifications

| Columns |              |
|---------|--------------|
| Weight  | 3.2 lbs      |
| Size    | 12 x 8 in    |

| Section Metadata |                  |
|------------------|------------------|
| tab              | Specifications   |
```

## Authoring in Universal Editor

1. Add a **Tabs** block to a section.
2. Add **Tab Item** children — each with a `label` field for the tab button text.
3. Create subsequent sections and set their **Tab Label** field (in the section properties panel) to match one of the tab labels.
4. Add any blocks or content inside those sections.

### Model Fields

**Tab Item** (child of Tabs block):

| Field | Type | Description |
|-------|------|-------------|
| `label` | text | Display text for the tab button |

**Section** (tab panel):

| Field | Type | Description |
|-------|------|-------------|
| `tab` | text | Assigns this section as a tab panel. Must match a tab label. |

## Accessibility

The block produces fully accessible markup:

- `role="tablist"` on the tab navigation container
- `role="tab"` on each tab button with `aria-selected` and `aria-controls`
- `role="tabpanel"` on each panel section with `aria-labelledby` and `aria-hidden`
- Keyboard support via native `<button>` elements

## Styling

Tab buttons use the project's brand color (`--color-brand-500`) for the active indicator and hover state. The tab bar scrolls horizontally on narrow screens.

Key CSS classes:

| Class | Element | Purpose |
|-------|---------|---------|
| `.tabs-list` | Tab navigation bar | Flexbox row with bottom border |
| `.tabs-tab` | Tab button | Individual tab trigger |
| `.tabs-panel-container` | Wrapper | Contains all panel sections |
| `.tabs-panel` | Panel section | Full section acting as tab content |

## Files

| File | Purpose |
|------|---------|
| `tabs.js` | Block decoration — reads labels, collects panel sections, builds tab UI |
| `tabs.css` | Styles for tab bar, buttons, and panel sections |
| `_tabs.json` | Universal Editor model definition |
