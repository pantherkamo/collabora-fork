# MUI Icon Replacement Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace 63 basic SVG icons in the collabora-fork with MUI equivalents for visual consistency with other Kamo projects.

**Architecture:** A one-time Node.js script reads MUI icon JS files from kamo-internal's node_modules, extracts SVG path data via regex, and generates standalone SVG files with collabora's color palette. Originals are backed up before replacement.

**Tech Stack:** Node.js (fs, path), regex for SVG path extraction, no external dependencies.

**Spec:** `docs/superpowers/specs/2026-03-16-mui-icon-replacement-design.md`

---

## Chunk 1: Build the replacement script

### Task 1: Create the script file with icon mapping config

**Files:**
- Create: `browser/scripts/replace-icons-with-mui.js` (directory does not exist yet — create with `mkdir -p browser/scripts`)

- [ ] **Step 1: Create the script with all constants and mapping**

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Paths
const COLLABORA_ROOT = path.resolve(__dirname, '..');
const LIGHT_DIR = path.join(COLLABORA_ROOT, 'images');
const DARK_DIR = path.join(COLLABORA_ROOT, 'images', 'dark');
const LIGHT_BACKUP = path.join(LIGHT_DIR, '_originals');
const DARK_BACKUP = path.join(DARK_DIR, '_originals');
const MUI_DIR = path.resolve(__dirname, '..', '..', '..', '..', 'Next.js', 'Kamo Internal Site', 'kamo-internal', 'node_modules', '@mui', 'icons-material');

// Color config
const LIGHT_FILL = '#3a3a38';
const DARK_FILL = '#fafafa';

// Per-icon color overrides (semantic colors)
const COLOR_OVERRIDES = {
  'lc_undo.svg': { light: '#1e8bcd', dark: '#1e8bcd' },
  'lc_redo.svg': { light: '#1e8bcd', dark: '#1e8bcd' },
  'lc_delete.svg': { light: '#ed3d3d', dark: '#ed3d3d' },
  'compact_undo.svg': { light: '#1e8bcd', dark: '#1e8bcd' },
  'compact_redo.svg': { light: '#1e8bcd', dark: '#1e8bcd' },
};

// Icon mapping: collabora filename -> MUI JS filename
const ICON_MAP = {
  // File operations
  'lc_save.svg': 'Save.js',
  'lc_saveas.svg': 'SaveAs.js',
  'lc_open.svg': 'FolderOpen.js',
  'lc_newdoc.svg': 'NoteAdd.js',
  'lc_exportpdf.svg': 'PictureAsPdf.js',
  'lc_print.svg': 'Print.js',
  'lc_printpreview.svg': 'PrintOutlined.js',

  // Edit operations
  'lc_copy.svg': 'ContentCopy.js',
  'lc_cut.svg': 'ContentCut.js',
  'lc_paste.svg': 'ContentPaste.js',
  'lc_undo.svg': 'Undo.js',
  'lc_redo.svg': 'Redo.js',
  'lc_delete.svg': 'Delete.js',
  'lc_selectall.svg': 'SelectAll.js',
  'lc_recsearch.svg': 'Search.js',
  'lc_searchreplace.svg': 'FindReplace.js',

  // Text formatting
  'lc_bold.svg': 'FormatBold.js',
  'lc_italic.svg': 'FormatItalic.js',
  'lc_underline.svg': 'FormatUnderlined.js',
  'lc_strikeout.svg': 'StrikethroughS.js',
  'lc_subscript.svg': 'Subscript.js',
  'lc_superscript.svg': 'Superscript.js',
  'lc_fontcolor.svg': 'FormatColorText.js',
  'lc_backcolor.svg': 'FormatColorFill.js',

  // Paragraph alignment
  'lc_leftpara.svg': 'FormatAlignLeft.js',
  'lc_centerpara.svg': 'FormatAlignCenter.js',
  'lc_rightpara.svg': 'FormatAlignRight.js',
  'lc_justifypara.svg': 'FormatAlignJustify.js',

  // Indentation & spacing
  'lc_decrementindent.svg': 'FormatIndentDecrease.js',
  'lc_linespacing.svg': 'FormatLineSpacing.js',

  // Insert operations
  'lc_insertgraphic.svg': 'Image.js',
  'lc_inserttable.svg': 'TableChart.js',
  'lc_inserthyperlink.svg': 'Link.js',
  'lc_insertsymbol.svg': 'EmojiSymbols.js',

  // View/Navigation
  'lc_zoomin.svg': 'ZoomIn.js',
  'lc_zoomout.svg': 'ZoomOut.js',
  'lc_fullscreen.svg': 'Fullscreen.js',
  'lc_home.svg': 'Home.js',
  'lc_settings.svg': 'Settings.js',
  'lc_lock.svg': 'Lock.js',
  'lc_sidebar.svg': 'ViewSidebar.js',

  // Sort
  'lc_sortascending.svg': 'ArrowUpward.js',
  'lc_sortdescending.svg': 'ArrowDownward.js',

  // Compact variants (same MUI source as lc_ counterparts)
  'compact_save.svg': 'Save.js',
  'compact_undo.svg': 'Undo.js',
  'compact_redo.svg': 'Redo.js',
  'compact_print.svg': 'Print.js',
  'compact_insertgraphic.svg': 'Image.js',
  'compact_inserthyperlink.svg': 'Link.js',
  'compact_insertsymbol.svg': 'EmojiSymbols.js',
  'compact_inserttable.svg': 'TableChart.js',
  'compact_centerpara.svg': 'FormatAlignCenter.js',
  'compact_leftpara.svg': 'FormatAlignLeft.js',
  'compact_rightpara.svg': 'FormatAlignRight.js',
  'compact_justifypara.svg': 'FormatAlignJustify.js',
  'compact_decrementindent.svg': 'FormatIndentDecrease.js',
  'compact_linespacing.svg': 'FormatLineSpacing.js',
  'compact_fontcolor.svg': 'FormatColorText.js',
  'compact_fillcolor.svg': 'FormatColorFill.js',
  'compact_backcolor.svg': 'FormatColorFill.js',
  'compact_sortascending.svg': 'ArrowUpward.js',
  'compact_sortdescending.svg': 'ArrowDownward.js',
  'compact_sidebar.svg': 'ViewSidebar.js',
};
```

### Task 2: Add SVG element extraction function

**Files:**
- Modify: `browser/scripts/replace-icons-with-mui.js`

- [ ] **Step 1: Add the extractElements function after the ICON_MAP**

```javascript
/**
 * Extract all SVG elements from a MUI icon JS file.
 * MUI JS files contain: jsx("path", { d: "..." }) and sometimes jsx("circle", { cx: ..., cy: ..., r: ... })
 * Returns an array of objects: { type: 'path', d: '...' } or { type: 'circle', cx, cy, r }
 */
