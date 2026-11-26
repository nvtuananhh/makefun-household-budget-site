// Hearth Ledger — the hand-in program (Node 22, standard library only).
//
// The site itself is plain static files under app/ (index.html, CSS and ES
// modules, no build step, nothing loaded over the network). This program
// hands the entry in: it copies app/ and screenshots/ from beside this file
// into the output directory and writes dossier.json there, the summary the
// judge reads (the screenshots, the first load's files and bytes, and the
// site's source), using the vendored make.fun library. vendor/
// makefun-frontend.ts stays exactly as the kit shipped it: the scorer
// rebuilds the dossier with its own copy and compares the two byte for byte.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for
// /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const appDir = join(repoRoot, 'app');
const shotsDir = join(repoRoot, 'screenshots');

if (!existsSync(join(appDir, 'index.html'))) {
  throw new Error('app/index.html is missing: the site cannot be handed in without it');
}
const shotNames = readdirSync(shotsDir).filter((name) => !name.startsWith('.'));
if (shotNames.length < 3 || shotNames.length > 4) {
  throw new Error(`screenshots/ holds ${shotNames.length} images; the gate wants 3 or 4`);
}
for (const name of shotNames) {
  const size = statSync(join(shotsDir, name)).size;
  if (size > 262144) throw new Error(`screenshots/${name} is ${size} bytes, over the 256 KiB cap`);
}

mkdirSync(outDir, { recursive: true });
cpSync(appDir, join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });

const appBytes = readdirSync(appDir, { recursive: true })
  .map((name) => join(appDir, name.toString()))
  .filter((path) => statSync(path).isFile())
  .reduce((sum, path) => sum + statSync(path).size, 0);
if (appBytes > 16 * 1024 * 1024) {
  throw new Error(`app/ is ${appBytes} bytes, over the 16 MiB gate cap`);
}

// Caps from the gate (reference/gate.json): the text cap shapes the dossier
// bytes; the others refuse an entry the scorer would refuse.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);

const dossierBytes = statSync(join(outDir, 'dossier.json')).size;
if (dossierBytes === 0 || dossierBytes > 1536 * 1024) {
  throw new Error(`dossier.json is ${dossierBytes} bytes, outside the expected range`);
}

console.log(`Hearth Ledger handed in: app/ (${appBytes} bytes) + ${shotNames.length} screenshots + dossier.json (${dossierBytes} bytes) -> ${outDir}`);
