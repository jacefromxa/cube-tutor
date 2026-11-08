#!/usr/bin/env node
/**
 * CubeDex dataset integrity check.
 *
 *   npm run verify
 *
 * Verifies the 633 curated cases before a release: counts, duplicate ids, group
 * references, video time ranges, referenced images and algorithm syntax.
 * Exits with code 1 when a hard error is found so it can gate a deploy.
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { F2L_CASES, F2L_GROUPS, VIDEO_PATH as F2L_VIDEO, invertAlgorithm } from '../src/data/f2lCases.js';
import { OLL_CASES, OLL_GROUPS, OLL_VIDEO_PATH } from '../src/data/ollCases.js';
import { PLL_CASES, PLL_VIDEO_PATH } from '../src/data/pllCases.js';
import { CMLL_CASES, CMLL_GROUPS, CMLL_VIDEO_PATH } from '../src/data/cmllCases.js';
import { ZBLL_SETS } from '../src/data/zbllCases.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

const MOVE_TOKEN_RE = /(\([^)]*\)|(?:[UDLRFBudlrfbMESxyz]w?)['2]?)/g;

const MODULES = [
  { id: 'f2l', label: 'F2L', cases: F2L_CASES, groups: F2L_GROUPS, video: F2L_VIDEO, expected: 41 },
  { id: 'oll', label: 'OLL', cases: OLL_CASES, groups: OLL_GROUPS, video: OLL_VIDEO_PATH, expected: 57 },
  { id: 'pll', label: 'PLL', cases: PLL_CASES, groups: null, video: PLL_VIDEO_PATH, expected: 21 },
  { id: 'cmll', label: 'CMLL', cases: CMLL_CASES, groups: CMLL_GROUPS, video: CMLL_VIDEO_PATH, expected: 42 },
  ...Object.entries(ZBLL_SETS).map(([setId, set]) => ({
    id: `zbll-${setId}`,
    label: `ZBLL ${set.label}`,
    cases: set.cases,
    groups: set.groups,
    video: set.videoPath,
    expected: setId === 'h' ? 40 : 72
  }))
];

const errors = [];
const warnings = [];
const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

const publicFileExists = (urlPath) =>
  typeof urlPath === 'string' && existsSync(path.join(PUBLIC_DIR, urlPath.replace(/^\//, '')));

const seenIds = new Map();
let totalCases = 0;

for (const mod of MODULES) {
  totalCases += mod.cases.length;

  if (mod.cases.length !== mod.expected) {
    fail(`${mod.label}: expected ${mod.expected} cases, found ${mod.cases.length}`);
  }

  if (!publicFileExists(mod.video)) {
    warn(`${mod.label}: video ${mod.video} is not present locally (expected when using the COS CDN)`);
  }

  for (const item of mod.cases) {
    const where = `${mod.label} ${item.id ?? '(missing id)'}`;

    if (!item.id || !item.code) fail(`${where}: missing id or code`);
    if (seenIds.has(item.id)) {
      fail(`${where}: duplicate id, already used by ${seenIds.get(item.id)}`);
    } else {
      seenIds.set(item.id, mod.label);
    }

    if (mod.groups) {
      if (!item.group) fail(`${where}: missing group`);
      else if (!mod.groups[item.group]) fail(`${where}: unknown group "${item.group}"`);
    }

    const start = Number(item.startSec);
    const end = Number(item.endSec);
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      fail(`${where}: startSec/endSec must be numbers`);
    } else if (end <= start) {
      fail(`${where}: endSec (${end}) must be greater than startSec (${start})`);
    }

    if (typeof item.duration === 'number' && Number.isFinite(start) && Number.isFinite(end)) {
      const span = Math.round((end - start) * 10) / 10;
      if (Math.abs(span - item.duration) > 1) {
        warn(`${where}: duration ${item.duration}s does not match ${start}–${end} (${span}s)`);
      }
    }

    if (!item.algorithm) {
      fail(`${where}: missing algorithm`);
    } else {
      const residue = item.algorithm.replace(MOVE_TOKEN_RE, '').replace(/\s+/g, '');
      if (residue) {
        fail(`${where}: non-move text "${residue}" in algorithm "${item.algorithm}"`);
      }
      if (!invertAlgorithm(item.algorithm)) {
        fail(`${where}: could not derive a scramble from "${item.algorithm}"`);
      }
    }

    if (!item.cubeImg) fail(`${where}: missing cubeImg`);
    else if (!publicFileExists(item.cubeImg)) fail(`${where}: image ${item.cubeImg} not found in public/`);
  }
}

if (totalCases !== 633) {
  fail(`total case count is ${totalCases}, expected 633 (CFOP 119 + ZBLL 472 + CMLL 42)`);
}

for (const message of warnings) console.warn(`⚠️  ${message}`);
for (const message of errors) console.error(`❌ ${message}`);

if (errors.length > 0) {
  console.error(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
  process.exit(1);
}

console.log(`✅ Dataset OK — ${totalCases} cases across ${MODULES.length} modules, ${warnings.length} warning(s).`);
