"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transpile = void 0;
const REQUIRE_ESCAPE = Object.freeze(new Set([
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
]));
const CHAR = Object.freeze({
    NEWLINE: 10
});
const REPLACERS = Object.freeze(new Map([
    ['*', handldeAsterisk],
    ['_', handldeUnderscore]
]));
function isAlphanumeric(s, idx) {
    const code = s.charCodeAt(idx);
    if (isNaN(code)) {
        return false;
    }
    if (!(code > 47 && code < 58) &&
        !(code > 64 && code < 91) &&
        !(code > 96 && code < 123)) {
        return false;
    }
    return true;
}
function isSpace(s, idx) {
    const code = s.charCodeAt(idx);
    return code === 32;
}
function isSpaceLineEdge(s, idx) {
    const code = s.charCodeAt(idx);
    return isNaN(code) || code === CHAR.NEWLINE || isSpace(s, idx);
}
function handleRequiresEscape(s, cursor) {
    if (REQUIRE_ESCAPE.has(s[cursor])) {
        return [s.slice(0, cursor) + '\\' + s.slice(cursor), cursor + 1];
    }
    return [s, cursor];
}
function handldeAsterisk(s, cursor) {
    if (isAlphanumeric(s, cursor + 1) && isSpaceLineEdge(s, cursor - 1)) {
        return [s.slice(0, cursor) + '_' + s.slice(cursor + 1), cursor + 1];
    }
    if (isAlphanumeric(s, cursor - 1) && isSpaceLineEdge(s, cursor + 1)) {
        return [s.slice(0, cursor) + '_' + s.slice(cursor + 1), cursor + 1];
    }
    if (s[cursor - 1] === '*' && isAlphanumeric(s, cursor + 1)) {
        return [s.slice(0, cursor) + s.slice(cursor + 1), cursor + 2];
    }
    if (s[cursor + 1] === '*' && isAlphanumeric(s, cursor - 1)) {
        return [s.slice(0, cursor) + s.slice(cursor + 1), cursor + 2];
    }
    return [s, cursor + 1];
}
function handldeUnderscore(s, cursor) {
    if (isAlphanumeric(s, cursor - 1) && isSpaceLineEdge(s, cursor - 1)) {
        return [s, cursor + 1];
    }
    if (isAlphanumeric(s, cursor - 1) && isSpaceLineEdge(s, cursor + 1)) {
        return [s, cursor + 1];
    }
    if (s[cursor - 1] === '_' && isAlphanumeric(s, cursor + 1)) {
        return [s.slice(0, cursor - 1) + '*' + s.slice(cursor + 1), cursor + 1];
    }
    if (s[cursor + 1] === '_' && isAlphanumeric(s, cursor - 1)) {
        return [s.slice(0, cursor) + '*' + s.slice(cursor + 2), cursor + 1];
    }
    return [s, cursor + 1];
}
function transpile(s) {
    let res = s.slice(0);
    let cursor = 0;
    while (cursor < res.length) {
        const c = res[cursor];
        const replacer = REPLACERS.get(c);
        if (replacer) {
            const [newRes, newCursor] = handleRequiresEscape(...replacer(res, cursor));
            res = newRes;
            cursor = newCursor;
        }
        else {
            const [newRes, newCursor] = handleRequiresEscape(res, cursor);
            res = newRes;
            cursor = newCursor + 1;
        }
    }
    return res;
}
exports.transpile = transpile;
//# sourceMappingURL=transpile.js.map