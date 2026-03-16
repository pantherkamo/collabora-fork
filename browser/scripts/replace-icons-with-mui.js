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

function extractElements(muiJsFilePath) {
  const content = fs.readFileSync(muiJsFilePath, 'utf-8');
  const elements = [];

  // Extract <path> elements
  const pathRegex = /d:\s*"([^"]+)"/g;
  let match;
  while ((match = pathRegex.exec(content)) !== null) {
    elements.push({ type: 'path', d: match[1] });
  }

  // Extract <circle> elements
  const circleRegex = /"circle"[^}]*?cx:\s*([\d.]+)[^}]*?cy:\s*([\d.]+)[^}]*?r:\s*([\d.]+)/g;
  while ((match = circleRegex.exec(content)) !== null) {
    elements.push({ type: 'circle', cx: match[1], cy: match[2], r: match[3] });
  }

  return elements;
}

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

function writeSvg(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

function main() {
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

    if (!fs.existsSync(muiPath)) {
      console.warn(`WARN: MUI icon not found: ${muiFile} — skipping ${collaboraFile}`);
      results.push({ icon: collaboraFile, status: 'skipped', reason: 'MUI source missing' });
      stats.skipped++;
      continue;
    }

    const elements = extractElements(muiPath);
    if (elements.length === 0) {
      console.warn(`WARN: No SVG elements found in ${muiFile} — skipping ${collaboraFile}`);
      results.push({ icon: collaboraFile, status: 'failed', reason: 'No elements extracted' });
      stats.failed++;
      continue;
    }

    // Warn if original doesn't exist
    if (!fs.existsSync(lightPath)) {
      console.warn(`WARN: Original not found: ${lightPath} — creating new file`);
    }
    if (!fs.existsSync(darkPath)) {
      console.warn(`WARN: Dark original not found: ${darkPath} — creating new file`);
    }

    const override = COLOR_OVERRIDES[collaboraFile];
    const lightColor = override ? override.light : LIGHT_FILL;
    const darkColor = override ? override.dark : DARK_FILL;

    if (backupFile(lightPath, LIGHT_BACKUP)) stats.backedUp++;
    if (backupFile(darkPath, DARK_BACKUP)) stats.backedUp++;

    const lightSvg = generateSvg(elements, lightColor);
    const darkSvg = generateSvg(elements, darkColor);

    writeSvg(lightPath, lightSvg);
    writeSvg(darkPath, darkSvg);

    results.push({ icon: collaboraFile, status: 'replaced', elements: elements.length });
    stats.replaced++;
  }

  console.log('\n=== MUI Icon Replacement Summary ===');
  console.log(`Replaced: ${stats.replaced}`);
  console.log(`Skipped:  ${stats.skipped}`);
  console.log(`Failed:   ${stats.failed}`);
  console.log(`Backed up: ${stats.backedUp} files`);
  console.log('');

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