function extractElements(muiJsFilePath) {
  const content = fs.readFileSync(muiJsFilePath, 'utf-8');
  const elements = [];

  // Extract <path> elements
  const pathRegex = /d:\s*"([^"]+)"/g;
  let match;
  while ((match = pathRegex.exec(content)) !== null) {
    elements.push({ type: 'path', d: match[1] });
  }

  // Extract <circle> elements: jsx("circle", { cx: N, cy: N, r: N })
  const circleRegex = /"circle"[^}]*?cx:\s*([\d.]+)[^}]*?cy:\s*([\d.]+)[^}]*?r:\s*([\d.]+)/g;
  while ((match = circleRegex.exec(content)) !== null) {
    elements.push({ type: 'circle', cx: match[1], cy: match[2], r: match[3] });
  }

  return elements;
}
```

### Task 3: Add SVG generation function

**Files:**
- Modify: `browser/scripts/replace-icons-with-mui.js`

- [ ] **Step 1: Add the generateSvg function**

```javascript
/**
 * Generate a standalone SVG string from extracted elements and a fill color.
 * Supports both <path> and <circle> elements.
 */
function generateSvg(elements, fillColor) {
  const svgElements = elements
    .map((el) => {
      if (el.type === 'path') {
        return `  <path d="${el.d}" fill="${fillColor}"/>`;
      } else if (el.type === 'circle') {
        return `  <circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${fillColor}"/>`;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n${svgElements}\n</svg>\n`;
}
```

### Task 4: Add backup and file writing logic

**Files:**
- Modify: `browser/scripts/replace-icons-with-mui.js`

- [ ] **Step 1: Add the backup and write functions**

```javascript
/**
 * Back up an original file to the _originals directory.
 * Does not overwrite existing backups (idempotent).
 */
function backupFile(filePath, backupDir) {
  const fileName = path.basename(filePath);
  const backupPath = path.join(backupDir, fileName);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  if (!fs.existsSync(backupPath) && fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
    return true;
  }
  return false;
}

/**
 * Write SVG content to a file, creating parent directories if needed.
 */
function writeSvg(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}
```

### Task 5: Add main execution logic

**Files:**
- Modify: `browser/scripts/replace-icons-with-mui.js`

- [ ] **Step 1: Add the main function**

```javascript
function main() {
  // Verify MUI source directory exists
  if (!fs.existsSync(MUI_DIR)) {
    console.error(`ERROR: MUI icons directory not found at: ${MUI_DIR}`);
    console.error('Make sure @mui/icons-material is installed in kamo-internal.');
    process.exit(1);
  }

  const stats = { replaced: 0, skipped: 0, failed: 0, backedUp: 0 };
  const results = [];

  for (const [collaboraFile, muiFile] of Object.entries(ICON_MAP)) {
    const muiPath = path.join(MUI_DIR, muiFile);
    const lightPath = path.join(LIGHT_DIR, collaboraFile);
    const darkPath = path.join(DARK_DIR, collaboraFile);

    // Check MUI source exists
    if (!fs.existsSync(muiPath)) {
      console.warn(`WARN: MUI icon not found: ${muiFile} — skipping ${collaboraFile}`);
      results.push({ icon: collaboraFile, status: 'skipped', reason: 'MUI source missing' });
      stats.skipped++;
      continue;
    }

    // Extract SVG elements (paths and circles)
    const elements = extractElements(muiPath);
    if (elements.length === 0) {
      console.warn(`WARN: No SVG elements found in ${muiFile} — skipping ${collaboraFile}`);
      results.push({ icon: collaboraFile, status: 'failed', reason: 'No elements extracted' });
      stats.failed++;
      continue;
    }

    // Determine colors (check overrides first)
    const override = COLOR_OVERRIDES[collaboraFile];
    const lightColor = override ? override.light : LIGHT_FILL;
    const darkColor = override ? override.dark : DARK_FILL;

    // Warn if original doesn't exist (still write the new icon)
    if (!fs.existsSync(lightPath)) {
      console.warn(`WARN: Original not found: ${lightPath} — creating new file`);
    }
    if (!fs.existsSync(darkPath)) {
      console.warn(`WARN: Dark original not found: ${darkPath} — creating new file`);
    }

    // Backup originals
    if (backupFile(lightPath, LIGHT_BACKUP)) stats.backedUp++;
    if (backupFile(darkPath, DARK_BACKUP)) stats.backedUp++;

    // Generate and write SVGs
    const lightSvg = generateSvg(elements, lightColor);
    const darkSvg = generateSvg(elements, darkColor);

    writeSvg(lightPath, lightSvg);
    writeSvg(darkPath, darkSvg);

    results.push({ icon: collaboraFile, status: 'replaced', elements: elements.length });
    stats.replaced++;
  }

  // Print summary
  console.log('\n=== MUI Icon Replacement Summary ===');
  console.log(`Replaced: ${stats.replaced}`);
  console.log(`Skipped:  ${stats.skipped}`);
  console.log(`Failed:   ${stats.failed}`);
  console.log(`Backed up: ${stats.backedUp} files`);
  console.log('');

  // Print details
  for (const r of results) {
    const icon = r.icon.padEnd(35);
    if (r.status === 'replaced') {
      console.log(`  ✓ ${icon} (${r.elements} element${r.elements > 1 ? 's' : ''})`);
    } else if (r.status === 'skipped') {
      console.log(`  ⊘ ${icon} ${r.reason}`);
    } else {
      console.log(`  ✗ ${icon} ${r.reason}`);
    }
  }
}

main();
```

- [ ] **Step 2: Commit the complete script**

```bash
mkdir -p browser/scripts
git add browser/scripts/replace-icons-with-mui.js
git commit -m "feat: add MUI icon replacement script"
```

## Chunk 2: Run the script and verify

### Task 6: Run the script

**Files:**
- Modify: `browser/images/*.svg` (43 lc_ icons overwritten)
- Modify: `browser/images/dark/*.svg` (43 lc_ icons overwritten)
- Modify: `browser/images/compact_*.svg` (20 compact icons overwritten)
- Modify: `browser/images/dark/compact_*.svg` (20 compact icons overwritten)
- Create: `browser/images/_originals/` (backups)
- Create: `browser/images/dark/_originals/` (backups)

- [ ] **Step 1: Run the replacement script**

Run from the CollaboraOnline project root:

```bash
node browser/scripts/replace-icons-with-mui.js
```

Expected output: Summary showing 63 replaced, 0 skipped, 0 failed.

- [ ] **Step 2: Verify output file count**

```bash
ls browser/images/_originals/ | wc -l
ls browser/images/dark/_originals/ | wc -l
```

Expected: Both should show backed-up SVG counts matching the icons that existed in each directory.

- [ ] **Step 3: Spot-check a few generated SVGs**

Verify format of a single-path icon:
```bash
cat browser/images/lc_bold.svg
```
Expected: Valid SVG with `viewBox="0 0 24 24"` and `fill="#3a3a38"`.

Verify format of a multi-path icon:
```bash
cat browser/images/lc_zoomin.svg
```
Expected: Valid SVG with two `<path>` elements.

Verify dark theme variant:
```bash
cat browser/images/dark/lc_bold.svg
```
Expected: Same structure but `fill="#fafafa"`.

Verify semantic color override:
```bash
cat browser/images/lc_undo.svg
```
Expected: `fill="#1e8bcd"`.

Verify compact variant:
```bash
cat browser/images/compact_save.svg
```
Expected: Same SVG content as `lc_save.svg`.

- [ ] **Step 4: Commit all replaced icons**

```bash
git add browser/images/ browser/scripts/replace-icons-with-mui.js
git commit -m "feat: replace 63 basic icons with MUI equivalents

Replaces basic document-editing SVG icons (save, copy, paste, undo, redo,
bold, italic, underline, alignment, zoom, etc.) with Material UI icons
for visual consistency with other Kamo projects.

- 43 lc_ icons + 20 compact icons replaced
- Light and dark theme variants generated
- Semantic colors preserved (blue for undo/redo, red for delete)
- Originals backed up to _originals/ directories"
```
