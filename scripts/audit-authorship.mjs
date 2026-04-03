#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'

const cwd = process.cwd()
const options = parseArgs(process.argv.slice(2))
const owner = options.owner ?? 'Chai Pin Zheng'
const ownerSlug = slugify(owner)
const inferredAliases = loadOwnerAliases(ownerSlug)
const allowedValues = Array.from(
  new Set([owner, ownerSlug, ...inferredAliases, ...(options.allow ?? [])]),
)
const allowedTokens = allowedValues.map(normalize).filter(Boolean)

const trackedFiles = git(['ls-files', '-z'])
  .split('\u0000')
  .filter(Boolean)
  .filter((file) => existsSync(resolve(cwd, file)))

const untrackedFiles = git(['ls-files', '--others', '--exclude-standard', '-z'])
  .split('\u0000')
  .filter(Boolean)

const repoSignals = collectRepoSignals()
const historyFlags = []
const frontmatterFlags = []

let ownerOnlyCount = 0
let mixedCount = 0
let externalOnlyCount = 0

for (const file of trackedFiles) {
  const history = git(['log', '--follow', '--format=%an <%ae>', '--', file])
    .split('\n')
    .filter(Boolean)

  if (history.length === 0) continue

  const authorCounts = countValues(history)
  const ownerAuthors = [...authorCounts.keys()].filter(matchesAllowed)
  const nonOwnerAuthors = [...authorCounts.keys()].filter(
    (author) => !matchesAllowed(author),
  )

  if (nonOwnerAuthors.length === 0) {
    ownerOnlyCount += 1
  } else if (ownerAuthors.length === 0) {
    externalOnlyCount += 1
  } else {
    mixedCount += 1
  }

  if (nonOwnerAuthors.length > 0) {
    historyFlags.push({
      file,
      status: ownerAuthors.length === 0 ? 'external-history' : 'mixed-history',
      commits: history.length,
      nonOwnerAuthors: formatCounts(authorCounts, nonOwnerAuthors),
    })
  }

  if (isContentFile(file)) {
    const content = safeReadText(file)
    if (content) {
      collectFrontmatterFlags(file, content, frontmatterFlags, ownerSlug)
    }
  }
}

historyFlags.sort((left, right) => {
  if (right.commits !== left.commits) return right.commits - left.commits
  return left.file.localeCompare(right.file)
})

frontmatterFlags.sort((left, right) => left.file.localeCompare(right.file))

const report = renderReport({
  owner,
  allowedValues,
  trackedFiles,
  untrackedFiles,
  ownerOnlyCount,
  mixedCount,
  externalOnlyCount,
  repoSignals,
  frontmatterFlags,
  historyFlags,
})

if (options.out) {
  writeFileSync(resolve(cwd, options.out), report)
  process.stdout.write(`Wrote authorship audit to ${options.out}\n`)
} else {
  process.stdout.write(report)
}

function parseArgs(argv) {
  const parsed = {
    allow: [],
  }

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]

    if (value === '--owner') {
      parsed.owner = argv[index + 1]
      index += 1
      continue
    }

    if (value === '--allow') {
      parsed.allow.push(argv[index + 1])
      index += 1
      continue
    }

    if (value === '--out') {
      parsed.out = argv[index + 1]
      index += 1
    }
  }

  return parsed
}

