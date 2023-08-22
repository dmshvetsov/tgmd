// TODO rename commonmark markdow to telegram MarkdownV2
import { transpile } from '../transpile'

it('parses simple plain text without changes', () => {
  expect(transpile('it is ok 🥳')).toBe('it is ok 🥳')
})

test('supports italic transformation', () => {
  expect(transpile('*italic* and _123_')).toBe('_italic_ and _123_')
})

test('supports bold transformation', () => {
  expect(transpile('**bold** and __123__')).toBe('*bold* and *123*')
})

test('supports escape *', () => {
  expect(transpile('\\*a\\*')).toBe('\\*a\\*')
})

test('supports escape _', () => {
  expect(transpile('\\_a\\_')).toBe('\\_a\\_')
})

test('supports new line transformation', () => {
  expect(transpile('\n**bold**\n_italic_\n__bold__\n*italic*\n')).toBe(
    '\n*bold*\n_italic_\n*bold*\n_italic_\n'
  )
})

test('escapes exclamation mark', () => {
  expect(transpile('it is great!')).toBe(`it is great\\!`)
  expect(transpile('it is awesome!!!')).toBe(`it is awesome\\!\\!\\!`)
})

test('escapes dots', () => {
  expect(transpile('it is ok.')).toBe(`it is ok\\.`)
  expect(transpile('let me think ... a little bit')).toBe(`let me think \\.\\.\\. a little bit`)
})

test('escapes +', () => {
  expect(transpile('this+that')).toBe(`this\\+that`)
  expect(transpile('wtf ++++')).toBe(`wtf \\+\\+\\+\\+`)
})

test(`escapes '`, () => {
  expect(transpile(`i'm doing stuff`)).toBe(`i'm doing stuff`)
  expect(transpile(`whatever '''`)).toBe(`whatever '''`)
})

it('does not modify original string', () => {
  const original = '**bold** *italic*'
  transpile(original)
  expect(original).toBe('**bold** *italic*')
})
