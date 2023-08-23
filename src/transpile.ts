import remarkParse from 'remark-parse'
import remarkStrigify from 'remark-stringify'
import { unified } from 'unified'

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

// function isAlphanumeric(s: string, idx: number) {
//   const code = s.charCodeAt(idx)
//   if (isNaN(code)) {
//     return false
//   }
//
//   if (
//     !(code > 47 && code < 58) && // numeric (0-9)
//     !(code > 64 && code < 91) && // upper alpha (A-Z)
//     !(code > 96 && code < 123) // lower alpha (a-z)
//   ) {
//     return false
//   }
//   return true
// }

// function isSpace(s: string, idx: number) {
//   const code = s.charCodeAt(idx)
//   return code === 32
// }

// function isSpaceLineEdge(s: string, idx: number) {
//   const code = s.charCodeAt(idx)
//   return isNaN(code) || code === CHAR.NEWLINE || isSpace(s, idx)
// }

// function handldeAsterisk(s: string, cursor: number): [string, number] {
//   if (isAlphanumeric(s, cursor + 1) && isSpaceLineEdge(s, cursor - 1)) {
//     // \s*\w transfor to \s_\w
//     // \n*\w transfor to \n_\w
//     return [s.slice(0, cursor) + '_' + s.slice(cursor + 1), cursor + 1]
//   }
//   if (isAlphanumeric(s, cursor - 1) && isSpaceLineEdge(s, cursor + 1)) {
//     // \w*\s transform to \w_\s
//     // \w*\n transform to \w_\n
//     return [s.slice(0, cursor) + '_' + s.slice(cursor + 1), cursor + 1]
//   }
//
//   if (s[cursor - 1] === '*' && isAlphanumeric(s, cursor + 1)) {
//     // **\w transformation to *\w
//     return [s.slice(0, cursor) + s.slice(cursor + 1), cursor + 2]
//   }
//   if (s[cursor + 1] === '*' && isAlphanumeric(s, cursor - 1)) {
//     // \w**\s transformation to \w*\s
//     return [s.slice(0, cursor) + s.slice(cursor + 1), cursor + 2]
//   }
//
//   return [s, cursor + 1]
// }

// function handldeUnderscore(s: string, cursor: number): [string, number] {
//   if (isAlphanumeric(s, cursor - 1) && isSpaceLineEdge(s, cursor - 1)) {
//     // \s_\w keep as \s_\w
//     // \n_\w keep as \n_\w
//     return [s, cursor + 1]
//   }
//   if (isAlphanumeric(s, cursor - 1) && isSpaceLineEdge(s, cursor + 1)) {
//     // \w_\s keep as \w_\s
//     // \w_\n keep as \w_\n
//     return [s, cursor + 1]
//   }
//   if (s[cursor - 1] === '_' && isAlphanumeric(s, cursor + 1)) {
//     // __\w transformation to *\w
//     return [s.slice(0, cursor - 1) + '*' + s.slice(cursor + 1), cursor + 1]
//   }
//   if (s[cursor + 1] === '_' && isAlphanumeric(s, cursor - 1)) {
//     // \w__ transformation to \w*
//     return [s.slice(0, cursor) + '*' + s.slice(cursor + 2), cursor + 1]
//   }
//   return [s, cursor + 1]
// }

function handleRequiresEscape(s: string, cursor: number): [string, number] {
  if (REQUIRE_ESCAPE.has(s[cursor]) && s[cursor - 1] !== '\\') {
    return [s.slice(0, cursor) + '\\' + s.slice(cursor), cursor + 1]
  }
  return [s, cursor]
}

function strong(node: any, _: any, state: any, info: any) {
  const marker = '*'
  const exit = state.enter('strong')
  const tracker = state.createTracker(info)
  let value = tracker.move(marker)
  value += tracker.move(
    state.containerPhrasing(node, {
      before: value,
      after: marker,
      ...tracker.current()
    })
  )
  value += tracker.move(marker)
  exit()
  return value
}

strong.peek = strongPeek

/**
 * @param {Strong} _
 * @param {Parents | undefined} _1
 * @param {State} state
 * @returns {string}
 */
function strongPeek(_: any, _1: any, state: any) {
  return state.options.strong || '*'
}

function emphasis(node: any, _: any, state: any, info: any) {
  const exit = state.enter('emphasis')
  const tracker = state.createTracker(info)
  let value = tracker.move('_')
  value += tracker.move(
    state.containerPhrasing(node, {
      before: value,
      after: '_',
      ...tracker.current()
    })
  )
  value += tracker.move('_')
  exit()
  return value
}

emphasis.peek = emphasisPeek

function emphasisPeek(_: any, _1: any, state: any) {
  return state.options.emphasis || '*'
}

export function remarkTranspile(s: string): string {
  const file = unified()
    .use(remarkParse)
    .use(remarkStrigify, {
      handlers: {
        strong,
        emphasis
      }
    })
    .processSync(s)
  return String(file)
}

export function transpile(s: string): string {
  let res = remarkTranspile(s)
  // let res = s.slice(0)
  let cursor = 0
  while (cursor < res.length) {
    const [newRes, newCursor] = handleRequiresEscape(res, cursor)
    res = newRes
    cursor = newCursor + 1
  }
  return res
}