function git(args) {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function matchesAllowed(value) {
  const normalized = normalize(value)
  return allowedTokens.some((token) => token && normalized.includes(token))
}

function loadOwnerAliases(ownerId) {
  const aliases = new Set()
  const profilePath = resolve(cwd, `src/content/authors/${ownerId}.md`)

  if (!existsSync(profilePath)) return aliases

  const profile = safeReadText(`src/content/authors/${ownerId}.md`)
  if (!profile) return aliases

  const github = profile.match(/^github:\s*['"]?([^'"\n]+)['"]?\s*$/m)?.[1]
  const email = profile.match(/^mail:\s*['"]?([^'"\n]+)['"]?\s*$/m)?.[1]

  if (github) {
    aliases.add(github)
    const githubHandle = github.match(/github\.com\/([^/?#]+)/i)?.[1]
    if (githubHandle) aliases.add(githubHandle)
  }

  if (email) {
    aliases.add(email)
    const [localPart] = email.split('@')
    if (localPart) aliases.add(localPart)
  }

  return aliases
}

function collectRepoSignals() {
  const signals = []
  const origin = git(['remote', 'get-url', 'origin'])
  const upstream = git(['remote', 'get-url', 'upstream'])

  if (origin && !matchesAllowed(origin)) {
    signals.push({
      type: 'origin-remote',
      value: origin,
    })
  }

  if (upstream && !matchesAllowed(upstream)) {
    signals.push({
      type: 'upstream-remote',
      value: upstream,
    })
  }

  const licensePath = resolve(cwd, 'LICENSE')
  if (existsSync(licensePath)) {
    const license = readFileSync(licensePath, 'utf8')
    const copyrightLine = license.match(/^Copyright.*$/im)?.[0]

    if (copyrightLine && !matchesAllowed(copyrightLine)) {
      signals.push({
        type: 'license-copyright',
        value: copyrightLine,
      })
    }
  }

  return signals
}

function countValues(values) {
  const counts = new Map()

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return counts
}

function formatCounts(counts, keys) {
  return keys
    .map((key) => `${key} (${counts.get(key) ?? 0})`)
    .sort((left, right) => right.localeCompare(left))
    .join(', ')
}

function isContentFile(file) {
  return /\.(md|mdx)$/i.test(file) || file.startsWith('src/content/authors/')
}

function safeReadText(file) {
  try {
    return readFileSync(resolve(cwd, file), 'utf8')
  } catch {
    return ''
  }
}

function collectFrontmatterFlags(file, content, flags, ownerId) {
  const frontmatter = content.match(/^---\s*\n([\s\S]*?)\n---/m)?.[1]

  if (!frontmatter) return

  const authorList = frontmatter.match(/^authors:\s*\[(.*?)\]\s*$/m)?.[1]
  if (authorList) {
    const authors = authorList
      .split(',')
      .map((entry) => entry.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean)
    const unexpectedAuthors = authors.filter(
      (author) => !matchesAllowed(author) && author !== ownerId,
    )

    if (unexpectedAuthors.length > 0) {
      flags.push({
        file,
        type: 'frontmatter-authors',
        value: unexpectedAuthors.join(', '),
      })
    }
  }

  if (file.startsWith('src/content/authors/')) {
    const authorId = basename(file, extname(file))

    if (!matchesAllowed(authorId) && authorId !== ownerId) {
      flags.push({
        file,
        type: 'author-profile-id',
        value: authorId,
      })
    }
  }
}

function renderReport(data) {
  const lines = [
    '# Authorship Audit',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Owner: ${data.owner}`,
    `Allowed identities: ${data.allowedValues.join(', ')}`,
    '',
    '## Summary',
    `- Tracked files scanned: ${data.trackedFiles.length}`,
    `- Owner-only history: ${data.ownerOnlyCount}`,
    `- Mixed history: ${data.mixedCount}`,
    `- External-only history: ${data.externalOnlyCount}`,
    `- Repo lineage flags: ${data.repoSignals.length}`,
    `- Frontmatter/profile flags: ${data.frontmatterFlags.length}`,
    `- Untracked files skipped from git-history audit: ${data.untrackedFiles.length}`,
    '',
    'History classifications use committed git ancestry. Modified working-tree files can still contain new local edits from the owner.',
    '',
  ]

  lines.push('## Repo Lineage Flags', '')
  if (data.repoSignals.length === 0) {
    lines.push('No repo-level lineage flags found.', '')
  } else {
    lines.push('| Signal | Value |', '| --- | --- |')
    for (const signal of data.repoSignals) {
      lines.push(`| ${escapeCell(signal.type)} | ${escapeCell(signal.value)} |`)
    }
    lines.push('')
  }

  lines.push('## Frontmatter And Profile Flags', '')
  if (data.frontmatterFlags.length === 0) {
    lines.push('No frontmatter/profile flags found.', '')
  } else {
    lines.push('| File | Type | Value |', '| --- | --- | --- |')
    for (const flag of data.frontmatterFlags) {
      lines.push(
        `| ${escapeCell(flag.file)} | ${escapeCell(flag.type)} | ${escapeCell(flag.value)} |`,
      )
    }
    lines.push('')
  }

  lines.push('## Files With Non-Owner Git History', '')
  if (data.historyFlags.length === 0) {
    lines.push('No files with non-owner history found.', '')
  } else {
    lines.push('| File | Status | Commits | Non-owner authors |')
    lines.push('| --- | --- | ---: | --- |')
    for (const flag of data.historyFlags) {
      lines.push(
        `| ${escapeCell(flag.file)} | ${escapeCell(flag.status)} | ${flag.commits} | ${escapeCell(flag.nonOwnerAuthors)} |`,
      )
    }
    lines.push('')
  }

  if (data.untrackedFiles.length > 0) {
    lines.push('## Untracked Files Skipped', '')
    for (const file of data.untrackedFiles.sort()) {
      lines.push(`- ${file}`)
    }
    lines.push('')
  }

  return `${lines.join('\n')}\n`
}

function escapeCell(value) {
  return String(value).replace(/\|/g, '\\|')
}
