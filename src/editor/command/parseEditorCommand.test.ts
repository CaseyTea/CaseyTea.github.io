import { portfolioData } from '../../data/portfolio'
import { createBufferRegistry } from '../buffers/createBufferRegistry'
import { parseEditorCommand } from './parseEditorCommand'

const registry = createBufferRegistry(portfolioData)

test.each([
  [':e README.md', 'readme'],
  ['  e   experience.log  ', 'experience'],
  [':e GuessThatAsciiMon', 'project-guess-that-ascii-mon'],
] as const)('resolves the editor command %s through buffer aliases', (input, bufferId) => {
  expect(parseEditorCommand(input, registry)).toEqual({
    type: 'open-buffer',
    bufferId,
  })
})

test.each([
  [':help', { type: 'help' }],
  [' help ', { type: 'help' }],
  [':resume', { type: 'resume' }],
  ['resume', { type: 'resume' }],
] as const)('recognizes %s with an optional leading colon', (input, expected) => {
  expect(parseEditorCommand(input, registry)).toEqual(expected)
})

test.each([
  [':vim on', true],
  ['vim   off', false],
] as const)('parses the persistent Vim preference command %s', (input, enabled) => {
  expect(parseEditorCommand(input, registry)).toEqual({ type: 'set-vim', enabled })
})

test.each([
  [':w', 'portfolio already saved'],
  [':q', "close this tab whenever you're ready"],
  ['', 'portfolio is read-only'],
  ['   :   ', 'portfolio is read-only'],
] as const)('turns harmless editor command %s into a status message', (input, message) => {
  expect(parseEditorCommand(input, registry)).toEqual({ type: 'message', message })
})

test.each([
  [':dance', 'not an editor command: dance'],
  [':e missing.md', 'not an editor command: e missing.md'],
  [':vim maybe', 'not an editor command: vim maybe'],
] as const)('reports the unsupported command %s without side effects', (input, message) => {
  expect(parseEditorCommand(input, registry)).toEqual({ type: 'unknown', message })
})
