import assert from 'node:assert/strict'
import { readdirSync, readFileSync, realpathSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

// Registry audits cannot see Yarn source patches. Allow this one advisory only
// after checking EVERY installed picomatch copy and its security behavior.
// Remove the patches and this exception when an upstream fixed release exists.
const packages = new Set()
function scan(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const path = join(directory, entry.name)
    if (entry.name === 'picomatch') packages.add(realpathSync(path))
    else scan(path)
  }
}
scan('node_modules')
assert(packages.size > 0, 'Install dependencies before auditing')

const regression = `
  const assert = require('node:assert/strict');
  const pm = require(process.argv[1]);
  for (const pattern of ['+(*)', '+(*a)', '*(*)', '*(*a)', '+(*?a)', '*(a*)', 'x+(*a)y']) {
    assert.equal(pm.isMatch('a'.repeat(64) + '!', pattern), false, pattern);
    assert.equal(pm.isMatch(pattern, pattern), true, 'risky pattern must be literalized: ' + pattern);
  }
  assert.equal(pm.isMatch('src/app.ts', '**/*.ts'), true);
  assert.equal(pm.isMatch('file.js', '*.{js,ts}'), true);
  assert.equal(pm.isMatch('abc', '+(a|b|c)'), true);
  assert.equal(pm.isMatch('aaa', '+(a)'), true);
  assert.equal(pm.isMatch('bbb', '+(a)'), false);
`
for (const path of packages) {
  const metadata = JSON.parse(readFileSync(join(path, 'package.json'), 'utf8'))
  assert(['2.3.2', '4.0.7'].includes(metadata.version), 'Reassess patch for new picomatch version')
  assert(readFileSync(join(path, 'lib/parse.js'), 'utf8').includes('GHSA-fc5q-39xc-vjpf'),
    `Missing local security patch: ${path}`)
  const result = spawnSync(process.execPath, ['-e', regression, resolve(path)], {
    encoding: 'utf8', timeout: 3000,
  })
  assert.equal(result.status, 0, result.error?.message ?? result.stderr)
  console.log(`Verified patched picomatch ${metadata.version}`)
}

// The exception is limited to this patched advisory; all other high/critical
// advisories, registry failures and failed regressions still fail the job.
const audit = spawnSync(process.execPath, [
  '.yarn/releases/yarn-4.18.1.cjs', 'npm', 'audit',
  '--all', '--recursive', '--severity', 'high', '--ignore', '1247710',
], { stdio: 'inherit' })
if (audit.error) throw audit.error
process.exitCode = audit.status ?? 1
