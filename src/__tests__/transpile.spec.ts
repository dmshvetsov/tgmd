// TODO rename commonmark markdow to telegram MarkdownV2
import { it, expect } from 'vitest'
import { transpile } from '../transpile'

it('parses simple plain text without changes', () => {
  expect(transpile('it is ok 🥳')).toBe('it is ok 🥳\n')
})

it('removes preceding new line and adds trailing new line', () => {
  expect(transpile(`\nuseles new line sign before, but needed new line after`)).toBe(
    `useles new line sign before, but needed new line after\n`
  )
})

it('supports italic transformation', () => {
  expect(transpile('*italic* and _123_')).toBe('_italic_ and _123_\n')
})

it('supports bold transformation', () => {
  expect(transpile('**bold** and __123__')).toBe('*bold* and *123*\n')
})

it('supports escape *', () => {
  expect(transpile('\\*a\\*')).toBe('\\*a\\*\n')
})

it('supports escape _', () => {
  expect(transpile('\\_a\\_')).toBe('\\_a\\_\n')
})

it('supports new line transformation', () => {
  expect(transpile('**bold**\n_italic_\n__bold__\n*italic*\n')).toBe(
    '*bold*\n_italic_\n*bold*\n_italic_\n'
  )
})

it('escapes exclamation mark', () => {
  expect(transpile('it is great!')).toBe(`it is great\\!\n`)
  expect(transpile('it is awesome!!!')).toBe(`it is awesome\\!\\!\\!\n`)
})

it('escapes dots', () => {
  expect(transpile('it is ok.')).toBe(`it is ok\\.\n`)
  expect(transpile('let me think ... a little bit')).toBe(`let me think \\.\\.\\. a little bit\n`)
})

it('escapes +', () => {
  expect(transpile('this+that')).toBe(`this\\+that\n`)
  expect(transpile('wtf ++++')).toBe(`wtf \\+\\+\\+\\+\n`)
})

it(`escapes '`, () => {
  expect(transpile(`i'm doing stuff`)).toBe(`i'm doing stuff\n`)
  expect(transpile(`whatever '''`)).toBe(`whatever '''\n`)
})

it('transpiles complex strings', () => {
  expect(transpile(`hello, **my friend!!**!!\n\n[that's was a test]`)).toBe(
    `hello, *my friend\\!\\!*\\!\\!\n\n\\[that's was a test\\]\n`
  )
})

it('does not modify original string', () => {
  const original = '**bold** *italic*'
  transpile(original)
  expect(original).toBe('**bold** *italic*')
})
