"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transpile = exports.remarkTranspile = void 0;
const remark_parse_1 = require("remark-parse");
const remark_stringify_1 = require("remark-stringify");
const unified_1 = require("unified");
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
function handleRequiresEscape(s, cursor) {
    if (REQUIRE_ESCAPE.has(s[cursor]) && s[cursor - 1] !== '\\') {
        return [s.slice(0, cursor) + '\\' + s.slice(cursor), cursor + 1];
    }
    return [s, cursor];
}
function strong(node, _, state, info) {
    const marker = '*';
    const exit = state.enter('strong');
    const tracker = state.createTracker(info);
    let value = tracker.move(marker);
    value += tracker.move(state.containerPhrasing(node, Object.assign({ before: value, after: marker }, tracker.current())));
    value += tracker.move(marker);
    exit();
    return value;
}
strong.peek = strongPeek;
function strongPeek(_, _1, state) {
    return state.options.strong || '*';
}
function emphasis(node, _, state, info) {
    const exit = state.enter('emphasis');
    const tracker = state.createTracker(info);
    let value = tracker.move('_');
    value += tracker.move(state.containerPhrasing(node, Object.assign({ before: value, after: '_' }, tracker.current())));
    value += tracker.move('_');
    exit();
    return value;
}
emphasis.peek = emphasisPeek;
function emphasisPeek(_, _1, state) {
    return state.options.emphasis || '*';
}
function remarkTranspile(s) {
    const file = (0, unified_1.unified)()
        .use(remark_parse_1.default)
        .use(remark_stringify_1.default, {
        handlers: {
            strong,
            emphasis
        }
    })
        .processSync(s);
    return String(file);
}
exports.remarkTranspile = remarkTranspile;
function transpile(s) {
    let res = remarkTranspile(s);
    let cursor = 0;
    while (cursor < res.length) {
        const [newRes, newCursor] = handleRequiresEscape(res, cursor);
        res = newRes;
        cursor = newCursor + 1;
    }
    return res;
}
exports.transpile = transpile;
//# sourceMappingURL=transpile.js.map