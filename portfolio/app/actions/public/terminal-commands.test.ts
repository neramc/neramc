import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { runCommand, type TerminalData } from './terminal-commands.ts'

const data: TerminalData = {
  projects: [
    { slug: 'linuxhub', name: 'Linuxhub', status: 'active', href: '/projects/linuxhub' },
    { slug: 'markdown-studio', name: 'Markdown Studio', status: 'archived', href: '/projects/markdown-studio' },
  ],
  gear: [{ label: '언어', items: ['Rust'] }],
  githubHref: 'https://github.com/neramc',
}

describe('terminal commands', () => {
  it('opens projects by slug, name or prefix', () => {
    assert.equal(runCommand('open linuxhub', data).navigate, '/projects/linuxhub')
    assert.equal(runCommand('open Markdown Studio', data).navigate, '/projects/markdown-studio')
    assert.equal(runCommand('cd ~/projects/mark/', data).navigate, '/projects/markdown-studio')
    assert.equal(runCommand('open nothing', data).navigate, undefined)
  })

  it('lists projects by status', () => {
    let text = runCommand('ls', data).lines.map((line) => line.text).join('\n')
    assert.match(text, /장착 중\s+linuxhub\//)
    assert.match(text, /보관함\s+markdown-studio\//)
  })

  it('mines ore with weighted XP', () => {
    assert.equal(runCommand('mine', data, { random: () => 0 }).xp, 1)
    assert.equal(runCommand('mine', data, { random: () => 0.999 }).xp, 10)
  })

  it('clears, ignores blank input and reports unknown commands', () => {
    assert.equal(runCommand('clear', data).clear, true)
    assert.deepEqual(runCommand('   ', data).lines, [])
    assert.match(runCommand('frobnicate', data).lines[0].text, /command not found/)
  })

  it('caps input length', () => {
    let result = runCommand(`echo ${'x'.repeat(200)}`, data)
    assert.ok(result.lines[0].text.length <= 64)
  })
})
