// Fails the build when a colour is written anywhere other than styles/tokens.css.
// Rules: raw hex, CSS colour functions, Tailwind palette utilities, and named
// CSS colours. `public/` is never walked, so real brand assets keep their colours.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const SCAN_DIRS = ['app', 'components', 'lib', 'content', 'styles', 'hooks'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.css']);
const EXEMPT_FILES = new Set(['styles/tokens.css']);
const SKIP_DIRS = new Set(['node_modules', '.next', 'out']);

const PALETTE =
  'red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|white|black';
const PREFIXES =
  'bg|text|border|border-[trblsexy]|ring|ring-offset|outline|fill|stroke|from|via|to|decoration|accent|caret|shadow|inset-ring|divide|placeholder';

const RULES = [
  {
    id: 'hex',
    re: /(?<![\w-])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/gi,
    // Anchors, ids and SVG references also start with "#": skip those lines.
    skipLine: /\b(?:href|id|htmlFor|for|aria-[\w-]+)\s*[=:]\s*["'`{(]*#|url\(#|`#\$\{|'#'|"#"/,
  },
  {
    id: 'color-fn',
    // color-mix( is allowed: it only composes tokens. var(--color-x) does not
    // match because "color" is followed by "-", not "(".
    re: /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/g,
  },
  {
    id: 'tailwind-palette',
    re: new RegExp(
      `(?<![\\w-])(?:[\\w-]+:)*(?:${PREFIXES})-(?:${PALETTE})(?:-\\d{2,3})?(?:\\/\\d{1,3})?(?![\\w-])`,
      'g',
    ),
  },
  {
    id: 'named-color',
    cssOnly: true,
    re: /:\s*(?:white|black|red|blue|green|gray|grey|silver|orange|yellow|purple|pink|navy|teal)\b/gi,
  },
];

const IGNORE_LINE = /lint-colors-ignore-line/;
const IGNORE_NEXT = /lint-colors-ignore-next-line/;
const IGNORE_FILE = /lint-colors-ignore-file/;

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if ([...EXTENSIONS].some((ext) => entry.name.endsWith(ext))) yield full;
  }
}

const findings = [];
let filesScanned = 0;
let escapesUsed = 0;

for (const dir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const rel = relative(ROOT, file).split('\\').join('/');
    if (EXEMPT_FILES.has(rel)) continue;
    const source = readFileSync(file, 'utf8');
    const lines = source.split('\n');
    if (lines.slice(0, 3).some((l) => IGNORE_FILE.test(l))) {
      escapesUsed += 1;
      continue;
    }
    filesScanned += 1;
    const isCss = rel.endsWith('.css');
    let skipNext = false;
    lines.forEach((line, i) => {
      if (skipNext) {
        skipNext = false;
        return;
      }
      if (IGNORE_NEXT.test(line)) {
        skipNext = true;
        escapesUsed += 1;
        return;
      }
      if (IGNORE_LINE.test(line)) {
        escapesUsed += 1;
        return;
      }
      for (const rule of RULES) {
        if (rule.cssOnly && !isCss) continue;
        if (rule.skipLine && rule.skipLine.test(line)) continue;
        rule.re.lastIndex = 0;
        let match;
        while ((match = rule.re.exec(line)) !== null) {
          findings.push({
            file: rel,
            line: i + 1,
            col: match.index + 1,
            rule: rule.id,
            text: match[0],
          });
        }
      }
    });
  }
}

if (findings.length > 0) {
  for (const f of findings) {
    console.error(`${f.file}:${f.line}:${f.col}  ${f.rule}  «${f.text}»`);
  }
  console.error(`\nlint:colors — ${findings.length} finding(s) outside styles/tokens.css`);
  process.exit(1);
}

console.log(
  `lint:colors — ${filesScanned} file(s) scanned, no colours outside styles/tokens.css` +
    (escapesUsed ? ` (${escapesUsed} escape(s) used)` : ''),
);
