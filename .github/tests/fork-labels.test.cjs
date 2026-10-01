const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')
const { runInNewContext } = require('node:vm')

const root = resolve(__dirname, '../..')
const workflow = readFileSync(
  resolve(root, '.github/workflows/pr-label-branch-name.yml'),
  'utf8',
)
const script = workflow
  .split('          script: |\n')[1]
  .split('\n')
  .map((line) => line.slice(12))
  .join('\n')
const config = readFileSync(
  resolve(root, '.github/workflows/config/pr-label-branch-name.yml'),
  'utf8',
)

async function labelsFor(ref) {
  const calls = []
  await runInNewContext(`(async () => { ${script} })()`, {
    Buffer,
    context: {
      repo: { owner: 'bubkoo', repo: 'html-to-image' },
      payload: {
        pull_request: {
          number: 595,
          base: { sha: 'trusted-base-sha' },
          head: { ref, repo: { owner: { login: 'houmark-com' } } },
        },
      },
    },
    github: {
      rest: {
        repos: {
          getContent: async (request) => {
            assert.equal(request.owner, 'bubkoo')
            assert.equal(request.repo, 'html-to-image')
            assert.equal(request.ref, 'trusted-base-sha')
            assert.equal(
              request.path,
              '.github/workflows/config/pr-label-branch-name.yml',
            )
            return { data: { content: Buffer.from(config).toString('base64') } }
          },
        },
        issues: {
          addLabels: async (request) => {
            assert.equal(request.owner, 'bubkoo')
            assert.equal(request.repo, 'html-to-image')
            assert.equal(request.issue_number, 595)
            calls.push(...request.labels)
          },
        },
      },
    },
  })
  return calls
}

for (const [label, patterns] of Object.entries(JSON.parse(config))) {
  for (const pattern of [patterns].flat()) {
    test(`labels a fork branch matching ${pattern} in the base repository`, async () => {
      assert.deepEqual(await labelsFor(pattern.replace('*', 'example')), [
        label,
      ])
    })
  }
}
test('does not label unmatched or misleading branch names', async () => {
  for (const ref of [
    'main',
    'prefix-feature/example',
    'feature',
    'fixity/example',
  ]) {
    assert.deepEqual(await labelsFor(ref), [])
  }
})
