// Module-owned lexical presentation adapter. The bundled clike mode remains unmodified.
(function (root) {
	"use strict";
	const cm = root.CodeMirror;
	cm.defineMode("source-csharp", function (config) {
		const original = cm.resolveMode("text/x-csharp");
		const keywords = Object.assign({}, original.keywords);
		for (const word of "record required file scoped init with when where not and or managed unmanaged nint nuint nameof".split(" ")) keywords[word] = true;
		function rawString(stream, state) {
			const closing = '"'.repeat(state.sourceRawQuotes);
			while (!stream.eol()) {
				if (stream.match(closing)) { state.tokenize = null; state.sourceRawQuotes = 0; break; }
				stream.next();
			}
			return "string";
		}
		function openRaw(stream, state) {
			const opening = stream.match(/^"{3,}/);
			if (!opening) return false;
			state.sourceRawQuotes = opening[0].length;
			state.tokenize = rawString;
			return rawString(stream, state);
		}
		const hooks = Object.assign({}, original.hooks, {
			'"': function (stream, state) {
				stream.backUp(1);
				const result = openRaw(stream, state);
				if (result) return result;
				stream.next(); return false;
			},
			'$': function (stream, state) {
				// Prefix belongs to the string, not to a variable token. Raw delimiters can be any length >= 3.
				stream.eatWhile('$');
				const result = openRaw(stream, state);
				if (result) return result;
				if (stream.eat('@')) return original.hooks['@'](stream, state);
				if (stream.peek() === '"') return "string";
				return false;
			},
			'#': function (stream, state) {
				if (!state.startOfLine) return false;
				stream.skipToEnd(); return "meta";
			}
		});
		const base = cm.getMode(config, Object.assign({}, original, { keywords, hooks }));
		return Object.assign({}, base, {
			token: function (stream, state) {
				const style = base.token(stream, state);
				if (style !== "variable" && style !== "def") return style;
				const value = stream.current();
				// These are lexical categories, not compiler symbol resolution.
				if (stream.match(/^\s*(?:<[^<>\r\n]+>)?\s*\(/, false)) return "function";
				if (stream.string.slice(0, stream.start).trimEnd().endsWith('.')) return "property";
				if (/^[A-Z][\w]*$/.test(value)) return "type";
				return style === "def" ? "variable" : style;
			}
		});
	});
})(window);
