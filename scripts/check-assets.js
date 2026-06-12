#!/usr/bin/env node
'use strict';
/**
 * check-assets.js — verify that all local asset references in docs/index.html
 * resolve to real files on disk. Exits with code 1 if any are missing.
 *
 * Usage: node scripts/check-assets.js
 */

const fs = require('fs');
const path = require('path');

const HTML_FILE = path.resolve(__dirname, '..', 'docs', 'index.html');
const HTML_DIR  = path.dirname(HTML_FILE);

const html = fs.readFileSync(HTML_FILE, 'utf8');

// Find all href and src attribute values
const ATTR_RE = /(?:href|src)="([^"]+)"/g;
let match;
const missing = [];

while ((match = ATTR_RE.exec(html)) !== null) {
  const ref = match[1];
  // Skip absolute and protocol-relative URLs
  if (/^(?:[a-z][a-z0-9+\-.]*:)?\/\//i.test(ref) || /^[a-z][a-z0-9+\-.]*:/i.test(ref)) {
    continue;
  }
  const resolved = path.resolve(HTML_DIR, ref);
  if (!fs.existsSync(resolved)) {
    missing.push({ ref, resolved });
  }
}

if (missing.length === 0) {
  console.log('✅ All asset references in docs/index.html resolve OK.');
  process.exit(0);
} else {
  console.error(`❌ ${missing.length} broken asset reference(s) in docs/index.html:`);
  for (const { ref, resolved } of missing) {
    console.error(`  ${ref}  →  ${resolved}`);
  }
  process.exit(1);
}
