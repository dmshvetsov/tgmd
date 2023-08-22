/*
    *bold \*text*
    _italic \*text_
    __underline__
    ~strikethrough~
    ||spoiler||
    *bold _italic bold ~italic bold strikethrough ||italic bold strikethrough spoiler||~ __underline italic bold___ bold*
    [inline URL](http://www.example.com/)
    [inline mention of a user](tg://user?id=123456789)
    ![👍](tg://emoji?id=5368324170671202286)
    `inline fixed-width code`
    ```
    pre-formatted fixed-width code block
    ```
    ```python
    pre-formatted fixed-width code block written in the Python programming language
    ``` 


    Any character with code between 1 and 126 inclusively can be escaped anywhere with a preceding '\' character, in which case it is treated as an ordinary character and not a part of the markup. This implies that '\' character usually must be escaped with a preceding '\' character.
    Inside pre and code entities, all '`' and '\' characters must be escaped with a preceding '\' character.
    Inside the (...) part of the inline link and custom emoji definition, all ')' and '\' must be escaped with a preceding '\' character.
    In all other places characters '_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!' must be escaped with the preceding character '\'.
    In case of ambiguity between italic and underline entities __ is always greadily treated from left to right as beginning or end of underline entity, so instead of ___italic underline___ use ___italic underline_\r__, where \r is a character with code 13, which will be ignored.
 */
const REQUIRE_ESCAPE = Object.freeze(
  new Set([
    // '_', should be escaped manually
    // '*', should be escaped manually
    '.',
    '!',
    '[',
    ']',
    '(',
    ')',
    '~',
    '`',
    '>',
    '#',
    '+',
    '-',
    '=',
    '|',
    '{',
    '}'
  ])
)

type ReplacerFn = (s: string, cursor: number) => [string, number]

const CHAR = Object.freeze({
  NEWLINE: 10
})

const REPLACERS = Object.freeze(
  new Map<string, ReplacerFn>([
    ['*', handldeAsterisk],
    ['_', handldeUnderscore]
  ])
)

// function isSequence(s: string, idx: number) {
//   const cur = s[idx]
//   const prev = s[idx - 1]
//   const next = s[idx + 1]
//   if (isSpaceLineEdge(s, idx - 1) || isSpaceLineEdge(s, idx + 1)) {
//     return false
//   }
//
//   return (cur === '*' || cur === '_') && (cur === prev || cur === next)
// }

function isAlphanumeric(s: string, idx: number) {
  const code = s.charCodeAt(idx)
  if (isNaN(code)) {
    return false
  }

  if (
    !(code > 47 && code < 58) && // numeric (0-9)
    !(code > 64 && code < 91) && // upper alpha (A-Z)
    !(code > 96 && code < 123) // lower alpha (a-z)
  ) {
    return false
  }
  return true
}

function isSpace(s: string, idx: number) {
  const code = s.charCodeAt(idx)
  return code === 32
}

function isSpaceLineEdge(s: string, idx: number) {
  const code = s.charCodeAt(idx)
  return isNaN(code) || code === CHAR.NEWLINE || isSpace(s, idx)
}

function handleRequiresEscape(s: string, cursor: number): [string, number] {
  if (REQUIRE_ESCAPE.has(s[cursor])) {
    return [s.slice(0, cursor) + '\\' + s.slice(cursor), cursor + 1]
  }
  return [s, cursor]
}

function handldeAsterisk(s: string, cursor: number): [string, number] {
  if (isAlphanumeric(s, cursor + 1) && isSpaceLineEdge(s, cursor - 1)) {
    // \s*\w transfor to \s_\w
    // \n*\w transfor to \n_\w
    return [s.slice(0, cursor) + '_' + s.slice(cursor + 1), cursor + 1]
  }
  if (isAlphanumeric(s, cursor - 1) && isSpaceLineEdge(s, cursor + 1)) {
    // \w*\s transform to \w_\s
    // \w*\n transform to \w_\n
    return [s.slice(0, cursor) + '_' + s.slice(cursor + 1), cursor + 1]
  }

  if (s[cursor - 1] === '*' && isAlphanumeric(s, cursor + 1)) {
    // **\w transformation to *\w
    return [s.slice(0, cursor) + s.slice(cursor + 1), cursor + 2]
  }
  if (s[cursor + 1] === '*' && isAlphanumeric(s, cursor - 1)) {
    // \w**\s transformation to \w*\s
    return [s.slice(0, cursor) + s.slice(cursor + 1), cursor + 2]
  }

  return [s, cursor + 1]
}

function handldeUnderscore(s: string, cursor: number): [string, number] {
  if (isAlphanumeric(s, cursor - 1) && isSpaceLineEdge(s, cursor - 1)) {
    // \s_\w keep as \s_\w
    // \n_\w keep as \n_\w
    return [s, cursor + 1]
  }
  if (isAlphanumeric(s, cursor - 1) && isSpaceLineEdge(s, cursor + 1)) {
    // \w_\s keep as \w_\s
    // \w_\n keep as \w_\n
    return [s, cursor + 1]
  }
  if (s[cursor - 1] === '_' && isAlphanumeric(s, cursor + 1)) {
    // __\w transformation to *\w
    return [s.slice(0, cursor - 1) + '*' + s.slice(cursor + 1), cursor + 1]
  }
  if (s[cursor + 1] === '_' && isAlphanumeric(s, cursor - 1)) {
    // \w__ transformation to \w*
    return [s.slice(0, cursor) + '*' + s.slice(cursor + 2), cursor + 1]
  }
  return [s, cursor + 1]
}

export function transpile(s: string): string {
  let res = s.slice(0)
  let cursor = 0
  while (cursor < res.length) {
    const c = res[cursor]
    const replacer = REPLACERS.get(c)
    if (replacer) {
      // console.debug('input:', res, cursor)
      const [newRes, newCursor] = handleRequiresEscape(...replacer(res, cursor))
      res = newRes
      // console.debug('output:', res, cursor)
      cursor = newCursor
    } else {
      // console.debug('input:', res, cursor)
      const [newRes, newCursor] = handleRequiresEscape(res, cursor)
      res = newRes
      // console.debug('output:', res, cursor)
      cursor = newCursor + 1
    }
  }
  return res
}
