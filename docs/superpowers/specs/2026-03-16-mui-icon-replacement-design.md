# MUI Icon Replacement for Collabora Fork

## Summary

Replace ~60 basic document-editing SVG icons in the collabora-fork project with Material UI (MUI) equivalents to achieve visual consistency with the other Kamo Next.js projects (kamo-login, kamo-internal, kamo-register). Only basic, commonly recognizable icons are replaced; specialized LibreOffice icons (chart types, shapes, flowcharts, fontwork, layouts, etc.) are left as-is.

## Context

- The collabora-fork at `/home/kamo/Documents/kamo/Projects/C/CollaboraOnline` uses a custom SVG icon system with 1,191 icons in `browser/images/` (light) and ~976 in `browser/images/dark/`
- Icons are loaded via `<img>` tags through `LOUtil.getImageURL()` and resolved from UNO command names via `LOUtil.getIconNameOfCommand()`
- All icons use 24x24 viewBox
- The other Kamo projects use `@mui/icons-material` for their icon set
- No React or MUI dependencies exist in the collabora-fork — we replace SVG files directly, not the icon loading system

## Approach

Write a one-time Node.js script that:

1. Parses MUI icon `.js` files from an existing `node_modules/@mui/icons-material/` installation to extract SVG path `d` attributes via regex
2. Generates standalone 24x24 SVG files with collabora's color palette
3. Backs up originals before overwriting
4. Writes both light and dark theme variants

### MUI Icon Source

The `@mui/icons-material` package (v7.3.1) is already installed in `kamo-internal`. Each icon JS file contains embedded SVG path data in this format:

```javascript
createSvgIcon(jsx("path", { d: "M17 3H5c-1.11..." }), 'Save')
```

The script extracts all `d:` attributes using a regex that matches all occurrences. Most icons have a single `<path>`; some (like `ZoomIn`) have multiple paths that must all be included.

### SVG Template

**Single-path icon (light theme):**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="..." fill="#3a3a38"/>
</svg>
```

**Multi-path icon (light theme, e.g., ZoomIn):**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="..." fill="#3a3a38"/>
  <path d="..." fill="#3a3a38"/>
</svg>
```

Dark theme variants use `fill="#fafafa"` instead of `fill="#3a3a38"`.

### Color Rules

| Theme | Fill Color | Rationale |
|-------|-----------|-----------|
| Light | `#3a3a38` | Matches collabora's existing primary icon color (dark gray) |
| Dark  | `#fafafa`  | Matches collabora's existing dark-theme primary (inverted) |

Most icons use the primary color. However, to preserve semantic meaning, the following icons use accent colors matching collabora's existing palette:

| Icon | Light Fill | Dark Fill | Reason |
|------|-----------|-----------|--------|
| `lc_undo.svg`, `compact_undo.svg` | `#1e8bcd` | `#1e8bcd` | Matches existing blue accent for undo |
| `lc_redo.svg`, `compact_redo.svg` | `#1e8bcd` | `#1e8bcd` | Matches existing blue accent for redo |
| `lc_delete.svg` | `#ed3d3d` | `#ed3d3d` | Matches existing red for destructive actions |

The script supports a per-icon color override map. Icons not in the override map default to `#3a3a38` (light) / `#fafafa` (dark).

**Note on visual fidelity:** Some existing collabora icons (e.g., `lc_save.svg`) use multi-tone coloring with CSS classes (`.icon-primary`, `.icon-white`, `.icon-gray`) to create detailed, multi-color icons. The MUI replacements are flat single-color icons, which is a deliberate trade-off for cross-project consistency.

### Backup Strategy

Before overwriting, originals are copied to:
- `browser/images/_originals/`
- `browser/images/dark/_originals/`

This makes the change reversible. Rollback command:

```bash
# Restore originals
cp browser/images/_originals/*.svg browser/images/
cp browser/images/dark/_originals/*.svg browser/images/dark/
```

## Icon Mapping

### File Operations (7 icons)

| Collabora File | MUI Icon Name | MUI JS File |
|----------------|---------------|-------------|
| `lc_save.svg` | Save | `Save.js` |
| `lc_saveas.svg` | SaveAs | `SaveAs.js` |
| `lc_open.svg` | FolderOpen | `FolderOpen.js` |
| `lc_newdoc.svg` | NoteAdd | `NoteAdd.js` |
| `lc_exportpdf.svg` | PictureAsPdf | `PictureAsPdf.js` |
| `lc_print.svg` | Print | `Print.js` |
| `lc_printpreview.svg` | PrintOutlined | `PrintOutlined.js` |

### Edit Operations (9 icons)

| Collabora File | MUI Icon Name | MUI JS File |
|----------------|---------------|-------------|
| `lc_copy.svg` | ContentCopy | `ContentCopy.js` |
| `lc_cut.svg` | ContentCut | `ContentCut.js` |
| `lc_paste.svg` | ContentPaste | `ContentPaste.js` |
| `lc_undo.svg` | Undo | `Undo.js` |
| `lc_redo.svg` | Redo | `Redo.js` |
| `lc_delete.svg` | Delete | `Delete.js` |
| `lc_selectall.svg` | SelectAll | `SelectAll.js` |
| `lc_recsearch.svg` | Search | `Search.js` |
| `lc_searchreplace.svg` | FindReplace | `FindReplace.js` |

### Text Formatting (8 icons)

