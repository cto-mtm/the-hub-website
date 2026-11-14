/**
 * Build & deploy for The Hub Louisville website — the only deploy path.
 * Cross-platform, so `npm run deploy` behaves the same everywhere.
 *
 * Same pipeline shape as the app family's scripts/deploy.mjs: guard → build →
 * stage into Hosting's public dir → deploy → append to the gitignored
 * deploys/LEDGER.md. There is no automated test suite, so the only pre-deploy
 * gate is the functions compile (tsc) — a type error stops the deploy.
 *
 * Usage:
 *   npm run deploy                        # hosting + functions
 *   npm run deploy -- --only-hosting      # site only
 *   npm run deploy -- --only-functions    # submitForm only
 *   npm run deploy -- --dry-run           # print every step, change nothing
 *
 * Requires `firebase login` and `npm install` in www/ and firebase/functions/.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stage } from './lib/stage.mjs';

// ─── Site config ────────────────────────────────────────────────────────
const CONFIG = {
  siteName: 'The Hub Louisville Website',
  // firebase.json and .firebaserc both live in firebase/, so the CLI runs
  // there and resolves the project from the .firebaserc default.
  firebaseDir: 'firebase',
  firebasercPath: 'firebase/.firebaserc',
  // Cloud Functions (the submitForm backend). Compiled with tsc before deploy.
  functions: { cmd: 'npm run build', cwd: 'firebase/functions', env: 'firebase/functions/.env' },
  // Static site generation (prerenders every page in both locales).
  build: { cmd: 'npm run generate', cwd: 'www' },
  // Generated site → Hosting public dir (firebase.json: "public": "www").
  hostingSrc: 'www/.output/public',
  hostingDest: 'firebase/www',
};
// ────────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const deployStarted = Date.now();

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const onlyHosting = args.includes('--only-hosting');
const onlyFunctions = args.includes('--only-functions');
if (onlyHosting && onlyFunctions) {
  console.error('ERROR: --only-hosting and --only-functions are mutually exclusive.');
  process.exit(1);
}
const withHosting = !onlyFunctions;
const withFunctions = !onlyHosting;
const scope = [withHosting && 'hosting', withFunctions && 'functions'].filter(Boolean).join(' + ');

function run(cmd, cwd = root) {
  const where = cwd !== root ? ` in ${path.relative(root, cwd)}` : '';
  if (dryRun) {
    console.log(`[dry run] would execute: ${cmd}${where}`);
    return;
  }
  console.log(`Executing: ${cmd}${where}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function die(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

console.log(`\n🚀 ${CONFIG.siteName} deploy (${scope})${dryRun ? ' — DRY RUN' : ''}\n`);

// ─── 1. Guard: .firebaserc must exist and carry a real project id ────────
const firebasercPath = path.join(root, CONFIG.firebasercPath);
if (!fs.existsSync(firebasercPath)) die(`${CONFIG.firebasercPath} not found!`);
if (fs.readFileSync(firebasercPath, 'utf8').includes('REPLACE_ME')) {
  die(`${CONFIG.firebasercPath} still contains REPLACE_ME — set the real Firebase project id first.`);
}

// ─── 2. Guard: dependencies installed, mailer configured ─────────────────
const needsInstall = [withHosting && CONFIG.build.cwd, withFunctions && CONFIG.functions.cwd].filter(Boolean);
for (const dir of needsInstall) {
  if (!dryRun && !fs.existsSync(path.join(root, dir, 'node_modules'))) {
    die(`${dir}/node_modules is missing — run \`npm install\` in ${dir}/ first.`);
  }
}
if (withFunctions) {
  // Without MAILER_URL the forms deploy fine and then fail every submission.
  const envPath = path.join(root, CONFIG.functions.env);
  const env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  if (!/^MAILER_URL=\S+/m.test(env)) {
    die(`${CONFIG.functions.env} must set MAILER_URL (see docs/mtmcya-mailer.md).`);
  }
}

let s;

// ─── 3. Build Cloud Functions ────────────────────────────────────────────
if (withFunctions) {
  s = stage(`Build functions (${CONFIG.functions.cmd})`);
  run(CONFIG.functions.cmd, path.join(root, CONFIG.functions.cwd));
  s.done();
}

if (withHosting) {
  // ─── 4. Build the site ─────────────────────────────────────────────────
  s = stage(`Build site (${CONFIG.build.cmd})`);
  run(CONFIG.build.cmd, path.join(root, CONFIG.build.cwd));
  s.done();

  // ─── 5. Stage the generated site into Hosting's public dir ─────────────
  s = stage('Stage files for hosting');
  const src = path.join(root, CONFIG.hostingSrc);
  const dest = path.join(root, CONFIG.hostingDest);
  if (dryRun) {
    console.log(`[dry run] would replace ${CONFIG.hostingDest} with ${CONFIG.hostingSrc}`);
  } else {
    if (!fs.existsSync(src)) die(`build output not found at ${CONFIG.hostingSrc}`);
    fs.rmSync(dest, { recursive: true, force: true });
    fs.mkdirSync(dest, { recursive: true });
    fs.cpSync(src, dest, { recursive: true });
  }
  s.done(`copied ${CONFIG.hostingSrc} → ${CONFIG.hostingDest}`);
}

// ─── 6. Deploy ───────────────────────────────────────────────────────────
// --force skips the Artifact Registry cleanup-policy prompt on functions deploys.
const only = onlyHosting ? '--only hosting' : onlyFunctions ? '--only functions' : '--only hosting,functions';
s = stage(`Deploy (${scope})`);
run(`npx firebase deploy ${only} --non-interactive${withFunctions ? ' --force' : ''}`, path.join(root, CONFIG.firebaseDir));
s.done(dryRun ? 'skipped (dry run)' : 'deployed');

const totalMin = ((Date.now() - deployStarted) / 60000).toFixed(1);
console.log(`\n✔ Done in ${totalMin} min.`);

// ─── 7. Append to the deploy ledger ──────────────────────────────────────
if (!dryRun) {
  const ledgerPath = path.join(root, 'deploys', 'LEDGER.md');
  try {
    fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
    const git = (cmd) => execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    // The ledger still records the deploy when the folder isn't a git repo yet.
    let source = '- **SHA:** not a git repository';
    try {
      const sha = git('git rev-parse --short HEAD');
      const branch = git('git rev-parse --abbrev-ref HEAD');
      const subject = git('git log -1 --format=%s');
      const dirty = git('git status --porcelain') !== '';
      source = `- **SHA:** \`${sha}\` (${branch})${dirty ? ' ⚠️ with uncommitted changes' : ''}\n- **Commit:** ${subject}`;
    } catch { /* no git — keep the fallback line */ }
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const entry = [
      `## ${timestamp}`,
      '',
      source,
      `- **Scope:** ${scope}`,
      `- **Duration:** ${totalMin} min`,
      '',
      '---',
      '',
    ].join('\n');

    // Insert newest-first, right after the header's first `---`.
    if (fs.existsSync(ledgerPath)) {
      const content = fs.readFileSync(ledgerPath, 'utf8');
      const marker = '---\n';
      const insertAt = content.indexOf(marker);
      if (insertAt !== -1) {
        const before = content.slice(0, insertAt + marker.length);
        const after = content.slice(insertAt + marker.length);
        fs.writeFileSync(ledgerPath, before + '\n' + entry + after);
      } else {
        fs.appendFileSync(ledgerPath, '\n' + entry);
      }
    } else {
      fs.writeFileSync(ledgerPath, `# Deploy Ledger\n\nNewest first.\n\n---\n\n${entry}`);
    }
    console.log('📋 Ledger updated: deploys/LEDGER.md');
  } catch (e) {
    // Non-fatal — don't fail the deploy over ledger bookkeeping.
    console.warn(`⚠️ Could not update deploy ledger: ${e.message}`);
  }
}
