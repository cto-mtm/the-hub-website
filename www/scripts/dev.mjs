/**
 * Dev server launcher. Reads the port from ports.json (repo root) and starts
 * `nuxt dev` on 0.0.0.0:<app.vite>. Nuxt's listener silently falls back to
 * another port when the requested one is busy, so we probe first and fail
 * loudly instead.
 *
 * Usage: node scripts/dev.mjs [extra nuxt dev args]
 */
import { readFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ports = JSON.parse(readFileSync(join(__dirname, '../../ports.json'), 'utf-8'))
const port = ports.app.vite
const host = '0.0.0.0'

function assertPortFree() {
  return new Promise((resolve, reject) => {
    const probe = createServer()
    probe.once('error', reject)
    probe.listen({ port, host, exclusive: true }, () => probe.close(resolve))
  })
}

try {
  await assertPortFree()
} catch (err) {
  console.error(`\n[dev] Port ${port} (ports.json app.vite) is unavailable on ${host}: ${err.code ?? err.message}`)
  console.error('[dev] Refusing to start on a different port. Free the port and retry.\n')
  process.exit(1)
}

// `nuxt` is on PATH via npm scripts (node_modules/.bin); shell needed for the .cmd shim on Windows.
const child = spawn(
  'nuxt',
  ['dev', '--host', host, '--port', String(port), ...process.argv.slice(2)],
  { stdio: 'inherit', cwd: join(__dirname, '..'), shell: process.platform === 'win32' }
)
child.on('exit', code => process.exit(code ?? 1))
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig))