| Collabora File | MUI Icon Name | MUI JS File |
|----------------|---------------|-------------|
| `lc_bold.svg` | FormatBold | `FormatBold.js` |
| `lc_italic.svg` | FormatItalic | `FormatItalic.js` |
| `lc_underline.svg` | FormatUnderlined | `FormatUnderlined.js` |
| `lc_strikeout.svg` | StrikethroughS | `StrikethroughS.js` |
| `lc_subscript.svg` | Subscript | `Subscript.js` |
| `lc_superscript.svg` | Superscript | `Superscript.js` |
| `lc_fontcolor.svg` | FormatColorText | `FormatColorText.js` |
| `lc_backcolor.svg` | FormatColorFill | `FormatColorFill.js` |

### Paragraph Alignment (4 icons)

| Collabora File | MUI Icon Name | MUI JS File |
|----------------|---------------|-------------|
| `lc_leftpara.svg` | FormatAlignLeft | `FormatAlignLeft.js` |
| `lc_centerpara.svg` | FormatAlignCenter | `FormatAlignCenter.js` |
| `lc_rightpara.svg` | FormatAlignRight | `FormatAlignRight.js` |
| `lc_justifypara.svg` | FormatAlignJustify | `FormatAlignJustify.js` |

### Indentation & Spacing (3 icons)

| Collabora File | MUI Icon Name | MUI JS File |
|----------------|---------------|-------------|
| `lc_decrementindent.svg` | FormatIndentDecrease | `FormatIndentDecrease.js` |
| `lc_incrementindent.svg` | FormatIndentIncrease | `FormatIndentIncrease.js` |
| `lc_linespacing.svg` | FormatLineSpacing | `FormatLineSpacing.js` |

### Insert Operations (4 icons)

| Collabora File | MUI Icon Name | MUI JS File |
|----------------|---------------|-------------|
| `lc_insertgraphic.svg` | Image | `Image.js` |
| `lc_inserttable.svg` | TableChart | `TableChart.js` |
| `lc_inserthyperlink.svg` | Link | `Link.js` |
| `lc_insertsymbol.svg` | EmojiSymbols | `EmojiSymbols.js` |

### View/Navigation (7 icons)

| Collabora File | MUI Icon Name | MUI JS File |
|----------------|---------------|-------------|
| `lc_zoomin.svg` | ZoomIn | `ZoomIn.js` |
| `lc_zoomout.svg` | ZoomOut | `ZoomOut.js` |
| `lc_fullscreen.svg` | Fullscreen | `Fullscreen.js` |
| `lc_home.svg` | Home | `Home.js` |
| `lc_settings.svg` | Settings | `Settings.js` |
| `lc_lock.svg` | Lock | `Lock.js` |
| `lc_sidebar.svg` | ViewSidebar | `ViewSidebar.js` |

### Sort (2 icons)

| Collabora File | MUI Icon Name | MUI JS File |
|----------------|---------------|-------------|
| `lc_sortascending.svg` | ArrowUpward | `ArrowUpward.js` |
| `lc_sortdescending.svg` | ArrowDownward | `ArrowDownward.js` |

### Compact Variants (20 icons)

These use the same MUI source as their `lc_` counterparts:

| Compact File | Same MUI source as |
|---|---|
| `compact_save.svg` | Save |
| `compact_undo.svg` | Undo |
| `compact_redo.svg` | Redo |
| `compact_print.svg` | Print |
| `compact_insertgraphic.svg` | Image |
| `compact_inserthyperlink.svg` | Link |
| `compact_insertsymbol.svg` | EmojiSymbols |
| `compact_inserttable.svg` | TableChart |
| `compact_centerpara.svg` | FormatAlignCenter |
| `compact_leftpara.svg` | FormatAlignLeft |
| `compact_rightpara.svg` | FormatAlignRight |
| `compact_justifypara.svg` | FormatAlignJustify |
| `compact_decrementindent.svg` | FormatIndentDecrease |
| `compact_linespacing.svg` | FormatLineSpacing |
| `compact_fontcolor.svg` | FormatColorText |
| `compact_fillcolor.svg` | FormatColorFill |
| `compact_backcolor.svg` | FormatColorFill |
| `compact_sortascending.svg` | ArrowUpward |
| `compact_sortdescending.svg` | ArrowDownward |
| `compact_sidebar.svg` | ViewSidebar |

**Total: 44 lc_ icons + 20 compact icons = 64 icons x 2 themes = 128 file writes**

## Script Details

**Location:** `browser/scripts/replace-icons-with-mui.js`

**MUI source path:** `../../../Next.js/Kamo Internal Site/kamo-internal/node_modules/@mui/icons-material/`

**Execution:** `node browser/scripts/replace-icons-with-mui.js` from the CollaboraOnline project root

**Script flow:**
1. Define the icon mapping config (collabora filename -> MUI JS filename)
2. For each mapping entry:
   a. Read the MUI JS file
   b. Extract all `d:` path attributes via regex
   c. Generate light SVG with `fill="#3a3a38"`
   d. Generate dark SVG with `fill="#fafafa"`
   e. Back up original files to `_originals/` directories
   f. Write new SVGs to `browser/images/` and `browser/images/dark/`
3. Print summary of replaced/skipped/failed icons

**Error handling:**
- Skip if MUI JS file not found (log warning)
- Skip if collabora original doesn't exist (log warning)
- Don't overwrite backups if they already exist (idempotent re-runs)

## What Is NOT Changed

- The icon loading system (`LOUtil.ts`, `IconUtil.ts`) — untouched
- All specialized icons (shapes, charts, flowcharts, fontwork, layouts, connectors, etc.) — left as-is
- Localized icon variants (`browser/images/ar/`, `browser/images/de/`, etc.) — left as-is
- CSS files — no changes
- No new dependencies added to the collabora-fork project

## Validation

After running the script, visually verify by opening a test document in the collabora instance and checking toolbar icons. The script also prints a summary of all replaced/skipped/failed icons for quick review.
