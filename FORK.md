# Houmark html-to-image fork

This public MIT-licensed fork preserves the upstream library and carries small,
tested source changes. The release baseline is upstream 1.11.13; the source
baseline is upstream master at ad4ff59 (2026-05-28). Its rendering source has not
changed since the upstream 1.11.13 release.

The `houmark` branch integrates the fixes. `master` remains the upstream baseline.
Contribution branches contain no fork packaging or integration metadata:

| Branch | Change | Dependency |
| --- | --- | --- |
| feature/capture-style-option-cache | Honor each capture's property list | None |
| feature/skip-svg-fragment-fetch | Do not fetch fragment-only CSS URLs | None |
| feature/clone-node-callback | Decorate a detached copy after cloning | None |
| feature/per-node-style-properties | Select computed properties per element | Cache fix |

No upstream PRs have been opened for these changes. The fragment fix does not
normalize absolute same-document URLs and does not resolve all of upstream #579.
The capability marker on `getStyleProperties` is fork integration metadata and
is intentionally absent from contribution branches.

## Build and verify

```sh
pnpm install --frozen-lockfile --ignore-scripts # pnpm 8.15.9, Node 22
pnpm build
pnpm test # Chrome or CHROME_BIN must be available
npm pack --ignore-scripts
```

The browser suite covers changing style lists across captures, fragment fetching,
callback ordering and original-document preservation, per-element selections,
and the combined hooks with CSS layers. Existing upstream skipped tests remain
skipped. The published tarball includes rebuilt ESM, CommonJS, UMD, source,
declarations, and source maps.

## Public distribution

Releases use `1.11.13-houmark.N`. A compiled npm tarball and SHA-256 checksum are
attached to each public GitHub Release. Consumers pin the versioned release URL
and lock its integrity. Installation needs no GitHub or npm credentials.
Never replace an existing release asset; publish a new version for changes.
Original authorship and MIT license are retained.

## Updating from upstream

Before every fork or consuming-app release, check upstream tags and source:

```sh
git fetch upstream --tags
git log --oneline master..upstream/master -- src
npm view html-to-image version time --json
```

For a new upstream release, prepare a separate integration branch, apply only
fixes still missing upstream, rebuild, run the complete browser suite, and test
consumer production bundles and actual browser captures. Keep separate source
commits to make dropping merged fixes straightforward. A merged upstream PR is
not sufficient evidence of a published fix. Switch back to upstream only after
a released package passes all required regressions and consumer captures.
Fork CI reports the current upstream published version on every run. It does
not submit PRs, merge upstream changes, or publish packages automatically.
