// GTA VI trophy guide entry (Node 22, standard library only).
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The grader runs this as nobody on a read-only tree with /output writable:
// never delete or recreate the output directory, only create it if missing.
mkdirSync(out, { recursive: true });

// Dotfiles (a .gitkeep keeping an empty dir in git, for example) must never
// reach /output: the grade run rejects any output path that is not a plain
// relative name, so both copies skip files whose name starts with a dot.
function skipDotfiles(src: string): boolean {
  return !src.split('/').pop()?.startsWith('.');
}

cpSync(join(here, 'app'), join(out, 'app'), { recursive: true, filter: skipDotfiles });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true, filter: skipDotfiles });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 48 MiB of app files; a path over 1000 bytes). app/ counts beside
// /output's own 1000-entry cap, its screenshots/ and dossier.json.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
